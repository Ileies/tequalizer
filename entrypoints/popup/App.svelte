<script lang="ts">
  import { getState, updateSettings } from '../../src/storage/storageAdapter.ts';
  import { saveStyle, createStyle } from '../../src/style-engine/library.ts';
  import { DIMS } from '../../src/ui/dims.ts';
  import ToggleSwitch from '../../src/ui/components/ToggleSwitch.svelte';
  import ExtractPanel from './ExtractPanel.svelte';
  import type { StoredState, StyleConfig, Settings } from '../../src/storage/schema.ts';
  import type { ExtractedStyle } from '../../src/llm/styleExtractor.ts';

  let appState = $state<StoredState | null>(null);
  let triggering = $state(false);
  let extracting = $state(false);
  let extractResult = $state<ExtractedStyle | null>(null);
  let extractError = $state<string | null>(null);
  let keyInput = $state('');
  let showKey = $state(false);
  let keySaving = $state(false);
  let keySaved = $state(false);

  function isProviderConfigured(settings: Settings): boolean {
    if (settings.provider === 'openai') return Boolean(settings.apiKeys.openai);
    if (settings.provider === 'claude') return Boolean(settings.apiKeys.claude);
    return false;
  }

  function providerLabel(provider: Settings['provider']): string {
    if (provider === 'openai') return 'OpenAI';
    if (provider === 'claude') return 'Claude';
    return 'Ollama';
  }

  function keyPlaceholder(provider: Settings['provider']): string {
    if (provider === 'claude') return 'sk-ant-…';
    return 'sk-…';
  }

  async function saveKey() {
    if (!appState || !keyInput.trim() || keySaving) return;
    keySaving = true;
    const provider = appState.settings.provider;
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    await updateSettings({
      apiKeys: { ...apiKeys, [provider]: keyInput.trim() },
    });
    appState = await getState();
    keySaving = false;
    keySaved = true;
    setTimeout(() => { keySaved = false; }, 2000);
  }

  $effect(() => {
    getState().then((s) => { appState = s; });
  });

  const activeStyle = $derived(
    appState
      ? (appState.styleLibrary.find((s) => s.id === appState!.settings.activeStyleId) ?? null)
      : null
  );

  const extractActive = $derived(extracting || extractResult !== null || extractError !== null);

  async function refresh() {
    appState = await getState();
  }

  async function onStyleChange(id: string) {
    await updateSettings({ activeStyleId: id });
    await refresh();
  }

  async function onDimChange(key: keyof StyleConfig['dimensions'], value: number) {
    if (!activeStyle) return;
    const base = $state.snapshot(activeStyle) as StyleConfig;
    await saveStyle({ ...base, dimensions: { ...base.dimensions, [key]: value } });
    await refresh();
  }

  async function toggleAutoRewrite() {
    if (!appState) return;
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    await updateSettings({ autoRewrite: { ...autoRewrite, enabled: !autoRewrite.enabled } });
    await refresh();
  }

  async function toggleKnowledge() {
    if (!appState) return;
    const knownKnowledge = $state.snapshot(appState.settings.knownKnowledge);
    await updateSettings({ knownKnowledge: { ...knownKnowledge, enabled: !knownKnowledge.enabled } });
    await refresh();
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

  async function extractStyle() {
    if (extracting) return;
    extracting = true;
    extractResult = null;
    extractError = null;
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) {
        extractError = 'Kein aktiver Tab gefunden.';
        return;
      }
      let pageData: { text: string } | null = null;
      try {
        pageData = await browser.tabs.sendMessage(tab.id, { type: 'GET_PAGE_SAMPLES' });
      } catch {
        extractError = 'Kein Text gefunden (Content Script nicht aktiv).';
        return;
      }
      if (!pageData?.text) {
        extractError = 'Kein auswertbarer Text auf der Seite.';
        return;
      }
      const result = (await browser.runtime.sendMessage({
        type: 'EXTRACT_STYLE',
        payload: { text: pageData.text },
      })) as ExtractedStyle | { error: string };
      if ('error' in result) {
        extractError = result.error;
      } else {
        extractResult = result;
      }
    } catch (err) {
      extractError = err instanceof Error ? err.message : 'Unbekannter Fehler';
    } finally {
      extracting = false;
    }
  }

  async function applyExtracted() {
    if (!activeStyle || !extractResult) return;
    const base = $state.snapshot(activeStyle) as StyleConfig;
    await saveStyle({
      ...base,
      dimensions: extractResult.dimensions,
      customInstructions: extractResult.customInstructions || base.customInstructions,
    });
    await refresh();
    extractResult = null;
  }

  async function saveExtractedAsNew() {
    if (!extractResult) return;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const hostname = tabs[0]?.url ? new URL(tabs[0].url).hostname.replace(/^www\./, '') : 'Seite';
    const newStyle = createStyle({
      name: `Stil von ${hostname}`,
      dimensions: extractResult.dimensions,
      customInstructions: extractResult.customInstructions,
      template: 'none',
    });
    await saveStyle(newStyle);
    await updateSettings({ activeStyleId: newStyle.id });
    await refresh();
    extractResult = null;
  }

  function openOptions() {
    browser.runtime.openOptionsPage();
  }
</script>

<div class="w-[360px] min-h-[120px]">
  {#if !appState}
    <div class="p-8 text-center text-[#6c7086] text-sm">Laden…</div>
  {:else}
    <header class="flex items-center justify-between px-4 pt-[14px] pb-[10px] border-b border-[#313244]">
      <span class="text-base font-bold text-[#cdd6f4] tracking-[-0.01em]">Tequalizer</span>
      <button
        class="cursor-pointer text-lg text-[#6c7086] leading-none py-0.5 px-1 rounded transition-colors duration-150 hover:text-[#cdd6f4]"
        onclick={openOptions}
        title="Einstellungen"
      >⚙</button>
    </header>

    {#if !isProviderConfigured(appState.settings)}
      <div class="px-4 py-5 flex flex-col gap-4">
        <div class="flex items-start gap-3 bg-[#f9e2af]/8 border border-[#f9e2af]/20 rounded-lg px-4 py-3">
          <span class="text-[#f9e2af] text-base leading-none mt-[1px]">!</span>
          <div>
            <div class="text-sm font-semibold text-[#f9e2af] mb-0.5">
              {appState.settings.provider === 'ollama' ? 'Ollama nicht verfügbar' : 'API-Key fehlt'}
            </div>
            <div class="text-[12px] text-[#a6adc8] leading-snug">
              {#if appState.settings.provider === 'ollama'}
                Ollama-Unterstützung ist noch nicht implementiert. Wechsle zu OpenAI oder Claude.
              {:else}
                Für {providerLabel(appState.settings.provider)} wird ein API-Key benötigt.
              {/if}
            </div>
          </div>
        </div>

        {#if appState.settings.provider !== 'ollama'}
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-2" for="popup-key-input">
              {providerLabel(appState.settings.provider)} API-Key
            </label>
            <div class="flex gap-2 items-center">
              <input
                id="popup-key-input"
                class="w-full bg-[#181825] text-[#cdd6f4] border border-[#313244] rounded-md px-[10px] py-[7px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
                type={showKey ? 'text' : 'password'}
                placeholder={keyPlaceholder(appState.settings.provider)}
                bind:value={keyInput}
                onkeydown={(e) => { if (e.key === 'Enter') saveKey(); }}
              />
              <button
                class="cursor-pointer text-sm px-2 py-1.5 rounded-md shrink-0 leading-none text-[#6c7086] hover:bg-[#313244] hover:text-[#cdd6f4]"
                onclick={() => (showKey = !showKey)}
                title={showKey ? 'Verstecken' : 'Anzeigen'}
              >{showKey ? '🙈' : '👁'}</button>
            </div>
          </div>

          <button
            class="block w-full text-center bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold py-[10px] rounded-[7px] cursor-pointer transition-colors duration-150 enabled:hover:bg-[#74c7ec] disabled:opacity-50 disabled:cursor-not-allowed"
            onclick={saveKey}
            disabled={!keyInput.trim() || keySaving}
          >
            {keySaving ? 'Speichern…' : keySaved ? 'Gespeichert ✓' : 'Speichern'}
          </button>
        {/if}

        <button
          class="block w-full text-center bg-[#313244] text-[#cdd6f4] text-sm font-medium py-[9px] rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#45475a]"
          onclick={openOptions}
        >Einstellungen öffnen</button>
      </div>
    {:else}
    <div>
      <section class="px-4 py-3 border-b border-[#313244]">
        <label class="block text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6c7086] mb-2" for="style-select">Style</label>
        <select
          id="style-select"
          class="w-full bg-[#181825] text-[#cdd6f4] border border-[#313244] rounded-md px-[10px] py-[7px] text-sm cursor-pointer focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px]"
          value={appState.settings.activeStyleId}
          onchange={(e) => onStyleChange(e.currentTarget.value)}
        >
          {#each appState.styleLibrary as style}
            <option value={style.id}>{style.name}{style.builtIn ? ' ★' : ''}</option>
          {/each}
        </select>
      </section>

      {#if activeStyle}
        <section class="px-4 py-3 border-b border-[#313244]">
          {#each DIMS as dim}
            <div class="mb-[10px] last:mb-0">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-[13px] font-medium text-[#cdd6f4]">{dim.label}</span>
                <span class="text-[11px] text-[#6c7086]">{dim.min} → {dim.max}</span>
              </div>
              <div class="relative h-5 flex items-center">
                <div class="absolute left-[7px] right-[7px] top-1/2 -translate-y-1/2 h-[3px] bg-[#313244] rounded-sm pointer-events-none z-0"></div>
                <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-1 pointer-events-none z-[1]">
                  {#each [-2, -1, 0, 1, 2] as tick}
                    <span class="w-1.5 h-1.5 rounded-full shrink-0 {tick === 0 ? 'bg-[#6c7086]' : 'bg-[#45475a]'}"></span>
                  {/each}
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="1"
                  class="slider w-full h-5 relative z-[2]"
                  value={activeStyle.dimensions[dim.key]}
                  onchange={(e) => onDimChange(dim.key, Number(e.currentTarget.value))}
                />
              </div>
            </div>
          {/each}
        </section>
      {/if}

      <section class="px-4 py-3 border-b border-[#313244] flex flex-col gap-[10px]">
        <div class="flex items-center justify-between">
          <span class="text-sm text-[#cdd6f4]">Auto-Modus</span>
          <ToggleSwitch
            checked={appState.settings.autoRewrite.enabled}
            label="Auto-Modus"
            compact
            onToggle={toggleAutoRewrite}
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-[#cdd6f4]">Bekanntes Wissen</span>
          <ToggleSwitch
            checked={appState.settings.knownKnowledge.enabled}
            label="Bekanntes Wissen"
            compact
            onToggle={toggleKnowledge}
          />
        </div>
      </section>

      <section class="px-4 py-3 flex flex-col gap-2 {extractActive ? 'border-b border-[#313244]' : ''}">
        <button
          class="block w-full text-center bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold py-[10px] rounded-[7px] cursor-pointer transition-colors duration-150 enabled:hover:bg-[#74c7ec] disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={triggerRewrite}
          disabled={triggering}
        >
          {triggering ? 'Wird gestartet…' : 'Aktuelle Seite umformulieren'}
        </button>
        <button
          class="block w-full text-center bg-[#313244] text-[#cdd6f4] text-sm font-medium py-[9px] rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#45475a] disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={extractStyle}
          disabled={extracting}
        >
          {extracting ? 'Analysiert…' : 'Stil extrahieren'}
        </button>
      </section>

      <ExtractPanel
        {extracting}
        {extractResult}
        {extractError}
        onApply={applyExtracted}
        onSaveAsNew={saveExtractedAsNew}
        onDismiss={() => { extractResult = null; extractError = null; }}
      />
    </div>
    {/if}
  {/if}
</div>

<style>
  .slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }
  .slider::-webkit-slider-runnable-track {
    height: 3px;
    background: transparent;
  }
  .slider::-moz-range-track {
    height: 3px;
    background: transparent;
    border: none;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #89b4fa;
    margin-top: -5.5px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .slider:hover::-webkit-slider-thumb {
    background: #b4d0ff;
    box-shadow: 0 0 0 4px rgba(137, 180, 250, 0.2);
  }
  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #89b4fa;
    border: none;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .slider:hover::-moz-range-thumb {
    background: #b4d0ff;
    box-shadow: 0 0 0 4px rgba(137, 180, 250, 0.2);
  }
</style>
