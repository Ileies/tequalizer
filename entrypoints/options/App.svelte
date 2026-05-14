<script lang="ts">
  import { getState, updateSettings } from '../../src/storage/storageAdapter.ts';
  import { saveStyle, deleteStyle, createStyle } from '../../src/style-engine/library.ts';
  import type { StoredState, StyleConfig, Settings } from '../../src/storage/schema.ts';
  import { TEMPLATES as TEMPLATE_DATA } from '../../src/style-engine/presets.ts';

  type Tab = 'api' | 'styles' | 'automode' | 'knowledge';

  const TEMPLATES: Array<{ id: StyleConfig['template']; label: string }> = [
    { id: 'none', label: 'Keins' },
    ...Object.entries(TEMPLATE_DATA).map(([id, t]) => ({
      id: id as StyleConfig['template'],
      label: t.label,
    })),
  ];

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

  const OPENAI_MODELS: Settings['openaiModel'][] = ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-5.4-mini'];

  let activeTab = $state<Tab>('api');
  let appState = $state<StoredState | null>(null);

  // Style editor
  let editStyle = $state<StyleConfig | null>(null);
  let isNewStyle = $state(false);
  let dialog = $state<HTMLDialogElement | undefined>();

  // Exclude domains text (for Auto-Modus tab)
  let excludeDomainsText = $state('');
  // Profile text (for Bekanntes Wissen tab)
  let profileText = $state('');

  // API key visibility
  let showOpenaiKey = $state(false);
  let showClaudeKey = $state(false);

  // Save feedback
  let savedMsg = $state('');
  let savedTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    getState().then((s) => {
      appState = s;
      excludeDomainsText = s.settings.autoRewrite.excludeDomains.join('\n');
      profileText = s.settings.knownKnowledge.profileText;
    });
  });

  $effect(() => {
    if (editStyle) {
      dialog?.showModal();
    }
  });

  function showSaved() {
    savedMsg = 'Gespeichert ✓';
    if (savedTimer) clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      savedMsg = '';
    }, 2000);
  }

  // --- API Tab ---

  async function saveProvider(provider: Settings['provider']) {
    if (!appState) return;
    await updateSettings({ provider });
    appState = await getState();
  }

  async function saveOpenaiKey(key: string) {
    if (!appState) return;
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    await updateSettings({ apiKeys: { ...apiKeys, openai: key } });
    appState = await getState();
    showSaved();
  }

  async function saveClaudeKey(key: string) {
    if (!appState) return;
    const apiKeys = $state.snapshot(appState.settings.apiKeys);
    await updateSettings({ apiKeys: { ...apiKeys, claude: key } });
    appState = await getState();
    showSaved();
  }

  async function saveOpenaiModel(model: Settings['openaiModel']) {
    if (!appState) return;
    await updateSettings({ openaiModel: model });
    appState = await getState();
  }

  async function saveOllamaEndpoint(endpoint: string) {
    if (!appState) return;
    await updateSettings({ ollamaEndpoint: endpoint || undefined });
    appState = await getState();
  }

  async function saveOllamaModel(model: string) {
    if (!appState) return;
    await updateSettings({ ollamaModel: model || undefined });
    appState = await getState();
    showSaved();
  }

  // --- Style Library Tab ---

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

  function closeDialog() {
    dialog?.close();
    editStyle = null;
  }

  async function submitStyle() {
    if (!editStyle || !editStyle.name.trim()) return;
    const styleSnap = $state.snapshot(editStyle) as StyleConfig;
    await saveStyle(styleSnap);
    if (isNewStyle && appState) {
      // Auto-set as active if it's the first custom style
      const state = await getState();
      if (state.styleLibrary.length === 2) {
        await updateSettings({ activeStyleId: styleSnap.id });
      }
    }
    appState = await getState();
    closeDialog();
  }

  async function handleDeleteStyle(id: string) {
    if (!confirm('Style löschen?')) return;
    await deleteStyle(id);
    appState = await getState();
  }

  async function setDefault(id: string) {
    if (!appState) return;
    await updateSettings({ activeStyleId: id });
    appState = await getState();
  }

  // --- Auto-Modus Tab ---

  async function saveAutoEnabled(enabled: boolean) {
    if (!appState) return;
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    await updateSettings({ autoRewrite: { ...autoRewrite, enabled } });
    appState = await getState();
  }

  async function saveMinWordCount(count: number) {
    if (!appState) return;
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    await updateSettings({ autoRewrite: { ...autoRewrite, minWordCount: count } });
    appState = await getState();
  }

  async function saveExcludeDomains() {
    if (!appState) return;
    const autoRewrite = $state.snapshot(appState.settings.autoRewrite);
    const domains = excludeDomainsText
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean);
    await updateSettings({ autoRewrite: { ...autoRewrite, excludeDomains: domains } });
    appState = await getState();
    showSaved();
  }

  // --- Bekanntes Wissen Tab ---

  async function saveKnowledgeEnabled(enabled: boolean) {
    if (!appState) return;
    const knownKnowledge = $state.snapshot(appState.settings.knownKnowledge);
    await updateSettings({ knownKnowledge: { ...knownKnowledge, enabled } });
    appState = await getState();
  }

  async function saveProfileText(text: string) {
    if (!appState) return;
    const knownKnowledge = $state.snapshot(appState.settings.knownKnowledge);
    await updateSettings({ knownKnowledge: { ...knownKnowledge, profileText: text } });
    appState = await getState();
    showSaved();
  }
</script>

<div class="page">
  {#if !appState}
    <div class="loading">Laden…</div>
  {:else}
    <div class="layout">
      <nav class="sidebar">
        <div class="app-name">Tequalizer</div>
        <button
          class="nav-item"
          class:active={activeTab === 'api'}
          onclick={() => (activeTab = 'api')}
        >API & Anbieter</button>
        <button
          class="nav-item"
          class:active={activeTab === 'styles'}
          onclick={() => (activeTab = 'styles')}
        >Style-Bibliothek</button>
        <button
          class="nav-item"
          class:active={activeTab === 'automode'}
          onclick={() => (activeTab = 'automode')}
        >Auto-Modus</button>
        <button
          class="nav-item"
          class:active={activeTab === 'knowledge'}
          onclick={() => (activeTab = 'knowledge')}
        >Bekanntes Wissen</button>
      </nav>

      <main class="content">
        <!-- ── API & Anbieter ── -->
        {#if activeTab === 'api'}
          <h1>API & Anbieter</h1>
          <p class="page-desc">Verbinde Rewrite mit deinem bevorzugten KI-Anbieter.</p>

          <section class="card">
            <div class="field-label">Anbieter</div>
            <div class="provider-tabs">
              {#each (['openai', 'claude', 'ollama'] as const) as p}
                <button
                  class="provider-tab"
                  class:provider-active={appState.settings.provider === p}
                  onclick={() => saveProvider(p)}
                >
                  {p === 'openai' ? 'OpenAI' : p === 'claude' ? 'Claude' : 'Ollama'}
                </button>
              {/each}
            </div>
          </section>

          {#if appState.settings.provider === 'openai'}
            <section class="card">
              <div class="field-label">OpenAI API-Key</div>
              <div class="input-row">
                <input
                  class="text-input"
                  type={showOpenaiKey ? 'text' : 'password'}
                  placeholder="sk-…"
                  value={appState.settings.apiKeys.openai ?? ''}
                  onchange={(e) => saveOpenaiKey(e.currentTarget.value)}
                />
                <button class="icon-btn" onclick={() => (showOpenaiKey = !showOpenaiKey)}>
                  {showOpenaiKey ? '🙈' : '👁'}
                </button>
              </div>

              <div class="field-label" style="margin-top: 20px;">Modell</div>
              <select
                class="select"
                value={appState.settings.openaiModel}
                onchange={(e) =>
                  saveOpenaiModel(e.currentTarget.value as Settings['openaiModel'])}
              >
                {#each OPENAI_MODELS as m}
                  <option value={m}>{m}</option>
                {/each}
              </select>
            </section>
          {/if}

          {#if appState.settings.provider === 'claude'}
            <section class="card">
              <div class="field-row">
                <div class="field-label">Claude API-Key</div>
                <span class="badge">Experimentell</span>
              </div>
              <div class="input-row">
                <input
                  class="text-input"
                  type={showClaudeKey ? 'text' : 'password'}
                  placeholder="sk-ant-…"
                  value={appState.settings.apiKeys.claude ?? ''}
                  onchange={(e) => saveClaudeKey(e.currentTarget.value)}
                />
                <button class="icon-btn" onclick={() => (showClaudeKey = !showClaudeKey)}>
                  {showClaudeKey ? '🙈' : '👁'}
                </button>
              </div>
            </section>
          {/if}

          {#if appState.settings.provider === 'ollama'}
            <section class="card">
              <div class="field-label">Ollama Endpoint</div>
              <input
                class="text-input"
                type="url"
                placeholder="http://localhost:11434"
                value={appState.settings.ollamaEndpoint ?? ''}
                onchange={(e) => saveOllamaEndpoint(e.currentTarget.value)}
              />

              <div class="field-label" style="margin-top: 20px;">Modell</div>
              <div class="input-row">
                <input
                  class="text-input"
                  type="text"
                  placeholder="llama3"
                  value={appState.settings.ollamaModel ?? ''}
                  onchange={(e) => saveOllamaModel(e.currentTarget.value)}
                />
              </div>
            </section>
          {/if}

          {#if savedMsg}
            <div class="saved-msg">{savedMsg}</div>
          {/if}
        {/if}

        <!-- ── Style-Bibliothek ── -->
        {#if activeTab === 'styles'}
          <div class="tab-header">
            <h1>Style-Bibliothek</h1>
            <button class="btn-secondary" onclick={openNewStyle}>+ Neuer Style</button>
          </div>

          <div class="style-list">
            {#each appState.styleLibrary as style}
              <div class="style-card">
                <div class="style-info">
                  <span class="style-name">{style.name}</span>
                  <div class="style-badges">
                    {#if style.builtIn}
                      <span class="badge">Integriert</span>
                    {/if}
                    {#if style.id === appState.settings.activeStyleId}
                      <span class="badge badge-active">Standard</span>
                    {/if}
                    {#if style.template !== 'none'}
                      <span class="badge">{TEMPLATES.find((t) => t.id === style.template)?.label ?? style.template}</span>
                    {/if}
                  </div>
                </div>
                <div class="style-actions">
                  {#if style.id !== appState.settings.activeStyleId}
                    <button class="btn-ghost" onclick={() => setDefault(style.id)}>
                      Als Standard
                    </button>
                  {/if}
                  <button class="btn-ghost" onclick={() => openEditStyle(style)}>Bearbeiten</button>
                  {#if !style.builtIn}
                    <button class="btn-ghost btn-danger" onclick={() => handleDeleteStyle(style.id)}>
                      Löschen
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- ── Auto-Modus ── -->
        {#if activeTab === 'automode'}
          <h1>Auto-Modus</h1>
          <p class="page-desc">Seiten werden automatisch umformuliert, sobald du sie öffnest.</p>

          <section class="card">
            <div class="toggle-row">
              <div>
                <div class="field-label" style="margin-bottom: 2px;">Automatisch umformulieren</div>
                <div class="field-hint">Texte werden beim Öffnen einer Seite automatisch umgeschrieben.</div>
              </div>
              <button
                class="toggle"
                class:toggle-on={appState.settings.autoRewrite.enabled}
                onclick={() => saveAutoEnabled(!appState!.settings.autoRewrite.enabled)}
                aria-pressed={appState.settings.autoRewrite.enabled}
                aria-label="Auto-Modus aktivieren"
              >
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </section>

          <section class="card">
            <div class="field-label">
              Mindest-Wortanzahl: {appState.settings.autoRewrite.minWordCount}
            </div>
            <div class="field-hint">Abschnitte mit weniger Wörtern werden übersprungen.</div>
            <input
              type="range"
              class="slider"
              min="10"
              max="500"
              step="10"
              value={appState.settings.autoRewrite.minWordCount}
              onchange={(e) => saveMinWordCount(Number(e.currentTarget.value))}
            />
            <div class="slider-labels">
              <span>10</span>
              <span>500</span>
            </div>
          </section>

          <section class="card">
            <div class="field-label">Ausgeschlossene Domains</div>
            <div class="field-hint">Eine Domain pro Zeile, z.B. <code>example.com</code></div>
            <textarea
              class="textarea"
              rows="6"
              placeholder="example.com&#10;news.example.org"
              bind:value={excludeDomainsText}
            ></textarea>
            <div class="card-footer">
              <button class="btn-primary" onclick={saveExcludeDomains}>Speichern</button>
              {#if savedMsg}
                <span class="saved-msg">{savedMsg}</span>
              {/if}
            </div>
          </section>
        {/if}

        <!-- ── Bekanntes Wissen ── -->
        {#if activeTab === 'knowledge'}
          <h1>Bekanntes Wissen</h1>
          <p class="page-desc">Dein Profil wird beim Umformulieren als Kontext an das Modell übergeben.</p>

          <section class="card">
            <div class="toggle-row">
              <div>
                <div class="field-label" style="margin-bottom: 2px;">Bekanntes Wissen verwenden</div>
                <div class="field-hint">Das Profil wird beim Umformulieren als Kontext übergeben.</div>
              </div>
              <button
                class="toggle"
                class:toggle-on={appState.settings.knownKnowledge.enabled}
                onclick={() => saveKnowledgeEnabled(!appState!.settings.knownKnowledge.enabled)}
                aria-pressed={appState.settings.knownKnowledge.enabled}
                aria-label="Bekanntes Wissen aktivieren"
              >
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </section>

          <section class="card">
            <div class="field-label">Profil-Text</div>
            <div class="field-hint">Beschreibe deinen Schreibstil, dein Publikum oder andere Hinweise für das Modell.</div>
            <textarea
              class="textarea"
              rows="10"
              maxlength="2000"
              placeholder="Ich schreibe für ein technisch versiertes Publikum…"
              bind:value={profileText}
            ></textarea>
            <div class="card-footer">
              <span class="char-count">{profileText.length} / 2000</span>
              <button class="btn-primary" onclick={() => saveProfileText(profileText)}>
                Speichern
              </button>
              {#if savedMsg}
                <span class="saved-msg">{savedMsg}</span>
              {/if}
            </div>
          </section>
        {/if}
      </main>
    </div>
  {/if}
</div>

<!-- Style editor dialog -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  oncancel={closeDialog}
  onclick={(e) => { if (e.target === dialog) closeDialog(); }}
>
  <div class="dialog-inner" role="presentation" onclick={(e) => e.stopPropagation()}>
    {#if editStyle}
      <h2>{isNewStyle ? 'Neuer Style' : 'Style bearbeiten'}</h2>

      <div class="field-label">Name</div>
      <input
        class="text-input"
        type="text"
        placeholder="Mein Style"
        bind:value={editStyle.name}
      />

      <div class="field-label" style="margin-top: 20px;">Dimensionen</div>
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
              bind:value={editStyle.dimensions[dim.key]}
            />
            <div class="slider-dots">
              {#each [-2, -1, 0, 1, 2] as tick}
                <span class="dot" class:dot-center={tick === 0}></span>
              {/each}
            </div>
          </div>
        </div>
      {/each}

      <div class="field-label" style="margin-top: 20px;">Vorlage</div>
      <div class="chips">
        {#each TEMPLATES as t}
          <button
            class="chip"
            class:chip-active={editStyle.template === t.id}
            onclick={() => {
              if (!editStyle) return;
              editStyle.template = t.id;
              const tmpl = t.id !== 'none' ? TEMPLATE_DATA[t.id] : null;
              if (tmpl) editStyle.dimensions = { ...tmpl.defaultDimensions };
            }}
          >
            {t.label}
          </button>
        {/each}
      </div>

      <div class="field-label" style="margin-top: 20px;">Eigene Anweisungen <span class="field-hint-inline">(optional, max. 2000 Zeichen)</span></div>
      <textarea
        class="textarea"
        rows="4"
        maxlength="2000"
        placeholder="Verwende kurze Sätze. Schreibe in der Du-Form."
        bind:value={editStyle.customInstructions}
      ></textarea>

      <div class="dialog-actions">
        <button
          class="btn-primary"
          onclick={submitStyle}
          disabled={!editStyle.name.trim()}
        >
          {isNewStyle ? 'Erstellen' : 'Speichern'}
        </button>
        <button class="btn-secondary" onclick={closeDialog}>Abbrechen</button>
      </div>
    {/if}
  </div>
</dialog>

<style>
  :global(body) {
    margin: 0;
    background: #1e1e2e;
    color: #cdd6f4;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .page {
    min-height: 100vh;
  }

  .loading {
    padding: 80px;
    text-align: center;
    color: #6c7086;
    font-size: 14px;
  }

  /* Layout */
  .layout {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 260px;
    flex-shrink: 0;
    background: #181825;
    border-right: 1px solid #313244;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .app-name {
    font-size: 20px;
    font-weight: 700;
    color: #cdd6f4;
    letter-spacing: -0.01em;
    padding: 0 12px 20px;
    border-bottom: 1px solid #313244;
    margin-bottom: 12px;
  }

  .nav-item {
    all: unset;
    font-family: inherit;
    font-size: 14px;
    color: #a6adc8;
    padding: 10px 12px;
    border-radius: 8px;
    border-left: 3px solid transparent;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .nav-item:hover {
    background: rgba(49, 50, 68, 0.7);
    color: #cdd6f4;
  }

  .nav-item.active {
    background: rgba(137, 180, 250, 0.1);
    color: #89b4fa;
    font-weight: 600;
    border-left-color: #89b4fa;
  }

  .content {
    flex: 1;
    padding: 52px 64px;
    max-width: 820px;
  }

  h1 {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #cdd6f4;
    letter-spacing: -0.02em;
    display: block;
    margin-bottom: 6px;
  }

  .page-desc {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    color: #6c7086;
    display: block;
    margin-bottom: 32px;
    line-height: 1.5;
  }

  .tab-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .tab-header h1 {
    margin-bottom: 0;
  }

  /* Cards */
  .card {
    background: #181825;
    border: 1px solid #313244;
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 20px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6c7086;
    margin-bottom: 12px;
    display: block;
  }

  .field-hint {
    font-size: 13px;
    color: #6c7086;
    margin-bottom: 14px;
    line-height: 1.55;
  }

  .field-hint-inline {
    font-size: 11px;
    color: #6c7086;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 400;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .field-row .field-label {
    margin-bottom: 0;
  }

  /* Provider tabs */
  .provider-tabs {
    display: flex;
    gap: 8px;
  }

  .provider-tab {
    all: unset;
    font-family: inherit;
    font-size: 14px;
    padding: 9px 22px;
    border-radius: 8px;
    border: 1px solid #313244;
    background: #1e1e2e;
    color: #a6adc8;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }

  .provider-tab:hover {
    background: #313244;
    color: #cdd6f4;
  }

  .provider-active {
    background: #89b4fa;
    color: #1e1e2e;
    border-color: #89b4fa;
    font-weight: 600;
  }

  /* Inputs */
  .text-input {
    width: 100%;
    box-sizing: border-box;
    background: #1e1e2e;
    color: #cdd6f4;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    font-family: inherit;
  }

  .text-input:focus {
    outline: 2px solid #89b4fa;
    outline-offset: -2px;
  }

  .text-input::placeholder {
    color: #45475a;
  }

  .input-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .select {
    width: 100%;
    background: #1e1e2e;
    color: #cdd6f4;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    appearance: auto;
  }

  .select:focus {
    outline: 2px solid #89b4fa;
    outline-offset: -2px;
  }

  .textarea {
    width: 100%;
    box-sizing: border-box;
    background: #1e1e2e;
    color: #cdd6f4;
    border: 1px solid #313244;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    line-height: 1.6;
  }

  .textarea:focus {
    outline: 2px solid #89b4fa;
    outline-offset: -2px;
  }

  .textarea::placeholder {
    color: #45475a;
  }

  code {
    font-family: monospace;
    font-size: 12px;
    background: #313244;
    padding: 2px 5px;
    border-radius: 4px;
    color: #cba6f7;
  }

  /* Icon button (key visibility) */
  .icon-btn {
    all: unset;
    cursor: pointer;
    font-size: 16px;
    padding: 6px 8px;
    border-radius: 6px;
    flex-shrink: 0;
    line-height: 1;
  }

  .icon-btn:hover {
    background: #313244;
  }

  /* Badges */
  .badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 99px;
    background: #313244;
    color: #a6adc8;
    text-transform: none;
    letter-spacing: 0;
  }

  .badge-active {
    background: rgba(137, 180, 250, 0.15);
    color: #89b4fa;
  }

  /* Style list */
  .style-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .style-card {
    background: #181825;
    border: 1px solid #313244;
    border-radius: 12px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .style-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .style-name {
    font-size: 15px;
    font-weight: 600;
    color: #cdd6f4;
  }

  .style-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .style-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  /* Buttons */
  .btn-primary {
    all: unset;
    font-family: inherit;
    background: #89b4fa;
    color: #1e1e2e;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 22px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #74c7ec;
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-secondary {
    all: unset;
    font-family: inherit;
    background: #313244;
    color: #cdd6f4;
    font-size: 14px;
    padding: 10px 22px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-secondary:hover {
    background: #45475a;
  }

  .btn-ghost {
    all: unset;
    font-family: inherit;
    font-size: 13px;
    color: #89b4fa;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s;
  }

  .btn-ghost:hover {
    background: rgba(137, 180, 250, 0.1);
  }

  .btn-danger {
    color: #f38ba8;
  }

  .btn-danger:hover {
    background: rgba(243, 139, 168, 0.1);
  }

  /* Card footer */
  .card-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
  }

  .saved-msg {
    font-size: 13px;
    color: #a6e3a1;
  }

  .char-count {
    font-size: 12px;
    color: #6c7086;
    margin-left: auto;
  }

  /* Slider */
  .slider {
    width: 100%;
    accent-color: #89b4fa;
    cursor: pointer;
    margin-top: 8px;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #6c7086;
    margin-top: 6px;
  }

  /* Toggle */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 2px 0;
  }

  .toggle {
    all: unset;
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 12px;
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
    top: 4px;
    left: 4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #cdd6f4;
    transition: transform 0.2s;
    pointer-events: none;
  }

  .toggle-on .toggle-thumb {
    transform: translateX(20px);
  }

  /* Dim sliders */
  .dim-row {
    margin-bottom: 16px;
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
    padding-bottom: 12px;
  }

  .slider-dots {
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #45475a;
    flex-shrink: 0;
  }

  .dot-center {
    background: #585b70;
  }

  /* Template chips */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    all: unset;
    font-family: inherit;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 99px;
    border: 1px solid #313244;
    background: #1e1e2e;
    color: #a6adc8;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }

  .chip:hover {
    background: #313244;
    color: #cdd6f4;
  }

  .chip-active {
    background: #89b4fa;
    color: #1e1e2e;
    border-color: #89b4fa;
    font-weight: 600;
  }

  /* Dialog */
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

  .dialog-inner {
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 14px;
    padding: 36px;
    width: min(90vw, 560px);
    max-height: 88vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.65);
  }

  h2 {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #cdd6f4;
    letter-spacing: -0.01em;
    display: block;
    margin-bottom: 24px;
  }

  .dialog-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 28px;
  }

  .dialog-inner .text-input,
  .dialog-inner .textarea {
    margin-bottom: 0;
  }

  .dialog-inner .field-label {
    margin-top: 0;
  }
</style>
