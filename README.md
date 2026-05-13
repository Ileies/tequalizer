# Rewrite — Texte in deinem Stil

A cross-browser extension (Chrome MV3 + Firefox MV3) that rewrites articles and blog posts on any website to match your personal writing style preferences.

## Features

- **Style dimensions** — four sliders (length, imagery, warmth, formality) from −1 to +1
- **Templates** — TED Talk, Bible, Personal Letter, Academic, Tabloid
- **Style library** — save and switch between multiple named styles
- **Auto-mode** — automatically detects and rewrites articles on page load
- **Manual trigger** — rewrite the current page from the popup at any time
- **Diff view** — side-by-side original vs. rewrite with word-level highlighting; accept or reject
- **Known knowledge** — optional user profile injected into the prompt so the LLM skips obvious context
- **Provider abstraction** — OpenAI in V1, architecture ready for Claude (V2) and Ollama (V3)

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
3. Background calls `openaiProvider.streamRewrite()` and streams tokens back
4. Content script renders the live Diff View (word-level diff via `jsdiff`)
5. User accepts (DOM is patched in place) or rejects (original restored)

## Project structure

```
entrypoints/
  background.ts          — service worker; LLM streaming, port-based messaging
  content/
    index.ts             — message listeners, auto-rewrite trigger
    articleDetector.ts   — Readability-based page scoring
    autoRewriteOrchestrator.ts — segment iteration, streaming coordination
    diffRenderer.ts      — word-level diff rendering
    diffViewInjector.ts  — injects the DiffView overlay into the page
    domSegmenter.ts      — splits article DOM into rewritable segments
    domSurgeon.ts        — applies accepted rewrites back to the DOM
    segmentClassifier.ts — filters out headings, nav, code, link-dense text
  popup/                 — style picker, dimension sliders, manual trigger
  options/               — 4-tab settings page (API, Styles, Auto-mode, Knowledge)

src/
  fidelity/
    checker.ts           — post-rewrite fidelity check (entity preservation)
    entityExtractor.ts   — regex-based number/date/name/quote extraction
  llm/
    promptBuilder.ts     — assembles system + user prompt from style + settings
    streamParser.ts      — SSE → token stream parser
    openaiProvider.ts    — OpenAI chat completions (streaming)
    claudeProvider.ts    — stub (V2)
    ollamaProvider.ts    — stub (V3)
    providerRegistry.ts  — selects the active provider from settings
  messaging/
    types.ts             — discriminated union of all extension messages
    client.ts            — sendMessage / openPort helpers for extension pages
  storage/
    schema.ts            — Zod schemas: StyleConfig, Settings, StoredState
    storageAdapter.ts    — getState / setState / updateSettings + subscribers
    migrations.ts        — schema version migrations
  style-engine/
    dimensions.ts        — maps slider values (−1…+1) to prompt fragments
    presets.ts           — few-shot examples for each template
    library.ts           — CRUD for the style library (saveStyle, deleteStyle, createStyle)
  ui/
    components/DiffView.svelte
```

## Development

**Requirements:** Bun, Node ≥ 20

```bash
bun install

# Chrome (hot-reload)
bun run dev

# Firefox
bun run dev:firefox

# Production builds
bun run build           # Chrome MV3  → .output/chrome-mv3/
bun run build:firefox   # Firefox MV3 → .output/firefox-mv3/
bun run build:all       # Both

# Packaged zips (for store submission)
bun run zip
bun run zip:firefox
```

### Loading the extension

**Chrome:** `chrome://extensions` → Enable Developer mode → Load unpacked → select `.output/chrome-mv3/`

**Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → select `.output/firefox-mv3/manifest.json`

## Testing

```bash
bun run test          # Vitest unit tests (84 tests, ~500 ms)
bun run typecheck     # svelte-check + tsc --noEmit
bun run lint          # ESLint
```

Unit test coverage: storage adapter, migrations, prompt builder, stream parser, segment classifier, fidelity checker, entity extractor, style library, dimension mapping, provider registry.

## Configuration

Open the Options page (gear icon in the popup) to configure:

| Tab | Settings |
|-----|----------|
| **API** | Provider (OpenAI / Claude / Ollama), API key, model selection |
| **Styles** | Create, edit, delete, and set the default style |
| **Auto-mode** | Enable/disable, minimum word count, per-domain exclusions |
| **Knowledge** | User profile text injected into every prompt (max 2000 chars) |

## Tech stack

| Tool | Role |
|------|------|
| [WXT](https://wxt.dev) | Extension framework (Vite-based, cross-browser) |
| Svelte 5 (Runes) | UI for popup and options pages |
| Tailwind CSS v4 | Utility styles (options page only) |
| Zod | Runtime schema validation for storage |
| @mozilla/readability | Article detection and extraction |
| diff (jsdiff) | Word-level diff for the rewrite overlay |
| Vitest | Unit tests |
| Playwright | E2E tests (`bun run test:e2e`) |
| Bun | Package manager and script runner |

## Roadmap

- **V2** — Claude (Anthropic) provider
- **V3** — Ollama (local) provider
- **V4** — Per-site style pinning; style import/export
