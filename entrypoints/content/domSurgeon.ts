const originalTexts = new WeakMap<Element, string>();
const rewrittenTexts = new WeakMap<Element, string>();

export function saveOriginal(element: Element): void {
  if (!originalTexts.has(element)) {
    originalTexts.set(element, element.textContent ?? '');
  }
}

export function getOriginal(element: Element): string | undefined {
  return originalTexts.get(element);
}

export function createStreamingNode(element: Element): Text {
  saveOriginal(element);
  element.textContent = '';
  const node = document.createTextNode('');
  element.appendChild(node);
  return node;
}

export function finalizeStreaming(element: Element, fullText: string): void {
  rewrittenTexts.set(element, fullText);
  element.textContent = fullText;
  element.setAttribute('data-rewritten', 'true');
  element.removeAttribute('data-showing');
}

export function restoreOriginal(element: Element): void {
  const original = originalTexts.get(element);
  if (original === undefined) return;
  element.textContent = original;
  element.removeAttribute('data-rewritten');
  element.removeAttribute('data-showing');
}

export function addHoverPreview(element: Element): void {
  const original = originalTexts.get(element);
  if (!original) return;

  let tooltip: HTMLElement | null = null;

  element.addEventListener('mouseenter', () => {
    tooltip = document.createElement('div');
    tooltip.textContent = original;
    Object.assign(tooltip.style, {
      position: 'fixed',
      background: '#1e1e2e',
      color: '#cdd6f4',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      maxWidth: '340px',
      lineHeight: '1.5',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      zIndex: '2147483647',
      pointerEvents: 'none',
      fontFamily: 'system-ui, sans-serif',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    });
    document.body.appendChild(tooltip);
  });

  element.addEventListener('mousemove', (e) => {
    const ev = e as MouseEvent;
    if (tooltip) {
      tooltip.style.left = `${Math.min(ev.clientX + 14, window.innerWidth - 360)}px`;
      tooltip.style.top = `${Math.min(ev.clientY + 14, window.innerHeight - 100)}px`;
    }
  });

  element.addEventListener('mouseleave', () => {
    tooltip?.remove();
    tooltip = null;
  });
}

export function showOriginals(root: Element = document.body): void {
  root.querySelectorAll('[data-rewritten="true"]').forEach((el) => {
    const original = originalTexts.get(el);
    if (original !== undefined) {
      el.textContent = original;
      el.setAttribute('data-showing', 'original');
    }
  });
}

export function showRewritten(root: Element = document.body): void {
  root.querySelectorAll('[data-rewritten="true"]').forEach((el) => {
    const rewritten = rewrittenTexts.get(el);
    if (rewritten !== undefined) {
      el.textContent = rewritten;
      el.removeAttribute('data-showing');
    }
  });
}
