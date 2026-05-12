const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Labels that Google Vision returns for identity documents
const ID_LABELS = [
  'identity document',
  'passport',
  "driver's license",
  'driver license',
  'photo identification',
  'government id',
  'national id',
  'id card',
  'visa',
  'residence permit',
  'document',
];

// Text keywords found on real IDs/passports
const ID_TEXT_KEYWORDS = [
  'passport',
  'surname',
  'given name',
  'given names',
  'nationality',
  'date of birth',
  'place of birth',
  'expiry',
  'expiration',
  'document no',
  'document number',
  'personal no',
  'personal number',
  'drivers license',
  "driver's license",
  'estado',       // Spanish ID keyword
  'republica',    // Spanish passport
  'ciudadano',    // Mexican ID
  'curp',         // Mexico unique population registry code
  'rfc',          // Mexico tax ID
];

export interface DocumentCheckResult {
  isIdentityDocument: boolean;
  documentType: string | null;
  confidence: number;
  extractedText: string;
  extractedName: string | null;
  error?: string;
}

export function extractNameFromOCR(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Passport MRZ: line starting with P< followed by 3-letter country then name<<givenname
  const mrzLine = lines.find((l) => /^P<[A-Z]{3}[A-Z<]{10,}$/.test(l.replace(/\s/g, '')));
  if (mrzLine) {
    const clean = mrzLine.replace(/\s/g, '').slice(5); // strip P<CCC
    const [surname, given] = clean.split('<<');
    const s = surname?.replace(/<+/g, ' ').trim();
    const g = given?.replace(/<+/g, ' ').trim();
    if (s && g) return `${g} ${s}`;
    if (s) return s;
  }

  // Keyword-based: NOMBRE, NAME, APELLIDO on its own line followed by value
  const keywordPatterns = [
    /^(?:nombre[s]?|apellidos?\s+y\s+nombre[s]?)[:\s]+(.+)$/i,
    /^(?:full\s+name|name)[:\s]+(.+)$/i,
    /^(?:apellidos?)[:\s]+(.+)$/i,
  ];
  for (const line of lines) {
    for (const pat of keywordPatterns) {
      const m = line.match(pat);
      if (m?.[1]?.trim()) return m[1].trim();
    }
  }

  // Last resort: find a line of 2–4 ALL-CAPS words that looks like a name
  for (const line of lines) {
    if (/^[A-ZÁÉÍÓÚÜÑ]{2,}(\s[A-ZÁÉÍÓÚÜÑ]{2,}){1,3}$/.test(line)) {
      // Skip lines that are clearly not names (doc type labels, country names, etc.)
      const skip = ['REPUBLICA', 'MEXICO', 'ESTADOS', 'UNIDOS', 'MEXICANA', 'PASSPORT', 'PASAPORTE'];
      if (!skip.some((s) => line.includes(s))) return line;
    }
  }

  return null;
}

export async function checkIsIdentityDocument(
  imageBase64: string,
  mimeType = 'image/jpeg',
): Promise<DocumentCheckResult> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    return {
      isIdentityDocument: false,
      documentType: null,
      confidence: 0,
      extractedText: '',
      error: 'GOOGLE_CLOUD_VISION_API_KEY is not configured.',
    };
  }

  const body = {
    requests: [
      {
        image: { content: imageBase64 },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'DOCUMENT_TEXT_DETECTION' },
        ],
      },
    ],
  };

  const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let detail = '';
    try { detail = JSON.parse(body)?.error?.message ?? ''; } catch { detail = body.slice(0, 120); }
    return {
      isIdentityDocument: false,
      documentType: null,
      confidence: 0,
      extractedText: '',
      error: `Vision API error ${res.status}${detail ? `: ${detail}` : ''}`,
    };
  }

  const data = await res.json();
  const response = data.responses?.[0];
  if (!response) {
    return { isIdentityDocument: false, documentType: null, confidence: 0, extractedText: '', extractedName: null };
  }

  const labels: Array<{ description: string; score: number }> = response.labelAnnotations ?? [];
  // Use original-case text for name extraction, lowercase for keyword matching
  const rawText: string =
    response.fullTextAnnotation?.text ??
    response.textAnnotations?.[0]?.description ?? '';
  const fullText = rawText.toLowerCase();

  // Check label annotations
  const matchingLabel = labels.find((l) =>
    ID_LABELS.some((kw) => l.description.toLowerCase().includes(kw)),
  );

  // Check extracted text for multiple ID keywords
  const keywordHits = ID_TEXT_KEYWORDS.filter((kw) => fullText.includes(kw));

  const isIdentityDocument = !!matchingLabel || keywordHits.length >= 2;
  const confidence = matchingLabel?.score ?? Math.min(keywordHits.length / 3, 1);

  let documentType: string | null = null;
  if (fullText.includes('passport')) documentType = 'Passport';
  else if (fullText.includes('driver') || fullText.includes('driving')) documentType = "Driver's License";
  else if (fullText.includes('curp') || fullText.includes('ine') || fullText.includes('credencial')) documentType = 'Mexican INE / ID';
  else if (matchingLabel) documentType = matchingLabel.description;

  const extractedName = isIdentityDocument ? extractNameFromOCR(rawText) : null;

  return {
    isIdentityDocument,
    documentType,
    confidence,
    extractedText: rawText,
    extractedName,
  };
}
