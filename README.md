# Tequalizer - Texte in deinem Stil

A cross-browser extension (Chrome MV3 + Firefox MV3) that rewrites articles and blog posts on any website to match your personal writing style preferences.

## Features

- **Style dimensions** - five sliders (length, imagery, warmth, formality, simplicity), integer −2 to +2
- **Templates** - TED Talk, Bible, Personal Letter, Academic, Tabloid
- **Style library** - save and switch between multiple named styles
- **Style extraction** - analyze the writing style of any page and import it as a new style
- **Auto-mode** - automatically detects and rewrites articles on page load
- **Manual trigger** - rewrite the current page from the popup at any time
- **Diff view** - side-by-side original vs. rewrite with word-level highlighting; accept or reject
- **Known knowledge** - optional user profile injected into the prompt so the LLM skips obvious context
- **API key setup** - popup shows an inline key entry screen when no key is configured
- **Provider abstraction** - OpenAI in V1, architecture ready for Claude (V2) and Ollama (V3)

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Content Script          Background          Popup / Options
│  (DOM, Diff View)  ◄──►  (LLM calls)  ◄──►  (Svelte UI)
└──────────────────────────────────────────────────────────┘
                               │
                    LLMProvider interface
                          │         │
                      OpenAI     Claude / Ollama (V2/V3)
```

**Rewrite flow:**
1. Content script scores the page with Readability; if it qualifies, a floating button appears
2. User clicks the button (or Auto-mode fires on load) → content script sends `REWRITE_SEGMENT` messages to background
3. Background calls `openaiProvider.streamRewrite()` and streams tokens back via a named port
4. Content script renders the live Diff View (word-level diff via `jsdiff`)
5. User accepts (DOM is patched in place) or rejects (original restored)

**Style extraction flow:**
1. User clicks "Stil extrahieren" in the popup
2. Popup sends `GET_PAGE_SAMPLES` to the content script → up to 3000 chars of page text
3. Popup sends `EXTRACT_STYLE` to background → background calls LLM (non-streaming) with extraction prompt
4. Result (`dimensions` + `customInstructions`) shown in `ExtractPanel`; user can apply to current style or save as new

## Project structure

```
entrypoints/
  background.ts          - service worker; LLM streaming, port-based messaging, style extraction
  content/
    index.ts             - message listeners (TRIGGER_REWRITE, GET_PAGE_SAMPLES), auto-rewrite trigger
    articleDetector.ts   - Readability-based page scoring
    autoRewriteOrchestrator.ts - segment iteration, streaming coordination
    diffRenderer.ts      - word-level diff rendering
    diffViewInjector.ts  - injects the DiffView overlay into the page
    domSegmenter.ts      - splits article DOM into rewritable segments
    domSurgeon.ts        - applies accepted rewrites back to the DOM
    segmentClassifier.ts - filters out headings, nav, code, link-dense text
  popup/
    App.svelte           - style picker, dimension sliders, toggles, trigger + extract buttons
    ExtractPanel.svelte  - shows extracted style with apply / save-as-new actions
  options/
    App.svelte           - 4-tab settings page with vertical sidebar nav
    StyleEditorDialog.svelte - modal for creating/editing styles
    tabs/
      ApiTab.svelte      - provider selection, API keys, model picker
      StylesTab.svelte   - style library list (create, edit, delete, set default)
      AutoModeTab.svelte - enable/disable, min-word-count, domain exclusions
      KnowledgeTab.svelte - user profile text

src/
  fidelity/
    checker.ts           - post-rewrite fidelity check (entity preservation)
    entityExtractor.ts   - regex-based number/date/name/quote extraction
  llm/
    promptBuilder.ts     - assembles system + user prompt from style + settings
    streamParser.ts      - SSE → token stream parser
    styleExtractor.ts    - LLM prompt + response parser for style extraction
    openaiProvider.ts    - OpenAI chat completions (streaming)
    claudeProvider.ts    - stub (V2)
    ollamaProvider.ts    - stub (V3)
    providerRegistry.ts  - selects the active provider from settings
  messaging/
    types.ts             - discriminated union of all extension messages
    client.ts            - sendMessage / openPort helpers for extension pages
  storage/
    schema.ts            - Zod schemas: StyleConfig (5 dims, −2…+2), Settings, StoredState
    storageAdapter.ts    - getState / setState / updateSettings + subscribers
    migrations.ts        - schema version migrations (v3)
  style-engine/
    dimensions.ts        - maps integer values (−2…+2) to German prompt fragments
    presets.ts           - few-shot examples for each template
    library.ts           - CRUD for the style library (saveStyle, deleteStyle, createStyle)
  ui/
    dims.ts              - DIMS array shared between popup and options for slider rendering
    app.css              - Tailwind + DaisyUI theme
    components/
      DiffView.svelte
      ToggleSwitch.svelte
```

## Development

**Requirements:** Bun, Node ≥ 20

```bash
bun install

# Chrome (hot-reload)
bun run dev:chrome

# Firefox
bun run dev:firefox

# Production builds
bun run build:chrome    # Chrome MV3  → .output/chrome-mv3/
bun run build:firefox   # Firefox MV3 → .output/firefox-mv3/
bun run build           # Both

# Packaged zips (for store submission)
bun run zip
bun run zip:firefox
```

### Loading the extension

**Chrome:** `chrome://extensions` → Enable Developer mode → Load unpacked → select `.output/chrome-mv3/`

**Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → select `.output/firefox-mv3/manifest.json`

## Testing

```bash
bun run test          # Vitest unit tests
bun run test:e2e      # Playwright E2E tests (requires a build first)
bun run typecheck     # svelte-check + tsc --noEmit
bun run lint          # ESLint
```

Unit test coverage: storage adapter, migrations, prompt builder, stream parser, segment classifier, fidelity checker, entity extractor, style library, dimension mapping, provider registry.

E2E tests load the built extension into a real Chromium instance. Fixture HTML pages in `tests/fixtures/html/` are served by a local server during E2E runs.

## Configuration

Open the Options page (gear icon in the popup) to configure:

| Tab | Settings |
|-----|----------|
| **API & Anbieter** | Provider (OpenAI / Claude / Ollama), API key, model selection |
| **Style-Bibliothek** | Create, edit, delete, and set the default style |
| **Auto-Modus** | Enable/disable, minimum word count, per-domain exclusions |
| **Bekanntes Wissen** | User profile text injected into every prompt (max 2000 chars) |

## Style dimensions

Five sliders, integer −2 to +2:

| Dimension   | −2                   | 0 (neutral)    | +2                     |
|-------------|----------------------|----------------|------------------------|
| length      | Extrem kompakt       | Original       | Sehr ausführlich (~1.5×) |
| imagery     | Rein sachlich        | Neutral        | Sehr bildhaft          |
| warmth      | Kalt/distanziert     | Neutral        | Warm/empathisch        |
| formality   | Umgangssprachlich    | Standard       | Akademisch             |
| simplicity  | Komplex/Fachsprache  | Neutral        | Sehr einfach           |

## Tech stack

| Tool | Role |
|------|------|
| [WXT](https://wxt.dev) | Extension framework (Vite-based, cross-browser) |
| Svelte 5 (Runes) | UI for popup and options pages |
| Tailwind CSS v4 | Utility styles |
| DaisyUI v5 | Component library (buttons, inputs, toggles, alerts) |
| Zod | Runtime schema validation for storage |
| @mozilla/readability | Article detection and extraction |
| diff (jsdiff) | Word-level diff for the rewrite overlay |
| Vitest | Unit tests |
| Playwright | E2E tests |
| Bun | Package manager and script runner |

## Roadmap

### Pre-launch (critical)

- **Error feedback** - when a segment fails mid-stream (rate limit, network error), show a toast or inline banner instead of silently restoring the original text
- **Manual rewrite progress** - popup currently closes after triggering a rewrite; show progress (running segments, done/failed count) so the user knows something is happening
- **Auto-mode feedback** - show a subtle notification when auto-rewrite finishes ("Artikel umformuliert" / "Umformulierung fehlgeschlagen")
- **Claude / Ollama clarity** - key validation currently returns `{ ok: true }` for stub providers, masking the "Not implemented" error; either remove them from the UI or disable them with a clear note ("kommt in V2/V3")
- **Network timeout** - `openaiProvider` fetch calls have no timeout; add `AbortSignal.timeout()` so a hanging OpenAI request doesn't wait forever
- **Onboarding** - first-run modal explaining the five style sliders and how to get started

### Pre-launch (store submission)

- **Privacy policy** - required for Chrome Web Store and Firefox Add-on submission
- **Store assets** - screenshots, promotional images, store description
- **Permissions justification** - document why `<all_urls>` is needed (required by both stores)
- **Troubleshooting section in README** - "Why didn't my article rewrite?", known limitations

### V2 - Claude provider

- Implement `claudeProvider.ts`: Anthropic Messages API, SSE with `event:`-prefixed lines, `anthropic-version` header

### V3 - Ollama provider

- Implement `ollamaProvider.ts`: configurable endpoint (default `http://localhost:11434`), newline-delimited JSON (not SSE), extend `host_permissions` to include `http://localhost/*`

### V4 - Style management

- Per-site style pinning (e.g. always use Academic on Wikipedia)
- Style import / export

### Future

- **Rewrite history / undo** - let users revert to the original after accepting a rewrite without a page reload
- **Context menu rewrite** - right-click a paragraph to rewrite just that selection
- **Dynamic model list** - fetch available models from the OpenAI API instead of a hardcoded list (list will rot)
- **Diff view for auto-mode** - currently auto-mode applies rewrites silently; optionally show a diff before committing
- **Expanded fidelity checking** - semantic similarity checks in addition to entity (number/date/name/quote) preservation
- **Accessibility audit** - verify keyboard navigation and screen reader compatibility for all UI components
