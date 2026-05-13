import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  // Phase 9: Firefox auf MV3 umstellen (wxt build -b firefox mit manifestVersion: 3)
  suppressWarnings: { firefoxDataCollection: true },
  manifest: {
    name: 'Rewrite — Texte in deinem Stil',
    description: 'Formuliert Artikel und Blogeinträge in deinen bevorzugten Stil um.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>', 'https://api.openai.com/*'],
  },
});
