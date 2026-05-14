import { z } from 'zod';
import { TEMPLATES } from '../style-engine/presets.ts';

export const StyleConfig = z.object({
  id: z.string().uuid(),
  name: z.string(),
  builtIn: z.boolean(),
  dimensions: z.object({
    length: z.number().int().min(-2).max(2),
    imagery: z.number().int().min(-2).max(2),
    warmth: z.number().int().min(-2).max(2),
    formality: z.number().int().min(-2).max(2),
    simplicity: z.number().int().min(-2).max(2),
  }),
  template: z
    .enum(['none', 'ted_talk', 'bible', 'personal_letter', 'academic', 'tabloid'])
    .default('none'),
  customInstructions: z.string().max(2000).optional(),
});

export type StyleConfig = z.infer<typeof StyleConfig>;

export const Settings = z.object({
  provider: z.enum(['openai', 'claude', 'ollama']).default('openai'),
  apiKeys: z.object({
    openai: z.string().optional(),
    claude: z.string().optional(),
  }),
  ollamaEndpoint: z.string().url().optional(),
  ollamaModel: z.string().optional(),
  openaiModel: z
    .enum(['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-5.4-mini'])
    .default('gpt-4.1-mini'),
  activeStyleId: z.string().uuid(),
  autoRewrite: z.object({
    enabled: z.boolean().default(false),
    minWordCount: z.number().default(50),
    excludeDomains: z.array(z.string()).default([]),
  }),
  knownKnowledge: z.object({
    enabled: z.boolean().default(false),
    profileText: z.string().default(''),
  }),
});

export type Settings = z.infer<typeof Settings>;

export const StoredState = z.object({
  settings: Settings,
  styleLibrary: z.array(StyleConfig),
  schemaVersion: z.number(),
});

export type StoredState = z.infer<typeof StoredState>;

export const DEFAULT_STYLE_ID = '00000000-0000-0000-0000-000000000001';

export const DEFAULT_STYLE: StyleConfig = {
  id: DEFAULT_STYLE_ID,
  name: 'Neutral',
  builtIn: true,
  dimensions: { length: 0, imagery: 0, warmth: 0, formality: 0, simplicity: 0 },
  template: 'none',
};

const PRESET_STYLE_IDS: Record<string, string> = {
  ted_talk: '00000000-0000-0000-0000-000000000002',
  bible: '00000000-0000-0000-0000-000000000003',
  personal_letter: '00000000-0000-0000-0000-000000000004',
  academic: '00000000-0000-0000-0000-000000000005',
  tabloid: '00000000-0000-0000-0000-000000000006',
};

export const PRESET_STYLES: StyleConfig[] = Object.entries(TEMPLATES).map(([key, tmpl]) => ({
  id: PRESET_STYLE_IDS[key]!,
  name: tmpl.label,
  builtIn: true,
  dimensions: tmpl.defaultDimensions,
  template: key as StyleConfig['template'],
}));

export const INITIAL_STATE: StoredState = {
  settings: {
    provider: 'openai',
    apiKeys: {},
    openaiModel: 'gpt-4.1-mini',
    activeStyleId: DEFAULT_STYLE_ID,
    autoRewrite: { enabled: false, minWordCount: 50, excludeDomains: [] },
    knownKnowledge: { enabled: false, profileText: '' },
  },
  styleLibrary: [DEFAULT_STYLE, ...PRESET_STYLES],
  schemaVersion: 3,
};
