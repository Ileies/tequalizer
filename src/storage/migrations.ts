import type { StoredState } from './schema.ts';

type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, Migration> = {
  // v1 is the initial schema — no migration needed
};

export function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  let state = raw;
  const current = typeof state['schemaVersion'] === 'number' ? state['schemaVersion'] : 0;
  const target: keyof typeof MIGRATIONS extends never ? number : number = 1;

  for (let v = current + 1; v <= target; v++) {
    const migration = MIGRATIONS[v];
    if (migration) state = migration(state);
    state = { ...state, schemaVersion: v };
  }

  return state;
}

export const CURRENT_SCHEMA_VERSION: StoredState['schemaVersion'] = 1;
