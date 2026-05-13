import { diffWords } from 'diff';
import type { Change } from 'diff';

export type DiffToken = Change;

export function computeWordDiff(original: string, rewritten: string): DiffToken[] {
  return diffWords(original, rewritten);
}
