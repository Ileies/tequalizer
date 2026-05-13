export interface FewShotPair {
  original: string;
  rewritten: string;
}

export interface Template {
  description: string;
  fewShot: FewShotPair[];
}

export const TEMPLATES: Record<string, Template> = {
  ted_talk: {
    description:
      'TED-Talk-Stil: persönlicher Einstieg, eine starke These, konkrete Geschichten als Belege, Cliffhanger.',
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
    description:
      'Bibel-Stil (Lutherbibel-Anmutung): parataktische Reihung mit "und", archaische Wendungen, sentenzenhaft.',
    fewShot: [
      {
        original: 'Das Unternehmen wuchs und wurde erfolgreich.',
        rewritten:
          'Und es geschah, dass das Unternehmen wuchs und gedieh. Und seine Werke wurden bekannt in allen Landen.',
      },
    ],
  },
  personal_letter: {
    description:
      'Persönlicher Brief: direkt, herzlich, erzählerisch, als würde man einem guten Freund schreiben.',
    fewShot: [
      {
        original: 'Die Inflationsrate stieg im vergangenen Quartal auf 4,2 Prozent.',
        rewritten:
          'Du glaubst es kaum — ich war letzte Woche einkaufen und hab fast nicht hingeschaut, als die Kassiererin die Summe nannte. 4,2 Prozent Inflation, stell dir das mal vor. Das merkt man wirklich.',
      },
    ],
  },
  academic: {
    description:
      'Akademisch: Fachterminologie, passive Konstruktionen, distanzierter Stil, Quellenverweise impliziert.',
    fewShot: [
      {
        original: 'Zu wenig Schlaf macht dich dumm.',
        rewritten:
          'Empirische Untersuchungen legen nahe, dass eine suboptimale Schlafdauer in signifikantem Zusammenhang mit kognitiven Leistungseinbußen steht.',
      },
    ],
  },
  tabloid: {
    description:
      'Boulevardstil: Ausrufezeichen, Dramatik, Übertreibungen, emotionale Sprache, kurze Sätze.',
    fewShot: [
      {
        original: 'Die Temperaturen sollen in dieser Woche etwas über dem Durchschnitt liegen.',
        rewritten: 'HITZEWELLE KOMMT! Experten warnen: Das wird der heißeste Sommer ALLER ZEITEN!',
      },
    ],
  },
};

export type TemplateId = 'none' | keyof typeof TEMPLATES;
