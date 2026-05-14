import type { StoredState } from './schema.ts';

type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, Migration> = {
  // v1 is the initial schema — no migration needed
  2: (state) => {
    const library = Array.isArray(state['styleLibrary']) ? state['styleLibrary'] : [];
    const DIM_KEYS = ['length', 'imagery', 'warmth', 'formality', 'simplicity'];
    return {
      ...state,
      styleLibrary: library.map((style: unknown) => {
        if (typeof style !== 'object' || style === null) return style;
        const s = style as Record<string, unknown>;
        const raw =
          typeof s['dimensions'] === 'object' && s['dimensions'] !== null
            ? (s['dimensions'] as Record<string, unknown>)
            : {};
        const dims: Record<string, number> = {};
        for (const k of DIM_KEYS) {
          const v = typeof raw[k] === 'number' ? raw[k] : 0;
          // old schema: -1…+1 floats → new schema: -2…+2 integers
          dims[k] = Math.max(-2, Math.min(2, Math.round((v as number) * 2)));
        }
        return { ...s, dimensions: dims };
      }),
    };
  },
};

export function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  let state = raw;
  const current = typeof state['schemaVersion'] === 'number' ? state['schemaVersion'] : 0;
  const target = 2;

  for (let v = current + 1; v <= target; v++) {
    const migration = MIGRATIONS[v];
    if (migration) state = migration(state);
    state = { ...state, schemaVersion: v };
  }

  return state;
}

export const CURRENT_SCHEMA_VERSION: StoredState['schemaVersion'] = 2;
