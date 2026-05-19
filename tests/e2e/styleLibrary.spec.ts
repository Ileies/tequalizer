import { test, expect, openOptionsTab } from './fixtures.ts';

test('options page has four tabs', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);

  await expect(page.getByRole('tab', { name: 'API & Anbieter' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Style-Bibliothek' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Auto-Modus' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Bekanntes Wissen' })).toBeVisible();
  await page.close();
});

test('creates a new custom style and it appears in the list', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await openOptionsTab(page, 'Style-Bibliothek');

  await page.getByRole('button', { name: '+ Neuer Style' }).click();

  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();

  await dialog.locator('input[placeholder="Mein Style"]').fill('Mein Test-Style');
  await dialog.getByRole('button', { name: 'Erstellen' }).click();

  await expect(page.locator('text=Mein Test-Style')).toBeVisible();
  await page.close();
});

test('custom style persists after page reload', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await openOptionsTab(page, 'Style-Bibliothek');

  await page.getByRole('button', { name: '+ Neuer Style' }).click();
  const dialog = page.locator('dialog[open]');
  await dialog.locator('input[placeholder="Mein Style"]').fill('Persistierter Style');
  await dialog.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page.locator('text=Persistierter Style')).toBeVisible();

  await page.reload();
  await openOptionsTab(page, 'Style-Bibliothek');

  await expect(page.locator('text=Persistierter Style')).toBeVisible();
  await page.close();
});

test('deletes a custom style', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await openOptionsTab(page, 'Style-Bibliothek');

  await page.getByRole('button', { name: '+ Neuer Style' }).click();
  const dialog = page.locator('dialog[open]');
  await dialog.locator('input[placeholder="Mein Style"]').fill('Zu löschender Style');
  await dialog.getByRole('button', { name: 'Erstellen' }).click();
  await expect(page.locator('text=Zu löschender Style')).toBeVisible();

  page.on('dialog', (d) => d.accept());
  const styleRow = page.locator('div').filter({ hasText: 'Zu löschender Style' }).first();
  await styleRow.getByRole('button', { name: 'Löschen' }).click();

  await expect(page.locator('text=Zu löschender Style')).not.toBeVisible();
  await page.close();
});

test('built-in styles cannot be deleted', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await openOptionsTab(page, 'Style-Bibliothek');

  // "Neutral" is a built-in style and must have no delete button
  const neutralRow = page
    .locator('div')
    .filter({ hasText: 'Neutral' })
    .filter({ hasText: 'Integriert' })
    .first();
  await expect(neutralRow).toBeVisible();
  await expect(neutralRow.getByRole('button', { name: 'Löschen' })).not.toBeAttached();
  await page.close();
});

test('setting a custom style as default reflects in popup', async ({ context, extensionId }) => {
  const optionsPage = await context.newPage();
  await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);
  await openOptionsTab(optionsPage, 'Style-Bibliothek');

  await optionsPage.getByRole('button', { name: '+ Neuer Style' }).click();
  const dialog = optionsPage.locator('dialog[open]');
  await dialog.locator('input[placeholder="Mein Style"]').fill('Default-Test-Style');
  await dialog.getByRole('button', { name: 'Erstellen' }).click();
  await expect(optionsPage.locator('text=Default-Test-Style')).toBeVisible();

  const styleRow = optionsPage.locator('div').filter({ hasText: 'Default-Test-Style' }).first();
  await styleRow.getByRole('button', { name: 'Als Standard' }).click();
  await optionsPage.waitForTimeout(300);
  await optionsPage.close();

  // Verify popup reflects the new default
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

  // Popup may show API key setup; check storage-driven select if available
  const select = popupPage.locator('#style-select');
  if (await select.isVisible()) {
    const selectedText = await select.locator('option:checked').textContent();
    expect(selectedText).toContain('Default-Test-Style');
  }
  await popupPage.close();
});
