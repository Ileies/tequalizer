import { describe, it, expect } from 'vitest';
import { getActiveProvider, getAllProviders } from '../../src/llm/providerRegistry.ts';
import { INITIAL_STATE } from '../../src/storage/schema.ts';
import type { Settings } from '../../src/storage/schema.ts';

const BASE_SETTINGS: Settings = INITIAL_STATE.settings;

describe('getAllProviders', () => {
  it('returns exactly three providers', () => {
    const providers = getAllProviders();
    expect(providers).toHaveLength(3);
  });

  it('includes openai, claude, and ollama', () => {
    const ids = getAllProviders().map((p) => p.id);
    expect(ids).toContain('openai');
    expect(ids).toContain('claude');
    expect(ids).toContain('ollama');
  });
});

describe('getActiveProvider', () => {
  it('returns the openai provider when configured', () => {
    const settings: Settings = {
      ...BASE_SETTINGS,
      provider: 'openai',
      apiKeys: { openai: 'sk-test-key' },
    };
    const provider = getActiveProvider(settings);
    expect(provider.id).toBe('openai');
  });

  it('throws when the provider is not configured (no api key)', () => {
    const settings: Settings = {
      ...BASE_SETTINGS,
      provider: 'openai',
      apiKeys: {},
    };
    expect(() => getActiveProvider(settings)).toThrow('nicht konfiguriert');
  });

  it('throws for an unknown provider name', () => {
    const settings = { ...BASE_SETTINGS, provider: 'unknown' as Settings['provider'] };
    expect(() => getActiveProvider(settings)).toThrow('Unknown provider');
  });

  it('claude provider is never configured in V1', () => {
    const settings: Settings = {
      ...BASE_SETTINGS,
      provider: 'claude',
      apiKeys: { claude: 'sk-ant-key' },
    };
    expect(() => getActiveProvider(settings)).toThrow('nicht konfiguriert');
  });

  it('ollama provider is never configured in V1', () => {
    const settings: Settings = {
      ...BASE_SETTINGS,
      provider: 'ollama',
    };
    expect(() => getActiveProvider(settings)).toThrow('nicht konfiguriert');
  });
});

describe('provider.isConfigured', () => {
  it('openai: true when apiKeys.openai is set', () => {
    const [openai] = getAllProviders().filter((p) => p.id === 'openai');
    expect(openai!.isConfigured({ ...BASE_SETTINGS, apiKeys: { openai: 'sk-key' } })).toBe(true);
  });

  it('openai: false when apiKeys.openai is missing', () => {
    const [openai] = getAllProviders().filter((p) => p.id === 'openai');
    expect(openai!.isConfigured({ ...BASE_SETTINGS, apiKeys: {} })).toBe(false);
  });

  it('claude: always false in V1', () => {
    const [claude] = getAllProviders().filter((p) => p.id === 'claude');
    expect(claude!.isConfigured(BASE_SETTINGS)).toBe(false);
  });

  it('ollama: always false in V1', () => {
    const [ollama] = getAllProviders().filter((p) => p.id === 'ollama');
    expect(ollama!.isConfigured(BASE_SETTINGS)).toBe(false);
  });
});
