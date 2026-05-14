import { test, expect, ARTICLE_URL } from './fixtures.ts';

test('popup renders title and navigation', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.locator('text=Tequalizer')).toBeVisible();
  await expect(page.locator('#style-select')).toBeVisible();
  await expect(page.locator('text=Aktuelle Seite umformulieren')).toBeVisible();
  await expect(page.locator('text=Stil extrahieren')).toBeVisible();
  await page.close();
});

test('popup style selector is populated with built-in styles', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const select = page.locator('#style-select');
  await expect(select).toBeVisible();

  const count = await select.locator('option').count();
  expect(count).toBeGreaterThanOrEqual(6); // Neutral + 5 preset styles

  await page.close();
});

test('popup renders four style sliders', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const sliders = page.locator('input[type="range"]');
  await expect(sliders).toHaveCount(4);
  await page.close();
});

test('popup has auto-mode and bekanntes-wissen toggles', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.getByRole('button', { name: 'Auto-Modus' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bekanntes Wissen' })).toBeVisible();
  await page.close();
});

test('popup settings button is present', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.locator('button[title="Einstellungen"]')).toBeVisible();
  await page.close();
});

test('trigger rewrite sends message to content script and shows banner', async ({
  context,
  extensionId,
}) => {
  test.skip(!process.env['OPENAI_API_KEY'], 'Requires OPENAI_API_KEY');

  // Set API key in storage via options page
  const optionsPage = await context.newPage();
  await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
  await optionsPage.locator('input[type="password"], input[placeholder*="sk-"]').fill(
    process.env['OPENAI_API_KEY']!
  );
  await optionsPage.locator('button:has-text("Speichern"), button:has-text("Validieren")').first().click();
  await optionsPage.waitForTimeout(500);
  await optionsPage.close();

  // Navigate to article page — content script must be loaded
  const articlePage = await context.newPage();
  await articlePage.goto(ARTICLE_URL);
  await articlePage.waitForLoadState('networkidle');

  // Open popup and trigger rewrite
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
  await popupPage.locator('text=Aktuelle Seite umformulieren').click();
  await popupPage.waitForTimeout(300);
  await popupPage.close();

  // Banner should appear on article page
  await expect(articlePage.locator('[data-rewrite-banner]')).toBeAttached({ timeout: 5000 });
  await articlePage.close();
});
