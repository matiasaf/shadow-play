import { expect, test } from '@playwright/test';

const card = (view: string) =>
  `[data-dashboard-panel="${view}"] .dashboard-card:not([hidden])`;

test('the URL selects the view and the filters', async ({ page }) => {
  await page.goto('/?view=themes&theme=identity');
  await expect(page.getByRole('tab', { name: 'Themes' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-dashboard-filter="theme"]')).toHaveValue('identity');

  const cards = page.locator(card('themes'));
  await expect(cards.first()).toBeVisible();
  const tags = await cards.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLElement).dataset.tags ?? '')
  );
  expect(tags.length).toBeGreaterThan(0);
  for (const list of tags) expect(list.split('|')).toContain('identity');
});

test('changing the controls writes the URL, leaving defaults out', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Themes' }).click();
  await expect(page).toHaveURL(/[?&]view=themes/);

  const country = page.locator('[data-dashboard-filter="country"]');
  const firstCountry = await country.locator('option').nth(1).getAttribute('value');
  await country.selectOption(firstCountry!);
  expect(new URL(page.url()).searchParams.get('country')).toBe(firstCountry);

  await country.selectOption('');
  expect(new URL(page.url()).searchParams.has('country')).toBe(false);

  await page.getByRole('tab', { name: 'Directors' }).click();
  expect(new URL(page.url()).search).toBe('');
});

test('Back from a film restores the archive state', async ({ page }) => {
  await page.goto('/?view=journal');
  await page.locator(`${card('journal')} a.card`).first().click();
  await expect(page).toHaveURL(/\/films\//);

  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Journal' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-dashboard-panel="journal"]')).toBeVisible();
});

test('clear filters resets them and the count', async ({ page }) => {
  await page.goto('/');
  const total = Number(await page.locator('.hero-ledger-row strong').first().textContent());
  const count = page.locator('[data-dashboard-count]');
  const clear = page.getByRole('button', { name: 'Clear filters' });

  await expect(count).toHaveText(`${total} studies`);
  await expect(clear).toBeHidden();

  await page.locator('[data-dashboard-filter="theme"]').selectOption('identity');
  await expect(clear).toBeVisible();
  await expect(count).not.toHaveText(`${total} studies`);

  await clear.click();
  await expect(clear).toBeHidden();
  await expect(count).toHaveText(`${total} studies`);
  expect(new URL(page.url()).search).toBe('');
});

test('unknown values in the URL are ignored without errors', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));

  await page.goto('/?view=nope&theme=does-not-exist&sort=sideways');
  await expect(page.getByRole('tab', { name: 'Directors' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-dashboard-filter="theme"]')).toHaveValue('');
  await expect(page.locator('[data-dashboard-sort]')).toHaveValue('recency');
  expect(errors).toEqual([]);
});

test('the Spanish archive counts in Spanish', async ({ page }) => {
  await page.goto('/es/');
  await expect(page.locator('[data-dashboard-count]')).toHaveText(/^\d+ estudios?$/);
});
