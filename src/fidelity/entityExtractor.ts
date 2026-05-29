export interface Entities {
  numbers: string[];
  dates: string[];
  names: string[];
  quotes: string[];
}

// Matches dates like 1.1.2024 or 01.01.24 - extracted before numbers to avoid overlap
const DATE_RE = /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/g;
// Standalone 4-digit years (1000–2999)
const YEAR_RE = /\b[12]\d{3}\b/g;

// Numbers with optional decimal/thousands separator and common units.
// No trailing \b - unit symbols like % and € are non-word chars, which break \b.
// Leading \b prevents matching digits inside words.
const NUMBER_RE =
  /\b\d+(?:[.,]\d+)*\s*(?:%|€|\$|£|km|kg|g|t|mio\.?|mrd\.?|Millionen|Milliarden|Prozent|Mio\.?|Mrd\.?)?/gi;

// German quotes „…" and English "…" - capture the inner content
const QUOTE_DE_RE = /„([^"]+)"/g;
const QUOTE_EN_RE = /"([^"]{2,})"/g;

// Proper names: ≥2 consecutive capitalized words (uppercase initial, ≥2 chars each)
// First word must NOT be a common German article/conjunction/preposition
const NAME_RE = /\b([A-ZÄÖÜ][a-zäöüß]{1,}(?:\s+[A-ZÄÖÜ][a-zäöüß]{1,})+)\b/g;

const SKIP_FIRST_WORDS = new Set([
  'Der', 'Die', 'Das', 'Ein', 'Eine', 'Einer', 'Eines', 'Einem', 'Einen',
  'Und', 'Oder', 'Aber', 'Doch', 'Sondern', 'Jedoch', 'Sowie',
  'In', 'An', 'Auf', 'Zu', 'Bei', 'Mit', 'Von', 'Vom', 'Am', 'Im', 'Ins',
  'Durch', 'Über', 'Unter', 'Nach', 'Vor', 'Zwischen', 'Für', 'Gegen', 'Ab',
  'Ich', 'Du', 'Er', 'Sie', 'Es', 'Wir', 'Ihr',
  'Mein', 'Dein', 'Sein', 'Unser', 'Euer',
  'Alle', 'Viele', 'Einige', 'Wenige', 'Keine', 'Kein',
  'Diese', 'Dieser', 'Dieses', 'Jener', 'Jene', 'Jedes', 'Jeder',
  'Als', 'Wie', 'Wenn', 'Weil', 'Da', 'Ob',
  'The', 'A', 'An', 'And', 'Or', 'But', 'In', 'On', 'At', 'By',
]);

function normalizeNumber(raw: string): string {
  return raw.replace(/\s+/g, '').toLowerCase();
}

function execAll(re: RegExp, text: string): string[] {
  const results: string[] = [];
  const clone = new RegExp(re.source, re.flags);
  let m: RegExpExecArray | null;
  while ((m = clone.exec(text)) !== null) {
    const val = (m[1] ?? m[0]).trim();
    if (val && !results.includes(val)) results.push(val);
  }
  return results;
}

export function extractEntities(text: string): Entities {
  const dates: string[] = [
    ...execAll(DATE_RE, text),
    ...execAll(YEAR_RE, text),
  ];

  // Strip date spans from text before extracting numbers to avoid double-counting
  const textWithoutDates = text.replace(DATE_RE, '').replace(YEAR_RE, '');
  const rawNumbers = execAll(NUMBER_RE, textWithoutDates).map(normalizeNumber);
  // Remove empty and single-char matches (stray punctuation)
  const numbers = rawNumbers.filter((n) => n.length > 1);

  const quotes: string[] = [
    ...execAll(QUOTE_DE_RE, text),
    ...execAll(QUOTE_EN_RE, text),
  ];

  const names = execAll(NAME_RE, text).filter((name) => {
    const firstWord = name.split(' ')[0] ?? '';
    return !SKIP_FIRST_WORDS.has(firstWord);
  });

  return { numbers, dates, names, quotes };
}
