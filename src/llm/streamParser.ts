import type { TokenUsage } from './types.ts';

type ResponsesChunk =
  | { type: 'response.output_text.delta'; delta: string }
  | { type: 'response.completed'; response: { usage: { input_tokens: number; output_tokens: number } } };

export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string, TokenUsage | undefined, void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let usage: TokenUsage | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        let chunk: ResponsesChunk;
        try {
          chunk = JSON.parse(data) as ResponsesChunk;
        } catch {
          continue;
        }

        if (chunk.type === 'response.output_text.delta') {
          if (chunk.delta) yield chunk.delta;
        } else if (chunk.type === 'response.completed') {
          const u = chunk.response.usage;
          usage = { promptTokens: u.input_tokens, completionTokens: u.output_tokens };
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return usage;
}
