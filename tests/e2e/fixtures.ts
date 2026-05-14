import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { execFileSync } from 'child_process';
import { mkdtemp } from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.resolve(__dirname, '..', '..', '.output', 'chrome-mv3');

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

async function getExtensionId(context: BrowserContext): Promise<string> {
  // Try service worker list first (fast path)
  const sw = context.serviceWorkers()[0];
  if (sw) return new URL(sw.url()).hostname;

  // Use CDP to enumerate all targets, including extension service workers
  const page = await context.newPage();
  try {
    await page.goto('about:blank');
    const client = await context.newCDPSession(page);
    const { targetInfos } = await client.send('Target.getTargets');
    const swTarget = targetInfos.find(
      (t: { type: string; url: string }) =>
        t.type === 'service_worker' && t.url.startsWith('chrome-extension://')
    );
    if (swTarget) return new URL(swTarget.url).hostname;

    // Fall back to Playwright's service worker event (slower but reliable)
    const swEvent = await context.waitForEvent('serviceworker', { timeout: 15_000 });
    return new URL(swEvent.url()).hostname;
  } finally {
    await page.close();
  }
}

export const test = base.extend<ExtensionFixtures>({
  context: [
    async ({}, use) => {
      const dir = await mkdtemp(path.join(os.tmpdir(), 'pw-ext-'));
      const ctx = await chromium.launchPersistentContext(dir, {
        executablePath: CHROME_EXECUTABLE,
        headless: false,
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
    async ({ context }, use) => {
      const id = await getExtensionId(context);
      await use(id);
    },
    { scope: 'test' },
  ],
});

export { expect } from '@playwright/test';

export const ARTICLE_URL = 'http://localhost:3456/article.html';
export const NON_ARTICLE_URL = 'http://localhost:3456/non-article.html';

export async function enableAutoMode(context: BrowserContext, extensionId: string): Promise<void> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await page.getByRole('button', { name: 'Auto-Modus' }).click();
  await page.getByRole('button', { name: 'Auto-Modus aktivieren' }).click();
  await page.waitForTimeout(300);
  await page.close();
}
