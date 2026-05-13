import { Readability } from '@mozilla/readability';

const MIN_TEXT_LENGTH = 500;

export interface ArticleDetectionResult {
  title: string;
  byline: string;
  textContent: string;
  excerpt: string;
}

export function detectArticle(): ArticleDetectionResult | null {
  const cloned = document.cloneNode(true) as Document;
  const reader = new Readability(cloned);
  const result = reader.parse();

  if (!result || result.textContent.trim().length < MIN_TEXT_LENGTH) {
    return null;
  }

  return {
    title: result.title,
    byline: result.byline ?? '',
    textContent: result.textContent,
    excerpt: result.excerpt ?? '',
  };
}
