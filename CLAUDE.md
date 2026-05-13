# Rewrite Plugin — CLAUDE.md

Cross-browser extension (Chrome MV3 + Firefox MV3) that rewrites articles in the user's preferred style. Built with WXT + Svelte 5 (Runes) + Tailwind v4. Package manager: **Bun** (`bun x`, not `bunx`).

## Commands

```bash
bun run dev             # Chrome hot-reload dev server
bun run dev:firefox     # Firefox
bun run build           # Chrome → .output/chrome-mv3/
bun run build:firefox   # Firefox → .output/firefox-mv3/
bun run build:all       # Both targets
bun run test            # Vitest unit tests
bun run typecheck       # svelte-check + tsc --noEmit
bun run lint            # ESLint
```

Load in browser: Chrome → `chrome://extensions` → Load unpacked → `.output/chrome-mv3/`. Firefox → `about:debugging` → Load Temporary Add-on → `.output/firefox-mv3/manifest.json`.

## Architecture

```
Content Script  ←port→  Background SW  ←sendMessage→  Popup / Options
(DOM, overlay)           (LLM, storage)                (Svelte UI)
```

- **Streaming tokens** use `browser.runtime.Port` (persistent connection, one port per rewrite request named `rewrite-{requestId}`).
- **One-shot messages** (GET_SETTINGS, SAVE_STYLE, etc.) use `browser.runtime.sendMessage`.
- WXT provides the `browser` polyfill — never import `webextension-polyfill` directly.
- `browser.storage.local` is the only persistence layer, accessed via `src/storage/storageAdapter.ts`.

## Project structure

```
entrypoints/
  background.ts                  — service worker: LLM streaming, storage messages
  content/
    index.ts                     — message listeners, auto-rewrite trigger
    articleDetector.ts           — Readability-based page scoring
    autoRewriteOrchestrator.ts   — segment iteration, max 3 parallel streams
    diffRenderer.ts              — word-level diff via jsdiff
    diffViewInjector.ts          — injects DiffView as Shadow DOM
    domSegmenter.ts              — splits DOM into rewritable segments
    domSurgeon.ts                — applies accepted rewrites back to DOM
    segmentClassifier.ts         — filters headings, nav, code, link-dense text
  popup/App.svelte               — style picker, sliders, manual trigger
  options/App.svelte             — 4-tab settings page

src/
  llm/
    types.ts                     — LLMProvider interface (canonical)
    openaiProvider.ts            — V1, fully implemented
    claudeProvider.ts            — V2 stub: throws 'Not implemented'
    ollamaProvider.ts            — V3 stub: throws 'Not implemented'
    providerRegistry.ts          — getActiveProvider(settings) → LLMProvider
    promptBuilder.ts             — assembles system + user prompt
    streamParser.ts              — SSE → token stream
  storage/
    schema.ts                    — Zod schemas: StyleConfig, Settings, StoredState
    storageAdapter.ts            — getState / setState / updateSettings
    migrations.ts                — schema version migrations
  style-engine/
    dimensions.ts                — slider values (−1…+1) → prompt fragments
    presets.ts                   — few-shot examples per template
    library.ts                   — CRUD for style library
  fidelity/
    checker.ts                   — post-rewrite entity comparison
    entityExtractor.ts           — regex: numbers, dates, names, quotes
  messaging/
    types.ts                     — discriminated union Message type
    client.ts                    — sendMessage / openPort helpers
  ui/components/DiffView.svelte  — side-by-side diff overlay

tests/unit/                      — Vitest tests (node env, happy-dom for DOM)
tests/e2e/                       — Playwright tests against loaded extension
```

## Key types

**`LLMProvider` interface** (`src/llm/types.ts`) — all providers must implement:
```ts
interface LLMProvider {
  readonly id: 'openai' | 'claude' | 'ollama';
  isConfigured(settings: Settings): boolean;
  validateCredentials(settings: Settings): Promise<{ ok: boolean; error?: string }>;
  streamRewrite(req: RewriteRequest): AsyncGenerator<string, StreamResult, void>;
}
```

**`Message` union** (`src/messaging/types.ts`) — discriminated union covering all extension messages. Add new message types here and handle them in `background.ts`.

**`StoredState`** (`src/storage/schema.ts`) — Zod-validated. Every read from storage goes through `storageAdapter.getState()` which runs Zod parse. Schema changes require a migration in `migrations.ts` and a `schemaVersion` bump.

## Invariants — never break these

- **No `innerHTML` with LLM output** — XSS risk. Always use `textContent`. DOM-Surgery in `domSurgeon.ts` enforces this.
- **Overlay components use Shadow DOM** — prevents CSS conflicts with host pages.
- **ClaudeProvider and OllamaProvider are intentional stubs** — do not implement unless working on V2/V3.
- **Fidelity check runs on every rewrite** — `checkFidelity()` in `background.ts` after stream completes; high-severity issues block DOM acceptance.
- **TypeScript strict mode** — `strict: true`, `noUncheckedIndexedAccess: true` in `tsconfig.json`. No `any` shortcuts.

## Style dimensions

Four sliders, −1 to +1, quantized into three prompt fragments at ±0.33 threshold:

| Dimension  | −1             | 0 (neutral) | +1              |
|------------|----------------|-------------|-----------------|
| length     | maximally compressed | original length | ~1.5× expanded |
| imagery    | strictly factual | sparse      | rich analogies  |
| warmth     | distanced      | neutral     | warm, personal  |
| formality  | colloquial     | standard    | academic        |

Templates (`none`, `ted_talk`, `bible`, `personal_letter`, `academic`, `tabloid`) add few-shot examples on top of dimension fragments.

## Roadmap context

- **V2** — Implement `claudeProvider.ts`: Anthropic Messages API, SSE with `event:`-prefixed lines, `anthropic-version` header.
- **V3** — Implement `ollamaProvider.ts`: configurable endpoint (default `http://localhost:11434`), newline-delimited JSON (not SSE), extend `host_permissions` to include `http://localhost/*`.
- **V4** — Per-site style pinning, style import/export.

## Testing

Unit tests live in `tests/unit/`, run with `bun run test`. The setup file at `tests/unit/setup.ts` stubs the `browser` global. Tests use `happy-dom` for DOM-dependent modules. Do not mock storage in unit tests — use the real `storageAdapter` with a fake `browser.storage` stub from the setup file.

E2E tests in `tests/e2e/` use Playwright against a built extension loaded into a real browser. Run with `bun run test:e2e`.

Fix failing tests by changing code, not tests.
