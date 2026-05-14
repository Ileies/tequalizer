<script lang="ts">
  import { DIMS } from '../../src/ui/dims.ts';
  import type { StyleConfig } from '../../src/storage/schema.ts';

  let {
    initialStyle,
    isNewStyle,
    onClose,
    onSubmit,
  }: {
    initialStyle: StyleConfig | null;
    isNewStyle: boolean;
    onClose: () => void;
    onSubmit: (style: StyleConfig) => Promise<void>;
  } = $props();

  let localStyle = $state<StyleConfig | null>(null);
  let dialog = $state<HTMLDialogElement | undefined>();

  $effect(() => {
    if (initialStyle) {
      localStyle = { ...initialStyle, dimensions: { ...initialStyle.dimensions } };
      dialog?.showModal();
    }
  });

  function closeDialog() {
    dialog?.close();
    onClose();
  }

  async function submitStyle() {
    if (!localStyle || !localStyle.name.trim()) return;
    const snap = $state.snapshot(localStyle) as StyleConfig;
    await onSubmit(snap);
    dialog?.close();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  oncancel={closeDialog}
  onclick={(e) => { if (e.target === dialog) closeDialog(); }}
>
  <div
    class="bg-[#1e1e2e] text-[#cdd6f4] rounded-[14px] p-9 w-[min(90vw,560px)] max-h-[88vh] overflow-y-auto flex flex-col shadow-[0_12px_48px_rgba(0,0,0,0.65)]"
    role="presentation"
    onclick={(e) => e.stopPropagation()}
  >
    {#if localStyle}
      <h2 class="block text-lg font-bold text-[#cdd6f4] tracking-[-0.01em] mb-6">
        {isNewStyle ? 'Neuer Style' : 'Style bearbeiten'}
      </h2>

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Name</div>
      <input
        class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
        type="text"
        placeholder="Mein Style"
        bind:value={localStyle.name}
      />

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3 mt-5">Dimensionen</div>
      {#each DIMS as dim}
        <div class="mb-4 last:mb-0">
          <div class="flex justify-between items-baseline mb-1">
            <span class="text-[13px] font-medium text-[#cdd6f4]">{dim.label}</span>
            <span class="text-[11px] text-[#6c7086]">{dim.min} → {dim.max}</span>
          </div>
          <div class="relative pb-3">
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              class="w-full accent-[#89b4fa] cursor-pointer"
              bind:value={localStyle.dimensions[dim.key]}
            />
            <div class="flex justify-between px-2 pointer-events-none absolute bottom-0 left-0 right-0">
              {#each [-2, -1, 0, 1, 2] as tick}
                <span class="w-1.5 h-1.5 rounded-full shrink-0 {tick === 0 ? 'bg-[#585b70]' : 'bg-[#45475a]'}"></span>
              {/each}
            </div>
          </div>
        </div>
      {/each}

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3 mt-5">
        Eigene Anweisungen <span class="text-[11px] text-[#6c7086] normal-case tracking-normal font-normal">(optional, max. 2000 Zeichen)</span>
      </div>
      <textarea
        class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-3 text-sm resize-y leading-[1.6] focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
        rows="4"
        maxlength="2000"
        placeholder="Verwende kurze Sätze. Schreibe in der Du-Form."
        bind:value={localStyle.customInstructions}
      ></textarea>

      <div class="flex gap-[10px] justify-end mt-7">
        <button
          class="bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 enabled:hover:bg-[#74c7ec] disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={submitStyle}
          disabled={!localStyle.name.trim()}
        >
          {isNewStyle ? 'Erstellen' : 'Speichern'}
        </button>
        <button
          class="bg-[#313244] text-[#cdd6f4] text-sm px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#45475a]"
          onclick={closeDialog}
        >Abbrechen</button>
      </div>
    {/if}
  </div>
</dialog>

<style>
  dialog {
    all: initial;
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: transparent;
    border: none;
    padding: 0;
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(3px);
  }
</style>
