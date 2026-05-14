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

  let profileText = $state(untrack(() => appState.settings.knownKnowledge.profileText));
  let savedMsg = $state('');
  let savedTimer: ReturnType<typeof setTimeout> | null = null;

  function showSaved() {
    savedMsg = 'Gespeichert ✓';
    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { savedMsg = ''; }, 2000);
  }

  async function saveKnowledgeEnabled(enabled: boolean) {
    const knownKnowledge = $state.snapshot(appState.settings.knownKnowledge);
    await updateSettings({ knownKnowledge: { ...knownKnowledge, enabled } });
    await onRefresh();
  }

  async function saveProfileText(text: string) {
    const knownKnowledge = $state.snapshot(appState.settings.knownKnowledge);
    await updateSettings({ knownKnowledge: { ...knownKnowledge, profileText: text } });
    await onRefresh();
    showSaved();
  }
</script>

<h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em] mb-1.5">Bekanntes Wissen</h1>
<p class="block text-sm text-[#6c7086] mb-8 leading-normal">Dein Profil wird beim Umformulieren als Kontext an das Modell übergeben.</p>

<section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
  <div class="flex items-center justify-between gap-5 py-0.5">
    <div>
      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-[2px]">Bekanntes Wissen verwenden</div>
      <div class="text-[13px] text-[#6c7086] leading-[1.55]">Das Profil wird beim Umformulieren als Kontext übergeben.</div>
    </div>
    <ToggleSwitch
      checked={appState.settings.knownKnowledge.enabled}
      label="Bekanntes Wissen aktivieren"
      onToggle={() => saveKnowledgeEnabled(!appState.settings.knownKnowledge.enabled)}
    />
  </div>
</section>

<section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
  <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Profil-Text</div>
  <div class="text-[13px] text-[#6c7086] mb-[14px] leading-[1.55]">Beschreibe deinen Schreibstil, dein Publikum oder andere Hinweise für das Modell.</div>
  <textarea
    class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-3 text-sm resize-y leading-[1.6] focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
    rows="10"
    maxlength="2000"
    placeholder="Ich schreibe für ein technisch versiertes Publikum…"
    bind:value={profileText}
  ></textarea>
  <div class="flex items-center gap-3 mt-4">
    <span class="text-xs text-[#6c7086] ml-auto">{profileText.length} / 2000</span>
    <button
      class="bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#74c7ec]"
      onclick={() => saveProfileText(profileText)}
    >Speichern</button>
    {#if savedMsg}
      <span class="text-[13px] text-[#a6e3a1]">{savedMsg}</span>
    {/if}
  </div>
</section>
