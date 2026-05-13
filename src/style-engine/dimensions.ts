export const DIMENSION_FRAGMENTS = {
  length: {
    '-1': 'Fasse maximal komprimiert. Entferne jedes nicht-essentielle Wort. Bevorzuge Hauptsätze.',
    '0': 'Behalte ungefähre Länge des Originals bei.',
    '+1': 'Schmücke aus mit Adjektiven, Nebensätzen und erläuternden Einschüben. Ziel: ~1.5× Original-Länge.',
  },
  imagery: {
    '-1': 'Strikt sachlich. Keine Metaphern, keine Vergleiche, keine bildhafte Sprache. Nur Fakten und logische Konnektoren.',
    '0': 'Sparsam mit Bildern, nur wo sie das Verständnis erleichtern.',
    '+1': 'Nutze konkrete, sinnliche Beispiele und Vergleiche. Mache Abstraktes greifbar durch Analogien.',
  },
  warmth: {
    '-1': 'Distanzierter, sachlicher Ton. Vermeide Wertungen und emotionale Sprache. Passivkonstruktionen wo angemessen.',
    '0': 'Neutraler Berichtston.',
    '+1': 'Warmer, persönlicher Ton. Direkte Ansprache erlaubt. Empathie für die Leserschaft zeigen.',
  },
  formality: {
    '-1': 'Locker, umgangssprachlich. Kurze Sätze, aktive Konstruktionen, gerne Ellipsen.',
    '0': 'Standard-Schriftsprache.',
    '+1': 'Formal und akademisch. Vollständige Syntax, Fachterminologie wo angemessen.',
  },
} as const;

type Dimension = keyof typeof DIMENSION_FRAGMENTS;
type Stage = '-1' | '0' | '+1';

function toStage(value: number): Stage {
  if (value < -0.33) return '-1';
  if (value > 0.33) return '+1';
  return '0';
}

export function dimensionToFragment(name: Dimension, value: number): string {
  return DIMENSION_FRAGMENTS[name][toStage(value)];
}

export const DIMENSION_LABELS: Record<Dimension, { min: string; max: string; label: string }> = {
  length: { label: 'Länge', min: 'Kompakt', max: 'Ausführlich' },
  imagery: { label: 'Bildhaftigkeit', min: 'Sachlich', max: 'Bildhaft' },
  warmth: { label: 'Wärme', min: 'Distanziert', max: 'Warm' },
  formality: { label: 'Formalität', min: 'Locker', max: 'Formal' },
};
