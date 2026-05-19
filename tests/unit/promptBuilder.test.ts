import { describe, it, expect } from 'vitest';
import { buildPrompt, buildChunkPrompt } from '../../src/llm/promptBuilder.ts';
import type { ChunkSegmentInfo } from '../../src/llm/promptBuilder.ts';
import { INITIAL_STATE, DEFAULT_STYLE } from '../../src/storage/schema.ts';
import type { StyleConfig } from '../../src/storage/schema.ts';

const BASE_SETTINGS = INITIAL_STATE.settings;
const TEXT = 'Die Erde ist rund und umkreist die Sonne in 365 Tagen.';

describe('buildPrompt', () => {
  it('contains the absolute rules block in every prompt', () => {
    const { systemPrompt } = buildPrompt(TEXT, DEFAULT_STYLE, BASE_SETTINGS);
    expect(systemPrompt).toContain('Erfinde keine Fakten');
    expect(systemPrompt).toContain('AUSSCHLIESSLICH mit dem umformulierten Text');
  });

  it('passes original text as userPrompt unchanged', () => {
    const { userPrompt } = buildPrompt(TEXT, DEFAULT_STYLE, BASE_SETTINGS);
    expect(userPrompt).toBe(TEXT);
  });

  it('neutral dimensions produce neutral fragment', () => {
    const { systemPrompt } = buildPrompt(TEXT, DEFAULT_STYLE, BASE_SETTINGS);
    expect(systemPrompt).toContain('Behalte ungefähre Länge des Originals');
  });

  it('compact length dimension (-2) produces compress fragment', () => {
    const style: StyleConfig = {
      ...DEFAULT_STYLE,
      dimensions: { ...DEFAULT_STYLE.dimensions, length: -2 },
    };
    const { systemPrompt } = buildPrompt(TEXT, style, BASE_SETTINGS);
    expect(systemPrompt).toContain('maximal komprimiert');
  });

  it('verbose length dimension (+2) produces expand fragment', () => {
    const style: StyleConfig = {
      ...DEFAULT_STYLE,
      dimensions: { ...DEFAULT_STYLE.dimensions, length: 2 },
    };
    const { systemPrompt } = buildPrompt(TEXT, style, BASE_SETTINGS);
    expect(systemPrompt).toContain('1.5×');
  });

  it('customInstructions are appended when set', () => {
    const style: StyleConfig = {
      ...DEFAULT_STYLE,
      customInstructions: 'Nutze viele Emojis.',
    };
    const { systemPrompt } = buildPrompt(TEXT, style, BASE_SETTINGS);
    expect(systemPrompt).toContain('Nutze viele Emojis.');
  });

  it('knownKnowledge block appears when enabled', () => {
    const settings = {
      ...BASE_SETTINGS,
      knownKnowledge: { enabled: true, profileText: 'Ich bin Softwareentwickler.' },
    };
    const { systemPrompt } = buildPrompt(TEXT, DEFAULT_STYLE, settings);
    expect(systemPrompt).toContain('Ich bin Softwareentwickler.');
    expect(systemPrompt).toContain('braucht dafür keine Erklärungen');
  });

  it('knownKnowledge block is absent when disabled', () => {
    const settings = {
      ...BASE_SETTINGS,
      knownKnowledge: { enabled: false, profileText: 'Ich bin Softwareentwickler.' },
    };
    const { systemPrompt } = buildPrompt(TEXT, DEFAULT_STYLE, settings);
    expect(systemPrompt).not.toContain('Ich bin Softwareentwickler.');
  });

  it('produces deterministic output for same inputs (snapshot)', () => {
    const { systemPrompt } = buildPrompt(TEXT, DEFAULT_STYLE, BASE_SETTINGS);
    expect(systemPrompt).toMatchSnapshot();
  });
});

describe('buildChunkPrompt', () => {
  const makeSegs = (texts: string[]): ChunkSegmentInfo[] =>
    texts.map((text, i) => ({ text, localIndex: i, globalIndex: i, totalSegments: texts.length }));

  it('userPrompt contains correctly formed <<<S:N>>> markers', () => {
    const segs = makeSegs(['Erster Absatz.', 'Zweiter Absatz.']);
    const { userPrompt } = buildChunkPrompt(segs, DEFAULT_STYLE, BASE_SETTINGS);
    expect(userPrompt).toContain('<<<S:0>>>');
    expect(userPrompt).toContain('<<<S:1>>>');
    expect(userPrompt).not.toContain('<<<S:0>>\n'); // two-bracket form must not appear
  });

  it('each segment text follows its marker on the next line', () => {
    const segs = makeSegs(['Erster Absatz.', 'Zweiter Absatz.']);
    const { userPrompt } = buildChunkPrompt(segs, DEFAULT_STYLE, BASE_SETTINGS);
    expect(userPrompt).toContain('<<<S:0>>>\nErster Absatz.');
    expect(userPrompt).toContain('<<<S:1>>>\nZweiter Absatz.');
  });

  it('systemPrompt contains format instructions and position info', () => {
    const segs = makeSegs(['Text A', 'Text B', 'Text C']);
    const { systemPrompt } = buildChunkPrompt(segs, DEFAULT_STYLE, BASE_SETTINGS);
    expect(systemPrompt).toContain('Ausgabe-Format');
    expect(systemPrompt).toContain('<<<S:0>>>');
    expect(systemPrompt).toContain('Einleitung');
  });

  it('includes style dimension fragments', () => {
    const { systemPrompt } = buildChunkPrompt(makeSegs(['Text']), DEFAULT_STYLE, BASE_SETTINGS);
    expect(systemPrompt).toContain('Stilvorgaben:');
  });
});
