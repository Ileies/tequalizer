<script lang="ts">
  import { DIMS } from '../../src/ui/dims.ts';

  let { onDismiss }: { onDismiss: () => void } = $props();
</script>

<div class="absolute inset-0 z-50 bg-base-100 overflow-y-auto flex flex-col">
  <div class="p-5 flex flex-col gap-4 flex-1">
    <div>
      <h2 class="text-base font-bold text-base-content">Willkommen bei Tequalizer</h2>
      <p class="text-[12px] text-muted mt-0.5 leading-snug">
        Tequalizer formuliert Artikel im Web nach deinem persönlichen Stil um.
      </p>
    </div>

    <div>
      <p class="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted mb-2">Die fünf Regler</p>
      {#each DIMS as dim}
        <div class="flex items-center gap-2 mb-1.5 last:mb-0">
          <span class="text-[11px] text-muted w-[50px] shrink-0 text-right leading-tight">{dim.min}</span>
          <div class="flex-1 flex flex-col items-center">
            <div class="relative w-full h-[3px] bg-base-300 rounded-full">
              <div
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-primary border-2 border-base-100"
                style="box-shadow: 0 1px 3px rgba(0,0,0,.15)"
              ></div>
            </div>
            <span class="text-[10px] font-medium text-base-content mt-1">{dim.label}</span>
          </div>
          <span class="text-[11px] text-muted w-[50px] shrink-0 leading-tight">{dim.max}</span>
        </div>
      {/each}
    </div>

    <div>
      <p class="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted mb-2">So geht's</p>
      <ol class="flex flex-col gap-1.5">
        <li class="flex gap-2 text-[12px]">
          <span class="font-bold text-primary shrink-0">1.</span>
          <span class="text-base-content">Style wählen oder Regler nach Belieben anpassen</span>
        </li>
        <li class="flex gap-2 text-[12px]">
          <span class="font-bold text-primary shrink-0">2.</span>
          <span class="text-base-content">Einen Artikel im Browser öffnen</span>
        </li>
        <li class="flex gap-2 text-[12px]">
          <span class="font-bold text-primary shrink-0">3.</span>
          <span class="text-base-content">„Seite umformulieren" klicken</span>
        </li>
      </ol>
    </div>
  </div>

  <div class="p-5 pt-0">
    <button class="btn btn-primary w-full" onclick={onDismiss}>Los geht's</button>
  </div>
</div>
