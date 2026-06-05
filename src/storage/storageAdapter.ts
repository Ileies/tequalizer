import { StoredState, INITIAL_STATE } from './schema.ts';
import { migrate } from './migrations.ts';
import { debugError } from '../debug.ts';

type Listener = (state: StoredState) => void;
type StorageChange = { newValue?: unknown; oldValue?: unknown };

const listeners = new Set<Listener>();

export async function getState(): Promise<StoredState> {
  const raw = await browser.storage.local.get(null);

  if (!raw['schemaVersion']) {
    return INITIAL_STATE;
  }

  const migrated = migrate(raw as Record<string, unknown>);
  const parsed = StoredState.safeParse(migrated);

  if (!parsed.success) {
    debugError('[storage] Invalid state, resetting:', parsed.error);
    await browser.storage.local.set(INITIAL_STATE);
    return INITIAL_STATE;
  }

  return parsed.data;
}

export async function setState(partial: Partial<StoredState>): Promise<void> {
  const current = await getState();
  const next: StoredState = { ...current, ...partial };
  await browser.storage.local.set(next);
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

  const handler = (changes: Record<string, StorageChange>) => {
    if (Object.keys(changes).length > 0) {
      getState().then(listener);
    }
  };
  browser.storage.local.onChanged.addListener(handler);

  return () => {
    listeners.delete(listener);
    browser.storage.local.onChanged.removeListener(handler);
  };
}
