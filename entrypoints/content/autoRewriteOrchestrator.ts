import { segmentDocument, type Segment } from './domSegmenter.ts';
import { shouldRewrite } from './segmentClassifier.ts';
import { showOriginals, showRewritten } from './domSurgeon.ts';

const MAX_CONCURRENT = 3;

// Maximum number of words bundled into a single LLM call.
// Lower values → more parallel calls, less cross-paragraph coherence.
// Higher values → fewer calls, better coherence, longer wait per chunk.
export const CHUNK_WORD_BUDGET = 600;

export interface ChunkInfo {
  segments: Segment[];
  globalIndices: number[];
  totalSegments: number;
}

export type ChunkRewriter = (
  chunk: ChunkInfo,
  requestId: string,
  styleId: string,
  signal: AbortSignal
) => Promise<void>;

export interface OrchestratorResult {
  total: number;
  rewritten: number;
  stopped: boolean;
}

async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>,
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

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function buildChunks(segments: Segment[]): Array<{ segments: Segment[]; globalIndices: number[] }> {
  const chunks: Array<{ segments: Segment[]; globalIndices: number[] }> = [];
  let current: Segment[] = [];
  let currentIndices: number[] = [];
  let wordCount = 0;

  for (const [i, seg] of segments.entries()) {
    const words = countWords(seg.text);

    if (current.length > 0 && wordCount + words > CHUNK_WORD_BUDGET) {
      chunks.push({ segments: current, globalIndices: currentIndices });
      current = [];
      currentIndices = [];
      wordCount = 0;
    }

    current.push(seg);
    currentIndices.push(i);
    wordCount += words;
  }

  if (current.length > 0) {
    chunks.push({ segments: current, globalIndices: currentIndices });
  }

  return chunks;
}

interface BannerElements {
  root: HTMLElement;
  updateText: (done: number, total: number) => void;
  addStopButton: (controller: AbortController) => void;
  addToggle: (root: Element) => void;
}

function createCollapseButton(
  content: HTMLElement,
  getLabel: () => string
): HTMLButtonElement {
  let collapsed = false;
  const btn = document.createElement('button');
  btn.textContent = '−';
  btn.title = 'Ausblenden';
  Object.assign(btn.style, {
    background: 'transparent',
    color: '#a6adc8',
    border: 'none',
    borderRadius: '4px',
    padding: '0 4px',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
    flexShrink: '0',
    marginLeft: 'auto',
  });
  btn.addEventListener('click', () => {
    collapsed = !collapsed;
    content.style.display = collapsed ? 'none' : 'contents';
    btn.textContent = collapsed ? getLabel() : '−';
    btn.title = collapsed ? 'Einblenden' : 'Ausblenden';
    Object.assign(btn.style, {
      fontSize: collapsed ? '12px' : '16px',
      background: collapsed ? '#313244' : 'transparent',
      padding: collapsed ? '2px 8px' : '0 4px',
      color: collapsed ? '#cdd6f4' : '#a6adc8',
    });
  });
  return btn;
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

  const content = document.createElement('span');
  content.style.display = 'contents';

  const text = document.createElement('span');
  text.textContent = '0 von … Abschnitten umformuliert';
  content.appendChild(text);
  root.appendChild(content);

  let currentLabel = '…';
  const collapseBtn = createCollapseButton(content, () => currentLabel);
  root.appendChild(collapseBtn);

  return {
    root,
    updateText(done, total) {
      text.textContent = `${done} von ${total} Abschnitten umformuliert`;
      currentLabel = `${done}/${total}`;
    },
    addStopButton(controller: AbortController) {
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
      content.appendChild(btn);
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
      content.appendChild(btn);
    },
  };
}


export async function runAutoRewrite(
  styleId: string,
  rewriter: ChunkRewriter,
  root: Element = document.body
): Promise<OrchestratorResult> {
  const segments = segmentDocument(root);
  const rewritable = segments
    .filter((s) => shouldRewrite(s).rewrite)
    .sort(byVerticalPosition);

  if (rewritable.length === 0) {
    return { total: 0, rewritten: 0, stopped: false };
  }

  const chunks = buildChunks(rewritable);
  const totalSegments = rewritable.length;

  const controller = new AbortController();
  const banner = createBanner();
  banner.updateText(0, totalSegments);
  banner.addStopButton(controller);
  document.body.appendChild(banner.root);

  let rewritten = 0;

  await processWithConcurrency(
    chunks,
    MAX_CONCURRENT,
    async (chunk) => {
      if (controller.signal.aborted) return;
      const requestId = crypto.randomUUID();
      try {
        await rewriter(
          { segments: chunk.segments, globalIndices: chunk.globalIndices, totalSegments },
          requestId,
          styleId,
          controller.signal
        );
        rewritten += chunk.segments.length;
        banner.updateText(rewritten, totalSegments);
      } catch (e) {
        console.error('[tequalizer] chunk failed:', e);
      }
    },
    controller.signal
  );

  const stopBtn = banner.root.querySelector('button');
  stopBtn?.remove();
  banner.addToggle(root);

  return { total: totalSegments, rewritten, stopped: controller.signal.aborted };
}
