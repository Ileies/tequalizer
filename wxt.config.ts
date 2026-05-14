import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifestVersion: 3,
  suppressWarnings: { firefoxDataCollection: true },
  manifest: ({ browser }) => ({
    name: 'Tequalizer — Texte in deinem Stil',
    description: 'Formuliert Artikel und Blogeinträge in deinen bevorzugten Stil um.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>', 'https://api.openai.com/*'],
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'rewrite@ileies.dev',
              strict_min_version: '128.0',
            },
          },
        }
      : {}),
  }),
});
