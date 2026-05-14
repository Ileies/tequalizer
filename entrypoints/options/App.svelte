<script lang="ts">
  import { getState } from '../../src/storage/storageAdapter.ts';
  import type { StoredState } from '../../src/storage/schema.ts';
  import ApiTab from './tabs/ApiTab.svelte';
  import StylesTab from './tabs/StylesTab.svelte';
  import AutoModeTab from './tabs/AutoModeTab.svelte';
  import KnowledgeTab from './tabs/KnowledgeTab.svelte';

  type Tab = 'api' | 'styles' | 'automode' | 'knowledge';

  const TABS: [Tab, string][] = [
    ['api', 'API & Anbieter'],
    ['styles', 'Style-Bibliothek'],
    ['automode', 'Auto-Modus'],
    ['knowledge', 'Bekanntes Wissen'],
  ];

  let activeTab = $state<Tab>('api');
  let appState = $state<StoredState | null>(null);

  $effect(() => {
    getState().then((s) => { appState = s; });
  });

  async function refresh() {
    appState = await getState();
  }
</script>

<div class="min-h-screen">
  {#if !appState}
    <div class="p-20 text-center text-[#6c7086] text-sm">Laden…</div>
  {:else}
    <div class="flex min-h-screen">
      <nav class="w-[260px] shrink-0 bg-[#181825] border-r border-[#313244] px-5 py-8 flex flex-col gap-0.5">
        <div class="text-xl font-bold text-[#cdd6f4] tracking-[-0.01em] px-3 pb-5 border-b border-[#313244] mb-3">Tequalizer</div>
        {#each TABS as [tab, label]}
          <button
            class="block w-full text-sm px-3 py-[10px] rounded-lg border-l-[3px] cursor-pointer transition-[background,color] duration-[0.12s] text-left {activeTab === tab ? 'bg-[#89b4fa]/10 text-[#89b4fa] font-semibold border-l-[#89b4fa]' : 'text-[#a6adc8] border-l-transparent hover:bg-[#313244]/70 hover:text-[#cdd6f4]'}"
            onclick={() => (activeTab = tab)}
          >{label}</button>
        {/each}
      </nav>

      <main class="flex-1 px-16 py-[52px] max-w-[820px]">
        {#if activeTab === 'api'}
          <ApiTab appState={appState} onRefresh={refresh} />
        {:else if activeTab === 'styles'}
          <StylesTab appState={appState} onRefresh={refresh} />
        {:else if activeTab === 'automode'}
          <AutoModeTab appState={appState} onRefresh={refresh} />
        {:else if activeTab === 'knowledge'}
          <KnowledgeTab appState={appState} onRefresh={refresh} />
        {/if}
      </main>
    </div>
  {/if}
</div>
