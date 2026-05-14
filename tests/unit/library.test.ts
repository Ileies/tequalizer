import { describe, it, expect } from 'vitest';
import { getLibrary, saveStyle, deleteStyle, createStyle } from '../../src/style-engine/library.ts';
import { setState } from '../../src/storage/storageAdapter.ts';
import { INITIAL_STATE, DEFAULT_STYLE, PRESET_STYLES } from '../../src/storage/schema.ts';
import type { StyleConfig } from '../../src/storage/schema.ts';

const BASE_STATE = INITIAL_STATE;

const CUSTOM_STYLE: StyleConfig = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Mein Stil',
  builtIn: false,
  dimensions: { length: 1, imagery: -1, warmth: 0, formality: 0, simplicity: 0 },
  template: 'none',
};

describe('getLibrary', () => {
  it('returns the default style library', async () => {
    const library = await getLibrary();
    expect(library).toEqual([DEFAULT_STYLE, ...PRESET_STYLES]);
  });

  it('returns all styles after adding one', async () => {
    await setState({ ...BASE_STATE, styleLibrary: [DEFAULT_STYLE, CUSTOM_STYLE] });
    const library = await getLibrary();
    expect(library).toHaveLength(2);
    expect(library[1]!.id).toBe(CUSTOM_STYLE.id);
  });
});

describe('saveStyle', () => {
  it('adds a new style to the library', async () => {
    await saveStyle(CUSTOM_STYLE);
    const library = await getLibrary();
    expect(library.some((s) => s.id === CUSTOM_STYLE.id)).toBe(true);
  });

  it('updates an existing style in place', async () => {
    await setState({ ...BASE_STATE, styleLibrary: [DEFAULT_STYLE, CUSTOM_STYLE] });
    const updated: StyleConfig = { ...CUSTOM_STYLE, name: 'Neuer Name' };
    await saveStyle(updated);
    const library = await getLibrary();
    const found = library.find((s) => s.id === CUSTOM_STYLE.id);
    expect(found?.name).toBe('Neuer Name');
    expect(library).toHaveLength(2);
  });

  it('preserves order of other styles when updating', async () => {
    const another: StyleConfig = { ...CUSTOM_STYLE, id: '22222222-2222-2222-2222-222222222222', name: 'Anderer' };
    await setState({ ...BASE_STATE, styleLibrary: [DEFAULT_STYLE, CUSTOM_STYLE, another] });
    await saveStyle({ ...CUSTOM_STYLE, name: 'Geändert' });
    const library = await getLibrary();
    expect(library[0]!.id).toBe(DEFAULT_STYLE.id);
    expect(library[1]!.id).toBe(CUSTOM_STYLE.id);
    expect(library[2]!.id).toBe(another.id);
  });
});

describe('deleteStyle', () => {
  it('removes a non-built-in style', async () => {
    await setState({ ...BASE_STATE, styleLibrary: [DEFAULT_STYLE, CUSTOM_STYLE] });
    await deleteStyle(CUSTOM_STYLE.id);
    const library = await getLibrary();
    expect(library.some((s) => s.id === CUSTOM_STYLE.id)).toBe(false);
  });

  it('throws when attempting to delete a built-in style', async () => {
    await expect(deleteStyle(DEFAULT_STYLE.id)).rejects.toThrow(
      'Eingebaute Styles können nicht gelöscht werden.'
    );
  });
});

describe('createStyle', () => {
  it('generates a UUID id and sets builtIn to false', () => {
    const style = createStyle({
      name: 'Test',
      dimensions: { length: 0, imagery: 0, warmth: 0, formality: 0, simplicity: 0 },
      template: 'none',
    });
    expect(style.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(style.builtIn).toBe(false);
    expect(style.name).toBe('Test');
  });

  it('each call produces a unique id', () => {
    const a = createStyle({ name: 'A', dimensions: { length: 0, imagery: 0, warmth: 0, formality: 0, simplicity: 0 }, template: 'none' });
    const b = createStyle({ name: 'B', dimensions: { length: 0, imagery: 0, warmth: 0, formality: 0, simplicity: 0 }, template: 'none' });
    expect(a.id).not.toBe(b.id);
  });
});
