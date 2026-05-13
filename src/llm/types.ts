import type { Settings } from '../storage/schema.ts';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface RewriteRequest {
  text: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface StreamResult {
  fullText: string;
  usage?: TokenUsage;
}

export interface LLMProvider {
  readonly id: 'openai' | 'claude' | 'ollama';
  readonly displayName: string;
  isConfigured(settings: Settings): boolean;
  validateCredentials(settings: Settings): Promise<{ ok: boolean; error?: string }>;
  streamRewrite(req: RewriteRequest): AsyncGenerator<string, StreamResult, void>;
}
