# Datenschutzerklarung / Privacy Policy

**Tequalizer** - Version 0.1  
Stand: Juni 2026

---

## Kurzfassung

Tequalizer speichert alle Daten ausschliesslich lokal in Ihrem Browser. Der Entwickler empfangt keine Daten. Es gibt keinen Server, keine Telemetrie und keine Nutzerkonten.

---

## Welche Daten werden wo gespeichert?

### Lokal im Browser (`browser.storage.local`)

| Datum | Zweck |
|-------|-------|
| API-Schlussel (OpenAI, Claude) | Werden ausschliesslich lokal gespeichert und nie an den Entwickler ubermittelt |
| Style-Konfigurationen | Ihre Regler-Einstellungen, Style-Namen und Templates |
| Einstellungen | Provider-Wahl, Auto-Modus, Domain-Ausschlussliste, min. Wortanzahl |
| Benutzerprofil ("Bekanntes Wissen") | Optionaler Text, der lokal gespeichert und in Prompts eingebettet wird |

Diese Daten verlassen Ihren Browser nicht und sind fur den Entwickler nicht zuganglich.

### Ubertragung an KI-Anbieter

Wenn Sie eine Seite umformulieren, wird der Seitentext zusammen mit Ihren Style-Einstellungen direkt von Ihrem Browser an den von Ihnen konfigurierten KI-Anbieter gesendet:

- Die Ubertragung erfolgt direkt (Browser zu Anbieter-API), nicht uber einen Zwischen-Server
- Es wird ausschliesslich Ihr eigener API-Schlussel verwendet
- Der Entwickler hat keinen Zugang zu diesen Anfragen oder deren Inhalten

Bitte beachten Sie die Datenschutzbestimmungen Ihres Anbieters:

- **OpenAI:** https://openai.com/privacy
- **Anthropic (Claude):** https://www.anthropic.com/privacy

---

## Was wird NICHT erhoben

- Keine Nutzungsstatistiken oder Telemetrie
- Keine Tracking-Pixel oder Analytics
- Keine Aufzeichnung von Websitebesuchen
- Keine Weitergabe von Daten an Dritte durch den Entwickler
- Kein Server-Backend des Entwicklers

---

## Berechtigungen der Extension

| Berechtigung | Grund |
|---|---|
| `storage` | Lokale Speicherung von Einstellungen, Styles und API-Schlusseln |
| `activeTab` | Zugriff auf den aktuell aktiven Tab fur manuelle Umformulierungen |
| `scripting` | Einbinden des Content Scripts auf Nutzer-Anfrage |
| `<all_urls>` | Artikel erscheinen auf beliebigen Websites; ein fester Domain-Filter wurde Tausende legitime Seiten ausschliessen. Das Content Script wird nur aktiviert, wenn der Nutzer dies explizit ausgelost hat oder Auto-Modus eine Seite als Artikel erkennt. |
| `https://api.openai.com/*` | Direkter Aufruf der OpenAI API aus dem Service Worker |

---

## Datenspeicherung und Loschung

Da alle Daten ausschliesslich lokal gespeichert werden, konnen Sie diese jederzeit loschen:

- **Alle Daten:** Browser-Erweiterungsdaten loschen (in den Browser-Einstellungen unter Extensions / Add-ons)
- **Einzelne Daten:** Style-Bibliothek und Einstellungen uber die Options-Seite der Extension

---

## Anderungen dieser Datenschutzerklaung

Bei wesentlichen Anderungen wird die Version und das Datum oben aktualisiert.

---

## Kontakt

Elias Klassen  
elias.klassen@offlimits-it.com

---

## Summary (English)

Tequalizer stores all data exclusively in your browser (API keys, styles, settings via `browser.storage.local`). No data is transmitted to the developer. When rewriting text, the page content is sent directly from your browser to your configured AI provider (OpenAI by default) using your own API key - the developer never sees this traffic. The extension has no server-side component, no analytics, and no telemetry. You can delete all locally stored data at any time by removing the extension's stored data from your browser settings.
