import type { Segment } from './domSegmenter.ts';

const CONTENT_THRESHOLD = 0.3;
const MIN_WORDS_NONCONTENT = 10;

// Elements whose text is always rewritten regardless of length.
// All other elements require MIN_WORDS_NONCONTENT words to qualify.
const CONTENT_TAGS = new Set(['p', 'li', 'blockquote', 'dt', 'dd', 'figcaption']);

export type ClassificationReason =
  | 'too_few_words'
  | 'numeric_only'
  | 'chrome_region'
  | 'code'
  | 'tabular'
  | 'heading'
  | 'link_dense'
  | 'boilerplate'
  | 'low_content_score'
  | 'content_segment';

export interface ClassificationResult {
  rewrite: boolean;
  reason: ClassificationReason;
}

function linkCharCount(segment: Segment): number {
  return Array.from(segment.element.querySelectorAll('a')).reduce(
    (sum, a) => sum + (a.textContent?.length ?? 0),
    0
  );
}

function computeContentScore(segment: Segment): number {
  const { text } = segment;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentenceCount = (text.match(/[.!?]+/g) ?? []).length;

  if (sentenceCount === 0) return 0;

  const avgWordsPerSentence = wordCount / sentenceCount;
  const sentenceScore = avgWordsPerSentence >= 8 && avgWordsPerSentence <= 40 ? 0.6 : 0.2;
  const lengthScore = Math.min(text.length / 300, 0.4);

  return sentenceScore + lengthScore;
}

export function shouldRewrite(segment: Segment): ClassificationResult {
  const isContent = CONTENT_TAGS.has(segment.element.tagName.toLowerCase());
  const wordCount = segment.text.split(/\s+/).filter(Boolean).length;

  if (!isContent && wordCount < MIN_WORDS_NONCONTENT)
    return { rewrite: false, reason: 'too_few_words' };

  if (/^[\d\s.,€$%\-+/]+$/.test(segment.text))
    return { rewrite: false, reason: 'numeric_only' };

  if (
    segment.element.closest(
      'nav, header, footer, aside, [role="navigation"], .menu, .sidebar'
    )
  )
    return { rewrite: false, reason: 'chrome_region' };

  if (segment.element.closest('code, pre')) return { rewrite: false, reason: 'code' };

  if (segment.element.closest('table')) return { rewrite: false, reason: 'tabular' };

  if (segment.element.matches('h1, h2, h3, h4, h5, h6'))
    return { rewrite: false, reason: 'heading' };

  if (linkCharCount(segment) / segment.text.length > 0.3)
    return { rewrite: false, reason: 'link_dense' };

  if (/©|all rights reserved|cookie|privacy policy/i.test(segment.text))
    return { rewrite: false, reason: 'boilerplate' };

  if (!isContent) {
    const score = computeContentScore(segment);
    if (score < CONTENT_THRESHOLD) return { rewrite: false, reason: 'low_content_score' };
  }

  return { rewrite: true, reason: 'content_segment' };
}
