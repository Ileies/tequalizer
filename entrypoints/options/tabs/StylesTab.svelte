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
      template: 'none',
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
  <h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em]">Style-Bibliothek</h1>
  <button
    class="bg-[#313244] text-[#cdd6f4] text-sm px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#45475a]"
    onclick={openNewStyle}
  >+ Neuer Style</button>
</div>

<div class="flex flex-col gap-3">
  {#each appState.styleLibrary as style}
    <div class="bg-[#181825] border border-[#313244] rounded-xl px-[22px] py-[18px] flex items-center justify-between gap-4">
      <div class="flex flex-col gap-2 min-w-0">
        <span class="text-[15px] font-semibold text-[#cdd6f4]">{style.name}</span>
        <div class="flex gap-1.5 flex-wrap">
          {#if style.builtIn}
            <span class="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#313244] text-[#a6adc8]">Integriert</span>
          {/if}
          {#if style.id === appState.settings.activeStyleId}
            <span class="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#89b4fa]/15 text-[#89b4fa]">Standard</span>
          {/if}
        </div>
      </div>
      <div class="flex gap-1 shrink-0">
        {#if style.id !== appState.settings.activeStyleId}
          <button
            class="text-[13px] text-[#89b4fa] px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-[0.12s] hover:bg-[#89b4fa]/10"
            onclick={() => setDefault(style.id)}
          >Als Standard</button>
        {/if}
        <button
          class="text-[13px] text-[#89b4fa] px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-[0.12s] hover:bg-[#89b4fa]/10"
          onclick={() => openEditStyle(style)}
        >Bearbeiten</button>
        {#if !style.builtIn}
          <button
            class="text-[13px] text-[#f38ba8] px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-[0.12s] hover:bg-[#f38ba8]/10"
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
