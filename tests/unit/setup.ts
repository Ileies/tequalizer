import { vi, beforeEach } from 'vitest';

// Minimal browser.storage.local mock for unit tests
const store: Record<string, unknown> = {};

const storageMock = {
  get: vi.fn(async (_keys: null) => ({ ...store })),
  set: vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  }),
  clear: vi.fn(async () => {
    for (const key of Object.keys(store)) delete store[key];
  }),
  onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
};

// Reset store between tests
beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
  vi.clearAllMocks();
  storageMock.get.mockImplementation(async () => ({ ...store }));
  storageMock.set.mockImplementation(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  });
});

// @ts-expect-error - partial mock
globalThis.browser = { storage: { local: storageMock } };
// @ts-expect-error - partial mock
globalThis.chrome = { storage: { local: storageMock } };
