import { describe, it, expect, vi } from 'vitest';
import { ChunkStreamParser } from '../../entrypoints/content/chunkStreamParser.ts';

function makeParser() {
  const activated: number[] = [];
  const texts: Record<number, string> = {};
  const finalized: number[] = [];

  const parser = new ChunkStreamParser(
    (idx) => activated.push(idx),
    (idx, text) => { texts[idx] = (texts[idx] ?? '') + text; },
    (idx) => finalized.push(idx)
  );

  return { parser, activated, texts, finalized };
}

describe('ChunkStreamParser', () => {
  it('activates and finalizes a single segment fed in one token', () => {
    const { parser, activated, texts, finalized } = makeParser();
    parser.feed('<<<S:0>>>\nHello world');
    parser.finish();
    expect(activated).toEqual([0]);
    expect(texts[0]).toBe('Hello world');
    expect(finalized).toEqual([0]);
  });

  it('handles two segments in sequence', () => {
    const { parser, activated, texts, finalized } = makeParser();
    parser.feed('<<<S:0>>>\nFirst paragraph\n\n<<<S:1>>>\nSecond paragraph');
    parser.finish();
    expect(activated).toEqual([0, 1]);
    expect(texts[0]).toBe('First paragraph\n\n');
    expect(texts[1]).toBe('Second paragraph');
    expect(finalized).toEqual([0, 1]);
  });

  it('reconstructs text when marker arrives split across tokens', () => {
    const { parser, activated, texts, finalized } = makeParser();
    parser.feed('<<<S:0>>>\nHello ');
    parser.feed('world\n\n<<<');
    parser.feed('S:1>>>\nNext');
    parser.finish();
    expect(activated).toEqual([0, 1]);
    expect(texts[0]).toBe('Hello world\n\n');
    expect(texts[1]).toBe('Next');
    expect(finalized).toEqual([0, 1]);
  });

  it('does not emit marker bytes as text to the DOM', () => {
    const { parser, texts } = makeParser();
    parser.feed('<<<S:0>>>\nActual text');
    parser.finish();
    expect(texts[0]).not.toContain('<<<');
    expect(texts[0]).not.toContain('S:0');
    expect(texts[0]).not.toContain('>>>');
  });

  it('strips optional trailing newline after marker', () => {
    const { parser, texts } = makeParser();
    parser.feed('<<<S:0>>>\nHello');
    parser.finish();
    expect(texts[0]).toBe('Hello');
  });

  it('handles finish() with no active segment gracefully', () => {
    const { parser, activated, finalized } = makeParser();
    parser.finish();
    expect(activated).toEqual([]);
    expect(finalized).toEqual([]);
  });

  it('fires callbacks in correct order for three segments', () => {
    const order: string[] = [];
    const parser = new ChunkStreamParser(
      (i) => order.push(`activate:${i}`),
      () => {},
      (i) => order.push(`finalize:${i}`),
    );
    parser.feed('<<<S:0>>>\nA\n<<<S:1>>>\nB\n<<<S:2>>>\nC');
    parser.finish();
    expect(order).toEqual(['activate:0', 'finalize:0', 'activate:1', 'finalize:1', 'activate:2', 'finalize:2']);
  });

  it('does not call onText before first marker', () => {
    const onText = vi.fn();
    const parser = new ChunkStreamParser(() => {}, onText, () => {});
    parser.feed('preamble text <<<S:0>>>\nActual');
    parser.finish();
    // preamble before first marker has no active segment → onText not called for it
    const calls = onText.mock.calls.map(([, text]) => text as string);
    expect(calls.every((t) => !t.includes('preamble'))).toBe(true);
  });
});
