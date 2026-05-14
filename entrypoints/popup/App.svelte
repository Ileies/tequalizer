<script lang="ts">
  import { getState, updateSettings } from '../../src/storage/storageAdapter.ts';
  import { saveStyle } from '../../src/style-engine/library.ts';
  import type { StoredState, StyleConfig } from '../../src/storage/schema.ts';
  const DIMS: Array<{
    key: keyof StyleConfig['dimensions'];
    label: string;
    min: string;
    max: string;
  }> = [
    { key: 'length', label: 'Länge', min: 'Kürzer', max: 'Länger' },
    { key: 'imagery', label: 'Bildlichkeit', min: 'Sachlich', max: 'Bildhaft' },
    { key: 'warmth', label: 'Wärme', min: 'Kalt', max: 'Warm' },
    { key: 'formality', label: 'Formalität', min: 'Locker', max: 'Förmlich' },
    { key: 'simplicity', label: 'Einfachheit', min: 'Komplex', max: 'Einfach' },
  ];

  let appState = $state<StoredState | null>(null);
  let triggering = $state(false);

  $effect(() => {
    getState().then((s) => {
      appState = s;
    });
  });

  const activeStyle = $derived(
    appState
      ? (appState.styleLibrary.find((s) => s.id === appState!.settings.activeStyleId) ?? null)
      : null
  );

  async function onStyleChange(id: string) {
    if (!appState) return;
    await updateSettings({ activeStyleId: id });
    appState = await getState();
  }

  async function onDimChange(key: keyof StyleConfig['dimensions'], value: number) {
    if (!appState || !activeStyle) return;
    const base = $state.snapshot(activeStyle) as StyleConfig;
    const updated: StyleConfig = {
      ...base,
      dimensions: { ...base.dimensions, [key]: value },
    };
    await saveStyle(updated);
    appState = await getState();
  }

  async function toggleAutoRewrite() {
    if (!appState) return;
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    await updateSettings({
      autoRewrite: { ...autoRewrite, enabled: !autoRewrite.enabled },
    });
    appState = await getState();
  }

  async function toggleKnowledge() {
    if (!appState) return;
    const knownKnowledge = $state.snapshot(appState.settings.knownKnowledge);
    await updateSettings({
      knownKnowledge: { ...knownKnowledge, enabled: !knownKnowledge.enabled },
    });
    appState = await getState();
  }

  async function triggerRewrite() {
    if (!appState || triggering) return;
    triggering = true;
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (tab?.id != null) {
        await browser.tabs.sendMessage(tab.id, {
          type: 'TRIGGER_REWRITE',
          payload: { styleId: appState.settings.activeStyleId },
        });
        window.close();
      }
    } catch {
      // Content script may not be injected on this page
    } finally {
      triggering = false;
    }
  }

  function openOptions() {
    browser.runtime.openOptionsPage();
  }
</script>

<div class="popup">
  {#if !appState}
    <div class="loading">Laden…</div>
  {:else}
    <header>
      <span class="title">Tequalizer</span>
      <button class="icon-btn" onclick={openOptions} title="Einstellungen">⚙</button>
    </header>

    <div class="body">
      <section class="section">
        <label class="label" for="style-select">Style</label>
        <select
          id="style-select"
          class="select"
          value={appState.settings.activeStyleId}
          onchange={(e) => onStyleChange(e.currentTarget.value)}
        >
          {#each appState.styleLibrary as style}
            <option value={style.id}>{style.name}{style.builtIn ? ' ★' : ''}</option>
          {/each}
        </select>
      </section>

      {#if activeStyle}
        <section class="section">
          {#each DIMS as dim}
            <div class="dim-row">
              <div class="dim-header">
                <span class="dim-label">{dim.label}</span>
                <span class="dim-hints">{dim.min} → {dim.max}</span>
              </div>
              <div class="slider-wrap">
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="1"
                  class="slider"
                  value={activeStyle.dimensions[dim.key]}
                  onchange={(e) => onDimChange(dim.key, Number(e.currentTarget.value))}
                />
                <div class="slider-dots">
                  {#each [-2, -1, 0, 1, 2] as tick}
                    <span class="dot" class:dot-center={tick === 0}></span>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </section>

      {/if}

      <section class="section toggles">
        <div class="toggle-row">
          <span class="toggle-label">Auto-Modus</span>
          <button
            class="toggle"
            class:toggle-on={appState.settings.autoRewrite.enabled}
            onclick={toggleAutoRewrite}
            aria-pressed={appState.settings.autoRewrite.enabled}
            aria-label="Auto-Modus"
          >
            <span class="toggle-thumb"></span>
          </button>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Bekanntes Wissen</span>
          <button
            class="toggle"
            class:toggle-on={appState.settings.knownKnowledge.enabled}
            onclick={toggleKnowledge}
            aria-pressed={appState.settings.knownKnowledge.enabled}
            aria-label="Bekanntes Wissen"
          >
            <span class="toggle-thumb"></span>
          </button>
        </div>
      </section>

      <section class="section">
        <button class="btn-primary" onclick={triggerRewrite} disabled={triggering}>
          {triggering ? 'Wird gestartet…' : 'Aktuelle Seite umformulieren'}
        </button>
      </section>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .popup {
    width: 360px;
    min-height: 120px;
  }

  .loading {
    padding: 32px;
    text-align: center;
    color: #6c7086;
    font-size: 14px;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid #313244;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #cdd6f4;
    letter-spacing: -0.01em;
  }

  .icon-btn {
    all: unset;
    cursor: pointer;
    font-size: 18px;
    color: #6c7086;
    line-height: 1;
    padding: 2px 4px;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .icon-btn:hover {
    color: #cdd6f4;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .section {
    padding: 12px 16px;
    border-bottom: 1px solid #313244;
  }

  .section:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6c7086;
    margin-bottom: 8px;
  }

  .select {
    width: 100%;
    background: #181825;
    color: #cdd6f4;
    border: 1px solid #313244;
    border-radius: 6px;
    padding: 7px 10px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    appearance: auto;
  }

  .select:focus {
    outline: 2px solid #89b4fa;
    outline-offset: -2px;
  }

  /* Dimension sliders */
  .dim-row {
    margin-bottom: 10px;
  }

  .dim-row:last-child {
    margin-bottom: 0;
  }

  .dim-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .dim-label {
    font-size: 13px;
    font-weight: 500;
    color: #cdd6f4;
  }

  .dim-hints {
    font-size: 11px;
    color: #6c7086;
  }

  .slider-wrap {
    position: relative;
  }

  .slider-dots {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    right: 0;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #45475a;
    flex-shrink: 0;
  }

  .dot-center {
    background: #585b70;
  }

  .slider {
    width: 100%;
    accent-color: #89b4fa;
    cursor: pointer;
  }

  /* Toggles */
  .toggles {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .toggle-label {
    font-size: 14px;
    color: #cdd6f4;
  }

  .toggle {
    all: unset;
    position: relative;
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: #313244;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .toggle-on {
    background: #89b4fa;
  }

  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #cdd6f4;
    transition: transform 0.2s;
    pointer-events: none;
  }

  .toggle-on .toggle-thumb {
    transform: translateX(18px);
  }

  /* Primary button */
  .btn-primary {
    all: unset;
    font-family: inherit;
    display: block;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    background: #89b4fa;
    color: #1e1e2e;
    font-size: 14px;
    font-weight: 600;
    padding: 10px;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #74c7ec;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
