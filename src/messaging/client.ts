import type { Message, ResponseFor } from './types.ts';

export async function sendMessage<T extends Message>(
  msg: T
): Promise<ResponseFor<T>> {
  return browser.runtime.sendMessage(msg) as Promise<ResponseFor<T>>;
}

type RuntimePort = ReturnType<typeof browser.runtime.connect>;

export function openPort(name: string): RuntimePort {
  return browser.runtime.connect({ name });
}
