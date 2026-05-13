import type { FidelityIssue, FidelityReport } from '../messaging/types.ts';
import { extractEntities } from './entityExtractor.ts';

function normalizeNumber(n: string): string {
  return n.replace(/\s+/g, '').toLowerCase();
}

export function checkFidelity(original: string, rewritten: string): FidelityReport {
  const origEntities = extractEntities(original);
  const rewrittenEntities = extractEntities(rewritten);

  const issues: FidelityIssue[] = [];

  // Numbers invented by the LLM that did not appear in the original
  const newNumbers = rewrittenEntities.numbers.filter(
    (n) => !origEntities.numbers.some((o) => normalizeNumber(o) === normalizeNumber(n))
  );
  if (newNumbers.length > 0) {
    issues.push({ severity: 'high', type: 'invented_numbers', detail: newNumbers });
  }

  // Numbers from original that are absent in the rewrite
  const droppedNumbers = origEntities.numbers.filter(
    (n) => !rewrittenEntities.numbers.some((r) => normalizeNumber(r) === normalizeNumber(n))
  );
  if (droppedNumbers.length > 0) {
    issues.push({ severity: 'medium', type: 'dropped_numbers', detail: droppedNumbers });
  }

  // Verbatim quotes from original missing in the rewrite
  const missingQuotes = origEntities.quotes.filter((q) => !rewritten.includes(q));
  if (missingQuotes.length > 0) {
    issues.push({ severity: 'high', type: 'dropped_quotes', detail: missingQuotes });
  }

  // Proper names appearing in rewrite that weren't in original
  const newNames = rewrittenEntities.names.filter(
    (n) => !origEntities.names.includes(n)
  );
  if (newNames.length > 0) {
    issues.push({ severity: 'medium', type: 'invented_names', detail: newNames });
  }

  return {
    issues,
    passed: !issues.some((i) => i.severity === 'high'),
  };
}
