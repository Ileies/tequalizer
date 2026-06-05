# TODO

## Future

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
