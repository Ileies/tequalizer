import { segmentDocument, type Segment } from './domSegmenter.ts';
import { shouldRewrite } from './segmentClassifier.ts';

const MAX_CONCURRENT = 3;

export type SegmentRewriter = (
  segment: Segment,
  requestId: string,
  styleId: string,
  signal: AbortSignal
) => Promise<void>;

export interface OrchestratorResult {
  total: number;
  rewritten: number;
  stopped: boolean;
}

async function processWithConcurrency(
  items: Segment[],
  concurrency: number,
  task: (item: Segment) => Promise<void>,
  signal: AbortSignal
): Promise<void> {
  const executing = new Set<Promise<void>>();
  for (const item of items) {
    if (signal.aborted) break;
    const p = task(item).finally(() => executing.delete(p));
    executing.add(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
}

function byVerticalPosition(a: Segment, b: Segment): number {
  const aTop = a.element.getBoundingClientRect().top + window.scrollY;
  const bTop = b.element.getBoundingClientRect().top + window.scrollY;
  return aTop - bTop;
}

function createBanner(total: number): { root: HTMLElement; updateText: (done: number) => void } {
  const root = document.createElement('div');
  root.setAttribute('data-rewrite-banner', 'true');
  Object.assign(root.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: '2147483647',
    background: '#1e1e2e',
    color: '#cdd6f4',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    maxWidth: '320px',
  });

  const text = document.createElement('span');
  text.textContent = `0 von ${total} Abschnitten umformuliert`;
  root.appendChild(text);

  const updateText = (done: number): void => {
    text.textContent = `${done} von ${total} Abschnitten umformuliert`;
  };

  return { root, updateText };
}

function addStopButton(
  banner: HTMLElement,
  controller: AbortController
): void {
  const btn = document.createElement('button');
  btn.textContent = 'Stop';
  Object.assign(btn.style, {
    background: '#f38ba8',
    color: '#1e1e2e',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: '0',
  });
  btn.addEventListener('click', () => controller.abort());
  banner.appendChild(btn);
}

export async function runAutoRewrite(
  styleId: string,
  rewriter: SegmentRewriter,
  root: Element = document.body
): Promise<OrchestratorResult> {
  const segments = segmentDocument(root);
  const rewritable = segments
    .filter((s) => shouldRewrite(s).rewrite)
    .sort(byVerticalPosition);

  if (rewritable.length === 0) {
    return { total: 0, rewritten: 0, stopped: false };
  }

  const controller = new AbortController();
  const { root: bannerEl, updateText } = createBanner(rewritable.length);
  addStopButton(bannerEl, controller);
  document.body.appendChild(bannerEl);

  let rewritten = 0;

  await processWithConcurrency(
    rewritable,
    MAX_CONCURRENT,
    async (segment) => {
      if (controller.signal.aborted) return;
      const requestId = crypto.randomUUID();
      try {
        await rewriter(segment, requestId, styleId, controller.signal);
        rewritten++;
        updateText(rewritten);
      } catch {
        // segment skipped on error — continue with others
      }
    },
    controller.signal
  );

  setTimeout(() => bannerEl.remove(), 3000);

  return { total: rewritable.length, rewritten, stopped: controller.signal.aborted };
}
