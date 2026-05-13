# Rewrite-Plugin — Implementierungsplan

**Ziel:** Cross-Browser-Extension (Chrome MV3 + Firefox MV3), die Artikel/Blog-Texte auf Websites nach Nutzerpräferenzen umformuliert. V1-Scope: Vollumfang inkl. Diff-View. Backend: OpenAI in V1, aber Provider-abstrahiert für spätere Claude- und Ollama-Erweiterung.

**Lies diesen Plan einmal komplett, bevor du anfängst. Arbeite die Phasen strikt in Reihenfolge ab. Jede Phase hat ein klares "Done-Kriterium" — erst weitergehen, wenn das erfüllt ist.**

---

## 0. Tech-Stack (nicht-verhandelbar)

- **Build/Framework:** WXT (Next-gen Web Extension Framework, Vite-basiert)
- **Sprache:** TypeScript, strict mode
- **UI-Framework:** Svelte 5 (Runes-Modus) + Tailwind CSS v4
- **State (in Extension-Pages):** Svelte Stores (`$state`, `$derived` — kein externes State-Management)
- **Content-Extraction:** `@mozilla/readability`
- **Diff-Rendering:** `diff` (jsdiff) + eigene Word-Level-Render-Komponente
- **Tests:** Vitest (Unit) + Playwright (E2E gegen geladene Extension)
- **Linting:** ESLint v9 (flat config) + Prettier
- **Package-Manager:** Bun

**Browser-Targets:**
- Chrome 120+ (MV3)
- Firefox 121+ (MV3)
- Build-Output: `.output/chrome-mv3/` und `.output/firefox-mv3/` (WXT-Standard)

**Warum WXT statt @crxjs/vite-plugin:**
WXT ist seit 2025 der empfohlene Standard für neue Extensions. Aktiv maintained, Svelte first-class via `@wxt-dev/module-svelte`, bessere Cross-Browser-Abstraktion, ~43% kleinere Bundles als Alternativen.

**Warum Svelte statt React:**
Kein Virtual DOM, Stores ersetzen Zustand nativ, deutlich weniger Boilerplate in Extension-Pages, kleinere Bundle-Größe.

**Warum Tailwind v4:**
Kein PostCSS-Config mehr. Kein `tailwind.config.js` für Standardprojekte. Nur `@tailwindcss/vite` als Vite-Plugin und `@import "tailwindcss"` in CSS.

---

## 1. Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser Extension                                              │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ Content      │◄──►│ Background   │◄──►│ Popup / Options  │   │
│  │ Script       │    │ Service      │    │ (Svelte UI)      │   │
│  │ (Overlay,    │    │ Worker       │    │                  │   │
│  │ DOM-Surgery) │    │ (LLM-Calls,  │    │                  │   │
│  │              │    │  Storage)    │    │                  │   │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘   │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ LLMProvider      │  ← Interface
                    │ Abstraktion      │
                    └──┬────────────┬──┘
                       │            │
                       ▼            ▼   (V2/V3)
                ┌────────────┐  ┌─────────┐  ┌────────┐
                │ OpenAI     │  │ Claude  │  │ Ollama │
                │ (V1)       │  │ (V2)    │  │ (V3)   │
                └────────────┘  └─────────┘  └────────┘
```

**Datenfluss "Rewrite eines Artikels":**

1. Content-Script erkennt Artikel auf Page-Load (Readability-Score > Threshold)
2. Content-Script blendet Floating-Button neben Artikel ein
3. User klickt → Content-Script extrahiert Artikel-DOM, sendet `{text, styleConfig}` an Background
4. Background ruft LLMProvider.streamRewrite() → streamt Tokens zurück
5. Content-Script rendert: Original linke Spalte / Rewrite rechte Spalte (Diff-View), tokenweise wachsend
6. User-Aktionen: Akzeptieren (ersetzt DOM), Verwerfen, Style ändern (re-stream), in Bibliothek speichern

---

## 2. Projektstruktur

```
rewrite-plugin/
├── package.json
├── bun.lock
├── tsconfig.json
├── wxt.config.ts                        # WXT-Konfiguration (inkl. Vite-Plugins)
├── eslint.config.js                     # ESLint v9 flat config
├── .prettierrc
├── entrypoints/                         # WXT-Konvention: alle Extension-Einstiegspunkte
│   ├── background.ts                    # Service Worker entry
│   ├── content/
│   │   ├── index.ts                     # Content script entry
│   │   ├── articleDetector.ts
│   │   ├── overlayInjector.ts
│   │   ├── autoRewriteOrchestrator.ts
│   │   ├── domSegmenter.ts
│   │   ├── segmentClassifier.ts
│   │   └── diffRenderer.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── App.svelte
│   └── options/
│       ├── index.html
│       ├── main.ts
│       ├── App.svelte
│       ├── ApiKeyTab.svelte
│       ├── StyleLibraryTab.svelte
│       └── AdvancedTab.svelte
├── src/
│   ├── ui/                              # shared Svelte-Komponenten
│   │   ├── components/
│   │   │   ├── StylePicker.svelte
│   │   │   ├── SliderRow.svelte
│   │   │   ├── TemplatePicker.svelte
│   │   │   ├── DiffView.svelte
│   │   │   └── Button.svelte
│   │   └── app.css                      # @import "tailwindcss"
│   ├── llm/
│   │   ├── types.ts                     # LLMProvider interface
│   │   ├── openaiProvider.ts
│   │   ├── claudeProvider.ts            # V2 stub
│   │   ├── ollamaProvider.ts            # V3 stub
│   │   ├── providerRegistry.ts
│   │   ├── promptBuilder.ts
│   │   └── streamParser.ts
│   ├── style-engine/
│   │   ├── presets.ts
│   │   ├── dimensions.ts
│   │   ├── customStyle.ts
│   │   └── library.ts
│   ├── fidelity/
│   │   ├── checker.ts
│   │   └── entityExtractor.ts
│   ├── storage/
│   │   ├── schema.ts                    # Zod-Schemas
│   │   ├── storageAdapter.ts            # WXT storage (wraps browser.storage)
│   │   └── migrations.ts
│   ├── known-knowledge/
│   │   ├── profile.ts
│   │   └── elision.ts
│   ├── messaging/
│   │   ├── types.ts
│   │   └── client.ts
│   └── utils/
│       ├── logger.ts
│       ├── retry.ts
│       └── tokenize.ts
├── public/
│   └── icons/                           # 16/48/128px PNG
└── tests/
    ├── unit/
    │   ├── segmentClassifier.test.ts
    │   ├── promptBuilder.test.ts
    │   ├── fidelityChecker.test.ts
    │   └── streamParser.test.ts
    ├── fixtures/
    │   ├── articles/
    │   └── rewrites/
    └── e2e/
        ├── overlay.spec.ts
        ├── autoMode.spec.ts
        └── styleLibrary.spec.ts
```

---

## 3. Phasen (strikt der Reihe nach)

### Phase 1 — Projekt-Skeleton (Zeit: ~1h)

**Tasks:**
1. `wxt.config.ts` anlegen mit Svelte-Modul und Tailwind v4.
2. `tsconfig.json` mit `strict: true`, `noUncheckedIndexedAccess: true`.
3. Beide Manifeste als WXT `manifest`-Objekt in `wxt.config.ts` (nicht als separate JSON-Dateien — WXT merged das).
4. Leere `entrypoints/background.ts`, `entrypoints/content/index.ts`, `entrypoints/popup/` mit "Hello"-Svelte-Komponente.
5. `bun run dev` (Chrome) und `bun run build:all` müssen durchlaufen.
6. Extension in Chrome (Developer Mode, `.output/chrome-mv3/`) laden — Popup zeigt "Hello".

**Dependencies:**
```
dependencies:
  @mozilla/readability, diff, zod

devDependencies:
  wxt, @wxt-dev/module-svelte, svelte,
  typescript, @tailwindcss/vite, tailwindcss,
  @types/diff, @types/mozilla-readability,
  vitest, @playwright/test,
  eslint, eslint-plugin-svelte, prettier, prettier-plugin-svelte,
  @typescript-eslint/eslint-plugin, @typescript-eslint/parser,
  svelte-check
```

Hinweis: `@types/chrome` und `webextension-polyfill` liefert WXT automatisch. Kein separates `@types/firefox-webext-browser` nötig.

**`wxt.config.ts`:**
```ts
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Rewrite — Texte in deinem Stil',
    description: 'Formuliert Artikel und Blogeinträge in deinen bevorzugten Stil um.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>', 'https://api.openai.com/*'],
  },
});
```

**`package.json` scripts:**
```json
{
  "dev": "wxt",
  "dev:firefox": "wxt -b firefox",
  "build": "wxt build",
  "build:firefox": "wxt build -b firefox",
  "build:all": "bun run build && bun run build:firefox",
  "zip": "wxt zip",
  "zip:firefox": "wxt zip -b firefox",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "lint": "eslint .",
  "typecheck": "svelte-check && tsc --noEmit"
}
```

**Done:** `bun run build:all` erfolgreich, Extension lädt in Chrome, Popup zeigt "Hello".

---

### Phase 2 — Storage- und Messaging-Layer (Zeit: ~2h)

**Storage-Schema (Zod-validiert):**

```ts
// src/storage/schema.ts
export const StyleConfig = z.object({
  id: z.string().uuid(),
  name: z.string(),
  builtIn: z.boolean(),
  dimensions: z.object({
    length: z.number().min(-1).max(1),
    imagery: z.number().min(-1).max(1),
    warmth: z.number().min(-1).max(1),
    formality: z.number().min(-1).max(1),
  }),
  template: z.enum(['none','ted_talk','bible','personal_letter','academic','tabloid']).default('none'),
  customInstructions: z.string().max(2000).optional(),
});

export const Settings = z.object({
  provider: z.enum(['openai','claude','ollama']).default('openai'),
  apiKeys: z.object({ openai: z.string().optional(), claude: z.string().optional() }),
  ollamaEndpoint: z.string().url().optional(),
  ollamaModel: z.string().optional(),
  activeStyleId: z.string().uuid(),
  autoRewrite: z.object({
    enabled: z.boolean().default(false),
    minWordCount: z.number().default(50),
    excludeDomains: z.array(z.string()).default([]),
  }),
  knownKnowledge: z.object({
    enabled: z.boolean().default(false),
    profileText: z.string().default(''),
  }),
});

export const StoredState = z.object({
  settings: Settings,
  styleLibrary: z.array(StyleConfig),
  schemaVersion: z.number(),
});
```

**StorageAdapter:** Wrapper um `browser.storage.local` (WXT liefert das `browser`-Polyfill für Chrome+Firefox automatisch). Methoden: `get()`, `set(partial)`, `subscribe(callback)`. Zod-validiert auf jedem Read.

**Messaging:** Discriminated Unions in `src/messaging/types.ts`. WXT bietet `defineBackground` und `defineContentScript`-Wrapper — Messaging läuft trotzdem über standard `browser.runtime.sendMessage` / `browser.runtime.Port`:

```ts
type Message =
  | { type: 'REWRITE_REQUEST'; payload: { text: string; styleId: string; requestId: string } }
  | { type: 'REWRITE_TOKEN'; payload: { requestId: string; token: string } }
  | { type: 'REWRITE_DONE'; payload: { requestId: string; fullText: string; fidelity: FidelityReport } }
  | { type: 'REWRITE_ERROR'; payload: { requestId: string; error: string } }
  | { type: 'REWRITE_CANCEL'; payload: { requestId: string } }
  | { type: 'GET_SETTINGS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SAVE_STYLE'; payload: StyleConfig }
  | { type: 'DELETE_STYLE'; payload: { id: string } };
```

Streaming-Tokens werden über `browser.runtime.Port` (persistente Verbindung) gesendet — kein Message-Overhead pro Token.

**Done:** Unit-Tests für StorageAdapter. Messaging Background↔Popup funktioniert.

---

### Phase 3 — LLM-Provider-Abstraktion + OpenAI (Zeit: ~3h)

**Das ist der wichtigste Layer. Korrekt machen.**

```ts
// src/llm/types.ts
export interface RewriteRequest {
  text: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface LLMProvider {
  readonly id: 'openai' | 'claude' | 'ollama';
  readonly displayName: string;
  isConfigured(settings: Settings): boolean;
  validateCredentials(settings: Settings): Promise<{ ok: boolean; error?: string }>;
  streamRewrite(req: RewriteRequest): AsyncGenerator<string, { fullText: string; usage?: TokenUsage }, void>;
}
```

**OpenAIProvider:**
- API: Chat Completions (`https://api.openai.com/v1/chat/completions`, `stream: true`) — weiterhin der Standard für SSE-Streaming.
- Default-Modell: **`gpt-4.1-mini`** (2025er Nachfolger von gpt-4o-mini: 1M-Token-Context, niedrige Latenz, günstig).
- Weitere Optionen im Settings-UI: `gpt-4.1`, `gpt-4o`, `gpt-4o-mini`.
- SSE-Parsing: `streamParser.ts` liest `ReadableStream`, splittet an `\n\n`, extrahiert `data: {...}`-Lines, JSON-parsed `delta.content`.
- Abort über `AbortSignal`.
- Error-Mapping: HTTP 401 → "Ungültiger API-Key", 429 → "Rate-Limit erreicht", 5xx → "Provider-Fehler".

**ClaudeProvider / OllamaProvider:** Stubs — `throw new Error('Not implemented in V1')`. Interface vollständig erfüllen.

**ProviderRegistry:** `getActiveProvider(settings) → LLMProvider`. Wirft wenn Provider nicht konfiguriert.

**Done:** Unit-Test mit gemocktem fetch — `streamRewrite` yieldet erwartete Token-Sequenz aus simuliertem SSE-Stream.

---

### Phase 4 — Style-Engine + Prompt-Building (Zeit: ~3h)

**`src/style-engine/dimensions.ts`** — Slider-Dimensionen auf Prompt-Fragmente:

```ts
export const DIMENSION_FRAGMENTS = {
  length: {
    '-1': 'Fasse maximal komprimiert. Entferne jedes nicht-essentielle Wort. Bevorzuge Hauptsätze.',
    '0':  'Behalte ungefähre Länge des Originals bei.',
    '+1': 'Schmücke aus mit Adjektiven, Nebensätzen und erläuternden Einschüben. Ziel: ~1.5× Original-Länge.'
  },
  imagery: {
    '-1': 'Strikt sachlich. Keine Metaphern, keine Vergleiche. Nur Fakten und logische Konnektoren.',
    '0':  'Sparsam mit Bildern, nur wo sie Verständnis erleichtern.',
    '+1': 'Nutze konkrete, sinnliche Beispiele und Vergleiche. Mache Abstraktes greifbar durch Analogien.'
  },
  warmth: {
    '-1': 'Distanzierter Ton. Vermeide Wertungen und emotionale Sprache.',
    '0':  'Neutraler Berichtston.',
    '+1': 'Warmer, persönlicher Ton. Direkte Ansprache erlaubt.'
  },
  formality: {
    '-1': 'Locker, umgangssprachlich, kurze Sätze.',
    '0':  'Standard-Schriftsprache.',
    '+1': 'Formal, akademisch, vollständige Syntax.'
  },
} as const;

export function dimensionToFragment(name: keyof typeof DIMENSION_FRAGMENTS, value: number): string {
  const stage = value < -0.33 ? '-1' : value > 0.33 ? '+1' : '0';
  return DIMENSION_FRAGMENTS[name][stage];
}
```

**`src/style-engine/presets.ts`** — Templates mit Few-Shot-Beispielen (nicht nur Beschreibungen — verhindert Stil-Drift):

```ts
export const TEMPLATES = {
  ted_talk: {
    description: 'TED-Talk-Stil: persönlicher Einstieg, eine starke These, konkrete Geschichten.',
    fewShot: [
      {
        original: 'Studien zeigen, dass Schlafmangel die kognitive Leistung beeinträchtigt.',
        rewritten: 'Vor drei Jahren saß ich um 3 Uhr morgens vor einem Whiteboard und konnte mich nicht erinnern, was mein eigener Name war. Was mir niemand gesagt hatte: Schlafmangel zerstört das Gehirn buchstäblich.'
      },
    ]
  },
  bible: { description: 'Bibel-Stil: parataktische Reihung mit "und", archaische Wendungen.', fewShot: [] },
  personal_letter: { description: 'Persönlicher Brief: direkt, herzlich, erzählerisch.', fewShot: [] },
  academic: { description: 'Akademisch: Fachterminologie, passive Konstruktionen, Quellenverweise.', fewShot: [] },
  tabloid: { description: 'Boulevardstil: Ausrufezeichen, Übertreibungen, Dramatik.', fewShot: [] },
} as const;
```

**`src/llm/promptBuilder.ts`** — System-Prompt-Konstruktion:

```
SYSTEM:
Du formulierst Texte um. Absolute Regeln:
1. Erfinde keine Fakten, Zahlen, Namen, Daten, Zitate.
2. Entferne keine inhaltlichen Behauptungen des Originals.
3. Behalte logische Struktur und Argumentationsreihenfolge bei.
4. Antworte AUSSCHLIESSLICH mit dem umformulierten Text.

Stilvorgaben:
[dimensionFragmente]

[Template-Beschreibung + Few-Shot-Beispiele falls aktiv]

[customInstructions falls gesetzt]

[knownKnowledge-Block falls aktiv]

USER:
[Original-Text]
```

**Done:** Snapshot-Tests für `promptBuilder`. Manueller Test: 3 verschiedene Style-Configs → erkennbar unterschiedliche Outputs.

---

### Phase 5 — Article-Detection + Segmenter + Classifier (Zeit: ~3h)

**Modus A — Einzelner Artikel (Overlay-Button):**
- `entrypoints/content/articleDetector.ts`: `new Readability(document.cloneNode(true)).parse()` → wenn Result und `result.textContent.length > 500` → Floating-Button einblenden.

**Modus B — Auto-Rewrite ganze Seite:**
- `entrypoints/content/domSegmenter.ts`: Block-Elemente (`p`, `li`, `blockquote`, `h1-h6`, ...) → Liste von `{ element, text, role }`.
- `entrypoints/content/segmentClassifier.ts` — algorithmisch ohne LLM:

```ts
export function shouldRewrite(segment: Segment): { rewrite: boolean; reason: string } {
  if (segment.text.length < 50) return { rewrite: false, reason: 'too_short' };
  if (segment.text.split(/\s+/).length < 10) return { rewrite: false, reason: 'too_few_words' };
  if (/^[\d\s.,€$%-]+$/.test(segment.text)) return { rewrite: false, reason: 'numeric_only' };
  if (segment.element.closest('nav, header, footer, aside, [role="navigation"], .menu, .sidebar'))
    return { rewrite: false, reason: 'chrome_region' };
  if (segment.element.closest('code, pre')) return { rewrite: false, reason: 'code' };
  if (segment.element.closest('table')) return { rewrite: false, reason: 'tabular' };
  if (segment.element.matches('h1, h2, h3, h4, h5, h6')) return { rewrite: false, reason: 'heading' };
  if (countLinks(segment) / segment.text.length > 0.3) return { rewrite: false, reason: 'link_dense' };
  if (segment.text.match(/©|all rights reserved|cookie|privacy policy/i))
    return { rewrite: false, reason: 'boilerplate' };
  const score = computeContentScore(segment);
  if (score < CONTENT_THRESHOLD) return { rewrite: false, reason: 'low_content_score' };
  return { rewrite: true, reason: 'content_segment' };
}
```

**`entrypoints/content/autoRewriteOrchestrator.ts`:** Max 3 parallele Streams, von oben nach unten. Banner: "X von Y Abschnitten umformuliert · [Stop]".

**Done:** Unit-Tests mit 10 HTML-Fixtures. Manueller Test: Auto-Mode, Wikipedia-Artikel — nur Body-Absätze werden ersetzt.

---

### Phase 6 — Diff-View + DOM-Surgery (Zeit: ~3h)

**`entrypoints/content/diffRenderer.ts`:** `diff.diffWords(original, rewrite)` → Diff-Tokens.

**Modus A — Side-by-side Diff (Modal nach manuellem Rewrite):**
- Svelte-Komponente (`src/ui/components/DiffView.svelte`), als Shadow DOM in die Page injiziert (verhindert CSS-Konflikte).
- Zwei Spalten: Original (removed = orange), Rewrite (added = grün).
- Buttons: **Übernehmen** · **Verwerfen** · **Style ändern** · **In Bibliothek speichern**

**Modus B — Inline-Replace mit Hover-Diff (Auto-Mode):**
- `data-rewritten="true"` + `data-original={originalText}` auf Element.
- Hover: Tooltip mit Original-Preview.
- Global-Toggle im Banner: "Original anzeigen" → schaltet alle Replacements zurück.

**DOM-Surgery Regeln:**
- Niemals `innerHTML` mit LLM-Output → XSS. Nur `textContent` setzen.
- Original-Texte in `WeakMap<Element, string>` für Restore.
- Streaming: leeren TextNode einfügen, pro Token `node.textContent += token`.
- Cancel: X-Icon pro Segment → `REWRITE_CANCEL` → AbortController.

**Done:** Manueller Test: Artikel, Button, Diff erscheint, Akzeptieren ersetzt DOM, Reload stellt Original wieder her.

---

### Phase 7 — Halluzinations-Check (Zeit: ~2h)

**`src/fidelity/entityExtractor.ts`** — Regex-basiert (kein LLM):
- Zahlen: `/\b\d+([.,]\d+)?\s*(%|€|\$|km|kg|mio|mrd|millionen|milliarden)?/gi`
- Daten: `/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b|\b\d{4}\b/g`
- Eigennamen: Kapitalisierte Multi-Wort-Sequenzen (heuristisch)
- Zitate: Inhalte zwischen `"..."` oder `„..."`

**`src/fidelity/checker.ts`:**

```ts
export function checkFidelity(original: string, rewritten: string): FidelityReport {
  const origEntities = extractEntities(original);
  const rewrittenEntities = extractEntities(rewritten);

  const issues: FidelityIssue[] = [];
  const newNumbers = rewrittenEntities.numbers.filter(n => !origEntities.numbers.includes(n));
  const missingQuotes = origEntities.quotes.filter(q => !rewritten.includes(q));
  const newNames = rewrittenEntities.names.filter(n => !origEntities.names.includes(n));

  if (newNumbers.length > 0) issues.push({ severity: 'high', type: 'invented_numbers', detail: newNumbers });
  if (missingQuotes.length > 0) issues.push({ severity: 'high', type: 'dropped_quotes', detail: missingQuotes });
  if (newNames.length > 0) issues.push({ severity: 'medium', type: 'invented_names', detail: newNames });

  return { issues, passed: !issues.some(i => i.severity === 'high') };
}
```

**UI:** `passed: false` → roter Warn-Banner, Übernahme-Button disabled bis explizite Bestätigung.

**Done:** Unit-Tests: Erfundene Zahl im Rewrite → high-severity.

---

### Phase 8 — UI: Popup + Options (Zeit: ~4h)

Alle UI-Komponenten in Svelte 5 (Runes). Tailwind v4 für Styling, Shadow DOM für Overlay-Komponenten.

**Popup (360×500px):**
- Style-Dropdown + 4 Slider + Template-Chips
- Toggle: "Bekanntes Wissen entfernen"
- Toggle: "Auto-Modus für diese Seite"
- Button: "Aktuelle Seite umformulieren"
- Footer-Link: "⚙ Erweiterte Einstellungen"

**Options (Tab-Page):**

**Tab 1 — API & Provider:**
- Provider-Auswahl: OpenAI (aktiv) · Claude (disabled "V2") · Ollama (disabled "V3")
- API-Key-Feld + "Validieren"-Button
- Modell-Dropdown: `gpt-4.1-mini` (Default), `gpt-4.1`, `gpt-4o`, `gpt-4o-mini`

**Tab 2 — Style-Bibliothek:**
- Liste aller Styles (Built-in + Custom)
- Bearbeiten / Löschen / Als Standard
- "Neuer Style"-Button → Modal

**Tab 3 — Auto-Modus:**
- Master-Toggle + Mindest-Wortzahl-Slider + Exclude-Liste

**Tab 4 — Bekanntes Wissen:**
- Textarea (max 2000 Zeichen) + Beispiel-Button

**Done:** Alle UI-Flows klickbar, persistiert in Storage.

---

### Phase 9 — WXT-Manifest, Permissions, Builds (Zeit: ~30min)

WXT generiert die eigentlichen Manifest-Dateien aus `wxt.config.ts`. Browserspezifische Overrides:

```ts
// wxt.config.ts
export default defineConfig({
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    name: 'Rewrite — Texte in deinem Stil',
    description: 'Formuliert Artikel und Blogeinträge in deinen bevorzugten Stil um.',
    version: '0.1.0',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>', 'https://api.openai.com/*'],
  },
  // Firefox-spezifisch
  browser_specific_settings: {
    gecko: { id: 'rewrite-plugin@example.com', strict_min_version: '121.0' }
  },
});
```

WXT fügt automatisch MV3-spezifische Felder ein (`background.service_worker` für Chrome, `background.scripts` für Firefox).

**Done:** `bun run build:all` produziert beide `.output/`-Verzeichnisse. Beide Extensions laden in den jeweiligen Browsern.

---

### Phase 10 — Tests (Zeit: ~3h)

**Unit-Tests (Vitest):** Mindestens 80% Coverage für:
- `segmentClassifier` (10+ HTML-Fixtures)
- `promptBuilder` (Snapshot-Tests pro Style-Config)
- `fidelityChecker` (12+ konstruierte Paare)
- `streamParser` (gemockte SSE-Chunks)
- `storage/schema` (Zod-Validierung, Migrations)

**E2E (Playwright mit geladener Extension):**
- `overlay.spec.ts`: Artikel-Fixture → Floating-Button → Klick → Diff → Akzeptieren → DOM ersetzt
- `autoMode.spec.ts`: Auto-Modus → nur Body-Absätze ersetzt, Navi unverändert
- `styleLibrary.spec.ts`: Custom-Style erstellen → reload → Style vorhanden → verwenden

**LLM in Tests:** OpenAIProvider wird gemockt. Ein optionaler Smoke-Test mit echtem API-Key via Env-Var `OPENAI_API_KEY`.

**Done:** `bun run test` und `bun run test:e2e` grün.

---

### Phase 11 — README (Zeit: ~30min)

- Install-Anleitung (Chrome: `.output/chrome-mv3/` laden, Firefox: `.output/firefox-mv3/manifest.json`)
- API-Key besorgen
- Roadmap: V2 = Claude, V3 = Ollama

**Done:** Eine zweite Person kann die Extension nach README installieren und nutzen.

---

## 4. Latency-Strategie

1. **Streaming über Port** — `browser.runtime.Port` statt Request/Response (kein Message-Overhead pro Token).
2. **Optimistisches Rendering** — erstes Token → Diff-View erscheint sofort, wächst tokenweise.
3. **Parallelisierung im Auto-Modus** — max 3 parallele Streams, Viewport-Top-First.
4. **Caching** — Hash `(text + styleId)` → LRU-Cache in `browser.storage.local` (50 Einträge, je max 10KB).
5. **Modell-Wahl** — `gpt-4.1-mini` Default (TTFT ~150ms). `gpt-4.1` als Qualitäts-Option.

---

## 5. Halluzinations-Strategie

1. **Prompt-Härte** (Phase 4): System-Prompt verbietet Erfindung explizit.
2. **Post-hoc Checker** (Phase 7): Entity-Vergleich — erfundene Zahlen/Namen/Zitate blockieren blindes Übernehmen.
3. **Diff-Sichtbarkeit** (Phase 6): User sieht immer Original vs. Rewrite — added-Tokens grün markiert.

V1 ist nicht halluzinationsfrei, aber *halluzinationssicher*: keine Halluzination geht unbemerkt durch.

---

## 6. Multi-Provider-Erweiterung

**V2 (Claude):** `claudeProvider.ts` implementieren (`https://api.anthropic.com/v1/messages`, `anthropic-version`-Header, SSE mit `event:`-Lines). Provider-Radio und API-Key-Feld in Options aktivieren.

**V3 (Ollama):** `ollamaProvider.ts` implementieren (Endpoint aus Settings, default `http://localhost:11434/api/generate`, Newline-delimited JSON statt SSE). `host_permissions` um `http://localhost/*` erweitern.

---

## 7. Definition-of-Done für V1

- [ ] `bun run build:all` erfolgreich
- [ ] Extension installierbar in Chrome 120+ und Firefox 121+
- [ ] OpenAI-Key eintragen, validieren, speichern
- [ ] Auf Wikipedia-Artikel: Button → Diff streamend → Akzeptieren ersetzt DOM
- [ ] Auf Nicht-Artikel-Seite (Google): kein Button
- [ ] Alle 4 Slider und alle 6 Templates: erkennbar unterschiedliche Outputs
- [ ] Custom-Style erstellbar, speicherbar, abrufbar
- [ ] Auto-Modus: nur Body-Absätze einer Newssite ersetzt, Navi/Footer/Sidebar unverändert
- [ ] Bekanntes Wissen: Rewrites lassen entsprechende Erklärungen weg
- [ ] Halluzinations-Check warnt bei erfundener Zahl
- [ ] Cancel-Button bricht Stream sauber ab
- [ ] Reload stellt Original wieder her
- [ ] `bun run test` und `bun run test:e2e` grün
- [ ] README ermöglicht Fremd-Installation

---

## 8. Implementierungsregeln

1. Phasen 1–11 strikt der Reihe nach. Keine Phase beginnen, bevor die vorherige Done ist.
2. Nach jeder Phase: Commit mit Phasen-Nummer im Message.
3. Unspezifizierte Designentscheidungen: einfachste Option wählen, die dem V1-Done dient.
4. Keine Stub-Funktionen außer `ClaudeProvider` und `OllamaProvider` (explizit V2/V3).
5. Tests fixen durch Code-Änderung, nicht durch Test-Änderung.
6. Projektstruktur aus §2 einhalten. Keine zusätzlichen Top-Level-Ordner.
7. Fehlende Libraries: `bun add` — keine ungenutzten Dependencies.
