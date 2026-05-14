<script lang="ts">
  import { untrack } from 'svelte';
  import { updateSettings } from '../../../src/storage/storageAdapter.ts';
  import type { StoredState } from '../../../src/storage/schema.ts';
  import ToggleSwitch from '../../../src/ui/components/ToggleSwitch.svelte';

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

<h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em] mb-1.5">Auto-Modus</h1>
<p class="block text-sm text-[#6c7086] mb-8 leading-normal">Seiten werden automatisch umformuliert, sobald du sie öffnest.</p>

<section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
  <div class="flex items-center justify-between gap-5 py-0.5">
    <div>
      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-[2px]">Automatisch umformulieren</div>
      <div class="text-[13px] text-[#6c7086] leading-[1.55]">Texte werden beim Öffnen einer Seite automatisch umgeschrieben.</div>
    </div>
    <ToggleSwitch
      checked={appState.settings.autoRewrite.enabled}
      label="Auto-Modus aktivieren"
      onToggle={() => saveAutoEnabled(!appState.settings.autoRewrite.enabled)}
    />
  </div>
</section>

<section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
  <div class="flex items-center gap-3 mb-3">
    <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086]">Mindest-Wortanzahl</div>
    {#if appState.settings.autoRewrite.minWordCount === 0}
      <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#89b4fa]/15 text-[#89b4fa] border border-[#89b4fa]/30">Alle Abschnitte umschreiben</span>
    {/if}
  </div>
  <div class="text-[13px] text-[#6c7086] mb-[14px] leading-[1.55]">Abschnitte mit weniger Wörtern werden übersprungen. Bei 0 werden alle Abschnitte umgeschrieben.</div>
  <input
    type="number"
    class="w-32 bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-3 py-2 text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

<section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
  <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Ausgeschlossene Domains</div>
  <div class="text-[13px] text-[#6c7086] mb-[14px] leading-[1.55]">Eine Domain pro Zeile, z.B. <code class="font-mono text-xs bg-[#313244] px-[5px] py-0.5 rounded text-[#cba6f7]">example.com</code></div>
  <textarea
    class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-3 text-sm resize-y leading-[1.6] focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
    rows="6"
    placeholder="example.com&#10;news.example.org"
    bind:value={excludeDomainsText}
  ></textarea>
  <div class="flex items-center gap-3 mt-4">
    <button
      class="bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#74c7ec]"
      onclick={saveExcludeDomains}
    >Speichern</button>
    {#if savedMsg}
      <span class="text-[13px] text-[#a6e3a1]">{savedMsg}</span>
    {/if}
  </div>
</section>
