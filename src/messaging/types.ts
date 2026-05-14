import type { Settings, StyleConfig } from '../storage/schema.ts';
import type { ExtractedStyle } from '../llm/styleExtractor.ts';

export interface FidelityIssue {
  severity: 'high' | 'medium' | 'low';
  type: 'invented_numbers' | 'dropped_quotes' | 'invented_names' | 'dropped_numbers';
  detail: string[];
}

export interface FidelityReport {
  issues: FidelityIssue[];
  passed: boolean;
}

export type Message =
  | { type: 'REWRITE_REQUEST'; payload: { text: string; styleId: string; requestId: string } }
  | { type: 'REWRITE_TOKEN'; payload: { requestId: string; token: string } }
  | {
      type: 'REWRITE_DONE';
      payload: { requestId: string; fullText: string; fidelity: FidelityReport };
    }
  | { type: 'REWRITE_ERROR'; payload: { requestId: string; error: string } }
  | { type: 'REWRITE_CANCEL'; payload: { requestId: string } }
  | { type: 'GET_SETTINGS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SAVE_STYLE'; payload: StyleConfig }
  | { type: 'DELETE_STYLE'; payload: { id: string } }
  | { type: 'TRIGGER_REWRITE'; payload: { styleId: string } }
  | { type: 'GET_PAGE_SAMPLES' }
  | { type: 'GET_SEGMENT_COUNT' }
  | { type: 'EXTRACT_STYLE'; payload: { text: string } };

export type MessageType = Message['type'];

export type ResponseFor<T extends Message> = T extends { type: 'GET_SETTINGS' }
  ? Settings
  : T extends { type: 'UPDATE_SETTINGS' }
    ? void
    : T extends { type: 'SAVE_STYLE' }
      ? void
      : T extends { type: 'DELETE_STYLE' }
        ? void
        : T extends { type: 'GET_PAGE_SAMPLES' }
          ? { text: string } | null
          : T extends { type: 'GET_SEGMENT_COUNT' }
            ? { count: number }
            : T extends { type: 'EXTRACT_STYLE' }
            ? ExtractedStyle | { error: string }
            : void;
