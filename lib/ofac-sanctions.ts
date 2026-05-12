/**
 * OFAC SDN (Specially Designated Nationals) screening.
 * The SDN list is published by the US Treasury and is completely free / public domain.
 * It covers designated drug traffickers (SDNTK — including Sinaloa, CJNG),
 * global terrorists (SDGT), narco-terrorists, and other sanctions targets.
 *
 * List source: https://www.treasury.gov/ofac/downloads/sdn.csv
 * Updated by Treasury typically several times per week.
 */

// ─── Jaro-Winkler similarity ──────────────────────────────────────────────────

function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (!s1.length || !s2.length) return 0;

  const matchDist = Math.max(Math.floor(Math.max(s1.length, s2.length) / 2) - 1, 0);
  const s1Matched = new Array(s1.length).fill(false);
  const s2Matched = new Array(s2.length).fill(false);

  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    const lo = Math.max(0, i - matchDist);
    const hi = Math.min(i + matchDist + 1, s2.length);
    for (let j = lo; j < hi; j++) {
      if (s2Matched[j] || s1[i] !== s2[j]) continue;
      s1Matched[i] = true;
      s2Matched[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matched[i]) continue;
    while (!s2Matched[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
}

function jaroWinkler(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2);
  let prefix = 0;
  for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

// ─── Name normalisation ────────────────────────────────────────────────────────
// OFAC stores names as "LAST, FIRST MIDDLE". We normalise both the candidate
// name and the list entry to sorted lowercase tokens so order doesn't matter.

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,]/g, ' ')       // treat "LAST, FIRST" comma as a space
    .replace(/[^a-z\s]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

// ─── CSV parser ────────────────────────────────────────────────────────────────

function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// ─── In-memory cache (24h TTL) ────────────────────────────────────────────────

let cachedNames: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getSDNNames(): Promise<string[]> {
  if (cachedNames && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedNames;
  }

  const res = await fetch('https://www.treasury.gov/ofac/downloads/sdn.csv', {
    headers: { 'User-Agent': 'LaCasaOaxaca-ComplianceCheck/1.0' },
    next: { revalidate: 86400 }, // Next.js fetch cache: 24h
  });

  if (!res.ok) throw new Error(`Failed to fetch OFAC SDN list: ${res.status}`);

  const text = await res.text();
  const lines = text.split('\n');
  const names: string[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = parseCSVRow(line);
    // Column layout: ent_num | SDN_Name | SDN_Type | Program | ...
    if (fields.length < 3) continue;
    const sdnType = fields[2]?.toLowerCase();
    // Only screen individuals (entities are companies/vessels)
    if (sdnType !== 'individual') continue;
    const name = fields[1];
    if (name && name !== '-0-') names.push(name);
  }

  cachedNames = names;
  cacheTimestamp = Date.now();
  return names;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface SanctionsMatch {
  listedName: string;
  similarity: number;
}

export type AlertLevel = 'clear' | 'warning' | 'alert';

export interface SanctionsResult {
  alertLevel: AlertLevel;
  matches: SanctionsMatch[];
  checkedAt: string;
  totalEntriesChecked: number;
}

/**
 * Check a full name against the OFAC SDN list using Jaro-Winkler similarity.
 *
 * alertLevel:
 *   'clear'   — no match above 0.82
 *   'warning' — similarity 0.82–0.94 (similar name, investigate manually)
 *   'alert'   — similarity ≥ 0.95 (very high match, likely the same person)
 */
export async function checkNameAgainstOFAC(fullName: string): Promise<SanctionsResult> {
  const names = await getSDNNames();
  const normalizedInput = normalizeName(fullName);

  const WARNING_THRESHOLD = 0.82;
  const ALERT_THRESHOLD = 0.95;

  const matches: SanctionsMatch[] = [];

  for (const listed of names) {
    const score = jaroWinkler(normalizedInput, normalizeName(listed));
    if (score >= WARNING_THRESHOLD) {
      matches.push({ listedName: listed, similarity: score });
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  const top = matches.slice(0, 5);

  const highestScore = top[0]?.similarity ?? 0;
  const alertLevel: AlertLevel =
    highestScore >= ALERT_THRESHOLD ? 'alert' :
    highestScore >= WARNING_THRESHOLD ? 'warning' :
    'clear';

  return {
    alertLevel,
    matches: top,
    checkedAt: new Date().toISOString(),
    totalEntriesChecked: names.length,
  };
}
