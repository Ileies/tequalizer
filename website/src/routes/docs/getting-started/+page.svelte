<svelte:head>
  <title>Erste Schritte - Tequalizer Dokumentation</title>
</svelte:head>

<article class="prose max-w-none">
  <h1>Erste Schritte</h1>

  <p>
    Diese Anleitung fuhrt dich von der Installation bis zur ersten Seitenumformulierung.
    Die gesamte Einrichtung dauert ca. 3 Minuten.
  </p>

  <h2>1. Extension installieren</h2>

  <p>
    Tequalizer ist als Manifest-V3-Extension fur Chrome und Firefox verfugbar.
    Lade sie aus dem jeweiligen Store:
  </p>

  <ul>
    <li><strong>Chrome, Edge, Brave:</strong> Chrome Web Store (bald verfugbar)</li>
    <li><strong>Firefox:</strong> Firefox Add-ons (bald verfugbar)</li>
  </ul>

  <p>
    Nach der Installation erscheint das Tequalizer-Icon in der Browser-Symbolleiste.
    Falls es nicht sichtbar ist, klicke auf das Erweiterungs-Puzzle-Symbol und hefte Tequalizer an.
  </p>

  <h2>2. OpenAI API-Schlussel hinterlegen</h2>

  <p>
    Tequalizer nutzt die OpenAI API fur das Umformulieren. Du benotigst einen eigenen API-Schlussel
    von <a href="https://platform.openai.com" target="_blank" rel="noopener">platform.openai.com</a>.
  </p>

  <ol>
    <li>Tequalizer-Popup offnen (Extension-Icon anklicken).</li>
    <li>Wenn noch kein API-Schlussel konfiguriert ist, zeigt das Popup einen Einrichtungshinweis - auf "Einstellungen offnen" klicken.</li>
    <li>Im Tab "API & Modell" den OpenAI API-Schlussel eingeben und "Speichern" klicken.</li>
    <li>Optional: Das Modell wechseln (Standard ist GPT-4o mini).</li>
  </ol>

  <div class="not-prose bg-base-200 border border-base-300 rounded-lg p-4 text-sm my-4">
    <strong>Datenschutz:</strong> Dein API-Schlussel wird ausschliesslich lokal in
    <code>browser.storage.local</code> gespeichert. Weder der Schlussel noch Seiteninhalt
    werden an den Entwickler ubermittelt. Seitentext geht direkt von deinem Browser an die OpenAI API.
  </div>

  <h2>3. Ersten Artikel umformulieren</h2>

  <ol>
    <li>Ruf einen Blogartikel oder Nachrichtenbeitrag auf.</li>
    <li>Offne das Tequalizer-Popup.</li>
    <li>Stelle die funf Style-Regler nach Wunsch ein (oder behalte die Standardwerte).</li>
    <li>Klicke auf <strong>"Seite umformulieren"</strong>.</li>
    <li>Der Text wird im Hintergrund umformuliert und ein Diff-Overlay erscheint - Abschnitt fur Abschnitt.</li>
    <li>Im Diff-Overlay kannst du Original und Umformulierung vergleichen und jeden Abschnitt einzeln akzeptieren oder verwerfen.</li>
  </ol>

  <h2>4. Styles speichern und verwalten</h2>

  <p>
    Wenn du eine Regler-Kombination ofter nutzt, speichere sie als benannten Style:
  </p>

  <ol>
    <li>Regler wie gewunscht einstellen.</li>
    <li>Im Popup auf den Style-Namen klicken und "Als neuen Style speichern" wahlen.</li>
    <li>Einen Namen vergeben - der Style ist ab sofort in der Dropdown-Liste verfugbar.</li>
  </ol>

  <p>
    Styles werden in der Options-Seite verwaltet (Zahnrad-Icon im Popup, dann Tab "Style-Bibliothek").
    Dort kannst du Styles auch bearbeiten, loschen und einen Standard-Style festlegen.
  </p>

  <h2>5. Auto-Modus einrichten (optional)</h2>

  <p>
    Der Auto-Modus erkennt Artikel automatisch und formuliert sie beim Seitenaufruf um - ohne manuellen Klick.
  </p>

  <ol>
    <li>Options-Seite offnen (Zahnrad im Popup).</li>
    <li>Tab "Auto-Modus" wahlen.</li>
    <li>Auto-Modus aktivieren.</li>
    <li>Optional: Mindest-Wortanzahl anpassen und bestimmte Domains ausschliessen.</li>
  </ol>

  <div class="not-prose bg-base-200 border border-base-300 rounded-lg p-4 text-sm my-4">
    <strong>Hinweis:</strong> Der Auto-Modus erkennt Artikel anhand von Readability-Kriterien (Textlange,
    Absatzstruktur). Kurze oder layoutlastige Seiten werden nicht als Artikel erkannt und bleiben unverandert.
  </div>

  <h2>Nachste Schritte</h2>

  <ul>
    <li><a href="/docs/style-dimensions">Style-Regler im Detail</a> - alle funf Dimensionen erklart</li>
    <li><a href="/docs/faq">FAQ</a> - haufige Fragen und Antworten</li>
  </ul>
</article>
