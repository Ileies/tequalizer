import { segmentDocument, type Segment } from './domSegmenter.ts';
import { shouldRewrite } from './segmentClassifier.ts';
import { showOriginals, showRewritten } from './domSurgeon.ts';

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

interface BannerElements {
  root: HTMLElement;
  updateText: (done: number, total: number) => void;
  addToggle: (root: Element) => void;
}

function createBanner(): BannerElements {
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
    gap: '10px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    maxWidth: '400px',
  });

  const text = document.createElement('span');
  text.textContent = '0 von … Abschnitten umformuliert';
  root.appendChild(text);

  return {
    root,
    updateText(done, total) {
      text.textContent = `${done} von ${total} Abschnitten umformuliert`;
    },
    addToggle(docRoot: Element) {
      let showingOriginal = false;
      const btn = document.createElement('button');
      btn.textContent = 'Original';
      Object.assign(btn.style, {
        background: '#313244',
        color: '#cdd6f4',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '13px',
        flexShrink: '0',
      });
      btn.addEventListener('click', () => {
        showingOriginal = !showingOriginal;
        if (showingOriginal) {
          showOriginals(docRoot);
          btn.textContent = 'Umformuliert';
          btn.style.background = '#45475a';
        } else {
          showRewritten(docRoot);
          btn.textContent = 'Original';
          btn.style.background = '#313244';
        }
      });
      root.appendChild(btn);
    },
  };
}

function addStopButton(bannerEl: HTMLElement, controller: AbortController): void {
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
  bannerEl.appendChild(btn);
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
  const banner = createBanner();
  addStopButton(banner.root, controller);
  banner.updateText(0, rewritable.length);
  document.body.appendChild(banner.root);

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
        banner.updateText(rewritten, rewritable.length);
      } catch {
        // segment skipped on error — others continue
      }
    },
    controller.signal
  );

  // Replace Stop button with toggle
  const stopBtn = banner.root.querySelector('button');
  stopBtn?.remove();
  banner.addToggle(root);

  return { total: rewritable.length, rewritten, stopped: controller.signal.aborted };
}
