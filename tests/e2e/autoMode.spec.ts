import { test, expect, ARTICLE_URL, NON_ARTICLE_URL, enableAutoMode, setApiKey } from './fixtures.ts';

test('no banner on article page when auto-mode is disabled', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(ARTICLE_URL);
  await page.waitForTimeout(2000);

  await expect(page.locator('[data-rewrite-banner]')).not.toBeAttached();
  await page.close();
});

test('banner appears on article page when auto-mode is enabled', async ({
  context,
  extensionId,
}) => {
  await enableAutoMode(context, extensionId);

  const page = await context.newPage();
  await page.goto(ARTICLE_URL);

  await expect(page.locator('[data-rewrite-banner]')).toBeAttached({ timeout: 8000 });
  await page.close();
});

test('banner text shows rewritable segment count', async ({ context, extensionId }) => {
  await enableAutoMode(context, extensionId);

  const page = await context.newPage();
  await page.goto(ARTICLE_URL);

  const banner = page.locator('[data-rewrite-banner]');
  await expect(banner).toBeAttached({ timeout: 8000 });

  const text = await banner.textContent();
  expect(text).toMatch(/von \d+ Abschnitten/);

  const match = text?.match(/von (\d+) Abschnitten/);
  expect(Number(match?.[1])).toBeGreaterThan(0);
  await page.close();
});

test('no banner on non-article page even when auto-mode is enabled', async ({
  context,
  extensionId,
}) => {
  await enableAutoMode(context, extensionId);

  const page = await context.newPage();
  await page.goto(NON_ARTICLE_URL);
  await page.waitForTimeout(2000);

  await expect(page.locator('[data-rewrite-banner]')).not.toBeAttached();
  await page.close();
});

test('nav, header, footer and aside elements are never marked data-rewritten', async ({
  context,
  extensionId,
}) => {
  await enableAutoMode(context, extensionId);

  const page = await context.newPage();
  await page.goto(ARTICLE_URL);

  // Banner appears before any LLM call - wait for it
  await expect(page.locator('[data-rewrite-banner]')).toBeAttached({ timeout: 8000 });
  // Allow all segment attempts to finish (fail immediately without API key)
  await page.waitForTimeout(1000);

  const rewrittenInChrome = await page
    .locator(
      'nav [data-rewritten], header [data-rewritten], footer [data-rewritten], aside [data-rewritten]'
    )
    .count();
  expect(rewrittenInChrome).toBe(0);
  await page.close();
});

test('popup auto-mode toggle enables and disables auto-mode', async ({
  context,
  extensionId,
}) => {
  await setApiKey(context, extensionId);

  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

  const toggle = popupPage.locator('[aria-label="Auto-Modus"]');
  await expect(toggle).not.toBeChecked();

  await toggle.click();
  await expect(toggle).toBeChecked();

  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await popupPage.close();
});

test('(smoke) rewrite replaces body paragraphs but not nav elements', async ({
  context,
  extensionId,
}) => {
  test.skip(!process.env['OPENAI_API_KEY'], 'Requires OPENAI_API_KEY');

  await setApiKey(context, extensionId, process.env['OPENAI_API_KEY']!);
  await enableAutoMode(context, extensionId);

  const page = await context.newPage();
  await page.goto(ARTICLE_URL);

  // Wait for all segments to finish rewriting
  await page.waitForFunction(
    () => {
      const banner = document.querySelector('[data-rewrite-banner]');
      if (!banner) return false;
      const m = (banner.textContent ?? '').match(/(\d+) von (\d+)/);
      return m ? m[1] === m[2] : false;
    },
    { timeout: 60_000 }
  );

  const rewrittenParagraphs = await page
    .locator('#article-body p[data-rewritten="true"]')
    .count();
  expect(rewrittenParagraphs).toBeGreaterThan(0);

  const rewrittenNav = await page
    .locator(
      'nav [data-rewritten], header [data-rewritten], footer [data-rewritten], aside [data-rewritten]'
    )
    .count();
  expect(rewrittenNav).toBe(0);

  await page.close();
});
