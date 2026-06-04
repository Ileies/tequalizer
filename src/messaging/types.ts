import type { Settings, StyleConfig } from '../storage/schema.ts';
import type { ExtractedStyle } from '../llm/styleExtractor.ts';

export type Message =
  | { type: 'REWRITE_TOKEN'; payload: { requestId: string; token: string } }
  | { type: 'REWRITE_ERROR'; payload: { requestId: string; error: string } }
  | { type: 'GET_SETTINGS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SAVE_STYLE'; payload: StyleConfig }
  | { type: 'DELETE_STYLE'; payload: { id: string } }
  | { type: 'TRIGGER_REWRITE'; payload: { styleId: string } }
  | { type: 'GET_PAGE_SAMPLES' }
  | { type: 'GET_SEGMENT_COUNT' }
  | { type: 'EXTRACT_STYLE'; payload: { text: string } }
  | { type: 'VALIDATE_API_KEY'; payload: { provider: Settings['provider']; key: string } }
  | {
      type: 'CHUNK_REWRITE_REQUEST';
      payload: {
        segments: Array<{
          text: string;
          localIndex: number;
          globalIndex: number;
          totalSegments: number;
        }>;
        styleId: string;
        requestId: string;
      };
    }
  | { type: 'CHUNK_REWRITE_DONE'; payload: { requestId: string } }
  | { type: 'GET_REWRITE_PROGRESS' }
  | { type: 'RESTORE_ALL' };

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
          : T extends { type: 'VALIDATE_API_KEY' }
            ? { ok: boolean; error?: string }
            : T extends { type: 'GET_REWRITE_PROGRESS' }
              ? { total: number; done: number; failed: number; running: boolean } | null
              : T extends { type: 'RESTORE_ALL' }
                ? void
                : void;
