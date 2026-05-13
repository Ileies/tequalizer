import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../src/llm/promptBuilder.ts';
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

  it('compact length dimension (-1) produces compress fragment', () => {
    const style: StyleConfig = {
      ...DEFAULT_STYLE,
      dimensions: { ...DEFAULT_STYLE.dimensions, length: -1 },
    };
    const { systemPrompt } = buildPrompt(TEXT, style, BASE_SETTINGS);
    expect(systemPrompt).toContain('maximal komprimiert');
  });

  it('verbose length dimension (+1) produces expand fragment', () => {
    const style: StyleConfig = {
      ...DEFAULT_STYLE,
      dimensions: { ...DEFAULT_STYLE.dimensions, length: 1 },
    };
    const { systemPrompt } = buildPrompt(TEXT, style, BASE_SETTINGS);
    expect(systemPrompt).toContain('1.5×');
  });

  it('ted_talk template includes few-shot examples', () => {
    const style: StyleConfig = { ...DEFAULT_STYLE, template: 'ted_talk' };
    const { systemPrompt } = buildPrompt(TEXT, style, BASE_SETTINGS);
    expect(systemPrompt).toContain('TED-Talk');
    expect(systemPrompt).toContain('Original:');
    expect(systemPrompt).toContain('Umformuliert:');
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
