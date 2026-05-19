import { test, expect, ARTICLE_URL, setApiKey } from './fixtures.ts';

test('popup shows api-key prompt when unconfigured', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.locator('text=Tequalizer')).toBeVisible();
  // Without API key, shows the setup alert
  await expect(page.locator('[role="alert"]')).toBeVisible();
  await expect(page.locator('#popup-key-input')).toBeVisible();
  await expect(page.locator('button[title="Einstellungen"]')).toBeVisible();
  await page.close();
});

test('popup shows main ui after api key is saved', async ({ context, extensionId }) => {
  await setApiKey(context, extensionId);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.locator('#style-select')).toBeVisible();
  await expect(page.getByRole('button', { name: /Seite umformulieren/ })).toBeVisible();
  await expect(page.locator('text=Stil extrahieren')).toBeVisible();
  await page.close();
});

test('popup style selector is populated with built-in styles', async ({
  context,
  extensionId,
}) => {
  await setApiKey(context, extensionId);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const select = page.locator('#style-select');
  await expect(select).toBeVisible();

  const count = await select.locator('option').count();
  // Neutral + 5 template presets = 6 built-in styles
  expect(count).toBeGreaterThanOrEqual(6);
  await page.close();
});

test('popup renders five style sliders', async ({ context, extensionId }) => {
  await setApiKey(context, extensionId);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  // Five dimensions: length, imagery, warmth, formality, simplicity
  await expect(page.locator('input[type="range"]')).toHaveCount(5);
  await page.close();
});

test('popup has toggle switches for auto-mode and bekanntes-wissen', async ({
  context,
  extensionId,
}) => {
  await setApiKey(context, extensionId);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  // Toggles are DaisyUI checkboxes with aria-label
  await expect(page.locator('[aria-label="Auto-Modus"]')).toBeVisible();
  await expect(page.locator('[aria-label="Bekanntes Wissen"]')).toBeVisible();
  await page.close();
});

test('popup settings button is always visible', async ({ context, extensionId }) => {
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

  await setApiKey(context, extensionId, process.env['OPENAI_API_KEY']!);

  const articlePage = await context.newPage();
  await articlePage.goto(ARTICLE_URL);
  await articlePage.waitForLoadState('networkidle');

  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
  await popupPage.getByRole('button', { name: /Seite umformulieren/ }).click();
  await popupPage.waitForTimeout(300);
  await popupPage.close();

  await expect(articlePage.locator('[data-rewrite-banner]')).toBeAttached({ timeout: 5000 });
  await articlePage.close();
});
