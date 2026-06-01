# Store Submission Guide

Checkliste und Texte fur Chrome Web Store und Firefox Add-ons.

---

## Assets-Checkliste

### Icons (beide Stores)
- [ ] 16x16 PNG
- [ ] 32x32 PNG
- [ ] 48x48 PNG
- [ ] 128x128 PNG

### Chrome Web Store
- [ ] Screenshots: 1280x800 oder 640x400 (min. 1, max. 5, PNG oder JPEG)
  - [ ] Screenshot 1: Popup mit Style-Reglern (normaler Zustand)
  - [ ] Screenshot 2: Diff-View Overlay auf einem Artikel
  - [ ] Screenshot 3: Options-Seite, Tab "Style-Bibliothek"
  - [ ] Screenshot 4: ExtractPanel mit Ergebnis nach "Stil extrahieren"
- [ ] Promotional Tile: 440x280 PNG (erforderlich fur Featured-Listings)
- [ ] Marquee: 1400x560 PNG (optional)

### Firefox Add-ons
- [ ] Screenshots: beliebige Grosse bis 2000x2000 (max. 10, PNG oder JPEG)
  - [ ] Gleiche 4 Screenshots wie oben

---

## Permissions-Begrundung

Beide Stores verlangen eine Begrundung fur weitreichende Berechtigungen. Folgende Texte bei der Einreichung in das entsprechende Feld eintragen.

### `<all_urls>` / Host Permissions

**Deutsch:**
> Tequalizer muss auf beliebigen Websites laufen, weil Artikel und Blogbeitrage auf Millionen verschiedener Domains erscheinen. Eine feste Allowlist wurde die Kernfunktion unbrauchbar machen. Das Content Script wird ausschliesslich aktiviert, wenn der Nutzer eine Umformulierung explizit ausgelost hat oder der Auto-Modus eine Seite anhand von Readability-Kriterien als Artikel erkennt. Es werden keine Daten uber Websitebesuche gesammelt oder ubertragen.

**English:**
> Tequalizer must run on any website because articles and blog posts appear on millions of different domains. A fixed allowlist would make the core feature unusable. The content script is only activated when the user explicitly triggers a rewrite, or when Auto-mode detects a page as an article based on Readability scoring criteria. No browsing data is collected or transmitted.

### `scripting`

**English:**
> Required to programmatically inject the content script into the active tab when the user clicks "Rewrite page" from the popup, and to inject the diff view overlay component via Shadow DOM.

### `activeTab`

**English:**
> Required to send messages to the content script in the currently active tab (trigger rewrite, get segment count, poll rewrite progress).

---

## Store-Beschreibungen

### Chrome Web Store

#### Name
```
Tequalizer - Texte in deinem Stil
```

#### Summary (DE) - max. 132 Zeichen
```
Formuliert Artikel in deinem Schreibstil um. Funf Regler fur Lange, Ton, Formalitat, Bildsprache und Komplexitat.
```

#### Description (DE)
```
Tequalizer formuliert Artikel, Blogs und Nachrichtenbeitrage direkt im Browser in deinem personlichen Schreibstil um.

FUNF STYLE-REGLER
Stelle den perfekten Ton mit ganzzahligen Stufen (-2 bis +2) ein:
- Lange: extrem kompakt bis sehr ausfuhrlich
- Bildsprache: rein sachlich bis sehr bildhaft
- Warme: kalt/distanziert bis warm/empathisch
- Formalitat: umgangssprachlich bis akademisch
- Komplexitat: Fachsprache bis sehr einfach

WEITERE FUNKTIONEN
- Style-Bibliothek: Mehrere benannte Stile speichern und schnell wechseln
- Stil extrahieren: Den Schreibstil einer beliebigen Seite automatisch analysieren und importieren
- Auto-Modus: Erkannte Artikel werden beim Laden automatisch umformuliert
- Word-Diff: Original und Umformulierung nebeneinander mit Wort-Hervorhebung - annehmen oder verwerfen
- Bekanntes Wissen: Optionales Nutzerprofil, damit das KI-Modell offensichtlichen Kontext uberspringt
- Templates: TED Talk, Bibel, Personlicher Brief, Akademisch, Boulevard als Ausgangspunkt

DATENSCHUTZ
Alle Daten (API-Schlussel, Styles, Einstellungen) verbleiben lokal im Browser. Kein Server, keine Telemetrie, keine Nutzerkonten. Seitentext wird direkt an OpenAI ubermittelt - mit deinem eigenen API-Schlussel.

VORAUSSETZUNG
Eigener OpenAI API-Schlussel erforderlich. Claude und Ollama folgen in V2/V3.
```

---

#### Name (EN)
```
Tequalizer - Rewrite in Your Style
```

#### Summary (EN) - max. 132 Zeichen
```
Rewrites articles in your personal writing style. Five sliders for length, tone, formality, imagery and complexity.
```

#### Description (EN)
```
Tequalizer rewrites articles, blogs and news posts directly in your browser to match your personal writing style.

FIVE STYLE SLIDERS
Fine-tune your preferred tone with integer steps (-2 to +2):
- Length: extremely compact to very detailed
- Imagery: purely factual to highly figurative
- Warmth: cold/distant to warm/empathetic
- Formality: colloquial to academic
- Complexity: technical language to very plain

MORE FEATURES
- Style library: Save and quickly switch between multiple named styles
- Style extraction: Automatically analyze the writing style of any page and import it
- Auto-mode: Detected articles are automatically rewritten on page load
- Word diff: Original and rewrite side by side with word-level highlighting - accept or reject
- Known knowledge: Optional user profile so the AI model skips obvious context
- Templates: TED Talk, Bible, Personal Letter, Academic, Tabloid as starting points

PRIVACY
All data (API keys, styles, settings) stays local in your browser. No server, no telemetry, no accounts. Page text is sent directly to OpenAI using your own API key.

REQUIREMENT
Your own OpenAI API key is required. Claude and Ollama support coming in V2/V3.
```

---

### Firefox Add-ons

#### Name
```
Tequalizer - Texte in deinem Stil
```

#### Summary (DE) - max. 250 Zeichen
```
Formuliert Artikel und Blogbeitrage in deinem personlichen Schreibstil um. Funf Regler fur Lange, Ton, Formalitat, Bildsprache und Komplexitat. Style-Bibliothek, Auto-Modus, Diff-View und Stil-Extraktion inklusive.
```

#### Summary (EN) - max. 250 Zeichen
```
Rewrites articles and blog posts in your personal writing style. Five sliders for length, tone, formality, imagery and complexity. Includes style library, auto-mode, diff view and style extraction.
```

#### Description (DE/EN)
Identisch mit Chrome Web Store-Beschreibung (s.o.).

---

## Einreichungs-Checkliste

### Chrome Web Store
- [ ] Entwicklerkonto verifiziert ($5 Einmalgebur)
- [ ] `bun run zip` - ZIP erstellt
- [ ] Privacy Policy URL hinterlegt (PRIVACY.md hosten, z.B. GitHub Pages)
- [ ] Kategorie: Productivity
- [ ] Sprache: Deutsch (Primarsprache), Englisch
- [ ] Permissions-Begrundungen ausgefullt (s.o.)
- [ ] Screenshots hochgeladen (min. 1)
- [ ] Beschreibung eingefugt

### Firefox Add-ons
- [ ] Entwicklerkonto erstellt (kostenlos)
- [ ] `bun run zip:firefox` - ZIP erstellt
- [ ] Source-Code ZIP (wxt zip erstellt keinen Source-ZIP automatisch - `git archive` nutzen)
- [ ] Privacy Policy URL hinterlegt
- [ ] Kategorie: Appearance / Productivity
- [ ] Permissions-Begrundungen ausgefullt (s.o.)
- [ ] Screenshots hochgeladen
- [ ] Beschreibung eingefugt
