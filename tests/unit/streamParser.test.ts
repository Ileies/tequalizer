import { describe, it, expect } from 'vitest';
import { parseSSEStream } from '../../src/llm/streamParser.ts';

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

function sseChunk(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content }, finish_reason: null }], usage: null })}\n\n`;
}

const DONE_WITH_USAGE = `data: ${JSON.stringify({
  choices: [{ delta: {}, finish_reason: 'stop' }],
  usage: { prompt_tokens: 10, completion_tokens: 5 },
})}\n\ndata: [DONE]\n\n`;

describe('parseSSEStream', () => {
  it('yields tokens in order and returns usage', async () => {
    const stream = makeStream([
      sseChunk('Hallo'),
      sseChunk(' Welt'),
      sseChunk('!'),
      DONE_WITH_USAGE,
    ]);

    const tokens: string[] = [];
    const gen = parseSSEStream(stream);

    let step = await gen.next();
    while (!step.done) {
      tokens.push(step.value);
      step = await gen.next();
    }

    expect(tokens).toEqual(['Hallo', ' Welt', '!']);
    expect(step.value).toEqual({ promptTokens: 10, completionTokens: 5 });
  });

  it('handles chunks split across SSE line boundaries', async () => {
    // Simulate a chunk that arrives mid-line
    const line = sseChunk('split');
    const half = Math.floor(line.length / 2);
    const stream = makeStream([line.slice(0, half), line.slice(half), DONE_WITH_USAGE]);

    const tokens: string[] = [];
    const gen = parseSSEStream(stream);
    let step = await gen.next();
    while (!step.done) {
      tokens.push(step.value);
      step = await gen.next();
    }

    expect(tokens).toEqual(['split']);
  });

  it('skips malformed JSON lines without throwing', async () => {
    const stream = makeStream([
      'data: {invalid json}\n\n',
      sseChunk('ok'),
      DONE_WITH_USAGE,
    ]);

    const tokens: string[] = [];
    const gen = parseSSEStream(stream);
    let step = await gen.next();
    while (!step.done) {
      tokens.push(step.value);
      step = await gen.next();
    }

    expect(tokens).toEqual(['ok']);
  });

  it('returns undefined usage when not provided', async () => {
    const stream = makeStream([sseChunk('x'), 'data: [DONE]\n\n']);
    const gen = parseSSEStream(stream);
    let step = await gen.next();
    while (!step.done) step = await gen.next();
    expect(step.value).toBeUndefined();
  });
});
