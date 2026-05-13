import type { Message, ResponseFor } from './types.ts';

export async function sendMessage<T extends Message>(
  msg: T
): Promise<ResponseFor<T>> {
  return browser.runtime.sendMessage(msg) as Promise<ResponseFor<T>>;
}

export function openPort(name: string): chrome.runtime.Port {
  return browser.runtime.connect({ name });
}
