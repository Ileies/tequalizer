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
      <p class="text-[13px] text-[#6c7086] text-center">Stil wird analysiert…</p>
    {:else if extractError}
      <p class="text-[12px] text-[#f38ba8]">{extractError}</p>
    {:else if extractResult}
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086]">Extrahierter Stil</span>
        <button
          class="cursor-pointer text-base text-[#6c7086] leading-none px-1 rounded hover:text-[#cdd6f4]"
          onclick={onDismiss}
        >×</button>
      </div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
        {#each DIMS as dim}
          <div class="flex items-center justify-between">
            <span class="text-[12px] text-[#9399b2]">{dim.label}</span>
            <span class="text-[12px] font-semibold tabular-nums {extractResult.dimensions[dim.key] > 0 ? 'text-[#89b4fa]' : extractResult.dimensions[dim.key] < 0 ? 'text-[#f38ba8]' : 'text-[#6c7086]'}">
              {extractResult.dimensions[dim.key] > 0 ? '+' : ''}{extractResult.dimensions[dim.key]}
            </span>
          </div>
        {/each}
      </div>
      {#if extractResult.customInstructions}
        <p class="text-[11px] text-[#9399b2] italic leading-[1.4] mb-2">„{extractResult.customInstructions}"</p>
      {/if}
      <div class="flex gap-2">
        <button
          class="flex-1 text-center bg-[#313244] text-[#cdd6f4] text-[12px] font-medium py-[7px] rounded-md cursor-pointer transition-colors hover:bg-[#45475a]"
          onclick={onApply}
        >Anwenden</button>
        <button
          class="flex-1 text-center bg-[#313244] text-[#cdd6f4] text-[12px] font-medium py-[7px] rounded-md cursor-pointer transition-colors hover:bg-[#45475a]"
          onclick={onSaveAsNew}
        >Als neuen Style</button>
      </div>
    {/if}
  </section>
{/if}
