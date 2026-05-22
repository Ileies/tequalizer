import type { StyleConfig, Settings } from '../storage/schema.ts';
import { dimensionToFragment } from '../style-engine/dimensions.ts';

const SYSTEM_RULES = `Du formulierst Texte um. Absolute Regeln, die NIE verletzt werden dürfen:
1. Erfinde keine Fakten, Zahlen, Namen, Daten, Zitate. Wenn das Original etwas nicht enthält, darfst du es nicht hinzufügen.
2. Entferne keine inhaltlichen Behauptungen des Originals, außer der Nutzer hat das explizit erlaubt.
3. Behalte die logische Struktur und die Reihenfolge der Argumente bei.
4. Antworte AUSSCHLIESSLICH mit dem umformulierten Text. Kein Vorspann, kein Nachspann, keine Erklärungen.
5. Behalte die Sprache des Originaltexts bei. Übersetze nicht, außer die Stilanweisungen verlangen das explizit. Keine archaischen oder veralteten Ausdrucksweisen als ungewollter Nebeneffekt von Formalität.`;

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export interface ChunkSegmentInfo {
  text: string;
  localIndex: number;
  globalIndex: number;
  totalSegments: number;
}

function buildStyleParts(style: StyleConfig, settings: Settings): string[] {
  const parts: string[] = ['Stilvorgaben:'];
  parts.push(dimensionToFragment('length', style.dimensions.length));
  parts.push(dimensionToFragment('imagery', style.dimensions.imagery));
  parts.push(dimensionToFragment('warmth', style.dimensions.warmth));
  parts.push(dimensionToFragment('formality', style.dimensions.formality));
  parts.push(dimensionToFragment('simplicity', style.dimensions.simplicity));

  if (style.customInstructions) {
    parts.push('');
    parts.push(`Weitere Stilanweisungen: ${style.customInstructions}`);
  }

  if (settings.knownKnowledge.enabled && settings.knownKnowledge.profileText) {
    parts.push('');
    parts.push('Der Leser kennt bereits Folgendes und braucht dafür keine Erklärungen mehr:');
    parts.push(settings.knownKnowledge.profileText);
    parts.push('Lasse entsprechende Erklärungen weg, aber entferne keine neuen Informationen.');
  }

  return parts;
}

export function buildPrompt(
  originalText: string,
  style: StyleConfig,
  settings: Settings
): BuiltPrompt {
  const parts: string[] = [SYSTEM_RULES, '', ...buildStyleParts(style, settings)];
  return { systemPrompt: parts.join('\n'), userPrompt: originalText };
}

function positionLabel(globalIndex: number, total: number): string {
  if (globalIndex === 0) return 'Einleitung';
  if (globalIndex === total - 1) return 'Abschluss';
  const third = total / 3;
  if (globalIndex < third) return 'früher Mittelteil';
  if (globalIndex >= 2 * third) return 'später Mittelteil';
  return 'Mittelteil';
}

export function buildChunkPrompt(
  segments: ChunkSegmentInfo[],
  style: StyleConfig,
  settings: Settings
): BuiltPrompt {
  const parts: string[] = [SYSTEM_RULES, '', ...buildStyleParts(style, settings)];

  parts.push('');
  parts.push(
    'Ausgabe-Format: Du erhältst mehrere Absätze, jeweils eingeleitet durch <<<S:N>>>. ' +
      'Gib jeden Absatz umformuliert zurück, eingeleitet durch den exakt gleichen unveränderten Marker, ' +
      'gefolgt von einem Zeilenumbruch und dem umformulierten Text. ' +
      'Beginne sofort mit <<<S:0>>>. Kein Vortext, keine Erklärungen, keine zusätzlichen Markierungen.'
  );
  parts.push('');
  parts.push('Absatz-Positionen im Gesamtdokument (beeinflusst Stil und Aufbau, ändert keinen Inhalt):');
  for (const seg of segments) {
    parts.push(
      `  <<<S:${seg.localIndex}>>> = Absatz ${seg.globalIndex + 1} von ${seg.totalSegments} (${positionLabel(seg.globalIndex, seg.totalSegments)})`
    );
  }

  const userPrompt = segments.map((seg) => `<<<S:${seg.localIndex}>>>\n${seg.text}`).join('\n\n');

  return { systemPrompt: parts.join('\n'), userPrompt };
}
