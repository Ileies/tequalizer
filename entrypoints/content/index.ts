import { detectArticle } from './articleDetector.ts';
import { runAutoRewrite } from './autoRewriteOrchestrator.ts';
import type { ChunkInfo } from './autoRewriteOrchestrator.ts';
import { ChunkStreamParser } from './chunkStreamParser.ts';
import { sendMessage } from '../../src/messaging/client.ts';
import { segmentDocument, type Segment } from './domSegmenter.ts';
import { shouldRewrite } from './segmentClassifier.ts';
import {
  createStreamingNode,
  finalizeStreaming,
  addHoverPreview,
  restoreOriginal,
  getOriginal,
} from './domSurgeon.ts';

let rewriteProgress: { total: number; done: number; failed: number; running: boolean } | null = null;

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    browser.runtime.onMessage.addListener(
      (msg: unknown, _sender, sendResponse: (r: unknown) => void) => {
        const m = msg as { type: string; payload?: unknown };
        if (m.type === 'TRIGGER_REWRITE') {
          const { styleId } = m.payload as { styleId: string };
          rewriteProgress = { total: 0, done: 0, failed: 0, running: true };
          const trackingRewriter = async (
            chunk: ChunkInfo,
            requestId: string,
            sId: string,
            signal: AbortSignal
          ): Promise<void> => {
            if (rewriteProgress && rewriteProgress.total === 0) {
              rewriteProgress.total = chunk.totalSegments;
            }
            try {
              await chunkRewriter(chunk, requestId, sId, signal);
              if (rewriteProgress) rewriteProgress.done += chunk.segments.length;
            } catch (e) {
              if (rewriteProgress) rewriteProgress.failed += chunk.segments.length;
              throw e;
            }
          };
          runAutoRewrite(styleId, trackingRewriter)
            .then((result) => {
              rewriteProgress = { total: result.total, done: result.rewritten, failed: result.failed, running: false };
            })
            .catch((e) => {
              if (rewriteProgress) rewriteProgress.running = false;
              console.error(e);
            });
          return false;
        }
        if (m.type === 'GET_REWRITE_PROGRESS') {
          sendResponse(rewriteProgress);
          return true;
        }
        if (m.type === 'GET_PAGE_SAMPLES') {
          const text = collectPageText();
          sendResponse(text ? { text } : null);
          return true;
        }
        if (m.type === 'GET_SEGMENT_COUNT') {
          const count = segmentDocument().filter((s) => shouldRewrite(s).rewrite).length;
          sendResponse({ count });
          return true;
        }
        return false;
      }
    );

    const article = detectArticle();
    if (!article) return;

    const settings = await sendMessage({ type: 'GET_SETTINGS' });
    if (!settings.autoRewrite.enabled) return;

    const domain = location.hostname;
    if (settings.autoRewrite.excludeDomains.includes(domain)) return;

    await runAutoRewrite(settings.activeStyleId, chunkRewriter, document.body, { autoDismiss: true });
  },
});

function collectPageText(): string {
  const article = detectArticle();
  if (article) return article.textContent.trim().slice(0, 3000);
  const texts: string[] = [];
  for (const el of document.querySelectorAll('p, h1, h2, h3')) {
    const text = el.textContent?.trim() ?? '';
    if (text.length > 40) texts.push(text);
    if (texts.join('\n\n').length > 3000) break;
  }
  return texts.join('\n\n').slice(0, 3000);
}

async function chunkRewriter(
  chunk: ChunkInfo,
  requestId: string,
  styleId: string,
  signal: AbortSignal
): Promise<void> {
  if (signal.aborted) return;

  const { segments, globalIndices, totalSegments } = chunk;
  const streamNodes: (Text | null)[] = segments.map(() => null);
  const accTexts: string[] = segments.map(() => '');

  const parser = new ChunkStreamParser(
    (localIdx) => {
      const seg = segments[localIdx];
      if (!seg) return;
      streamNodes[localIdx] = createStreamingNode(seg.element);
    },
    (localIdx, text) => {
      accTexts[localIdx] = (accTexts[localIdx] ?? '') + text;
      const node = streamNodes[localIdx];
      if (node) node.textContent = accTexts[localIdx] ?? '';
    },
    (localIdx) => {
      const seg = segments[localIdx];
      if (!seg) return;
      const text = accTexts[localIdx] ?? '';
      if (text) {
        finalizeStreaming(seg.element, text);
        addHoverPreview(seg.element);
      } else {
        restoreOriginal(seg.element);
      }
    }
  );

  function cleanup(): void {
    parser.finish();
    for (const [i, seg] of segments.entries()) {
      if ((streamNodes[i] ?? null) === null) restoreOriginal(seg.element);
    }
  }

  const port = browser.runtime.connect({ name: `rewrite-${requestId}` });

  return new Promise<void>((resolve, reject) => {
    const segmentPayloads = segments.map((seg, localIdx) => ({
      text: getOriginal(seg.element) ?? seg.text,
      localIndex: localIdx,
      globalIndex: globalIndices[localIdx] ?? localIdx,
      totalSegments,
    }));

    port.postMessage({
      type: 'CHUNK_REWRITE_REQUEST',
      payload: { segments: segmentPayloads, styleId, requestId },
    });

    port.onMessage.addListener((msg: { type: string; payload: Record<string, string> }) => {
      if (signal.aborted) {
        port.disconnect();
        cleanup();
        resolve();
        return;
      }

      if (msg.type === 'REWRITE_TOKEN') {
        parser.feed(msg.payload['token'] ?? '');
      } else if (msg.type === 'CHUNK_REWRITE_DONE') {
        cleanup();
        port.disconnect();
        resolve();
      } else if (msg.type === 'REWRITE_ERROR') {
        console.error('[tequalizer] REWRITE_ERROR:', msg.payload['error']);
        for (const seg of segments) restoreOriginal(seg.element);
        port.disconnect();
        reject(new Error(msg.payload['error'] ?? 'Unknown error'));
      }
    });

    port.onDisconnect.addListener(() => {
      cleanup();
      resolve();
    });

    signal.addEventListener('abort', () => {
      port.disconnect();
      cleanup();
      resolve();
    });
  });
}
