import { z } from 'zod';

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
    minWordCount: z.number().min(0).default(50),
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
  customInstructions:
    'Schreibe unabhängig vom Stil des Eingabetexts in einem einheitlichen, klaren Standarddeutsch. Keine stilistischen Eigenheiten, keinen Jargon und keine Ausschmückungen des Originals übernehmen.',
};

export const PRESET_STYLES: StyleConfig[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'TED Talk',
    builtIn: true,
    dimensions: { length: 1, imagery: 1, warmth: 1, formality: -1, simplicity: 1 },
    customInstructions: 'Fessle vom ersten Satz mit einer persönlichen Anekdote oder überraschenden Frage. Sprich den Leser direkt an. Baue eine emotionale Reise auf: Spannung, Wendepunkt, Auflösung. Schließe mit einem klaren Appell oder einer unvergesslichen Botschaft.',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Bibel',
    builtIn: true,
    dimensions: { length: 0, imagery: 1, warmth: 0, formality: 1, simplicity: 0 },
    customInstructions: 'Nutze rhythmische Parallelstrukturen und bedeutungsvolle Wiederholungen. Formuliere in überzeitlichen, universellen Begriffen. Lass kurze, kraftvolle Aussagesätze mit feierlichen längeren Perioden wechseln.',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Brief',
    builtIn: true,
    dimensions: { length: 0, imagery: 0, warmth: 2, formality: -1, simplicity: 1 },
    customInstructions: 'Schreibe wie an einen guten Freund oder Vertrauten. Nutze direkte, warme Ansprache. Teile Gedanken wie in einem echten Gespräch mit. Auch bei ernsten Themen bleibt der Ton leicht und herzlich.',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Akademisch',
    builtIn: true,
    dimensions: { length: 0, imagery: -1, warmth: -1, formality: 2, simplicity: -1 },
    customInstructions: 'Formuliere objektiv und distanziert. Gliedere Argumente klar und nachvollziehbar. Meide Umgangssprache, subjektive Wertungen und rhetorische Fragen ohne analytische Funktion.',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Boulevard',
    builtIn: true,
    dimensions: { length: -1, imagery: 1, warmth: 1, formality: -1, simplicity: 2 },
    customInstructions: 'Kurze Knallsätze. Dramatisiere und setze auf Überraschungsmomente. Nutze direkte Rede und aktive, starke Verben. Jeder Absatz muss weiterziehen. Ausrufe erlaubt!',
  },
];

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
  schemaVersion: 6,
};
