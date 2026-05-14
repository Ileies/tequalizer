export interface FewShotPair {
  original: string;
  rewritten: string;
}

export interface TemplateDimensions {
  length: -2 | -1 | 0 | 1 | 2;
  imagery: -2 | -1 | 0 | 1 | 2;
  warmth: -2 | -1 | 0 | 1 | 2;
  formality: -2 | -1 | 0 | 1 | 2;
  simplicity: -2 | -1 | 0 | 1 | 2;
}

export interface Template {
  label: string;
  description: string;
  systemPrompt: string;
  defaultDimensions: TemplateDimensions;
  fewShot: FewShotPair[];
}

export const TEMPLATES: Record<string, Template> = {
  ted_talk: {
    label: 'TED Talk',
    description:
      'TED-Talk-Stil: persönlicher Einstieg, eine starke These, konkrete Geschichten als Belege, Cliffhanger.',
    systemPrompt:
      'Schreibe im Stil eines TED Talks: Beginne mit einer persönlichen Anekdote oder einem überraschenden Fakt. Formuliere eine klare zentrale These. Stütze Argumente auf konkrete, lebendige Geschichten statt auf abstrakte Fakten. Erzeuge Spannung durch Cliffhanger und direkte Publikumsansprache.',
    defaultDimensions: { length: 1, imagery: 1, warmth: 1, formality: -1, simplicity: 1 },
    fewShot: [
      {
        original: 'Studien zeigen, dass Schlafmangel die kognitive Leistung beeinträchtigt.',
        rewritten:
          'Vor drei Jahren saß ich um 3 Uhr morgens vor einem Whiteboard und konnte mich nicht erinnern, was mein eigener Name war. Was mir niemand gesagt hatte: Schlafmangel zerstört das Gehirn buchstäblich.',
      },
      {
        original: 'Die Nutzung von Smartphones nimmt weltweit zu.',
        rewritten:
          'Stellen Sie sich vor: Jede Sekunde kaufen irgendwo auf der Welt fünf Menschen ihr erstes Smartphone. Das ist keine Statistik — das ist eine Revolution, die gerade in Ihren Händen stattfindet.',
      },
    ],
  },
  bible: {
    label: 'Bibel',
    description:
      'Bibel-Stil (Lutherbibel-Anmutung): parataktische Reihung mit "und", archaische Wendungen, sentenzenhaft.',
    systemPrompt:
      'Schreibe im Stil der Lutherbibel: Reihe Sätze parataktisch mit "Und" aneinander. Verwende archaische Wendungen wie "es geschah", "und er sprach", "in allen Landen". Formuliere sentenzenhaft und feierlich. Vermeide moderne Kolloquialismen.',
    defaultDimensions: { length: 0, imagery: 1, warmth: 0, formality: 1, simplicity: 0 },
    fewShot: [
      {
        original: 'Das Unternehmen wuchs und wurde erfolgreich.',
        rewritten:
          'Und es geschah, dass das Unternehmen wuchs und gedieh. Und seine Werke wurden bekannt in allen Landen.',
      },
    ],
  },
  personal_letter: {
    label: 'Brief',
    description:
      'Persönlicher Brief: direkt, herzlich, erzählerisch, als würde man einem guten Freund schreiben.',
    systemPrompt:
      'Schreibe wie in einem persönlichen Brief an einen guten Freund: Sprich den Leser direkt mit "du" an. Schildere Sachverhalte erzählerisch und aus eigener Perspektive. Zeige echte Emotion und Nähe. Kurze, natürliche Sätze. Kein Fachjargon.',
    defaultDimensions: { length: 0, imagery: 0, warmth: 2, formality: -1, simplicity: 1 },
    fewShot: [
      {
        original: 'Die Inflationsrate stieg im vergangenen Quartal auf 4,2 Prozent.',
        rewritten:
          'Du glaubst es kaum — ich war letzte Woche einkaufen und hab fast nicht hingeschaut, als die Kassiererin die Summe nannte. 4,2 Prozent Inflation, stell dir das mal vor. Das merkt man wirklich.',
      },
    ],
  },
  academic: {
    label: 'Akademisch',
    description:
      'Akademisch: Fachterminologie, passive Konstruktionen, distanzierter Stil, Quellenverweise impliziert.',
    systemPrompt:
      'Schreibe im akademischen Stil: Nutze Fachterminologie und Nominalisierungen. Bevorzuge Passivsätze und distanzierte Formulierungen ("es zeigt sich", "es lässt sich konstatieren"). Vermeide Ich-Perspektive und emotionale Wertungen. Impliziere Quellenangaben durch Formulierungen wie "Studien belegen" oder "empirische Befunde legen nahe".',
    defaultDimensions: { length: 0, imagery: -1, warmth: -1, formality: 2, simplicity: -1 },
    fewShot: [
      {
        original: 'Zu wenig Schlaf macht dich dumm.',
        rewritten:
          'Empirische Untersuchungen legen nahe, dass eine suboptimale Schlafdauer in signifikantem Zusammenhang mit kognitiven Leistungseinbußen steht.',
      },
    ],
  },
  tabloid: {
    label: 'Boulevard',
    description:
      'Boulevardstil: Ausrufezeichen, Dramatik, Übertreibungen, emotionale Sprache, kurze Sätze.',
    systemPrompt:
      'Schreibe im Boulevardstil: Kurze, knallige Sätze. Großbuchstaben für Schlüsselwörter. Ausrufezeichen. Dramatisierende Adjektive und Übertreibungen. Emotionale, alarmierende Sprache. Suggestive Fragen. Nichts ist gewöhnlich — alles ist sensationell oder bedrohlich.',
    defaultDimensions: { length: -1, imagery: 1, warmth: 1, formality: -1, simplicity: 2 },
    fewShot: [
      {
        original: 'Die Temperaturen sollen in dieser Woche etwas über dem Durchschnitt liegen.',
        rewritten: 'HITZEWELLE KOMMT! Experten warnen: Das wird der heißeste Sommer ALLER ZEITEN!',
      },
    ],
  },
};

export type TemplateId = 'none' | keyof typeof TEMPLATES;
