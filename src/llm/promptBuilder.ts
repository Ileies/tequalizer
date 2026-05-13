import type { StyleConfig, Settings } from '../storage/schema.ts';
import { dimensionToFragment } from '../style-engine/dimensions.ts';
import { TEMPLATES } from '../style-engine/presets.ts';

const SYSTEM_RULES = `Du formulierst Texte um. Absolute Regeln, die NIE verletzt werden dürfen:
1. Erfinde keine Fakten, Zahlen, Namen, Daten, Zitate. Wenn das Original etwas nicht enthält, darfst du es nicht hinzufügen.
2. Entferne keine inhaltlichen Behauptungen des Originals, außer der Nutzer hat das explizit erlaubt.
3. Behalte die logische Struktur und die Reihenfolge der Argumente bei.
4. Antworte AUSSCHLIESSLICH mit dem umformulierten Text. Kein Vorspann, kein Nachspann, keine Erklärungen.`;

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function buildPrompt(
  originalText: string,
  style: StyleConfig,
  settings: Settings
): BuiltPrompt {
  const parts: string[] = [SYSTEM_RULES, '', 'Stilvorgaben:'];

  parts.push(dimensionToFragment('length', style.dimensions.length));
  parts.push(dimensionToFragment('imagery', style.dimensions.imagery));
  parts.push(dimensionToFragment('warmth', style.dimensions.warmth));
  parts.push(dimensionToFragment('formality', style.dimensions.formality));

  if (style.template !== 'none') {
    const tmpl = TEMPLATES[style.template];
    if (tmpl) {
      parts.push('');
      parts.push(`Schreibstil-Vorbild: ${tmpl.description}`);
      if (tmpl.fewShot.length > 0) {
        parts.push('Hier Beispiele, wie Original-Sätze in diesem Stil aussehen:');
        for (const pair of tmpl.fewShot) {
          parts.push(`Original: "${pair.original}"`);
          parts.push(`Umformuliert: "${pair.rewritten}"`);
        }
      }
    }
  }

  if (style.customInstructions) {
    parts.push('');
    parts.push(`Zusätzliche Nutzerwünsche: ${style.customInstructions}`);
  }

  if (settings.knownKnowledge.enabled && settings.knownKnowledge.profileText) {
    parts.push('');
    parts.push(
      'Der Leser kennt bereits Folgendes und braucht dafür keine Erklärungen mehr:'
    );
    parts.push(settings.knownKnowledge.profileText);
    parts.push(
      'Lasse entsprechende Erklärungen weg, aber entferne keine neuen Informationen.'
    );
  }

  return {
    systemPrompt: parts.join('\n'),
    userPrompt: originalText,
  };
}
