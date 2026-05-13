import { getState, setState, updateSettings } from '../src/storage/storageAdapter.ts';
import { getActiveProvider } from '../src/llm/providerRegistry.ts';
import { buildPrompt } from '../src/llm/promptBuilder.ts';
import { checkFidelity } from '../src/fidelity/checker.ts';
import type { Message } from '../src/messaging/types.ts';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (msg: Message, _sender, sendResponse: (response: unknown) => void) => {
      handleMessage(msg, sendResponse);
      return true; // keep channel open for async response
    }
  );

  browser.runtime.onConnect.addListener((port) => {
    if (port.name.startsWith('rewrite-')) {
      handleRewritePort(port).catch(console.error);
    }
  });
});

async function handleMessage(
  msg: Message,
  sendResponse: (response: unknown) => void
): Promise<void> {
  switch (msg.type) {
    case 'GET_SETTINGS': {
      const state = await getState();
      sendResponse(state.settings);
      break;
    }
    case 'UPDATE_SETTINGS': {
      await updateSettings(msg.payload);
      sendResponse(undefined);
      break;
    }
    case 'SAVE_STYLE': {
      const state = await getState();
      const existing = state.styleLibrary.findIndex((s) => s.id === msg.payload.id);
      const library =
        existing >= 0
          ? state.styleLibrary.map((s) => (s.id === msg.payload.id ? msg.payload : s))
          : [...state.styleLibrary, msg.payload];
      await setState({ styleLibrary: library });
      sendResponse(undefined);
      break;
    }
    case 'DELETE_STYLE': {
      const state = await getState();
      await setState({
        styleLibrary: state.styleLibrary.filter(
          (s) => s.id !== msg.payload.id || s.builtIn
        ),
      });
      sendResponse(undefined);
      break;
    }
    default:
      sendResponse(undefined);
  }
}

async function handleRewritePort(port: chrome.runtime.Port): Promise<void> {
  const controller = new AbortController();

  port.onDisconnect.addListener(() => controller.abort());

  port.onMessage.addListener(
    async (msg: {
      type: string;
      payload: { text: string; styleId: string; requestId: string };
    }) => {
      if (msg.type !== 'REWRITE_REQUEST') return;
      const { text, styleId, requestId } = msg.payload;

      try {
        const state = await getState();
        const style = state.styleLibrary.find((s) => s.id === styleId);
        if (!style) {
          port.postMessage({
            type: 'REWRITE_ERROR',
            payload: { requestId, error: 'Style nicht gefunden.' },
          });
          return;
        }

        const provider = getActiveProvider(state.settings);
        const { systemPrompt, userPrompt } = buildPrompt(text, style, state.settings);

        const gen = provider.streamRewrite({
          text,
          systemPrompt,
          userPrompt,
          signal: controller.signal,
        });

        let fullText = '';
        let step = await gen.next();
        while (!step.done) {
          if (controller.signal.aborted) {
            await gen.return({ fullText, usage: undefined });
            return;
          }
          fullText += step.value;
          port.postMessage({ type: 'REWRITE_TOKEN', payload: { requestId, token: step.value } });
          step = await gen.next();
        }

        if (controller.signal.aborted) return;

        const fidelity = checkFidelity(text, fullText);
        port.postMessage({ type: 'REWRITE_DONE', payload: { requestId, fullText, fidelity } });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unbekannter Fehler';
        if (!controller.signal.aborted) {
          port.postMessage({ type: 'REWRITE_ERROR', payload: { requestId, error } });
        }
      }
    }
  );
}
