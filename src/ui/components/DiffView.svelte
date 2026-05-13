<script lang="ts">
  import { computeWordDiff } from '../../../entrypoints/content/diffRenderer.ts';

  let {
    original,
    rewritten,
    onAccept,
    onDiscard,
    onChangeStyle,
    onSave,
  }: {
    original: string;
    rewritten: string;
    onAccept: () => void;
    onDiscard: () => void;
    onChangeStyle: () => void;
    onSave: () => void;
  } = $props();

  const diff = $derived(computeWordDiff(original, rewritten));

  let dialog = $state<HTMLDialogElement | undefined>();

  $effect(() => {
    dialog?.showModal();
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  oncancel={onDiscard}
  onclick={(e) => {
    if (e.target === dialog) onDiscard();
  }}
>
  <div class="modal-inner" role="presentation" onclick={(e) => e.stopPropagation()}>
    <h2>Umformulierter Text</h2>

    <div class="columns">
      <div class="column">
        <div class="column-title">Original</div>
        <div class="diff-text">
          {#each diff as token}
            {#if !token.added}
              <span class:removed={!!token.removed}>{token.value}</span>
            {/if}
          {/each}
        </div>
      </div>

      <div class="divider"></div>

      <div class="column">
        <div class="column-title">Umformuliert</div>
        <div class="diff-text">
          {#each diff as token}
            {#if !token.removed}
              <span class:added={!!token.added}>{token.value}</span>
            {/if}
          {/each}
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn-primary" onclick={onAccept}>Übernehmen</button>
      <button class="btn-secondary" onclick={onDiscard}>Verwerfen</button>
      <button class="btn-secondary" onclick={onChangeStyle}>Style ändern</button>
      <button class="btn-secondary" onclick={onSave}>In Bibliothek speichern</button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    all: initial;
    display: none;
    position: fixed;
    inset: 0;
    z-index: 2147483646;
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

  .modal-inner {
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 12px;
    padding: 24px;
    width: min(92vw, 1000px);
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  }

  h2 {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #cdd6f4;
  }

  .columns {
    display: flex;
    gap: 0;
    flex: 1;
    min-height: 0;
    border-radius: 8px;
    border: 1px solid #313244;
    overflow: hidden;
  }

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .column-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6c7086;
    padding: 8px 16px;
    background: #181825;
    border-bottom: 1px solid #313244;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .diff-text {
    padding: 16px;
    overflow-y: auto;
    font-size: 15px;
    line-height: 1.75;
    flex: 1;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .divider {
    width: 1px;
    background: #313244;
    flex-shrink: 0;
  }

  span.removed {
    background: rgba(243, 139, 168, 0.15);
    color: #f38ba8;
    border-radius: 2px;
    text-decoration: line-through;
  }

  span.added {
    background: rgba(166, 227, 161, 0.15);
    color: #a6e3a1;
    border-radius: 2px;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  button {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
    border-radius: 6px;
    padding: 8px 20px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-primary {
    background: #89b4fa;
    color: #1e1e2e;
    font-weight: 600;
  }

  .btn-primary:hover {
    background: #74c7ec;
  }

  .btn-secondary {
    background: #313244;
    color: #cdd6f4;
  }

  .btn-secondary:hover {
    background: #45475a;
  }
</style>
