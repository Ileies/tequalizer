import { describe, it, expect } from 'vitest';
import { migrate, CURRENT_SCHEMA_VERSION } from '../../src/storage/migrations.ts';

describe('migrate', () => {
  it('adds schemaVersion to state without one', () => {
    const result = migrate({ settings: {}, styleLibrary: [] });
    expect(result['schemaVersion']).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('is idempotent - migrating an already-current state changes nothing', () => {
    const state = { settings: {}, styleLibrary: [], schemaVersion: CURRENT_SCHEMA_VERSION };
    const result = migrate(state);
    expect(result['schemaVersion']).toBe(CURRENT_SCHEMA_VERSION);
    expect(result['settings']).toEqual({});
  });

  it.each([
    ['gpt-5.6-luna', 'gpt-6-luna'],
    ['gpt-4o-mini', 'gpt-6-luna'],
    ['gpt-5-mini', 'gpt-6-luna'],
    ['gpt-4.1-mini', 'gpt-6-luna'],
    ['gpt-5.4-mini', 'gpt-6-luna'],
    ['gpt-4o', 'gpt-6.1-sol'],
    ['gpt-4.1', 'gpt-6.1-sol'],
  ])('updates saved model %s without resetting settings', (previous, expected) => {
    const settings = { openaiModel: previous, apiKeys: { openai: 'existing-key' } };
    const result = migrate({ settings, styleLibrary: [], schemaVersion: 6 });
    expect(result['settings']).toEqual({ ...settings, openaiModel: expected });
    expect(result['schemaVersion']).toBe(CURRENT_SCHEMA_VERSION);
  });
});
