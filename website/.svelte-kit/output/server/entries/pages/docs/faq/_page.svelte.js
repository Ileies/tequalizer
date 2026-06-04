import { a7 as head, a as ensure_array_like, e as escape_html } from "../../../../chunks/index.js";
function _page($$renderer) {
  const faqs = [
    {
      q: "Was kostet Tequalizer?",
      a: "Die Extension selbst ist kostenlos. Du benotigst jedoch einen eigenen OpenAI API-Schlussel. Die Kosten dafur hangen von der Nutzung ab - GPT-4o mini (der Standard) ist sehr gunstig und kostet wenige Cent pro mehrseitigem Artikel."
    },
    {
      q: "Werden meine Daten gesammelt?",
      a: "Nein. Alle Daten (API-Schlussel, Styles, Einstellungen) werden ausschliesslich lokal in deinem Browser gespeichert. Der Entwickler empfangt keine Daten. Seitentext wird direkt von deinem Browser an die OpenAI API gesendet - nicht uber einen Zwischen-Server."
    },
    {
      q: "Welche Browser werden unterstutzt?",
      a: "Tequalizer lauft als Manifest-V3-Extension in Google Chrome, Mozilla Firefox, Microsoft Edge und Brave. Andere Chromium-basierte Browser funktionieren in der Regel ebenfalls."
    },
    {
      q: "Welche KI-Modelle werden unterstutzt?",
      a: "Aktuell (V1) wird ausschliesslich die OpenAI API unterstutzt. In V2 folgt Anthropic Claude, in V3 Ollama fur lokale Modelle."
    },
    {
      q: "Warum funktioniert der Auto-Modus nicht auf manchen Seiten?",
      a: "Der Auto-Modus erkennt Artikel anhand von Readability-Kriterien: Textlange, Absatzstruktur und Verhaltnis von Fliesstext zu Navigationselementen. Sehr kurze Texte, Startseiten, Suchergebnisse und layoutlastige Seiten werden nicht als Artikel erkannt und bleiben unverandert. Die Mindest-Wortanzahl kann in den Einstellungen angepasst werden."
    },
    {
      q: "Kann ich Tequalizer auf bestimmten Websites deaktivieren?",
      a: "Ja. Im Auto-Modus-Tab der Options-Seite kannst du Domains zur Ausschlussliste hinzufugen. Auf diesen Seiten wird der Auto-Modus nicht ausgefuhrt. Der manuelle Rewrite per Popup-Klick ist weiterhin moglich."
    },
    {
      q: "Wie lange dauert eine Umformulierung?",
      a: "Das hangt von der Lnge des Artikels und dem gewhlten Modell ab. Typischerweise 10-30 Sekunden fur einen mittellangen Artikel. Die Umformulierung lauft in Echtzeit-Streaming, sodass Segmente nach und nach erscheinen."
    },
    {
      q: 'Was ist der Unterschied zwischen "Stil extrahieren" und den manuellen Reglern?',
      a: '"Stil extrahieren" analysiert den Schreibstil einer beliebigen Webseite automatisch und ubersetzt ihn in Regler-Werte und optionale Zusatzinstruktionen. Die manuellen Regler erlauben die direkte, prazise Einstellung ohne Referenztext. Beides kann kombiniert werden: erst extrahieren, dann die Regler feinjustieren.'
    },
    {
      q: "Wird das Original der Seite wiederhergestellt wenn ich einen Rewrite ablehne?",
      a: "Ja. Im Diff-Overlay kannst du jeden Abschnitt einzeln akzeptieren oder verwerfen. Abgelehnte Abschnitte behalten den Originaltext. Ein komplettes Zurucksetzen (alle Rewrites verwerfen) ist derzeit noch nicht als eine-Klick-Aktion verfugbar, aber auf der Roadmap."
    },
    {
      q: "Wie melde ich einen Fehler oder schlage ein Feature vor?",
      a: "Bitte nutze den GitHub Issue Tracker des Projekts oder schreibe eine E-Mail an elias.klassen@offlimits-it.com."
    }
  ];
  head("1hnvmvd", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>FAQ - Tequalizer Dokumentation</title>`);
    });
  });
  $$renderer.push(`<article class="prose max-w-none"><h1>FAQ</h1> <p>Haufig gestellte Fragen zu Tequalizer.</p></article> <div class="mt-8 space-y-3"><!--[-->`);
  const each_array = ensure_array_like(faqs);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let faq = each_array[$$index];
    $$renderer.push(`<div class="collapse collapse-arrow bg-base-200 border border-base-300"><input type="checkbox"/> <div class="collapse-title font-medium text-sm">${escape_html(faq.q)}</div> <div class="collapse-content text-sm text-base-content/70"><p>${escape_html(faq.a)}</p></div></div>`);
  }
  $$renderer.push(`<!--]--></div> <div class="mt-10 p-4 bg-base-200 border border-base-300 rounded-lg text-sm">Noch Fragen? Schreib an <a href="mailto:elias.klassen@offlimits-it.com" class="link link-primary">elias.klassen@offlimits-it.com</a>.</div>`);
}
export {
  _page as default
};
