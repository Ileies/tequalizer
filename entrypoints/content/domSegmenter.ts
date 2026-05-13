export type SegmentRole = 'heading' | 'paragraph' | 'list-item' | 'blockquote' | 'other';

export interface Segment {
  element: Element;
  text: string;
  role: SegmentRole;
  index: number;
}

const BLOCK_SELECTORS = 'p, li, blockquote, h1, h2, h3, h4, h5, h6, dt, dd, figcaption';

function getRole(element: Element): SegmentRole {
  const tag = element.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'li') return 'list-item';
  if (tag === 'blockquote') return 'blockquote';
  if (tag === 'p') return 'paragraph';
  return 'other';
}

export function segmentDocument(root: Element = document.body): Segment[] {
  const elements = Array.from(root.querySelectorAll<Element>(BLOCK_SELECTORS));
  const segments: Segment[] = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]!;
    const text = element.textContent?.trim() ?? '';
    if (text.length > 0) {
      segments.push({ element, text, role: getRole(element), index: i });
    }
  }

  return segments;
}
