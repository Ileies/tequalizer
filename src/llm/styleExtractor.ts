import type { StyleConfig } from '../storage/schema.ts';

export interface ExtractedStyle {
  dimensions: StyleConfig['dimensions'];
  customInstructions: string;
}

const EXTRACTION_SYSTEM_PROMPT = `Du analysierst den Schreibstil eines Textes.
Gib AUSSCHLIESSLICH ein JSON-Objekt zurück – kein Markdown, kein Vorspann, kein Nachspann.

Format:
{"dimensions":{"length":<int>,"imagery":<int>,"warmth":<int>,"formality":<int>,"simplicity":<int>},"customInstructions":"<string>"}

Skala (ganzzahlig, -2 bis +2):
- length: -2=extrem kompakt  -1=knapp  0=neutral  +1=ausführlicher  +2=sehr ausführlich
- imagery: -2=rein sachlich  -1=kaum Bilder  0=neutral  +1=gelegentliche Metaphern  +2=sehr bildhaft
- warmth: -2=kalt/distanziert  -1=zurückhaltend  0=neutral  +1=persönlicher  +2=warm/empathisch
- formality: -2=umgangssprachlich  -1=locker  0=Standardsprache  +1=gehoben  +2=akademisch
- simplicity: -2=komplex/Fachsprache  -1=etwas gehoben  0=neutral  +1=vereinfacht  +2=sehr einfach

customInstructions: 1-2 Sätze auf Deutsch über markante Stilmerkmale, die obige Dimensionen nicht abdecken (Satzrhythmus, Struktur, typische Formulierungen). Max 300 Zeichen.`;

export function buildExtractionPrompt(text: string): { systemPrompt: string; userPrompt: string } {
  return { systemPrompt: EXTRACTION_SYSTEM_PROMPT, userPrompt: text };
}

export function parseExtractedStyle(raw: string): ExtractedStyle | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as {
      dimensions: Record<string, unknown>;
      customInstructions: unknown;
    };
    const d = parsed.dimensions;
    if (!d || typeof d !== 'object') return null;
    const clamp = (v: unknown): -2 | -1 | 0 | 1 | 2 =>
      (Math.max(-2, Math.min(2, Math.round(Number(v)))) as -2 | -1 | 0 | 1 | 2);
    return {
      dimensions: {
        length: clamp(d['length']),
        imagery: clamp(d['imagery']),
        warmth: clamp(d['warmth']),
        formality: clamp(d['formality']),
        simplicity: clamp(d['simplicity']),
      },
      customInstructions:
        typeof parsed.customInstructions === 'string'
          ? parsed.customInstructions.slice(0, 300)
          : '',
    };
  } catch {
    return null;
  }
}
