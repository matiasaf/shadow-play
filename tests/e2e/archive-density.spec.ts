import { expect, test } from '@playwright/test';

// Runs with motion allowed, so the reveal animation (cards start at opacity 0)
// is on and hydrated panels must have their cards observed.

const studiesPublished = async (page: import('@playwright/test').Page) =>
  Number(await page.locator('.hero-ledger-row strong').first().textContent());

test('only the default view is rendered on load', async ({ page }) => {
  await page.goto('/');
  const films = await studiesPublished(page);
  expect(films).toBeGreaterThan(0);
  await expect(page.locator('a.card')).toHaveCount(films);
  await expect(page.locator('template[data-panel-template]')).toHaveCount(4);
});

for (const view of ['Themes', 'Journal', 'Timeline', 'Connections']) {
  test(`opening ${view} renders its panel and reveals its cards`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: view }).click();

    const panel = page.locator(`[data-dashboard-panel="${view.toLowerCase()}"]`);
    await expect(panel.locator('template')).toHaveCount(0);
    const card = panel.locator('a.card').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-hit/);
    await expect(card).toHaveCSS('opacity', '1');
  });
}

test('a view from the URL is rendered on load', async ({ page }) => {
  await page.goto('/?view=timeline');
  const panel = page.locator('[data-dashboard-panel="timeline"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('a.card').first()).toBeAttached();
});

test('list mode shows one row per film, shortens the page and lives in the URL', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const gridHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  const list = page.getByRole('button', { name: 'List' });
  await list.click();
  await expect(list).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false');
  expect(new URL(page.url()).searchParams.get('density')).toBe('list');

  const panel = page.locator('[data-dashboard-panel="directors"]');
  await expect(panel.locator('.dashboard-card a.card').first()).toBeHidden();
  await expect(panel.locator('a.movie-row').first()).toBeVisible();
  const listHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(listHeight).toBeLessThan(gridHeight * 0.4);

  // Filters work the same in list mode.
  await page.locator('[data-dashboard-filter="director"]').selectOption('Michael Mann');
  await expect(panel.locator('.dashboard-card:not([hidden]) a.movie-row')).toHaveCount(1);
  await expect(panel.locator('.dashboard-card:not([hidden]) a.movie-row')).toHaveAttribute('href', '/films/heat/');

  await page.reload();
  await expect(page.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-dashboard-filter="director"]')).toHaveValue('Michael Mann');
  await expect(panel.locator('.dashboard-card:not([hidden]) a.movie-row')).toBeVisible();

  await page.getByRole('button', { name: 'Grid' }).click();
  expect(new URL(page.url()).searchParams.has('density')).toBe(false);
  await expect(panel.locator('.dashboard-card:not([hidden]) a.card').first()).toBeVisible();
});

test('list mode reaches hydrated views too', async ({ page }) => {
  await page.goto('/?density=list&view=themes');
  const panel = page.locator('[data-dashboard-panel="themes"]');
  await expect(panel.locator('a.movie-row').first()).toBeVisible();
  await expect(panel.locator('a.card').first()).toBeHidden();
});

test('the last density choice is remembered without the URL', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'List' }).click();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-dashboard-panel="directors"] a.movie-row').first()).toBeVisible();
});
