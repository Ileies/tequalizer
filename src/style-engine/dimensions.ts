export const DIMENSION_FRAGMENTS = {
  length: {
    '-2': 'Fasse maximal komprimiert. Entferne jedes nicht-essentielle Wort. Bevorzuge Hauptsätze.',
    '-1': 'Kürze den Text spürbar, ohne wichtige Inhalte wegzulassen.',
    '0': 'Behalte ungefähre Länge des Originals bei.',
    '1': 'Ergänze erklärende Nebensätze und Adjektive. Etwas ausführlicher als das Original.',
    '2': 'Schmücke stark aus mit Adjektiven, Nebensätzen und erläuternden Einschüben. Ziel: ~1.5× Original-Länge.',
  },
  imagery: {
    '-2': 'Strikt sachlich. Keine Metaphern, keine Vergleiche, keine bildhafte Sprache. Nur Fakten und logische Konnektoren.',
    '-1': 'Minimal bildhafte Sprache, nur wo unvermeidlich.',
    '0': 'Sparsam mit Bildern, nur wo sie das Verständnis erleichtern.',
    '1': 'Gelegentliche Metaphern und Vergleiche zur Veranschaulichung.',
    '2': 'Nutze konkrete, sinnliche Beispiele und Vergleiche. Mache Abstraktes greifbar durch Analogien.',
  },
  warmth: {
    '-2': 'Distanzierter, sachlicher Ton. Vermeide Wertungen und emotionale Sprache. Passivkonstruktionen wo angemessen.',
    '-1': 'Leicht zurückhaltender Ton, kaum emotionale Sprache.',
    '0': 'Neutraler Berichtston.',
    '1': 'Leicht persönlicher, einladender Ton.',
    '2': 'Warmer, persönlicher Ton. Direkte Ansprache erlaubt. Empathie für die Leserschaft zeigen.',
  },
  formality: {
    '-2': 'Locker, umgangssprachlich. Kurze Sätze, aktive Konstruktionen, gerne Ellipsen.',
    '-1': 'Entspannte Schriftsprache, leicht informell.',
    '0': 'Standard-Schriftsprache.',
    '1': 'Etwas gehobener Stil, vollständige Sätze, wenig Umgangssprache.',
    '2': 'Formal und akademisch. Vollständige Syntax, Fachterminologie wo angemessen.',
  },
  simplicity: {
    '-2': 'Verwende Fachbegriffe, komplexe Satzstrukturen und präzise Terminologie. Setze Vorwissen voraus.',
    '-1': 'Leicht gehobene Sprache, Fachbegriffe erlaubt ohne Erklärung.',
    '0': 'Behalte das sprachliche Niveau des Originals bei.',
    '1': 'Vereinfache etwas: kürzere Sätze, erkläre Fachbegriffe kurz.',
    '2': 'Vereinfache radikal: kurze Sätze, Alltagssprache, erkläre Fachbegriffe, keine Fremdwörter. Ziel: für jeden verständlich.',
  },
} as const;

type Dimension = keyof typeof DIMENSION_FRAGMENTS;
type Stage = '-2' | '-1' | '0' | '1' | '2';

function toStage(value: number): Stage {
  const clamped = Math.max(-2, Math.min(2, Math.round(value))) as -2 | -1 | 0 | 1 | 2;
  return String(clamped) as Stage;
}

export function dimensionToFragment(name: Dimension, value: number): string {
  return DIMENSION_FRAGMENTS[name][toStage(value)];
}

export const DIMENSION_LABELS: Record<Dimension, { min: string; max: string; label: string }> = {
  length: { label: 'Länge', min: 'Kompakt', max: 'Ausführlich' },
  imagery: { label: 'Bildhaftigkeit', min: 'Sachlich', max: 'Bildhaft' },
  warmth: { label: 'Wärme', min: 'Distanziert', max: 'Warm' },
  formality: { label: 'Formalität', min: 'Locker', max: 'Formal' },
  simplicity: { label: 'Einfachheit', min: 'Komplex', max: 'Einfach' },
};
