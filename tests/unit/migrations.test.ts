import { describe, it, expect } from 'vitest';
import { migrate, CURRENT_SCHEMA_VERSION } from '../../src/storage/migrations.ts';

describe('migrate', () => {
  it('adds schemaVersion to state without one', () => {
    const result = migrate({ settings: {}, styleLibrary: [] });
    expect(result['schemaVersion']).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('is idempotent — migrating an already-current state changes nothing', () => {
    const state = { settings: {}, styleLibrary: [], schemaVersion: 1 };
    const result = migrate(state);
    expect(result['schemaVersion']).toBe(1);
    expect(result['settings']).toEqual({});
  });
});
