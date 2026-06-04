<script lang="ts">
  import { getState } from '../../src/storage/storageAdapter.ts';
  import { INITIAL_STATE } from '../../src/storage/schema.ts';
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

  let resetting = $state(false);

  async function resetAllData() {
    if (!confirm('Alle Daten löschen und auf Standardwerte zurücksetzen?')) return;
    resetting = true;
    await browser.storage.local.clear();
    await browser.storage.local.set(INITIAL_STATE);
    try { await browser.storage.session.clear(); } catch {}
    appState = await getState();
    resetting = false;
  }

  function handleTabKeydown(e: KeyboardEvent) {
    const tabs = TABS.map(([t]) => t);
    const current = tabs.indexOf(activeTab);
    let next = current;
    if (e.key === 'ArrowDown') { e.preventDefault(); next = (current + 1) % tabs.length; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); next = (current - 1 + tabs.length) % tabs.length; }
    else if (e.key === 'Home') { e.preventDefault(); next = 0; }
    else if (e.key === 'End') { e.preventDefault(); next = tabs.length - 1; }
    else return;
    activeTab = tabs[next]!;
    document.getElementById(`tab-${tabs[next]}`)?.focus();
  }
</script>

<div class="min-h-screen">
  {#if !appState}
    <div class="p-20 text-center text-muted text-sm">Laden…</div>
  {:else}
    <div class="flex min-h-screen">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Einstellungen-Navigation"
        class="w-[260px] shrink-0 bg-base-200 border-r border-base-300 px-5 py-8 flex flex-col gap-0.5"
      >
        <div class="text-xl font-bold text-base-content tracking-[-0.01em] px-3 pb-5 border-b border-base-300 mb-3">Tequalizer</div>
        {#each TABS as [tab, label]}
          <button
            id="tab-{tab}"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="panel-{tab}"
            tabindex={activeTab === tab ? 0 : -1}
            class="block w-full text-sm px-3 py-[10px] rounded-lg cursor-pointer transition-[background,color] duration-[0.12s] text-left {activeTab === tab ? 'bg-primary/10 text-primary font-semibold' : 'text-subtext hover:bg-base-300/70 hover:text-base-content'}"
            onclick={() => (activeTab = tab)}
            onkeydown={handleTabKeydown}
          >{label}</button>
        {/each}
        <div class="mt-auto pt-6 border-t border-base-300">
          <button
            class="btn btn-ghost btn-sm w-full text-error/70 hover:text-error hover:bg-error/10"
            onclick={resetAllData}
            disabled={resetting}
          >{resetting ? 'Wird zurückgesetzt…' : 'Daten zurücksetzen'}</button>
        </div>
      </div>

      {#each TABS as [tab]}
        <div
          id="panel-{tab}"
          role="tabpanel"
          aria-labelledby="tab-{tab}"
          tabindex={activeTab === tab ? 0 : -1}
          class="flex-1 px-16 py-[52px] max-w-[820px] focus:outline-none"
          class:hidden={activeTab !== tab}
        >
          {#if tab === 'api'}
            <ApiTab appState={appState} onRefresh={refresh} />
          {:else if tab === 'styles'}
            <StylesTab appState={appState} onRefresh={refresh} />
          {:else if tab === 'automode'}
            <AutoModeTab appState={appState} onRefresh={refresh} />
          {:else if tab === 'knowledge'}
            <KnowledgeTab appState={appState} onRefresh={refresh} />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
