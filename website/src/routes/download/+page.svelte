<svelte:head>
  <title>Download - Tequalizer</title>
</svelte:head>

<section class="py-20 px-4">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-14">
      <h1 class="text-4xl font-extrabold mb-4">Tequalizer herunterladen</h1>
      <p class="text-base-content/70 text-lg">
        Kostenlose Browser-Extension fur Chrome und Firefox.
        Ein eigener OpenAI API-Schlussel ist erforderlich.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
      <!-- Chrome -->
      <div class="card bg-base-200 border border-base-300 shadow-sm">
        <div class="card-body items-center text-center gap-4">
          <div class="text-5xl">🌐</div>
          <h2 class="card-title">Google Chrome</h2>
          <p class="text-sm text-base-content/60">Chrome, Edge, Brave und andere Chromium-Browser</p>
          <a href="/download/tequalizer-0.1.1-chrome.zip" download class="btn btn-primary btn-block mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            ZIP herunterladen
          </a>
          <p class="text-xs text-base-content/50">Manuell laden - kein Store-Eintrag bisher</p>
        </div>
      </div>

      <!-- Firefox -->
      <div class="card bg-base-200 border border-base-300 shadow-sm">
        <div class="card-body items-center text-center gap-4">
          <div class="text-5xl">🦊</div>
          <h2 class="card-title">Mozilla Firefox</h2>
          <p class="text-sm text-base-content/60">Firefox Desktop</p>
          <a href="/download/tequalizer-0.1.1-firefox.zip" download class="btn btn-outline btn-block mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            ZIP herunterladen
          </a>
          <p class="text-xs text-base-content/50">Manuell laden - kein Store-Eintrag bisher</p>
        </div>
      </div>
    </div>

    <!-- Manual install instructions -->
    <div class="alert border border-base-300 bg-base-200 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="font-medium text-sm">Manuelle Installation (nicht aus dem Store)</p>
        <ul class="text-sm text-base-content/70 mt-2 space-y-1 list-disc list-inside">
          <li><strong>Chrome:</strong> ZIP entpacken - <code>chrome://extensions</code> offnen - "Entwicklermodus" aktivieren - "Entpackt laden" - entpackten Ordner wahlen</li>
          <li><strong>Firefox:</strong> <code>about:debugging</code> offnen - "Temporares Add-on laden" - die <code>.zip</code>-Datei direkt wahlen</li>
        </ul>
      </div>
    </div>

    <!-- API key requirement -->
    <div class="alert border border-base-300 bg-base-200 mb-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
      <div>
        <p class="font-medium text-sm">Eigener OpenAI API-Schlussel erforderlich</p>
        <p class="text-sm text-base-content/70 mt-1">
          Der Schlussel wird ausschliesslich lokal gespeichert und nie an den Entwickler ubermittelt.
          Claude und Ollama folgen in V2/V3.
        </p>
      </div>
    </div>

    <!-- Quick start -->
    <div class="prose max-w-none">
      <h2 class="text-xl font-bold mb-4">Schnellstart</h2>
      <ol class="list-decimal list-inside space-y-3 text-base-content/80 text-sm">
        <li>ZIP herunterladen und wie oben beschrieben manuell installieren.</li>
        <li>Das Tequalizer-Icon in der Symbolleiste anklicken - es erscheint ein Hinweis zur API-Konfiguration.</li>
        <li>Unter Einstellungen (Zahnrad-Icon) deinen OpenAI API-Schlussel eingeben und speichern.</li>
        <li>Einen Artikel aufrufen, das Popup offnen, Regler einstellen und "Seite umformulieren" klicken.</li>
      </ol>
      <p class="mt-4">
        <a href="/docs/getting-started" class="link link-primary text-sm">Ausfuhrliche Anleitung lesen &rarr;</a>
      </p>
    </div>
  </div>
</section>
