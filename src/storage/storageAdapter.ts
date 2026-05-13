import { StoredState, INITIAL_STATE } from './schema.ts';
import { migrate } from './migrations.ts';

type Listener = (state: StoredState) => void;

const listeners = new Set<Listener>();

function getBrowserStorage(): typeof chrome.storage.local {
  // WXT polyfills `browser` globally; fall back to `chrome` for content scripts
  const b = (globalThis as unknown as { browser?: typeof chrome }).browser;
  return (b ?? globalThis.chrome).storage.local;
}

export async function getState(): Promise<StoredState> {
  const storage = getBrowserStorage();
  const raw = await storage.get(null);

  if (!raw['schemaVersion']) {
    return INITIAL_STATE;
  }

  const migrated = migrate(raw as Record<string, unknown>);
  const parsed = StoredState.safeParse(migrated);

  if (!parsed.success) {
    console.error('[storage] Invalid state, resetting:', parsed.error);
    await storage.set(INITIAL_STATE);
    return INITIAL_STATE;
  }

  return parsed.data;
}

export async function setState(partial: Partial<StoredState>): Promise<void> {
  const current = await getState();
  const next: StoredState = { ...current, ...partial };
  await getBrowserStorage().set(next);
  listeners.forEach((fn) => fn(next));
}

export async function updateSettings(
  partial: Partial<StoredState['settings']>
): Promise<void> {
  const current = await getState();
  await setState({ settings: { ...current.settings, ...partial } });
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  // Also react to changes made from other extension pages
  const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
    if (Object.keys(changes).length > 0) {
      getState().then(listener);
    }
  };
  getBrowserStorage().onChanged?.addListener(handler);

  return () => {
    listeners.delete(listener);
    getBrowserStorage().onChanged?.removeListener(handler);
  };
}
