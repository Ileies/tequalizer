# TODO

## DX

- [x] **Session-Storage-Keys als Konstanten** - `'popup_pending'` und `'popup_extract_result'` sind in `popup/App.svelte` als Magic Strings hardcodiert; in `src/constants.ts` auslagern
- [x] **`as`-Casts durch Zod-Validierung ersetzen** - mehrere unvalidierte Type-Casts in `popup/App.svelte` (Storage-Reads, Message-Responses); Zod-Schemas verwenden
- [x] **ESLint a11y-Regeln aktivieren** - `svelte/a11y-click-events-have-key-events` und `svelte/a11y-no-static-element-interactions` sind deaktiviert; als `warn` einschalten
- [x] **`console.error` hinter DEBUG-Flag** - mehrere `console.error`-Calls in Background/Content-Scripts landen in der Produktionskonsole; auf `DEBUG`-Flag conditionen
- [ ] **`typecheck`-Script trennen** - `check` fuehrt svelte-check + tsc zusammen aus; separate `typecheck`- und `typecheck:svelte`-Scripts anlegen

## Future

- [x] Rewrite-History / Undo - nach dem Akzeptieren eines Rewrites zurueck zum Original ohne Seiten-Reload
- [ ] Context-Menu-Rewrite - Rechtsklick auf einen Absatz um nur diesen umzuformulieren
- [ ] Dynamische Modellliste - verfuegbare Modelle von der OpenAI API laden statt hartcodierter Liste
- [ ] Diff View fuer Auto-Mode - optional Diff anzeigen bevor Auto-Mode-Rewrites uebernommen werden
- [ ] Erweitertes Fidelity-Checking - semantische Aehnlichkeitspruefung zusaetzlich zur Entity-Pruefung (Zahlen/Daten/Namen)
- [ ] Accessibility-Audit - vollstaendiger Audit von Tastaturnavigation und Screen-Reader-Kompatibilitaet

## V2 - Claude Provider

- [ ] `claudeProvider.ts` implementieren: Anthropic Messages API, SSE mit `event:`-Praefixen, `anthropic-version` Header

## V3 - Ollama Provider

- [ ] `ollamaProvider.ts` implementieren: konfigurierbarer Endpoint (Default `http://localhost:11434`), Newline-delimited JSON statt SSE
- [ ] `host_permissions` in `wxt.config.ts` um `http://localhost/*` erweitern

## V4 - Style Management

- [ ] Per-Site Style-Pinning (z.B. immer Academic auf Wikipedia)
- [ ] Style Import / Export (JSON)
