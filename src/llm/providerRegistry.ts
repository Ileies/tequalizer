import type { LLMProvider } from './types.ts';
import type { Settings } from '../storage/schema.ts';
import { openaiProvider } from './openaiProvider.ts';
import { claudeProvider } from './claudeProvider.ts';
import { ollamaProvider } from './ollamaProvider.ts';

const PROVIDERS: Record<string, LLMProvider> = {
  openai: openaiProvider,
  claude: claudeProvider,
  ollama: ollamaProvider,
};

export function getActiveProvider(settings: Settings): LLMProvider {
  const provider = PROVIDERS[settings.provider];
  if (!provider) throw new Error(`Unknown provider: ${settings.provider}`);
  if (!provider.isConfigured(settings)) {
    throw new Error(
      `Provider "${provider.displayName}" ist nicht konfiguriert. Bitte API-Key in den Einstellungen eintragen.`
    );
  }
  return provider;
}

export function getAllProviders(): LLMProvider[] {
  return Object.values(PROVIDERS);
}

export function getProviderById(id: string): LLMProvider | undefined {
  return PROVIDERS[id];
}
