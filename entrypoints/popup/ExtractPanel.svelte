<script lang="ts">
  import { DIMS } from '../../src/ui/dims.ts';
  import type { ExtractedStyle } from '../../src/llm/styleExtractor.ts';

  let {
    extracting,
    extractResult,
    extractError,
    onApply,
    onSaveAsNew,
    onDismiss,
  }: {
    extracting: boolean;
    extractResult: ExtractedStyle | null;
    extractError: string | null;
    onApply: () => void;
    onSaveAsNew: () => void;
    onDismiss: () => void;
  } = $props();
</script>

{#if extracting || extractResult !== null || extractError !== null}
  <section class="px-4 py-3">
    {#if extracting}
      <p class="text-[13px] text-muted text-center">Stil wird analysiert…</p>
    {:else if extractError}
      <p class="text-[12px] text-error">{extractError}</p>
    {:else if extractResult}
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">Extrahierter Stil</span>
        <button
          class="btn btn-ghost btn-sm"
          onclick={onDismiss}
        >×</button>
      </div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
        {#each DIMS as dim}
          <div class="flex items-center justify-between">
            <span class="text-[12px] text-subtext">{dim.label}</span>
            <span class="text-[12px] font-semibold tabular-nums {extractResult.dimensions[dim.key] > 0 ? 'text-primary' : extractResult.dimensions[dim.key] < 0 ? 'text-error' : 'text-muted'}">
              {extractResult.dimensions[dim.key] > 0 ? '+' : ''}{extractResult.dimensions[dim.key]}
            </span>
          </div>
        {/each}
      </div>
      {#if extractResult.customInstructions}
        <p class="text-[11px] text-subtext italic leading-[1.4] mb-2">„{extractResult.customInstructions}"</p>
      {/if}
      <div class="flex gap-2">
        <button
          class="btn btn-sm bg-base-300 hover:bg-neutral text-base-content border-0 flex-1"
          onclick={onApply}
        >Anwenden</button>
        <button
          class="btn btn-sm bg-base-300 hover:bg-neutral text-base-content border-0 flex-1"
          onclick={onSaveAsNew}
        >Als neuen Style</button>
      </div>
    {/if}
  </section>
{/if}
