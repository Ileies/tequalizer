import { describe, it, expect } from 'vitest';
import { getState, setState, updateSettings } from '../../src/storage/storageAdapter.ts';
import { INITIAL_STATE, DEFAULT_STYLE_ID } from '../../src/storage/schema.ts';

describe('getState', () => {
  it('returns INITIAL_STATE when storage is empty', async () => {
    const state = await getState();
    expect(state).toEqual(INITIAL_STATE);
  });

  it('resets and returns INITIAL_STATE when stored data fails Zod validation', async () => {
    // Store invalid data directly
    // @ts-expect-error - intentionally invalid
    globalThis.chrome.storage.local.get.mockResolvedValueOnce({
      schemaVersion: 1,
      settings: { provider: 'invalid_provider' }, // fails enum validation
      styleLibrary: [],
    });

    const state = await getState();
    expect(state).toEqual(INITIAL_STATE);
  });

  it('returns valid stored state', async () => {
    await setState({ settings: { ...INITIAL_STATE.settings, openaiModel: 'gpt-4.1' } });
    const state = await getState();
    expect(state.settings.openaiModel).toBe('gpt-4.1');
  });
});

describe('updateSettings', () => {
  it('merges partial settings without overwriting other fields', async () => {
    await updateSettings({ openaiModel: 'gpt-4o' });
    const state = await getState();
    expect(state.settings.openaiModel).toBe('gpt-4o');
    expect(state.settings.provider).toBe('openai'); // unchanged
    expect(state.settings.activeStyleId).toBe(DEFAULT_STYLE_ID); // unchanged
  });
});

describe('setState', () => {
  it('notifies subscribers on change', async () => {
    const { subscribe } = await import('../../src/storage/storageAdapter.ts');
    const received: unknown[] = [];
    const unsub = subscribe((s) => received.push(s));

    await setState({ settings: { ...INITIAL_STATE.settings, openaiModel: 'gpt-4.1' } });

    expect(received).toHaveLength(1);
    unsub();
  });
});
