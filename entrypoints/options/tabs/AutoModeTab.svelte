<script lang="ts">
  import { untrack } from 'svelte';
  import { updateSettings } from '../../../src/storage/storageAdapter.ts';
  import type { StoredState } from '../../../src/storage/schema.ts';

  let {
    appState,
    onRefresh,
  }: {
    appState: StoredState;
    onRefresh: () => Promise<void>;
  } = $props();

  let excludeDomainsText = $state(untrack(() => appState.settings.autoRewrite.excludeDomains.join('\n')));
  let savedMsg = $state('');
  let savedTimer: ReturnType<typeof setTimeout> | null = null;

  function showSaved() {
    savedMsg = 'Gespeichert ✓';
    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { savedMsg = ''; }, 2000);
  }

  async function saveAutoEnabled(enabled: boolean) {
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    await updateSettings({ autoRewrite: { ...autoRewrite, enabled } });
    await onRefresh();
  }

  async function saveMinWordCount(count: number) {
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    await updateSettings({ autoRewrite: { ...autoRewrite, minWordCount: count } });
    await onRefresh();
  }

  async function saveExcludeDomains() {
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    const domains = excludeDomainsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);
    await updateSettings({ autoRewrite: { ...autoRewrite, excludeDomains: domains } });
    await onRefresh();
    showSaved();
  }
</script>

<h1 class="block text-[26px] font-bold text-base-content tracking-[-0.02em] mb-1.5">Auto-Modus</h1>
<p class="block text-sm text-muted mb-8 leading-normal">Seiten werden automatisch umformuliert, sobald du sie öffnest.</p>

<section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
  <div class="flex items-center justify-between gap-5 py-0.5">
    <div>
      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-[2px]">Automatisch umformulieren</div>
      <div class="text-[13px] text-muted leading-[1.55]">Texte werden beim Öffnen einer Seite automatisch umgeschrieben.</div>
    </div>
    <input
      type="checkbox"
      class="toggle toggle-primary"
      checked={appState.settings.autoRewrite.enabled}
      onclick={() => saveAutoEnabled(!appState.settings.autoRewrite.enabled)}
      aria-label="Auto-Modus aktivieren"
    />
  </div>
</section>

<section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
  <div class="flex items-center gap-3 mb-3">
    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Mindest-Wortanzahl</div>
    {#if appState.settings.autoRewrite.minWordCount === 0}
      <span class="badge bg-primary/15 text-primary border-primary/30">Alle Abschnitte umschreiben</span>
    {/if}
  </div>
  <div class="text-[13px] text-muted mb-[14px] leading-[1.55]">Abschnitte mit weniger Wörtern werden übersprungen. Bei 0 werden alle Abschnitte umgeschrieben.</div>
  <input
    type="number"
    class="input input-bordered w-32"
    min="0"
    step="1"
    value={appState.settings.autoRewrite.minWordCount}
    onchange={(e) => {
      const val = Math.max(0, Number(e.currentTarget.value));
      e.currentTarget.value = String(val);
      saveMinWordCount(val);
    }}
  />
</section>

<section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
  <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3">Ausgeschlossene Domains</div>
  <div class="text-[13px] text-muted mb-[14px] leading-[1.55]">Eine Domain pro Zeile, z.B. <code class="font-mono text-xs bg-base-300 px-[5px] py-0.5 rounded text-accent">example.com</code></div>
  <textarea
    class="textarea textarea-bordered w-full"
    rows="6"
    placeholder="example.com&#10;news.example.org"
    bind:value={excludeDomainsText}
  ></textarea>
  <div class="flex items-center gap-3 mt-4">
    <button
      class="btn btn-primary"
      onclick={saveExcludeDomains}
    >Speichern</button>
    {#if savedMsg}
      <span class="text-[13px] text-success">{savedMsg}</span>
    {/if}
  </div>
</section>
