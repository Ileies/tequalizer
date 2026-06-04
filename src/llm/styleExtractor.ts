import { z } from 'zod';
import { StyleConfig } from '../storage/schema.ts';

export const ExtractedStyle = z.object({
  dimensions: StyleConfig.shape.dimensions,
  customInstructions: z.string(),
});

export type ExtractedStyle = z.infer<typeof ExtractedStyle>;

const EXTRACTION_SYSTEM_PROMPT = `Du analysierst den Schreibstil eines Textes und leitest daraus konkrete Schreibanweisungen ab.
Gib AUSSCHLIESSLICH ein JSON-Objekt zurück – kein Markdown, kein Vorspann, kein Nachspann.

Format:
{"dimensions":{"length":<int>,"imagery":<int>,"warmth":<int>,"formality":<int>,"simplicity":<int>},"customInstructions":"<string>"}

Skala (ganzzahlig, -2 bis +2):
- length: -2=extrem kompakt  -1=knapp  0=neutral  +1=ausführlicher  +2=sehr ausführlich
- imagery: -2=rein sachlich  -1=kaum Bilder  0=neutral  +1=gelegentliche Metaphern  +2=sehr bildhaft
- warmth: -2=kalt/distanziert  -1=zurückhaltend  0=neutral  +1=persönlicher  +2=warm/empathisch
- formality: -2=umgangssprachlich  -1=locker  0=Standardsprache  +1=gehoben  +2=akademisch
- simplicity: -2=komplex/Fachsprache  -1=etwas gehoben  0=neutral  +1=vereinfacht  +2=sehr einfach

customInstructions: Beschreibe alle Stilmerkmale, die durch die fünf Dimensionen NICHT erfasst werden. Analysiere diese Kategorien und schreibe nur, was wirklich charakteristisch für diesen konkreten Text ist:

1. PERSPEKTIVE & STIMME: Welche grammatische Person wird verwendet (1./3. Person, unpersönlich)? Wird der Leser direkt angesprochen? Gibt es ein „Ich" oder „Wir"?
2. SATZMUSTER: Gibt es wiederkehrende Satzformeln (z.B. „X ist ein…" als Definitionsformel, „Als X bezeichnet man…", rhetorische Fragen)? Aktiv oder Passiv dominant?
3. ABSATZ- & TEXTSTRUKTUR: Wie beginnen Absätze? Thematischer Leitsatz zuerst? Wie wird von Punkt zu Punkt übergeleitet?
4. RHYTHMUS & INTERPUNKTION: Auffällige Satzlängen-Variation, Einschübe, Aufzählungen, ungewöhnliche Zeichensetzung?
5. SONSTIGE EIGENHEITEN: Dialektfärbung, Wiederholungsstrukturen, Zitierweise, Umgang mit Zahlen/Daten?

Die customInstructions werden direkt als Schreibanweisung an ein LLM weitergegeben, das einen anderen Text im extrahierten Stil umformuliert. Formuliere sie daher als umsetzbare Anweisungen (nicht als Beschreibung). Schreibe auf Deutsch. Wenn keine Besonderheiten vorhanden: "". Sonst: max. 700 Zeichen.`;

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
          ? parsed.customInstructions.slice(0, 700)
          : '',
    };
  } catch {
    return null;
  }
}
