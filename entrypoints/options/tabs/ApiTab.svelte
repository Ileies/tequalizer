<script lang="ts">
  import { updateSettings } from '../../../src/storage/storageAdapter.ts';
  import { sendMessage } from '../../../src/messaging/client.ts';
  import type { StoredState, Settings } from '../../../src/storage/schema.ts';

  const OPENAI_MODELS: Settings['openaiModel'][] = [
    'gpt-4.1-mini',
    'gpt-4.1',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-5.4-mini',
  ];

  let {
    appState,
    onRefresh,
  }: {
    appState: StoredState;
    onRefresh: () => Promise<void>;
  } = $props();

  let showOpenaiKey = $state(false);
  let showClaudeKey = $state(false);
  let savedMsg = $state('');
  let savedTimer: ReturnType<typeof setTimeout> | null = null;
  let validatingOpenai = $state(false);
  let validatingClaude = $state(false);
  let openaiKeyError = $state('');
  let claudeKeyError = $state('');

  function showSaved() {
    savedMsg = 'Gespeichert ✓';
    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { savedMsg = ''; }, 2000);
  }

  async function saveProvider(provider: Settings['provider']) {
    await updateSettings({ provider });
    await onRefresh();
  }

  async function saveOpenaiKey(key: string) {
    openaiKeyError = '';
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    if (!key) {
      await updateSettings({ apiKeys: { ...apiKeys, openai: '' } });
      await onRefresh();
      return;
    }
    validatingOpenai = true;
    try {
      const result = await sendMessage({ type: 'VALIDATE_API_KEY', payload: { provider: 'openai', key } });
      if (!result.ok) {
        openaiKeyError = result.error ?? 'Ungültiger API-Key.';
        return;
      }
      await updateSettings({ apiKeys: { ...apiKeys, openai: key } });
      await onRefresh();
      showSaved();
    } finally {
      validatingOpenai = false;
    }
  }

  async function saveClaudeKey(key: string) {
    claudeKeyError = '';
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    if (!key) {
      await updateSettings({ apiKeys: { ...apiKeys, claude: '' } });
      await onRefresh();
      return;
    }
    validatingClaude = true;
    try {
      const result = await sendMessage({ type: 'VALIDATE_API_KEY', payload: { provider: 'claude', key } });
      if (!result.ok) {
        claudeKeyError = result.error ?? 'Ungültiger API-Key.';
        return;
      }
      await updateSettings({ apiKeys: { ...apiKeys, claude: key } });
      await onRefresh();
      showSaved();
    } finally {
      validatingClaude = false;
    }
  }

  async function saveOpenaiModel(model: Settings['openaiModel']) {
    await updateSettings({ openaiModel: model });
    await onRefresh();
  }

  async function saveOllamaEndpoint(endpoint: string) {
    await updateSettings({ ollamaEndpoint: endpoint || undefined });
    await onRefresh();
  }

  async function saveOllamaModel(model: string) {
    await updateSettings({ ollamaModel: model || undefined });
    await onRefresh();
    showSaved();
  }
</script>

<h1 class="block text-[26px] font-bold text-base-content tracking-[-0.02em] mb-1.5">API & Anbieter</h1>
<p class="block text-sm text-muted mb-8 leading-normal">Verbinde Rewrite mit deinem bevorzugten KI-Anbieter.</p>

<section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
  <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3">Anbieter</div>
  <div class="flex gap-2">
    {#each (['openai', 'claude', 'ollama'] as const) as p}
      <button
        class="text-sm px-[22px] py-[9px] rounded-lg cursor-pointer transition-[background,color,border-color] duration-[0.12s] {appState.settings.provider === p ? 'btn border border-primary bg-primary text-primary-content font-semibold' : 'btn bg-base-100 text-subtext border-base-300 hover:bg-base-300 hover:text-base-content'}"
        onclick={() => saveProvider(p)}
      >
        {p === 'openai' ? 'OpenAI' : p === 'claude' ? 'Claude' : 'Ollama'}
      </button>
    {/each}
  </div>
</section>

{#if appState.settings.provider === 'openai'}
  <section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3">OpenAI API-Key</div>
    <div class="flex gap-2 items-center">
      <input
        class="input input-bordered w-full {openaiKeyError ? 'input-error' : ''}"
        type={showOpenaiKey ? 'text' : 'password'}
        placeholder="sk-…"
        value={appState.settings.apiKeys.openai ?? ''}
        onchange={(e) => saveOpenaiKey(e.currentTarget.value)}
        disabled={validatingOpenai}
      />
      <button
        class="btn btn-ghost btn-sm"
        onclick={() => (showOpenaiKey = !showOpenaiKey)}
      >{showOpenaiKey ? '🙈' : '👁'}</button>
    </div>
    {#if validatingOpenai}
      <div class="text-[13px] text-muted mt-2">Prüfe API-Key…</div>
    {:else if openaiKeyError}
      <div class="text-[13px] text-error mt-2">{openaiKeyError}</div>
    {/if}

    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3 mt-5">Modell</div>
    <select
      class="select select-bordered w-full"
      value={appState.settings.openaiModel}
      onchange={(e) => saveOpenaiModel(e.currentTarget.value as Settings['openaiModel'])}
    >
      {#each OPENAI_MODELS as m}
        <option value={m}>{m}</option>
      {/each}
    </select>
  </section>
{/if}

{#if appState.settings.provider === 'claude'}
  <section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
    <div class="flex items-center gap-2 text-[13px] text-muted">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>Claude-Unterstützung ist in <strong class="text-base-content">V2</strong> geplant und noch nicht verfügbar.</span>
    </div>
  </section>
{/if}

{#if appState.settings.provider === 'ollama'}
  <section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
    <div class="flex items-center gap-2 text-[13px] text-muted">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>Ollama-Unterstützung ist in <strong class="text-base-content">V3</strong> geplant und noch nicht verfügbar.</span>
    </div>
  </section>
{/if}

{#if savedMsg}
  <div class="text-[13px] text-success">{savedMsg}</div>
{/if}
