import type { LLMProvider, RewriteRequest, StreamResult } from './types.ts';
import type { Settings } from '../storage/schema.ts';
import { parseSSEStream } from './streamParser.ts';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function mapHttpError(status: number, body: string): string {
  if (status === 401) return 'Ungültiger API-Key. Bitte in den Einstellungen prüfen.';
  if (status === 429) return 'Rate-Limit erreicht. Bitte kurz warten.';
  if (status >= 500) return `OpenAI-Serverfehler (${status}). Bitte später versuchen.`;
  return `Unerwarteter Fehler (${status}): ${body.slice(0, 200)}`;
}

export const openaiProvider: LLMProvider = {
  id: 'openai',
  displayName: 'OpenAI',

  isConfigured(settings: Settings): boolean {
    return Boolean(settings.apiKeys.openai);
  },

  async validateCredentials(settings: Settings): Promise<{ ok: boolean; error?: string }> {
    const apiKey = settings.apiKeys.openai;
    if (!apiKey) return { ok: false, error: 'Kein API-Key konfiguriert.' };

    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: mapHttpError(res.status, body) };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Netzwerkfehler beim Validieren des API-Keys.' };
    }
  },

  async *streamRewrite(req: RewriteRequest): AsyncGenerator<string, StreamResult, void> {
    const state = await (await import('../storage/storageAdapter.ts')).getState();
    const apiKey = state.settings.apiKeys.openai;
    if (!apiKey) throw new Error('Kein API-Key konfiguriert.');

    const model = state.settings.openaiModel ?? 'gpt-4.1-mini';

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        stream_options: { include_usage: true },
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 4096,
        messages: [
          { role: 'system', content: req.systemPrompt },
          { role: 'user', content: req.userPrompt },
        ],
      }),
      signal: req.signal,
    });

    if (!res.ok || !res.body) {
      const body = await res.text();
      throw new Error(mapHttpError(res.status, body));
    }

    // Manually iterate so we can both yield tokens and collect fullText
    let fullText = '';
    const parser = parseSSEStream(res.body);

    let step = await parser.next();
    while (!step.done) {
      fullText += step.value;
      yield step.value;
      step = await parser.next();
    }

    return { fullText, usage: step.value };
  },
};
