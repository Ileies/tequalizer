<svelte:head>
  <title>Style-Regler - Tequalizer Dokumentation</title>
</svelte:head>

<script lang="ts">
  const dimensions = [
    {
      key: 'length',
      label: 'Lange',
      desc: 'Steuert, wie ausfuhrlich der umformulierte Text ist. Bei -2 werden Satze radikal verkurzt, Nebensatze gestrichen und nur die Kernaussage behalten. Bei +2 wird jeder Gedanke ausgefuhrt, Beispiele hinzugefugt und der Text auf etwa das 1,5-fache der Originallange ausgedehnt.',
      levels: [
        { val: -2, label: 'extrem kompakt' },
        { val: -1, label: 'knapp' },
        { val: 0, label: 'Original' },
        { val: 1, label: 'ausfuhrlicher' },
        { val: 2, label: 'sehr ausfuhrlich (~1,5x)' }
      ]
    },
    {
      key: 'imagery',
      label: 'Bildsprache',
      desc: 'Bestimmt den Grad an Metaphern, Vergleichen und bildlicher Sprache. Bei -2 werden alle Metaphern entfernt und der Text bleibt streng faktisch. Bei +2 wird jede Aussage mit Bildern, Analogien und lebhafter Sprache versehen.',
      levels: [
        { val: -2, label: 'rein sachlich' },
        { val: -1, label: 'kaum Bilder' },
        { val: 0, label: 'neutral' },
        { val: 1, label: 'gelegentl. Metaphern' },
        { val: 2, label: 'sehr bildhaft' }
      ]
    },
    {
      key: 'warmth',
      label: 'Warme',
      desc: 'Kontrolliert den emotionalen Ton des Textes. Bei -2 klingt der Text kalt und distanziert wie ein technisches Protokoll. Bei +2 wird er warm, empathisch und personlich - als wurde ein Freund schreiben.',
      levels: [
        { val: -2, label: 'kalt/distanziert' },
        { val: -1, label: 'zuruckhaltend' },
        { val: 0, label: 'neutral' },
        { val: 1, label: 'personlicher' },
        { val: 2, label: 'warm/empathisch' }
      ]
    },
    {
      key: 'formality',
      label: 'Formalitat',
      desc: 'Steuert das Sprachniveau von umgangssprachlich bis akademisch. Bei -2 wird Du-Form, Alltagssprache und lockere Formulierungen verwendet. Bei +2 ist der Text im akademischen Stil mit Fachvokabular und passivischer Konstruktion.',
      levels: [
        { val: -2, label: 'umgangssprachlich' },
        { val: -1, label: 'locker' },
        { val: 0, label: 'Standard' },
        { val: 1, label: 'gehoben' },
        { val: 2, label: 'akademisch' }
      ]
    },
    {
      key: 'simplicity',
      label: 'Komplexitat',
      desc: 'Bestimmt, wie einfach oder komplex die Sprache ist. Bei -2 werden Fachbegriffe, verschachtelte Satze und komplexe Konzepte beibehalten oder verstarkt. Bei +2 wird jeder Begriff erklart und die Sprache auf ein allgemeines Publikum vereinfacht.',
      levels: [
        { val: -2, label: 'komplex/Fachsprache' },
        { val: -1, label: 'etwas gehoben' },
        { val: 0, label: 'neutral' },
        { val: 1, label: 'vereinfacht' },
        { val: 2, label: 'sehr einfach' }
      ]
    }
  ];
</script>

<article class="prose max-w-none">
  <h1>Style-Regler</h1>

  <p>
    Tequalizer hat funf unabhangige Style-Regler, jeder mit funf Stufen von -2 bis +2.
    Der Wert 0 bedeutet "wie das Original", negative Werte gehen in eine Richtung, positive in die andere.
    Die Stufen sind ganzzahlig - es gibt keine Zwischenwerte.
  </p>

  <div class="not-prose bg-base-200 border border-base-300 rounded-lg p-4 text-sm my-6">
    Alle Regler wirken gleichzeitig. Eine Kombination aus kurz (-2), sehr bildhaft (+2) und akademisch (+2)
    ergibt z.B. einen extrem kompakten Text in gelehrtem Stil mit dichter Metaphorik - eine valide, wenn auch
    ungewohnliche Kombination.
  </div>
</article>

<div class="space-y-10 mt-8">
  {#each dimensions as dim}
    <div class="card bg-base-200 border border-base-300">
      <div class="card-body">
        <h2 class="card-title text-lg">{dim.label}</h2>
        <p class="text-sm text-base-content/70 mb-4">{dim.desc}</p>

        <div class="overflow-x-auto">
          <table class="table table-sm w-full">
            <thead>
              <tr>
                <th class="w-12 text-center">Wert</th>
                <th>Bezeichnung</th>
              </tr>
            </thead>
            <tbody>
              {#each dim.levels as level}
                <tr class:bg-primary={level.val === 0} class:text-primary-content={level.val === 0}>
                  <td class="text-center font-mono font-semibold">
                    {level.val > 0 ? `+${level.val}` : level.val}
                  </td>
                  <td>{level.label}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/each}
</div>

<article class="prose max-w-none mt-10">
  <h2>Templates</h2>

  <p>
    Zusatzlich zu den Reglern gibt es sechs Templates, die den Stil anhand von Beispielen prgen:
  </p>

  <ul>
    <li><strong>Kein Template</strong> - nur die Regler-Einstellungen gelten</li>
    <li><strong>TED Talk</strong> - inspirierend, storytelling-orientiert, fur ein breites Publikum</li>
    <li><strong>Bibel</strong> - altertumlicher, erhabener Ton mit biblischer Sprachfarbung</li>
    <li><strong>Personlicher Brief</strong> - direkt, herzlich, als wurde man an eine vertraute Person schreiben</li>
    <li><strong>Akademisch</strong> - sachlich, zitierfahig, wissenschaftlicher Stil</li>
    <li><strong>Boulevard</strong> - sensationalistisch, emotional aufgeladen, tabloider Stil</li>
  </ul>

  <p>
    Templates und Regler erganzen sich: Ein TED-Talk-Template mit Warme +2 und Bildsprache +2
    ergibt einen noch emotionaleren und bildhafteren Vortragsstil als das Template allein.
  </p>

  <h2>Bekanntes Wissen (Nutzerprofil)</h2>

  <p>
    In den Einstellungen (Tab "Bekanntes Wissen") kann ein optionaler Profiltext hinterlegt werden.
    Dieser Text wird in jeden Prompt eingebettet und informiert das Modell uber Vorkenntnisse -
    z.B. "Ich bin Softwareentwickler und kenne grundlegende Netzwerkkonzepte."
    Das Modell kann dann offensichtliche Erklarungen uberspringen.
  </p>
</article>
