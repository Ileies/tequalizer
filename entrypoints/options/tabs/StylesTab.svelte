<script lang="ts">
  import { getState, updateSettings } from '../../../src/storage/storageAdapter.ts';
  import { saveStyle, deleteStyle, createStyle } from '../../../src/style-engine/library.ts';
  import type { StoredState, StyleConfig } from '../../../src/storage/schema.ts';
  import StyleEditorDialog from '../StyleEditorDialog.svelte';

  let {
    appState,
    onRefresh,
  }: {
    appState: StoredState;
    onRefresh: () => Promise<void>;
  } = $props();

  let editStyle = $state<StyleConfig | null>(null);
  let isNewStyle = $state(false);

  function openNewStyle() {
    editStyle = createStyle({
      name: '',
      dimensions: { length: 0, imagery: 0, warmth: 0, formality: 0, simplicity: 0 },
    });
    isNewStyle = true;
  }

  function openEditStyle(style: StyleConfig) {
    editStyle = { ...style, dimensions: { ...style.dimensions } };
    isNewStyle = false;
  }

  async function handleSubmit(style: StyleConfig) {
    await saveStyle(style);
    if (isNewStyle) {
      const state = await getState();
      if (state.styleLibrary.length === 2) {
        await updateSettings({ activeStyleId: style.id });
      }
    }
    editStyle = null;
    await onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Style löschen?')) return;
    await deleteStyle(id);
    await onRefresh();
  }

  async function setDefault(id: string) {
    await updateSettings({ activeStyleId: id });
    await onRefresh();
  }
</script>

<div class="flex items-center justify-between mb-8">
  <h1 class="block text-[26px] font-bold text-base-content tracking-[-0.02em]">Style-Bibliothek</h1>
  <button
    class="btn bg-base-300 hover:bg-neutral text-base-content border-0"
    onclick={openNewStyle}
  >+ Neuer Style</button>
</div>

<div class="flex flex-col gap-3">
  {#if appState.styleLibrary.filter(s => !s.builtIn).length === 0}
    <div class="bg-base-200 border border-dashed border-base-300 rounded-xl px-[22px] py-10 flex flex-col items-center gap-3 text-center">
      <p class="text-[15px] text-muted">Noch keine eigenen Styles</p>
      <p class="text-[13px] text-subtext leading-snug max-w-[260px]">Erstelle einen neuen Style oder extrahiere einen Stil aus einer Webseite.</p>
      <button
        class="btn btn-primary btn-sm mt-1"
        onclick={openNewStyle}
      >+ Neuer Style</button>
    </div>
  {/if}
  {#each appState.styleLibrary as style}
    <div class="bg-base-200 border border-base-300 rounded-xl px-[22px] py-[18px] flex items-center justify-between gap-4">
      <div class="flex flex-col gap-2 min-w-0">
        <span class="text-[15px] font-semibold text-base-content">{style.name}</span>
        <div class="flex gap-1.5 flex-wrap">
          {#if style.builtIn}
            <span class="badge bg-base-300 text-subtext border-0">Integriert</span>
          {/if}
          {#if style.id === appState.settings.activeStyleId}
            <span class="badge bg-primary/15 text-primary border-primary/30">Standard</span>
          {/if}
        </div>
      </div>
      <div class="flex gap-1 shrink-0">
        {#if style.id !== appState.settings.activeStyleId}
          <button
            class="btn btn-ghost btn-sm text-primary"
            onclick={() => setDefault(style.id)}
          >Als Standard</button>
        {/if}
        <button
          class="btn btn-ghost btn-sm text-primary"
          onclick={() => openEditStyle(style)}
        >Bearbeiten</button>
        {#if !style.builtIn}
          <button
            class="btn btn-ghost btn-sm text-error"
            onclick={() => handleDelete(style.id)}
          >Löschen</button>
        {/if}
      </div>
    </div>
  {/each}
</div>

<StyleEditorDialog
  initialStyle={editStyle}
  {isNewStyle}
  onClose={() => { editStyle = null; }}
  onSubmit={handleSubmit}
/>
