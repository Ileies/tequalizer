# TODO

## Pre-launch: Kritische Fixes

- [x] **Error-Feedback bei Segment-Fehler** - wenn ein Absatz nicht umformuliert wird (Rate-Limit, Netzwerkfehler), Toast oder Banner zeigen statt still den Original-Text wiederherstellen (`autoRewriteOrchestrator.ts` Fehler in die UI propagieren)
- [x] **Fortschrittsanzeige beim manuellen Rewrite** - Popup schliesst sich aktuell nach dem Trigger ohne Feedback; laufende Segmente, Done/Failed-Zaehler anzeigen
- [x] **Auto-Mode-Feedback** - kurze Benachrichtigung wenn Auto-Rewrite abgeschlossen ist ("Artikel umformuliert" / "Umformulierung fehlgeschlagen")
- [x] **Claude/Ollama-Validierung reparieren** - Key-Validierung gibt `{ ok: true }` fuer Stub-Provider zurueck und verschleiert den Fehler; Provider mit klarem Hinweis deaktivieren ("kommt in V2/V3")
- [ ] **Network-Timeout** - `openaiProvider.ts` Fetch-Calls haben kein Timeout; `AbortSignal.timeout()` hinzufuegen (10s)
- [ ] **Onboarding** - First-Run-Modal das die fuenf Style-Slider erklaert und zeigt wie man startet
- [x] **API-Key-Validierung im Popup** - `saveKey()` in `popup/App.svelte` speichert Keys ohne Validierung; dieselbe Logik wie in `ApiTab.svelte` (`VALIDATE_API_KEY` Message) anwenden
- [x] **API-Key nach Speichern leeren** - nach erfolgreichem Speichern in `popup/App.svelte` den Input-Inhalt loeschen

## Pre-launch: Store Submission

- [ ] **Datenschutzerklaerung** - fuer Chrome Web Store und Firefox Add-ons Pflicht
- [ ] **Store-Assets** - Screenshots, Promotional Images, Store-Beschreibung (DE + EN)
- [ ] **Permissions-Begruendung** - dokumentieren warum `<all_urls>` benoetigt wird (beide Stores verlangen das)
- [ ] **Troubleshooting im README** - "Warum wurde mein Artikel nicht umformuliert?", bekannte Einschraenkungen

## UI

- [x] **Empty State Styles-Tab** - Style-Liste zeigt nichts wenn leer; leeren Zustand mit Call-to-Action anzeigen (`StylesTab.svelte`)
- [ ] **Ungespeicherte Aenderungen in KnowledgeTab** - kein Hinweis wenn der Profiltext geaendert aber noch nicht gespeichert wurde; Indicator anzeigen wenn `profileText !== savedText`
- [ ] **Bestaetigung fuer "Verwerfen"** - der Verwerfen-Button im Popup hat keine Bestaetigung; Nutzer koennten versehentlich ausloefen
- [ ] **Min-Word-Count Input** - negative Werte werden erst nach `onchange` korrigiert, sichtbar fuer den Nutzer; auf `oninput` umstellen (`AutoModeTab.svelte`)
- [ ] **Domain-Validierung** - in `AutoModeTab.svelte` werden ungueltige Domain-Eingaben (Leerzeichen, Sonderzeichen) lautlos akzeptiert; regex-Validierung + Warnhinweis hinzufuegen
- [ ] **Tab-Panel Fokus-Reihenfolge** - versteckte Tab-Panels in `options/App.svelte` haben `tabindex="0"` und sind damit im Tab-Order; auf `tabindex="-1"` fuer inaktive Panels setzen

## UX

- [ ] **Slider-State Race Condition** - `liveValues` im Popup wird nicht zurueckgesetzt wenn der Nutzer den Style wechselt waehrend ein Slider gezogen wird; Style-Wechsel soll `liveValues` zuruecksetzen
- [x] **`window.close()` zu frueh** - in `triggerRewrite()` schliesst sich das Popup bevor die Message bestaetigt wurde; erst nach erfolgreicher Uebertragung schliessen
- [x] **Extraction-Button erneut klickbar** - waehrend Extraktionsergebnisse angezeigt werden kann "Stil extrahieren" nochmals geklickt werden; Button disabled halten waehrend Ergebnis sichtbar ist
- [x] **Keyboard-Support ToggleSwitch** - `Space`/`Enter` loesen den Toggle nicht aus; `onkeydown`-Handler in `ToggleSwitch.svelte` erganzen

## DX

- [ ] **Session-Storage-Keys als Konstanten** - `'popup_pending'` und `'popup_extract_result'` sind in `popup/App.svelte` als Magic Strings hardcodiert; in `src/constants.ts` auslagern
- [ ] **`as`-Casts durch Zod-Validierung ersetzen** - mehrere unvalidierte Type-Casts in `popup/App.svelte` (Storage-Reads, Message-Responses); Zod-Schemas verwenden
- [ ] **ESLint a11y-Regeln aktivieren** - `svelte/a11y-click-events-have-key-events` und `svelte/a11y-no-static-element-interactions` sind deaktiviert; als `warn` einschalten
- [ ] **`console.error` hinter DEBUG-Flag** - mehrere `console.error`-Calls in Background/Content-Scripts landen in der Produktionskonsole; auf `DEBUG`-Flag conditionen
- [ ] **`typecheck`-Script trennen** - `check` fuehrt svelte-check + tsc zusammen aus; separate `typecheck`- und `typecheck:svelte`-Scripts anlegen

## V2 - Claude Provider

- [ ] `claudeProvider.ts` implementieren: Anthropic Messages API, SSE mit `event:`-Praefixen, `anthropic-version` Header

## V3 - Ollama Provider

- [ ] `ollamaProvider.ts` implementieren: konfigurierbarer Endpoint (Default `http://localhost:11434`), Newline-delimited JSON statt SSE
- [ ] `host_permissions` in `wxt.config.ts` um `http://localhost/*` erweitern

## V4 - Style Management

- [ ] Per-Site Style-Pinning (z.B. immer Academic auf Wikipedia)
- [ ] Style Import / Export (JSON)

## Future

- [ ] Rewrite-History / Undo - nach dem Akzeptieren eines Rewrites zurueck zum Original ohne Seiten-Reload
- [ ] Context-Menu-Rewrite - Rechtsklick auf einen Absatz um nur diesen umzuformulieren
- [ ] Dynamische Modellliste - verfuegbare Modelle von der OpenAI API laden statt hartcodierter Liste
- [ ] Diff View fuer Auto-Mode - optional Diff anzeigen bevor Auto-Mode-Rewrites uebernommen werden
- [ ] Erweitertes Fidelity-Checking - semantische Aehnlichkeitspruefung zusaetzlich zur Entity-Pruefung (Zahlen/Daten/Namen)
- [ ] Accessibility-Audit - vollstaendiger Audit von Tastaturnavigation und Screen-Reader-Kompatibilitaet
