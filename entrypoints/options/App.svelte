<script lang="ts">
  import { getState, updateSettings } from '../../src/storage/storageAdapter.ts';
  import { saveStyle, deleteStyle, createStyle } from '../../src/style-engine/library.ts';
  import type { StoredState, StyleConfig, Settings } from '../../src/storage/schema.ts';
  type Tab = 'api' | 'styles' | 'automode' | 'knowledge';

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

<div class="min-h-screen">
  {#if !appState}
    <div class="p-20 text-center text-[#6c7086] text-sm">Laden…</div>
  {:else}
    <div class="flex min-h-screen">
      <nav class="w-[260px] shrink-0 bg-[#181825] border-r border-[#313244] px-5 py-8 flex flex-col gap-0.5">
        <div class="text-xl font-bold text-[#cdd6f4] tracking-[-0.01em] px-3 pb-5 border-b border-[#313244] mb-3">Tequalizer</div>
        {#each ([['api', 'API & Anbieter'], ['styles', 'Style-Bibliothek'], ['automode', 'Auto-Modus'], ['knowledge', 'Bekanntes Wissen']] as const) as [tab, label]}
          <button
            class="block w-full text-sm px-3 py-[10px] rounded-lg border-l-[3px] cursor-pointer transition-[background,color] duration-[0.12s] text-left {activeTab === tab ? 'bg-[#89b4fa]/10 text-[#89b4fa] font-semibold border-l-[#89b4fa]' : 'text-[#a6adc8] border-l-transparent hover:bg-[#313244]/70 hover:text-[#cdd6f4]'}"
            onclick={() => (activeTab = tab)}
          >{label}</button>
        {/each}
      </nav>

      <main class="flex-1 px-16 py-[52px] max-w-[820px]">
        <!-- ── API & Anbieter ── -->
        {#if activeTab === 'api'}
          <h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em] mb-1.5">API & Anbieter</h1>
          <p class="block text-sm text-[#6c7086] mb-8 leading-normal">Verbinde Rewrite mit deinem bevorzugten KI-Anbieter.</p>

          <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
            <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Anbieter</div>
            <div class="flex gap-2">
              {#each (['openai', 'claude', 'ollama'] as const) as p}
                <button
                  class="text-sm px-[22px] py-[9px] rounded-lg border cursor-pointer transition-[background,color,border-color] duration-[0.12s] {appState.settings.provider === p ? 'bg-[#89b4fa] text-[#1e1e2e] border-[#89b4fa] font-semibold' : 'bg-[#1e1e2e] text-[#a6adc8] border-[#313244] hover:bg-[#313244] hover:text-[#cdd6f4]'}"
                  onclick={() => saveProvider(p)}
                >
                  {p === 'openai' ? 'OpenAI' : p === 'claude' ? 'Claude' : 'Ollama'}
                </button>
              {/each}
            </div>
          </section>

          {#if appState.settings.provider === 'openai'}
            <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
              <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">OpenAI API-Key</div>
              <div class="flex gap-2 items-center">
                <input
                  class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
                  type={showOpenaiKey ? 'text' : 'password'}
                  placeholder="sk-…"
                  value={appState.settings.apiKeys.openai ?? ''}
                  onchange={(e) => saveOpenaiKey(e.currentTarget.value)}
                />
                <button class="cursor-pointer text-base px-2 py-1.5 rounded-md shrink-0 leading-none hover:bg-[#313244]" onclick={() => (showOpenaiKey = !showOpenaiKey)}>
                  {showOpenaiKey ? '🙈' : '👁'}
                </button>
              </div>

              <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3 mt-5">Modell</div>
              <select
                class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm cursor-pointer focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px]"
                value={appState.settings.openaiModel}
                onchange={(e) => saveOpenaiModel(e.currentTarget.value as Settings['openaiModel'])}
              >
                {#each OPENAI_MODELS as m}
                  <option value={m}>{m}</option>
                {/each}
              </select>
            </section>
          {/if}

          {#if appState.settings.provider === 'claude'}
            <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
              <div class="flex items-center gap-[10px] mb-3">
                <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086]">Claude API-Key</div>
                <span class="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#313244] text-[#a6adc8]">Experimentell</span>
              </div>
              <div class="flex gap-2 items-center">
                <input
                  class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
                  type={showClaudeKey ? 'text' : 'password'}
                  placeholder="sk-ant-…"
                  value={appState.settings.apiKeys.claude ?? ''}
                  onchange={(e) => saveClaudeKey(e.currentTarget.value)}
                />
                <button class="cursor-pointer text-base px-2 py-1.5 rounded-md shrink-0 leading-none hover:bg-[#313244]" onclick={() => (showClaudeKey = !showClaudeKey)}>
                  {showClaudeKey ? '🙈' : '👁'}
                </button>
              </div>
            </section>
          {/if}

          {#if appState.settings.provider === 'ollama'}
            <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
              <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Ollama Endpoint</div>
              <input
                class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
                type="url"
                placeholder="http://localhost:11434"
                value={appState.settings.ollamaEndpoint ?? ''}
                onchange={(e) => saveOllamaEndpoint(e.currentTarget.value)}
              />

              <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3 mt-5">Modell</div>
              <div class="flex gap-2 items-center">
                <input
                  class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
                  type="text"
                  placeholder="llama3"
                  value={appState.settings.ollamaModel ?? ''}
                  onchange={(e) => saveOllamaModel(e.currentTarget.value)}
                />
              </div>
            </section>
          {/if}

          {#if savedMsg}
            <div class="text-[13px] text-[#a6e3a1]">{savedMsg}</div>
          {/if}
        {/if}

        <!-- ── Style-Bibliothek ── -->
        {#if activeTab === 'styles'}
          <div class="flex items-center justify-between mb-8">
            <h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em]">Style-Bibliothek</h1>
            <button class="bg-[#313244] text-[#cdd6f4] text-sm px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#45475a]" onclick={openNewStyle}>+ Neuer Style</button>
          </div>

          <div class="flex flex-col gap-3">
            {#each appState.styleLibrary as style}
              <div class="bg-[#181825] border border-[#313244] rounded-xl px-[22px] py-[18px] flex items-center justify-between gap-4">
                <div class="flex flex-col gap-2 min-w-0">
                  <span class="text-[15px] font-semibold text-[#cdd6f4]">{style.name}</span>
                  <div class="flex gap-1.5 flex-wrap">
                    {#if style.builtIn}
                      <span class="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#313244] text-[#a6adc8]">Integriert</span>
                    {/if}
                    {#if style.id === appState.settings.activeStyleId}
                      <span class="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-[#89b4fa]/15 text-[#89b4fa]">Standard</span>
                    {/if}
                  </div>
                </div>
                <div class="flex gap-1 shrink-0">
                  {#if style.id !== appState.settings.activeStyleId}
                    <button class="text-[13px] text-[#89b4fa] px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-[0.12s] hover:bg-[#89b4fa]/10" onclick={() => setDefault(style.id)}>
                      Als Standard
                    </button>
                  {/if}
                  <button class="text-[13px] text-[#89b4fa] px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-[0.12s] hover:bg-[#89b4fa]/10" onclick={() => openEditStyle(style)}>Bearbeiten</button>
                  {#if !style.builtIn}
                    <button class="text-[13px] text-[#f38ba8] px-3 py-1.5 rounded-md cursor-pointer transition-colors duration-[0.12s] hover:bg-[#f38ba8]/10" onclick={() => handleDeleteStyle(style.id)}>
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
          <h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em] mb-1.5">Auto-Modus</h1>
          <p class="block text-sm text-[#6c7086] mb-8 leading-normal">Seiten werden automatisch umformuliert, sobald du sie öffnest.</p>

          <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
            <div class="flex items-center justify-between gap-5 py-0.5">
              <div>
                <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-[2px]">Automatisch umformulieren</div>
                <div class="text-[13px] text-[#6c7086] leading-[1.55]">Texte werden beim Öffnen einer Seite automatisch umgeschrieben.</div>
              </div>
              <button
                class="relative w-11 h-6 rounded-xl cursor-pointer transition-colors duration-200 shrink-0 {appState.settings.autoRewrite.enabled ? 'bg-[#89b4fa]' : 'bg-[#313244]'}"
                onclick={() => saveAutoEnabled(!appState!.settings.autoRewrite.enabled)}
                aria-pressed={appState.settings.autoRewrite.enabled}
                aria-label="Auto-Modus aktivieren"
              >
                <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#cdd6f4] transition-transform duration-200 pointer-events-none {appState.settings.autoRewrite.enabled ? 'translate-x-5' : ''}"></span>
              </button>
            </div>
          </section>

          <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
            <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">
              Mindest-Wortanzahl: {appState.settings.autoRewrite.minWordCount}
            </div>
            <div class="text-[13px] text-[#6c7086] mb-[14px] leading-[1.55]">Abschnitte mit weniger Wörtern werden übersprungen.</div>
            <input
              type="range"
              class="w-full accent-[#89b4fa] cursor-pointer mt-2"
              min="10"
              max="500"
              step="10"
              value={appState.settings.autoRewrite.minWordCount}
              onchange={(e) => saveMinWordCount(Number(e.currentTarget.value))}
            />
            <div class="flex justify-between text-[11px] text-[#6c7086] mt-1.5">
              <span>10</span>
              <span>500</span>
            </div>
          </section>

          <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
            <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Ausgeschlossene Domains</div>
            <div class="text-[13px] text-[#6c7086] mb-[14px] leading-[1.55]">Eine Domain pro Zeile, z.B. <code class="font-mono text-xs bg-[#313244] px-[5px] py-0.5 rounded text-[#cba6f7]">example.com</code></div>
            <textarea
              class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-3 text-sm resize-y leading-[1.6] focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
              rows="6"
              placeholder="example.com&#10;news.example.org"
              bind:value={excludeDomainsText}
            ></textarea>
            <div class="flex items-center gap-3 mt-4">
              <button class="bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 enabled:hover:bg-[#74c7ec] disabled:opacity-40 disabled:cursor-not-allowed" onclick={saveExcludeDomains}>Speichern</button>
              {#if savedMsg}
                <span class="text-[13px] text-[#a6e3a1]">{savedMsg}</span>
              {/if}
            </div>
          </section>
        {/if}

        <!-- ── Bekanntes Wissen ── -->
        {#if activeTab === 'knowledge'}
          <h1 class="block text-[26px] font-bold text-[#cdd6f4] tracking-[-0.02em] mb-1.5">Bekanntes Wissen</h1>
          <p class="block text-sm text-[#6c7086] mb-8 leading-normal">Dein Profil wird beim Umformulieren als Kontext an das Modell übergeben.</p>

          <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
            <div class="flex items-center justify-between gap-5 py-0.5">
              <div>
                <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-[2px]">Bekanntes Wissen verwenden</div>
                <div class="text-[13px] text-[#6c7086] leading-[1.55]">Das Profil wird beim Umformulieren als Kontext übergeben.</div>
              </div>
              <button
                class="relative w-11 h-6 rounded-xl cursor-pointer transition-colors duration-200 shrink-0 {appState.settings.knownKnowledge.enabled ? 'bg-[#89b4fa]' : 'bg-[#313244]'}"
                onclick={() => saveKnowledgeEnabled(!appState!.settings.knownKnowledge.enabled)}
                aria-pressed={appState.settings.knownKnowledge.enabled}
                aria-label="Bekanntes Wissen aktivieren"
              >
                <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#cdd6f4] transition-transform duration-200 pointer-events-none {appState.settings.knownKnowledge.enabled ? 'translate-x-5' : ''}"></span>
              </button>
            </div>
          </section>

          <section class="bg-[#181825] border border-[#313244] rounded-xl px-7 py-6 mb-5">
            <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Profil-Text</div>
            <div class="text-[13px] text-[#6c7086] mb-[14px] leading-[1.55]">Beschreibe deinen Schreibstil, dein Publikum oder andere Hinweise für das Modell.</div>
            <textarea
              class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-3 text-sm resize-y leading-[1.6] focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
              rows="10"
              maxlength="2000"
              placeholder="Ich schreibe für ein technisch versiertes Publikum…"
              bind:value={profileText}
            ></textarea>
            <div class="flex items-center gap-3 mt-4">
              <span class="text-xs text-[#6c7086] ml-auto">{profileText.length} / 2000</span>
              <button class="bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 enabled:hover:bg-[#74c7ec] disabled:opacity-40 disabled:cursor-not-allowed" onclick={() => saveProfileText(profileText)}>
                Speichern
              </button>
              {#if savedMsg}
                <span class="text-[13px] text-[#a6e3a1]">{savedMsg}</span>
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
  <div class="bg-[#1e1e2e] text-[#cdd6f4] rounded-[14px] p-9 w-[min(90vw,560px)] max-h-[88vh] overflow-y-auto flex flex-col shadow-[0_12px_48px_rgba(0,0,0,0.65)]" role="presentation" onclick={(e) => e.stopPropagation()}>
    {#if editStyle}
      <h2 class="block text-lg font-bold text-[#cdd6f4] tracking-[-0.01em] mb-6">{isNewStyle ? 'Neuer Style' : 'Style bearbeiten'}</h2>

      <div class="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c7086] mb-3">Name</div>
      <input
        class="w-full bg-[#1e1e2e] text-[#cdd6f4] border border-[#313244] rounded-lg px-[14px] py-[10px] text-sm focus:outline-2 focus:outline-[#89b4fa] focus:outline-offset-[-2px] placeholder:text-[#45475a]"
        type="text"
        placeholder="Mein Style"
        bind:value={editStyle.name}
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
              bind:value={editStyle.dimensions[dim.key]}
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
        bind:value={editStyle.customInstructions}
      ></textarea>

      <div class="flex gap-[10px] justify-end mt-7">
        <button
          class="bg-[#89b4fa] text-[#1e1e2e] text-sm font-semibold px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 enabled:hover:bg-[#74c7ec] disabled:opacity-40 disabled:cursor-not-allowed"
          onclick={submitStyle}
          disabled={!editStyle.name.trim()}
        >
          {isNewStyle ? 'Erstellen' : 'Speichern'}
        </button>
        <button class="bg-[#313244] text-[#cdd6f4] text-sm px-[22px] py-[10px] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#45475a]" onclick={closeDialog}>Abbrechen</button>
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
