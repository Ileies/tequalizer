import type { TokenUsage } from './types.ts';

interface Delta {
  content?: string;
}

interface Choice {
  delta: Delta;
  finish_reason: string | null;
}

interface OpenAIChunk {
  choices: Choice[];
  usage?: { prompt_tokens: number; completion_tokens: number };
}

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
      // Keep the last (possibly incomplete) line in the buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        let chunk: OpenAIChunk;
        try {
          chunk = JSON.parse(data) as OpenAIChunk;
        } catch {
          continue;
        }

        if (chunk.usage) {
          usage = {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
          };
        }

        const content = chunk.choices[0]?.delta?.content;
        if (content) yield content;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return usage;
}
