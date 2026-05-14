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
  class="modal"
  oncancel={closeDialog}
  onclick={(e) => { if (e.target === dialog) closeDialog(); }}
>
  <div
    class="modal-box bg-base-100 text-base-content rounded-[14px] p-9 w-[min(90vw,560px)] max-w-none max-h-[88vh] overflow-y-auto flex flex-col shadow-[0_12px_48px_rgba(0,0,0,0.65)]"
    role="presentation"
    onclick={(e) => e.stopPropagation()}
  >
    {#if localStyle}
      <h2 class="block text-lg font-bold tracking-[-0.01em] mb-6">
        {isNewStyle ? 'Neuer Style' : 'Style bearbeiten'}
      </h2>

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3">Name</div>
      <input
        class="input input-bordered w-full text-sm"
        type="text"
        placeholder="Mein Style"
        bind:value={localStyle.name}
      />

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3 mt-5">Dimensionen</div>
      {#each DIMS as dim}
        <div class="mb-4 last:mb-0">
          <div class="flex justify-between items-baseline mb-1">
            <span class="text-[13px] font-medium text-base-content">{dim.label}</span>
            <span class="text-[11px] text-muted">{dim.min} → {dim.max}</span>
          </div>
          <div class="relative pb-3">
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              class="range range-primary range-sm w-full"
              bind:value={localStyle.dimensions[dim.key]}
            />
            <div class="flex justify-between px-2 pointer-events-none absolute bottom-0 left-0 right-0">
              {#each [-2, -1, 0, 1, 2] as tick}
                <span class="w-1.5 h-1.5 rounded-full shrink-0 {tick === 0 ? 'bg-muted' : 'bg-base-300'}"></span>
              {/each}
            </div>
          </div>
        </div>
      {/each}

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-muted mb-3 mt-5">
        Eigene Anweisungen <span class="text-[11px] text-muted normal-case tracking-normal font-normal">(optional, max. 2000 Zeichen)</span>
      </div>
      <textarea
        class="textarea textarea-bordered w-full text-sm resize-y leading-[1.6]"
        rows="4"
        maxlength="2000"
        placeholder="Verwende kurze Sätze. Schreibe in der Du-Form."
        bind:value={localStyle.customInstructions}
      ></textarea>

      <div class="flex gap-[10px] justify-end mt-7">
        <button
          class="btn btn-primary"
          onclick={submitStyle}
          disabled={!localStyle.name.trim()}
        >
          {isNewStyle ? 'Erstellen' : 'Speichern'}
        </button>
        <button
          class="btn bg-base-300 hover:bg-neutral text-base-content border-0"
          onclick={closeDialog}
        >Abbrechen</button>
      </div>
    {/if}
  </div>
</dialog>
