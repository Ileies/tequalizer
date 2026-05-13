import { detectArticle } from './articleDetector.ts';
import { runAutoRewrite } from './autoRewriteOrchestrator.ts';
import { sendMessage } from '../../src/messaging/client.ts';
import type { Segment } from './domSegmenter.ts';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const article = detectArticle();
    if (!article) return;

    const settings = await sendMessage({ type: 'GET_SETTINGS' });
    if (!settings.autoRewrite.enabled) return;

    const domain = location.hostname;
    if (settings.autoRewrite.excludeDomains.includes(domain)) return;

    await runAutoRewrite(settings.activeStyleId, segmentRewriter);
  },
});

async function segmentRewriter(
  segment: Segment,
  requestId: string,
  styleId: string,
  signal: AbortSignal
): Promise<void> {
  if (signal.aborted) return;

  const port = browser.runtime.connect({ name: `rewrite-${requestId}` });

  return new Promise<void>((resolve, reject) => {
    let buffer = '';

    port.postMessage({
      type: 'REWRITE_REQUEST',
      payload: { text: segment.text, styleId, requestId },
    });

    port.onMessage.addListener((msg: { type: string; payload: Record<string, string> }) => {
      if (signal.aborted) {
        port.disconnect();
        resolve();
        return;
      }
      if (msg.type === 'REWRITE_TOKEN') {
        buffer += msg.payload['token'] ?? '';
        segment.element.textContent = buffer;
      } else if (msg.type === 'REWRITE_DONE') {
        port.disconnect();
        resolve();
      } else if (msg.type === 'REWRITE_ERROR') {
        port.disconnect();
        reject(new Error(msg.payload['error'] ?? 'Unknown error'));
      }
    });

    port.onDisconnect.addListener(() => resolve());

    signal.addEventListener('abort', () => {
      port.disconnect();
      resolve();
    });
  });
}
