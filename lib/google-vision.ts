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
  error?: string;
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
    return {
      isIdentityDocument: false,
      documentType: null,
      confidence: 0,
      extractedText: '',
      error: `Vision API error: ${res.status}`,
    };
  }

  const data = await res.json();
  const response = data.responses?.[0];
  if (!response) {
    return { isIdentityDocument: false, documentType: null, confidence: 0, extractedText: '' };
  }

  const labels: Array<{ description: string; score: number }> = response.labelAnnotations ?? [];
  const fullText: string =
    response.fullTextAnnotation?.text?.toLowerCase() ??
    response.textAnnotations?.[0]?.description?.toLowerCase() ??
    '';

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

  return {
    isIdentityDocument,
    documentType,
    confidence,
    extractedText: response.textAnnotations?.[0]?.description ?? '',
  };
}
