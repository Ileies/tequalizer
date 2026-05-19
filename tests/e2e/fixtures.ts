import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import { execFileSync } from 'child_process';
import { mkdtemp } from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.resolve(__dirname, '..', '..', '.output', 'chrome-mv3');

// Deterministic ID derived from the RSA key in wxt.config.ts (browser=chrome manifest)
const EXTENSION_ID = 'dacmoahoccbmibcpjbnoiodapkogiaji';

function findChrome(): string | undefined {
  const fromEnv = process.env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH'];
  if (fromEnv) return fromEnv;
  for (const name of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [name], { stdio: ['pipe', 'pipe', 'pipe'] })
        .toString()
        .trim();
    } catch { /* not found */ }
  }
  return undefined;
}

const CHROME_EXECUTABLE = findChrome();

interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
}

export const test = base.extend<ExtensionFixtures>({
  context: [
    async ({}, use) => {
      const dir = await mkdtemp(path.join(os.tmpdir(), 'pw-ext-'));
      const ctx = await chromium.launchPersistentContext(dir, {
        executablePath: CHROME_EXECUTABLE,
        headless: false,
        // Prevent Playwright's default --disable-extensions from blocking our extension
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`,
          '--no-first-run',
          '--no-default-browser-check',
        ],
      });
      await use(ctx);
      await ctx.close();
    },
    { scope: 'test' },
  ],

  extensionId: [
    async ({}, use) => {
      await use(EXTENSION_ID);
    },
    { scope: 'test' },
  ],
});

export { expect } from '@playwright/test';

export const ARTICLE_URL = 'http://localhost:3456/article.html';
export const NON_ARTICLE_URL = 'http://localhost:3456/non-article.html';

/** Sets a fake API key via the popup's inline input so the main popup UI becomes visible. */
export async function setApiKey(
  context: BrowserContext,
  extensionId: string,
  key = 'sk-test-placeholder'
): Promise<void> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.locator('#popup-key-input').fill(key);
  await page.getByRole('button', { name: 'Speichern' }).click();
  // Wait for main UI to appear (style-select is hidden when unconfigured)
  await page.locator('#style-select').waitFor({ timeout: 5000 });
  await page.close();
}

/** Enables auto-mode via the options page Auto-Modus tab. */
export async function enableAutoMode(context: BrowserContext, extensionId: string): Promise<void> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  // Tab navigation buttons have role="tab"
  await page.getByRole('tab', { name: 'Auto-Modus' }).click();
  // ToggleSwitch renders as <button aria-label="Auto-Modus aktivieren">
  await page.getByRole('button', { name: 'Auto-Modus aktivieren' }).click();
  await page.waitForTimeout(300);
  await page.close();
}

/** Clicks a tab in the options page sidebar. */
export async function openOptionsTab(page: Page, tabName: string): Promise<void> {
  await page.getByRole('tab', { name: tabName }).click();
}
