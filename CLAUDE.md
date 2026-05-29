# Tequalizer - CLAUDE.md

Cross-browser extension (Chrome MV3 + Firefox MV3) that rewrites articles in the user's preferred style. Built with WXT + Svelte 5 (Runes) + Tailwind v4 + DaisyUI. Package manager: **Bun** (`bun x`, not `bunx`).

## Commands

```bash
bun run dev:chrome      # Chrome hot-reload dev server
bun run dev:firefox     # Firefox
bun run build           # Chrome + Firefox → .output/
bun run build:chrome    # Chrome only → .output/chrome-mv3/
bun run build:firefox   # Firefox only → .output/firefox-mv3/
bun run build:all       # Both targets (alias)
bun run test            # Vitest unit tests
bun run test:e2e        # Playwright E2E tests
bun run check           # svelte-check + tsc --noEmit
bun run lint            # ESLint
```

Load in browser: Chrome → `chrome://extensions` → Load unpacked → `.output/chrome-mv3/`. Firefox → `about:debugging` → Load Temporary Add-on → `.output/firefox-mv3/manifest.json`.

## Architecture

```
Content Script  ←port→  Background SW  ←sendMessage→  Popup / Options
(DOM, overlay)           (LLM, storage)                (Svelte UI)
```

- **Streaming tokens** use `browser.runtime.Port` (persistent connection, one port per rewrite request named `rewrite-{requestId}`).
- **One-shot messages** (GET_SETTINGS, SAVE_STYLE, EXTRACT_STYLE, etc.) use `browser.runtime.sendMessage`.
- WXT provides the `browser` polyfill - never import `webextension-polyfill` directly.
- `browser.storage.local` is the only persistence layer, accessed via `src/storage/storageAdapter.ts`.
- `browser.storage.session` is used by the popup for transient state (pending dimension edits, extract results).

## Project structure

```
entrypoints/
  background.ts                  - service worker: LLM streaming, storage messages, style extraction
  content/
    index.ts                     - message listeners, GET_PAGE_SAMPLES handler, auto-rewrite trigger
    articleDetector.ts           - Readability-based page scoring
    autoRewriteOrchestrator.ts   - segment iteration, max 3 parallel streams
    diffRenderer.ts              - word-level diff via jsdiff
    diffViewInjector.ts          - injects DiffView as Shadow DOM
    domSegmenter.ts              - splits DOM into rewritable segments
    domSurgeon.ts                - applies accepted rewrites back to DOM
    segmentClassifier.ts         - filters headings, nav, code, link-dense text
  popup/
    App.svelte                   - style picker, sliders, toggles, trigger + extract buttons; shows API key setup when unconfigured
    ExtractPanel.svelte          - shows extracted style result with apply / save-as-new actions
  options/
    App.svelte                   - 4-tab settings page with vertical sidebar nav
    StyleEditorDialog.svelte     - modal dialog for creating/editing styles
    tabs/
      ApiTab.svelte              - provider selection, API keys, model picker
      StylesTab.svelte           - style library list with create/edit/delete/set-default
      AutoModeTab.svelte         - enable/disable, min-word-count, domain exclusions
      KnowledgeTab.svelte        - user profile text (injected into every prompt)

src/
  llm/
    types.ts                     - LLMProvider interface (canonical)
    openaiProvider.ts            - V1, fully implemented
    claudeProvider.ts            - V2 stub: throws 'Not implemented'
    ollamaProvider.ts            - V3 stub: throws 'Not implemented'
    providerRegistry.ts          - getActiveProvider(settings) → LLMProvider
    promptBuilder.ts             - assembles system + user prompt
    streamParser.ts              - SSE → token stream
    styleExtractor.ts            - buildExtractionPrompt / parseExtractedStyle; ExtractedStyle type
  storage/
    schema.ts                    - Zod schemas: StyleConfig (5 dims, −2…+2), Settings, StoredState
    storageAdapter.ts            - getState / setState / updateSettings
    migrations.ts                - schema version migrations (current: v3)
  style-engine/
    dimensions.ts                - integer values (−2…+2) → German prompt fragments; DIMENSION_LABELS
    presets.ts                   - few-shot examples per template
    library.ts                   - CRUD for style library
  fidelity/
    checker.ts                   - post-rewrite entity comparison
    entityExtractor.ts           - regex: numbers, dates, names, quotes
  messaging/
    types.ts                     - discriminated union Message type
    client.ts                    - sendMessage / openPort helpers
  ui/
    dims.ts                      - DIMS array (key, label, min, max) shared by popup and options sliders
    app.css                      - Tailwind + DaisyUI theme variables
    components/
      DiffView.svelte            - side-by-side diff overlay
      ToggleSwitch.svelte        - reusable toggle component

tests/unit/                      - Vitest tests (node env, happy-dom for DOM)
tests/e2e/                       - Playwright tests against loaded extension
tests/fixtures/html/             - static HTML pages served by fixture-server for E2E tests
```

## Key types

**`LLMProvider` interface** (`src/llm/types.ts`) - all providers must implement:
```ts
interface LLMProvider {
  readonly id: 'openai' | 'claude' | 'ollama';
  isConfigured(settings: Settings): boolean;
  validateCredentials(settings: Settings): Promise<{ ok: boolean; error?: string }>;
  streamRewrite(req: RewriteRequest): AsyncGenerator<string, StreamResult, void>;
}
```

**`Message` union** (`src/messaging/types.ts`) - discriminated union covering all extension messages. Add new message types here and handle them in `background.ts`. Current types include `GET_PAGE_SAMPLES` (content script returns up to 3000 chars of page text) and `EXTRACT_STYLE` (background calls LLM, returns `ExtractedStyle | { error: string }`).

**`StoredState`** (`src/storage/schema.ts`) - Zod-validated. Every read from storage goes through `storageAdapter.getState()` which runs Zod parse. Schema changes require a migration in `migrations.ts` and a `schemaVersion` bump (currently v3).

**`ExtractedStyle`** (`src/llm/styleExtractor.ts`) - `{ dimensions: StyleConfig['dimensions']; customInstructions: string }`. Returned by `EXTRACT_STYLE` message and stored transiently in `browser.storage.session`.

## Invariants - never break these

- **No `innerHTML` with LLM output** - XSS risk. Always use `textContent`. DOM-Surgery in `domSurgeon.ts` enforces this.
- **Overlay components use Shadow DOM** - prevents CSS conflicts with host pages.
- **ClaudeProvider and OllamaProvider are intentional stubs** - do not implement unless working on V2/V3.
- **Fidelity check runs on every rewrite** - `checkFidelity()` in `background.ts` after stream completes; high-severity issues block DOM acceptance.
- **TypeScript strict mode** - `strict: true`, `noUncheckedIndexedAccess: true` in `tsconfig.json`. No `any` shortcuts.

## Style dimensions

Five sliders, integer −2 to +2. Quantized directly (no threshold - each integer is its own level):

| Dimension   | −2                     | −1             | 0 (neutral)    | +1                    | +2                     |
|-------------|------------------------|----------------|----------------|-----------------------|------------------------|
| length      | extrem kompakt         | knapp          | Original       | ausführlicher         | sehr ausführlich (~1.5×) |
| imagery     | rein sachlich          | kaum Bilder    | neutral        | gelegentl. Metaphern  | sehr bildhaft          |
| warmth      | kalt/distanziert       | zurückhaltend  | neutral        | persönlicher          | warm/empathisch        |
| formality   | umgangssprachlich      | locker         | Standard       | gehoben               | akademisch             |
| simplicity  | komplex/Fachsprache    | etwas gehoben  | neutral        | vereinfacht           | sehr einfach           |

Templates (`none`, `ted_talk`, `bible`, `personal_letter`, `academic`, `tabloid`) add few-shot examples on top of dimension fragments.

## Style extraction

"Stil extrahieren" in the popup sends `GET_PAGE_SAMPLES` to the content script (up to 3000 chars of page text), then `EXTRACT_STYLE` to background, which calls the active LLM provider with a non-streaming request. The LLM returns a JSON object with `dimensions` and `customInstructions`. Result is shown in `ExtractPanel.svelte` and stored in `browser.storage.session` so it survives popup close/reopen. User can apply it to the current style or save it as a new named style.

## Roadmap context

See `TODO.md`.

## Testing

Unit tests live in `tests/unit/`, run with `bun run test`. The setup file at `tests/unit/setup.ts` stubs the `browser` global. Tests use `happy-dom` for DOM-dependent modules. Do not mock storage in unit tests - use the real `storageAdapter` with a fake `browser.storage` stub from the setup file.

E2E tests in `tests/e2e/` use Playwright against a built extension loaded into a real browser. Run with `bun run test:e2e`. Fixture HTML pages in `tests/fixtures/html/` are served by `tests/e2e/fixture-server.ts`.

Fix failing tests by changing code, not tests.
