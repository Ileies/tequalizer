import type { StyleConfig } from '../storage/schema.ts';
import { getState, setState } from '../storage/storageAdapter.ts';

export async function getLibrary(): Promise<StyleConfig[]> {
  const state = await getState();
  return state.styleLibrary;
}

export async function saveStyle(style: StyleConfig): Promise<void> {
  const state = await getState();
  const idx = state.styleLibrary.findIndex((s) => s.id === style.id);
  const library =
    idx >= 0
      ? state.styleLibrary.map((s) => (s.id === style.id ? style : s))
      : [...state.styleLibrary, style];
  await setState({ styleLibrary: library });
}

export async function deleteStyle(id: string): Promise<void> {
  const state = await getState();
  const style = state.styleLibrary.find((s) => s.id === id);
  if (style?.builtIn) throw new Error('Eingebaute Styles können nicht gelöscht werden.');
  await setState({ styleLibrary: state.styleLibrary.filter((s) => s.id !== id) });
}

export function createStyle(
  partial: Omit<StyleConfig, 'id' | 'builtIn'>
): StyleConfig {
  return { ...partial, id: crypto.randomUUID(), builtIn: false };
}
