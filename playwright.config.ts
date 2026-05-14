import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['line']],
  fullyParallel: false,
  webServer: {
    command: 'bun tests/e2e/fixture-server.ts',
    port: 3456,
    reuseExistingServer: !process.env['CI'],
  },
});
