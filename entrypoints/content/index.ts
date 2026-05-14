import { detectArticle } from './articleDetector.ts';
import { runAutoRewrite } from './autoRewriteOrchestrator.ts';
import { sendMessage } from '../../src/messaging/client.ts';
import type { Segment } from './domSegmenter.ts';
import {
  createStreamingNode,
  finalizeStreaming,
  addHoverPreview,
  restoreOriginal,
  getOriginal,
} from './domSurgeon.ts';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    browser.runtime.onMessage.addListener(
      (msg: unknown, _sender, sendResponse: (r: unknown) => void) => {
        const m = msg as { type: string; payload?: unknown };
        if (m.type === 'TRIGGER_REWRITE') {
          const { styleId } = m.payload as { styleId: string };
          runAutoRewrite(styleId, segmentRewriter).catch(console.error);
          return false;
        }
        if (m.type === 'GET_PAGE_SAMPLES') {
          const text = collectPageText();
          sendResponse(text ? { text } : null);
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

    await runAutoRewrite(settings.activeStyleId, segmentRewriter);
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

async function segmentRewriter(
  segment: Segment,
  requestId: string,
  styleId: string,
  signal: AbortSignal
): Promise<void> {
  if (signal.aborted) return;

  const streamNode = createStreamingNode(segment.element);
  const port = browser.runtime.connect({ name: `rewrite-${requestId}` });
  let fullText = '';

  return new Promise<void>((resolve, reject) => {
    port.postMessage({
      type: 'REWRITE_REQUEST',
      payload: { text: segment.text, styleId, requestId },
    });

    port.onMessage.addListener((msg: { type: string; payload: Record<string, string> }) => {
      if (signal.aborted) {
        port.disconnect();
        const orig = getOriginal(segment.element);
        if (orig !== undefined) segment.element.textContent = orig;
        resolve();
        return;
      }

      if (msg.type === 'REWRITE_TOKEN') {
        fullText += msg.payload['token'] ?? '';
        streamNode.textContent = fullText;
      } else if (msg.type === 'REWRITE_DONE') {
        finalizeStreaming(segment.element, fullText);
        addHoverPreview(segment.element);
        port.disconnect();
        resolve();
      } else if (msg.type === 'REWRITE_ERROR') {
        restoreOriginal(segment.element);
        port.disconnect();
        reject(new Error(msg.payload['error'] ?? 'Unknown error'));
      }
    });

    port.onDisconnect.addListener(() => {
      if (fullText) {
        finalizeStreaming(segment.element, fullText);
        addHoverPreview(segment.element);
      } else {
        restoreOriginal(segment.element);
      }
      resolve();
    });

    signal.addEventListener('abort', () => {
      port.disconnect();
      const orig = getOriginal(segment.element);
      if (orig !== undefined) segment.element.textContent = orig;
      resolve();
    });
  });
}
