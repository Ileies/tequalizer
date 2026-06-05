export const DEBUG = import.meta.env.DEV;

export function debugError(...args: unknown[]): void {
  if (DEBUG) console.error(...args);
}
