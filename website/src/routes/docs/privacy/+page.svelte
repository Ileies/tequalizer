<svelte:head>
  <title>Datenschutz - Tequalizer</title>
</svelte:head>

<article class="prose max-w-none">
  <h1>Datenschutzerklarung</h1>

  <p><strong>Tequalizer</strong> - Version 0.1<br />Stand: Juni 2026</p>

  <div class="not-prose bg-base-200 border border-base-300 rounded-lg p-4 text-sm my-4">
    <strong>Kurzfassung:</strong> Tequalizer speichert alle Daten ausschliesslich lokal in deinem Browser.
    Der Entwickler empfangt keine Daten. Es gibt keinen Server, keine Telemetrie und keine Nutzerkonten.
  </div>

  <h2>Welche Daten werden wo gespeichert?</h2>

  <h3>Lokal im Browser (<code>browser.storage.local</code>)</h3>

  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Zweck</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>API-Schlussel (OpenAI, Claude)</td>
        <td>Werden ausschliesslich lokal gespeichert und nie an den Entwickler ubermittelt</td>
      </tr>
      <tr>
        <td>Style-Konfigurationen</td>
        <td>Deine Regler-Einstellungen, Style-Namen und Templates</td>
      </tr>
      <tr>
        <td>Einstellungen</td>
        <td>Provider-Wahl, Auto-Modus, Domain-Ausschlussliste, min. Wortanzahl</td>
      </tr>
      <tr>
        <td>Benutzerprofil ("Bekanntes Wissen")</td>
        <td>Optionaler Text, der lokal gespeichert und in Prompts eingebettet wird</td>
      </tr>
    </tbody>
  </table>

  <p>Diese Daten verlassen deinen Browser nicht und sind fur den Entwickler nicht zuganglich.</p>

  <h3>Ubertragung an KI-Anbieter</h3>

  <p>
    Wenn du eine Seite umformulierst, wird der Seitentext zusammen mit deinen Style-Einstellungen
    direkt von deinem Browser an den von dir konfigurierten KI-Anbieter gesendet:
  </p>

  <ul>
    <li>Die Ubertragung erfolgt direkt (Browser zu Anbieter-API), nicht uber einen Zwischen-Server</li>
    <li>Es wird ausschliesslich dein eigener API-Schlussel verwendet</li>
    <li>Der Entwickler hat keinen Zugang zu diesen Anfragen oder deren Inhalten</li>
  </ul>

  <p>Bitte beachte die Datenschutzbestimmungen deines Anbieters:</p>
  <ul>
    <li><strong>OpenAI:</strong> <a href="https://openai.com/privacy" target="_blank" rel="noopener">openai.com/privacy</a></li>
    <li><strong>Anthropic (Claude):</strong> <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener">anthropic.com/privacy</a></li>
  </ul>

  <h2>Was wird NICHT erhoben</h2>

  <ul>
    <li>Keine Nutzungsstatistiken oder Telemetrie</li>
    <li>Keine Tracking-Pixel oder Analytics</li>
    <li>Keine Aufzeichnung von Websitebesuchen</li>
    <li>Keine Weitergabe von Daten an Dritte durch den Entwickler</li>
    <li>Kein Server-Backend des Entwicklers</li>
  </ul>

  <h2>Berechtigungen der Extension</h2>

  <table>
    <thead>
      <tr>
        <th>Berechtigung</th>
        <th>Grund</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>storage</code></td>
        <td>Lokale Speicherung von Einstellungen, Styles und API-Schlusseln</td>
      </tr>
      <tr>
        <td><code>activeTab</code></td>
        <td>Zugriff auf den aktuell aktiven Tab fur manuelle Umformulierungen</td>
      </tr>
      <tr>
        <td><code>scripting</code></td>
        <td>Einbinden des Content Scripts auf Nutzer-Anfrage</td>
      </tr>
      <tr>
        <td><code>&lt;all_urls&gt;</code></td>
        <td>Artikel erscheinen auf beliebigen Websites; ein fester Domain-Filter wurde Tausende legitime Seiten ausschliessen. Das Content Script wird nur aktiviert, wenn der Nutzer dies explizit ausgelost hat oder Auto-Modus eine Seite als Artikel erkennt.</td>
      </tr>
      <tr>
        <td><code>https://api.openai.com/*</code></td>
        <td>Direkter Aufruf der OpenAI API aus dem Service Worker</td>
      </tr>
    </tbody>
  </table>

  <h2>Datenspeicherung und Loschung</h2>

  <p>
    Da alle Daten ausschliesslich lokal gespeichert werden, kannst du diese jederzeit loschen:
  </p>

  <ul>
    <li><strong>Alle Daten:</strong> Browser-Erweiterungsdaten loschen (in den Browser-Einstellungen unter Extensions / Add-ons)</li>
    <li><strong>Einzelne Daten:</strong> Style-Bibliothek und Einstellungen uber die Options-Seite der Extension</li>
  </ul>

  <h2>Anderungen dieser Datenschutzerklarung</h2>

  <p>Bei wesentlichen Anderungen wird die Version und das Datum oben aktualisiert.</p>

  <h2>Kontakt</h2>

  <p>
    Elias Klassen<br />
    <a href="mailto:elias.klassen@offlimits-it.com">elias.klassen@offlimits-it.com</a>
  </p>

  <hr />

  <h2>Summary (English)</h2>

  <p>
    Tequalizer stores all data exclusively in your browser (API keys, styles, settings via
    <code>browser.storage.local</code>). No data is transmitted to the developer. When rewriting text,
    the page content is sent directly from your browser to your configured AI provider (OpenAI by default)
    using your own API key - the developer never sees this traffic. The extension has no server-side
    component, no analytics, and no telemetry. You can delete all locally stored data at any time by
    removing the extension's stored data from your browser settings.
  </p>
</article>
