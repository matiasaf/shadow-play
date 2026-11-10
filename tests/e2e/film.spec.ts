import { expect, test } from '@playwright/test';

test('film study shows its frame, connections and links onward', async ({ page }) => {
  await page.goto('/films/heat/');

  await expect(page.getByRole('heading', { level: 1, name: 'Heat' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Frame from Heat', exact: true })).toBeVisible();

  const connections = page.locator('#study-connections');
  await expect(connections.getByRole('heading', { level: 2, name: 'Connections' })).toBeVisible();

  const firstLink = connections.locator('a[href^="/films/"]').first();
  const href = await firstLink.getAttribute('href');
  expect(href).toMatch(/^\/films\/[a-z0-9-]+\/$/);

  await firstLink.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('language switch keeps the same film', async ({ page }) => {
  await page.goto('/films/heat/');

  await page.locator('.lang-switch a[hreflang="es"]').click();
  await expect(page).toHaveURL(/\/es\/films\/heat\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('img', { name: 'Fotograma de Heat', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Conexiones' })).toBeVisible();

  await page.locator('.lang-switch a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/films\/heat\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
