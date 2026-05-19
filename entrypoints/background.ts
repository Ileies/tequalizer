import { getState, setState, updateSettings } from '../src/storage/storageAdapter.ts';
import { getActiveProvider, getProviderById } from '../src/llm/providerRegistry.ts';
import { buildChunkPrompt } from '../src/llm/promptBuilder.ts';
import type { ChunkSegmentInfo } from '../src/llm/promptBuilder.ts';
import { buildExtractionPrompt, parseExtractedStyle } from '../src/llm/styleExtractor.ts';
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
    case 'EXTRACT_STYLE': {
      try {
        const state = await getState();
        const provider = getActiveProvider(state.settings);
        const { systemPrompt, userPrompt } = buildExtractionPrompt(msg.payload.text);
        const gen = provider.streamRewrite({
          text: msg.payload.text,
          systemPrompt,
          userPrompt,
          temperature: 0,
          maxTokens: 512,
        });
        let fullText = '';
        let step = await gen.next();
        while (!step.done) {
          fullText += step.value;
          step = await gen.next();
        }
        const result = parseExtractedStyle(fullText);
        sendResponse(result ?? { error: 'Style konnte nicht extrahiert werden.' });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unbekannter Fehler';
        sendResponse({ error });
      }
      break;
    }
    case 'VALIDATE_API_KEY': {
      try {
        const state = await getState();
        const { provider: providerId, key } = msg.payload;
        const provider = getProviderById(providerId);
        if (!provider) {
          sendResponse({ ok: false, error: 'Unbekannter Anbieter.' });
          break;
        }
        const candidateSettings = {
          ...state.settings,
          apiKeys: {
            ...state.settings.apiKeys,
            ...(providerId === 'openai' ? { openai: key } : {}),
            ...(providerId === 'claude' ? { claude: key } : {}),
          },
          ...(providerId === 'ollama' ? { ollamaEndpoint: key } : {}),
        };
        const result = await provider.validateCredentials(candidateSettings);
        sendResponse(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (message.includes('Not implemented')) {
          sendResponse({ ok: true });
        } else {
          sendResponse({ ok: false, error: message || 'Validierungsfehler.' });
        }
      }
      break;
    }
    default:
      sendResponse(undefined);
  }
}

type RewritePort = Parameters<Parameters<typeof browser.runtime.onConnect.addListener>[0]>[0];

async function handleRewritePort(port: RewritePort): Promise<void> {
  const controller = new AbortController();

  port.onDisconnect.addListener(() => controller.abort());

  port.onMessage.addListener(
    async (msg: { type: string; payload: Record<string, unknown> }) => {
      if (msg.type === 'CHUNK_REWRITE_REQUEST') {
        const { segments, styleId, requestId } = msg.payload as {
          segments: ChunkSegmentInfo[];
          styleId: string;
          requestId: string;
        };

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
          const { systemPrompt, userPrompt } = buildChunkPrompt(segments, style, state.settings);

          const gen = provider.streamRewrite({
            text: userPrompt,
            systemPrompt,
            userPrompt,
            signal: controller.signal,
          });

          let step = await gen.next();
          while (!step.done) {
            if (controller.signal.aborted) {
              await gen.return({ fullText: '', usage: undefined });
              return;
            }
            port.postMessage({ type: 'REWRITE_TOKEN', payload: { requestId, token: step.value } });
            step = await gen.next();
          }

          if (!controller.signal.aborted) {
            port.postMessage({ type: 'CHUNK_REWRITE_DONE', payload: { requestId } });
          }
        } catch (err) {
          const error = err instanceof Error ? err.message : 'Unbekannter Fehler';
          if (!controller.signal.aborted) {
            port.postMessage({ type: 'REWRITE_ERROR', payload: { requestId, error } });
          }
        }
      }
    }
  );
}
