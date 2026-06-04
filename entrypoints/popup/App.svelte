<script lang="ts">
  import { getState, updateSettings } from '../../src/storage/storageAdapter.ts';
  import { saveStyle, createStyle } from '../../src/style-engine/library.ts';
  import { DIMS } from '../../src/ui/dims.ts';
  import { sendMessage } from '../../src/messaging/client.ts';
  import ExtractPanel from './ExtractPanel.svelte';
  import OnboardingModal from './OnboardingModal.svelte';
  import type { StoredState, StyleConfig, Settings } from '../../src/storage/schema.ts';
  import type { ExtractedStyle } from '../../src/llm/styleExtractor.ts';

  const ONBOARDING_KEY = 'onboarding_v1_done';

  let appState = $state<StoredState | null>(null);
  let showOnboarding = $state(false);
  let liveValues = $state<Partial<Record<keyof StyleConfig['dimensions'], number>>>({});
  let pendingDimensions = $state<StyleConfig['dimensions'] | null>(null);
  let triggering = $state(false);
  let extracting = $state(false);
  let segmentCount = $state<number | null>(null);
  let extractResult = $state<ExtractedStyle | null>(null);
  let extractError = $state<string | null>(null);
  let keyInput = $state('');
  let showKey = $state(false);
  let keySaving = $state(false);
  let keySaved = $state(false);
  let keyError = $state('');
  let rewriteRunning = $state(false);
  let confirmDiscard = $state(false);
  let dragStyleId = $state<string | null>(null);
  let rewriteProgress = $state<{ total: number; done: number; failed: number; running: boolean } | null>(null);
  let progressTabId: number | null = null;
  let progressInterval: ReturnType<typeof setInterval> | null = null;

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
    keyError = '';
    const provider = appState.settings.provider;
    const key = keyInput.trim();
    try {
      const result = await sendMessage({ type: 'VALIDATE_API_KEY', payload: { provider, key } });
      if (!result.ok) {
        keyError = result.error ?? 'Ungültiger API-Key.';
        return;
      }
      const apiKeys = $state.snapshot(appState.settings.apiKeys);
      await updateSettings({ apiKeys: { ...apiKeys, [provider]: key } });
      appState = await getState();
      keyInput = '';
      keySaved = true;
      setTimeout(() => { keySaved = false; }, 2000);
    } finally {
      keySaving = false;
    }
  }

  const SESSION_KEY = 'popup_pending';
  const EXTRACT_KEY = 'popup_extract_result';

  type PendingSession = { styleId: string; dimensions: StyleConfig['dimensions'] };

  async function loadPending(styleId: string) {
    const result = await browser.storage.session.get(SESSION_KEY) as Record<string, PendingSession>;
    const stored = result[SESSION_KEY];
    if (stored?.styleId === styleId) pendingDimensions = stored.dimensions;
  }

  async function persistPending(styleId: string, dims: StyleConfig['dimensions'] | null) {
    if (dims) {
      await browser.storage.session.set({ [SESSION_KEY]: { styleId, dimensions: dims } });
    } else {
      await browser.storage.session.remove(SESSION_KEY);
    }
  }

  async function loadExtractResult() {
    const result = await browser.storage.session.get(EXTRACT_KEY) as Record<string, ExtractedStyle>;
    const stored = result[EXTRACT_KEY];
    if (stored) extractResult = stored;
  }

  async function persistExtractResult(result: ExtractedStyle | null) {
    if (result) {
      await browser.storage.session.set({ [EXTRACT_KEY]: result });
    } else {
      await browser.storage.session.remove(EXTRACT_KEY);
    }
  }

  async function dismissOnboarding() {
    await browser.storage.local.set({ [ONBOARDING_KEY]: true });
    showOnboarding = false;
  }

  $effect(() => {
    getState().then(async (s) => {
      appState = s;
      await loadPending(s.settings.activeStyleId);
      await loadExtractResult();
    });
    browser.storage.local.get(ONBOARDING_KEY).then((result) => {
      if (!result[ONBOARDING_KEY]) showOnboarding = true;
    });
    browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId == null) return;
      progressTabId = tabId;
      try {
        const countResult = (await browser.tabs.sendMessage(tabId, { type: 'GET_SEGMENT_COUNT' })) as { count: number } | null;
        if (countResult) segmentCount = countResult.count;
      } catch {
        // Content script not injected on this page
      }
      try {
        const progress = (await browser.tabs.sendMessage(tabId, { type: 'GET_REWRITE_PROGRESS' })) as { total: number; done: number; failed: number; running: boolean } | null;
        if (progress?.running) {
          rewriteProgress = progress;
          rewriteRunning = true;
          startProgressPolling();
        }
      } catch {
        // Content script not injected
      }
    });
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
    pendingDimensions = null;
    confirmDiscard = false;
    liveValues = {};
    dragStyleId = null;
    await persistPending(id, null);
    await updateSettings({ activeStyleId: id });
    await refresh();
  }

  function onDimChange(key: keyof StyleConfig['dimensions'], value: number) {
    if (!activeStyle) return;
    const base = pendingDimensions ?? ($state.snapshot(activeStyle) as StyleConfig).dimensions;
    pendingDimensions = { ...base, [key]: value };
    persistPending(activeStyle.id, pendingDimensions);
  }

  async function savePending() {
    if (!pendingDimensions || !activeStyle) return;
    const base = $state.snapshot(activeStyle) as StyleConfig;
    const newStyle = createStyle({
      name: 'Benutzerdefiniert',
      dimensions: pendingDimensions,
      customInstructions: base.customInstructions,
    });
    await saveStyle(newStyle);
    await updateSettings({ activeStyleId: newStyle.id });
    await persistPending(newStyle.id, null);
    pendingDimensions = null;
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

  function startProgressPolling() {
    if (progressInterval != null) return;
    progressInterval = setInterval(async () => {
      if (progressTabId == null) {
        stopProgressPolling();
        return;
      }
      try {
        const result = (await browser.tabs.sendMessage(progressTabId, { type: 'GET_REWRITE_PROGRESS' })) as { total: number; done: number; failed: number; running: boolean } | null;
        if (result != null) {
          rewriteProgress = result;
          if (!result.running) stopProgressPolling();
        } else {
          rewriteProgress = rewriteProgress ? { ...rewriteProgress, running: false } : null;
          stopProgressPolling();
        }
      } catch {
        rewriteProgress = rewriteProgress ? { ...rewriteProgress, running: false } : null;
        stopProgressPolling();
      }
    }, 500);
  }

  function stopProgressPolling() {
    if (progressInterval != null) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  async function triggerRewrite() {
    if (!appState || triggering || rewriteRunning) return;
    triggering = true;
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (tab?.id != null) {
        await browser.tabs.sendMessage(tab.id, {
          type: 'TRIGGER_REWRITE',
          payload: { styleId: appState.settings.activeStyleId },
        });
        progressTabId = tab.id;
        rewriteProgress = { total: segmentCount ?? 0, done: 0, failed: 0, running: true };
        rewriteRunning = true;
        startProgressPolling();
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
        extractError = 'Seite nicht erreichbar. Tab neu laden und erneut versuchen.';
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
        await persistExtractResult(result);
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
    await persistExtractResult(null);
  }

  async function saveExtractedAsNew() {
    if (!extractResult) return;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const hostname = tabs[0]?.url ? new URL(tabs[0].url).hostname.replace(/^www\./, '') : 'Seite';
    const newStyle = createStyle({
      name: `Stil von ${hostname}`,
      dimensions: extractResult.dimensions,
      customInstructions: extractResult.customInstructions,
    });
    await saveStyle(newStyle);
    await updateSettings({ activeStyleId: newStyle.id });
    await refresh();
    extractResult = null;
    await persistExtractResult(null);
  }

  function openOptions() {
    browser.runtime.openOptionsPage();
  }
</script>

<div class="relative w-[360px] min-h-[120px]">
  {#if showOnboarding && appState}
    <OnboardingModal onDismiss={dismissOnboarding} />
  {/if}
  {#if !appState}
    <div class="p-8 text-center text-muted text-sm">Laden…</div>
  {:else}
    <header class="flex items-center justify-between px-4 pt-[14px] pb-[10px] border-b border-base-300">
      <span class="text-base font-bold text-base-content tracking-[-0.01em]">Tequalizer</span>
      <button
        class="btn btn-ghost btn-sm text-muted hover:text-base-content text-xl"
        onclick={openOptions}
        title="Einstellungen"
      >⚙</button>
    </header>

    {#if !isProviderConfigured(appState.settings)}
      <div class="px-4 py-5 flex flex-col gap-4">
        <div role="alert" class="alert alert-warning">
          <span class="text-base leading-none mt-[1px]">!</span>
          <div>
            <div class="text-sm font-semibold mb-0.5">
              {appState.settings.provider === 'ollama' ? 'Ollama nicht verfügbar' : 'API-Key fehlt'}
            </div>
            <div class="text-[12px] leading-snug">
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
            <label class="block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted mb-2" for="popup-key-input">
              {providerLabel(appState.settings.provider)} API-Key
            </label>
            <div class="flex gap-2 items-center">
              <input
                id="popup-key-input"
                class="input input-bordered w-full"
                type={showKey ? 'text' : 'password'}
                placeholder={keyPlaceholder(appState.settings.provider)}
                bind:value={keyInput}
                onkeydown={(e) => { if (e.key === 'Enter') saveKey(); }}
              />
              <button
                class="btn btn-ghost btn-sm"
                onclick={() => (showKey = !showKey)}
                title={showKey ? 'Verstecken' : 'Anzeigen'}
              >{showKey ? '🙈' : '👁'}</button>
            </div>
          </div>

          {#if keyError}
            <div class="text-[12px] text-error mt-1">{keyError}</div>
          {/if}

          <button
            class="btn btn-primary w-full"
            onclick={saveKey}
            disabled={!keyInput.trim() || keySaving}
          >
            {keySaving ? 'Prüfe Key…' : keySaved ? 'Gespeichert ✓' : 'Speichern'}
          </button>
        {/if}

        <button
          class="btn w-full bg-base-300 hover:bg-neutral text-base-content border-0"
          onclick={openOptions}
        >Einstellungen öffnen</button>
      </div>
    {:else}
    <div>
      <section class="px-4 py-3 border-b border-base-300">
        <label class="block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted mb-2" for="style-select">Style</label>
        <select
          id="style-select"
          class="select select-bordered w-full"
          value={pendingDimensions && activeStyle?.builtIn ? '__custom_pending__' : appState.settings.activeStyleId}
          onchange={(e) => { const v = e.currentTarget.value; if (v !== '__custom_pending__') onStyleChange(v); }}
        >
          {#if pendingDimensions && activeStyle?.builtIn}
            <option value="__custom_pending__">Benutzerdefiniert</option>
          {/if}
          {#each appState.styleLibrary as style}
            <option value={style.id}>{style.name}{pendingDimensions && !activeStyle?.builtIn && style.id === appState.settings.activeStyleId ? ' *' : ''}{style.builtIn ? ' ★' : ''}</option>
          {/each}
        </select>
      </section>

      {#if activeStyle}
        <section class="relative px-4 py-3 border-b border-base-300">
          <div class="absolute inset-y-0 w-px bg-base-300 pointer-events-none" style="left: 50%"></div>
          {#each DIMS as dim}
            {@const val = liveValues[dim.key] ?? pendingDimensions?.[dim.key] ?? activeStyle.dimensions[dim.key]}
            {@const pos = (val + 2) / 4 * 100}
            {@const fillStart = Math.min(50, pos)}
            {@const fillEnd = Math.max(50, pos)}
            <div class="mb-[8px] last:mb-0 flex items-center gap-2">
              <span class="text-[11px] text-muted w-[52px] shrink-0">{dim.min}</span>
              <div class="flex-1 relative h-5 flex items-center">
                <div
                  class="absolute left-[7px] right-[7px] top-1/2 -translate-y-1/2 h-[5px] rounded-sm pointer-events-none z-0"
                  style="background: linear-gradient(to right, var(--color-base-300) {fillStart}%, var(--color-primary) {fillStart}%, var(--color-primary) {fillEnd}%, var(--color-base-300) {fillEnd}%)"
                ></div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="1"
                  class="dim-slider w-full h-5 relative z-[2] bg-transparent cursor-pointer"
                  value={val}
                  onpointerdown={() => { dragStyleId = activeStyle?.id ?? null; }}
                  oninput={(e) => {
                    if (dragStyleId !== (activeStyle?.id ?? null)) return;
                    liveValues[dim.key] = Number(e.currentTarget.value);
                  }}
                  onchange={(e) => {
                    if (dragStyleId !== (activeStyle?.id ?? null)) { dragStyleId = null; return; }
                    const v = Number(e.currentTarget.value);
                    onDimChange(dim.key, v);
                    delete liveValues[dim.key];
                    dragStyleId = null;
                  }}
                />
              </div>
              <span class="text-[11px] text-muted w-[52px] shrink-0 text-right">{dim.max}</span>
            </div>
          {/each}
          {#if pendingDimensions}
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-base-300">
              {#if confirmDiscard}
                <span class="text-[11px] text-muted">Änderungen verwerfen?</span>
                <div class="flex gap-2">
                  <button
                    class="btn btn-ghost btn-xs"
                    onclick={() => { confirmDiscard = false; }}
                  >Abbrechen</button>
                  <button
                    class="btn btn-error btn-xs"
                    onclick={() => { confirmDiscard = false; pendingDimensions = null; if (activeStyle) persistPending(activeStyle.id, null); }}
                  >Verwerfen</button>
                </div>
              {:else}
                <span class="text-[11px] text-muted">Nicht gespeichert</span>
                <div class="flex gap-2">
                  <button
                    class="btn btn-ghost btn-xs"
                    onclick={() => { confirmDiscard = true; }}
                  >Verwerfen</button>
                  <button
                    class="btn btn-primary btn-xs"
                    onclick={savePending}
                  >Speichern</button>
                </div>
              {/if}
            </div>
          {/if}
        </section>
      {/if}

      <section class="px-4 py-3 border-b border-base-300 flex flex-col gap-[10px]">
        <div class="flex items-center justify-between">
          <label for="toggle-auto" class="text-sm text-base-content cursor-pointer">Auto-Modus</label>
          <input
            id="toggle-auto"
            type="checkbox"
            class="toggle toggle-primary toggle-sm"
            checked={appState.settings.autoRewrite.enabled}
            onclick={toggleAutoRewrite}
            aria-label="Auto-Modus"
          />
        </div>
        <div class="flex items-center justify-between">
          <label for="toggle-knowledge" class="text-sm text-base-content cursor-pointer">Bekanntes Wissen</label>
          <input
            id="toggle-knowledge"
            type="checkbox"
            class="toggle toggle-primary toggle-sm"
            checked={appState.settings.knownKnowledge.enabled}
            onclick={toggleKnowledge}
            aria-label="Bekanntes Wissen"
          />
        </div>
      </section>

      <section class="px-4 py-3 flex flex-col gap-2 {extractActive ? 'border-b border-base-300' : ''}">
        {#if rewriteRunning && rewriteProgress}
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-base-content">
                {rewriteProgress.running ? 'Wird umformuliert…' : 'Fertig'}
              </span>
              {#if rewriteProgress.running}
                <span class="loading loading-spinner loading-xs text-primary"></span>
              {:else}
                <span class="text-success text-sm">✓</span>
              {/if}
            </div>
            <div class="text-[13px] text-muted">
              {rewriteProgress.done} von {rewriteProgress.total > 0 ? rewriteProgress.total : '…'} Absätzen
              {#if rewriteProgress.failed > 0}
                <span class="text-error"> · {rewriteProgress.failed} fehlgeschlagen</span>
              {/if}
            </div>
            {#if rewriteProgress.total > 0}
              <progress
                class="progress progress-primary w-full h-1.5"
                value={rewriteProgress.done + rewriteProgress.failed}
                max={rewriteProgress.total}
              ></progress>
            {/if}
            <button class="btn btn-sm w-full" onclick={() => window.close()}>
              {rewriteProgress.running ? 'Im Hintergrund fortsetzen' : 'Schliessen'}
            </button>
          </div>
        {:else}
          <button
            class="btn btn-primary w-full"
            onclick={triggerRewrite}
            disabled={triggering}
          >
            {triggering ? 'Wird gestartet…' : segmentCount !== null ? `Seite umformulieren (${segmentCount} Absätze)` : 'Seite umformulieren'}
          </button>
          <button
            class="btn w-full bg-base-300 hover:bg-neutral text-base-content border-0"
            onclick={extractStyle}
            disabled={extractActive}
          >
            {extracting ? 'Analysiert…' : 'Stil extrahieren'}
          </button>
        {/if}
      </section>

      <ExtractPanel
        {extracting}
        {extractResult}
        {extractError}
        onApply={applyExtracted}
        onSaveAsNew={saveExtractedAsNew}
        onDismiss={() => { extractResult = null; extractError = null; persistExtractResult(null); }}
      />
    </div>
    {/if}
  {/if}
</div>

<style>
  .dim-slider {
    -webkit-appearance: none;
    appearance: none;
    padding: 0;
    margin: 0;
  }
  .dim-slider::-webkit-slider-runnable-track {
    height: 3px;
    background: transparent;
  }
  .dim-slider::-moz-range-track {
    height: 3px;
    background: transparent;
    border: none;
  }
  .dim-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary);
    margin-top: -5.5px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .dim-slider:hover::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklch, var(--color-primary) 20%, transparent);
  }
  .dim-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary);
    border: none;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .dim-slider:hover::-moz-range-thumb {
    box-shadow: 0 0 0 4px color-mix(in oklch, var(--color-primary) 20%, transparent);
  }
</style>
