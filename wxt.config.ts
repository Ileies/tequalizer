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
    // Deterministic extension ID for E2E tests (Chrome only; Firefox ignores key field)
    ...(browser === 'chrome'
      ? {
          key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApNM5cigTqIIYUvxzfe0yvP0cgMFlGBLL+eYm7xmbRathPnejQtkZRNjgoLlS7PCHEf/U1jiX3wGFtXK2PtSOIklZtKwPmknigyFsDF/fQz661IAWCAUKJZuqqgxJe4nc0MoHMsY7DilJNdYzL8zd8M8kwiQW9At9Sw0B+JKqwZW2PTvhgzYg8ephTr9YTpD+GXLOMKnIkUE9myrprTsUgrNOt9pD1Q9TK7krg/xS0pUTjbPAD53M3i5n10RuwYvR2mAXqnG4FBxMxLa76xGjrDycYjBjGeJ8SRn7LxyPOz7U1wuuugBatYX06T4QupO6yapazs6rxV1LJiZ3GzI9UwIDAQAB',
        }
      : {}),
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
