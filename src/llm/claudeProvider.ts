import type { LLMProvider, RewriteRequest, StreamResult } from './types.ts';
import type { Settings } from '../storage/schema.ts';

export const claudeProvider: LLMProvider = {
  id: 'claude',
  displayName: 'Claude (Anthropic)',

  isConfigured(_settings: Settings): boolean {
    return false;
  },

  async validateCredentials(_settings: Settings): Promise<{ ok: boolean; error?: string }> {
    throw new Error('Not implemented in V1 — see roadmap (V2)');
  },

  async *streamRewrite(_req: RewriteRequest): AsyncGenerator<string, StreamResult, void> {
    throw new Error('Not implemented in V1 — see roadmap (V2)');
  },
};
