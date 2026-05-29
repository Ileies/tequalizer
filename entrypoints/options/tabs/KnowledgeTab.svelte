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

<h1 class="block text-[26px] font-bold text-base-content tracking-[-0.02em] mb-1.5">Bekanntes Wissen</h1>
<p class="block text-sm text-muted mb-8 leading-normal">Dein Profil wird beim Umformulieren als Kontext an das Modell übergeben.</p>

<section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
  <div class="flex items-center justify-between gap-5 py-0.5">
    <div>
      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-[2px]">Bekanntes Wissen verwenden</div>
      <div class="text-[13px] text-muted leading-[1.55]">Das Profil wird beim Umformulieren als Kontext übergeben.</div>
    </div>
    <input
      type="checkbox"
      class="toggle toggle-primary"
      checked={appState.settings.knownKnowledge.enabled}
      onclick={() => saveKnowledgeEnabled(!appState.settings.knownKnowledge.enabled)}
      aria-label="Bekanntes Wissen aktivieren"
    />
  </div>
</section>

<section class="bg-base-200 border border-base-300 rounded-xl px-7 py-6 mb-5">
  <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3">Profil-Text</div>
  <div class="text-[13px] text-muted mb-[14px] leading-[1.55]">Beschreibe, wie Artikel umgeschrieben werden sollen - z. B. gewünschter Ton, Komplexität oder thematische Schwerpunkte.</div>
  <textarea
    class="textarea textarea-bordered w-full text-sm resize-y leading-[1.6]"
    rows="10"
    maxlength="2000"
    placeholder="Technische Fachbegriffe sollen erklärt und der Text auf das Wesentliche gekürzt werden…"
    bind:value={profileText}
  ></textarea>
  <div class="flex items-center gap-3 mt-4">
    <span class="text-xs text-muted ml-auto">{profileText.length} / 2000</span>
    <button
      class="btn btn-primary"
      onclick={() => saveProfileText(profileText)}
    >Speichern</button>
    {#if savedMsg}
      <span class="text-[13px] text-success">{savedMsg}</span>
    {/if}
  </div>
</section>
