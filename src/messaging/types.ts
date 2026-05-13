import type { Settings, StyleConfig } from '../storage/schema.ts';

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
  | { type: 'DELETE_STYLE'; payload: { id: string } };

export type MessageType = Message['type'];

export type ResponseFor<T extends Message> = T extends { type: 'GET_SETTINGS' }
  ? Settings
  : T extends { type: 'UPDATE_SETTINGS' }
    ? void
    : T extends { type: 'SAVE_STYLE' }
      ? void
      : T extends { type: 'DELETE_STYLE' }
        ? void
        : void;
