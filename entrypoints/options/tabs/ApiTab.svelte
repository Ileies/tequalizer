<script lang="ts">
  import { updateSettings } from '../../../src/storage/storageAdapter.ts';
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
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    await updateSettings({ apiKeys: { ...apiKeys, openai: key } });
    await onRefresh();
    showSaved();
  }

  async function saveClaudeKey(key: string) {
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    await updateSettings({ apiKeys: { ...apiKeys, claude: key } });
    await onRefresh();
    showSaved();
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

<h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em] mb-1.5">API & Anbieter</h1>
<p class="block text-sm text-[#6c7086] mb-8 leading-normal">Verbinde Rewrite mit deinem bevorzugten KI-Anbieter.</p>

<section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
  <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Anbieter</div>
  <div class="flex gap-2">
    {#each (['openai', 'claude', 'ollama'] as const) as p}
      <button
        class="text-sm px-[22px] py-[9px] rounded-lg border cursor-pointer transition-[background,color,border-color] duration-[0.12s] {appState.settings.provider === p ? 'bg-[#89b4fa] text-[#1e1e2e] border-[#89b4fa] font-semibold' : 'bg-[#1e1e2e] text-[#a6adc8] border-[#313244] hover:bg-[#313244] hover:text-[#cdd6f4]'}"
        onclick={() => saveProvider(p)}
      >
        {p === 'openai' ? 'OpenAI' : p === 'claude' ? 'Claude' : 'Ollama'}
      </button>
    {/each}
  </div>
</section>

{#if appState.settings.provider === 'openai'}
  <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">OpenAI API-Key</div>
    <div class="flex gap-2 items-center">
      <input
        class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
        type={showOpenaiKey ? 'text' : 'password'}
        placeholder="sk-…"
        value={appState.settings.apiKeys.openai ?? ''}
        onchange={(e) => saveOpenaiKey(e.currentTarget.value)}
      />
      <button
        class="cursor-pointer text-base px-2 py-1.5 rounded-md shrink-0 leading-none hover:bg-[#313244]"
        onclick={() => (showOpenaiKey = !showOpenaiKey)}
      >{showOpenaiKey ? '🙈' : '👁'}</button>
    </div>

    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3 mt-5">Modell</div>
    <select
      class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm cursor-pointer focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px]"
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
  <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
    <div class="flex items-center gap-[10px] mb-3">
      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086]">Claude API-Key</div>
      <span class="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#313244] text-[#a6adc8]">Experimentell</span>
    </div>
    <div class="flex gap-2 items-center">
      <input
        class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
        type={showClaudeKey ? 'text' : 'password'}
        placeholder="sk-ant-…"
        value={appState.settings.apiKeys.claude ?? ''}
        onchange={(e) => saveClaudeKey(e.currentTarget.value)}
      />
      <button
        class="cursor-pointer text-base px-2 py-1.5 rounded-md shrink-0 leading-none hover:bg-[#313244]"
        onclick={() => (showClaudeKey = !showClaudeKey)}
      >{showClaudeKey ? '🙈' : '👁'}</button>
    </div>
  </section>
{/if}

{#if appState.settings.provider === 'ollama'}
  <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Ollama Endpoint</div>
    <input
      class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
      type="url"
      placeholder="http://localhost:11434"
      value={appState.settings.ollamaEndpoint ?? ''}
      onchange={(e) => saveOllamaEndpoint(e.currentTarget.value)}
    />

    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3 mt-5">Modell</div>
    <input
      class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
      type="text"
      placeholder="llama3"
      value={appState.settings.ollamaModel ?? ''}
      onchange={(e) => saveOllamaModel(e.currentTarget.value)}
    />
  </section>
{/if}

{#if savedMsg}
  <div class="text-[13px] text-[#a6e3a1]">{savedMsg}</div>
{/if}
