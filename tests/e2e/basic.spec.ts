import { expect, test } from '@playwright/test';

test('basic bilingual archive journey', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Shadowplay/);
  await expect(
    page.getByRole('heading', { name: /I don't review films\.\s*I study them\./i })
  ).toBeVisible();

  await page.getByRole('tab', { name: 'Themes' }).click();
  await expect(page.locator('[data-dashboard-panel="themes"]')).toBeVisible();

  await page.getByRole('tab', { name: 'Directors' }).click();
  await expect(page.locator('[data-dashboard-panel="directors"]')).toBeVisible();
  await page.locator('[data-dashboard-panel="directors"] a.card[href="/films/heat/"]').click();
  await expect(page).toHaveURL(/\/films\/heat\/$/);
  await expect(page.getByRole('heading', { name: 'Heat', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Michael Mann' })).toBeVisible();

  await page.getByRole('link', { name: 'Michael Mann' }).click();
  await expect(page).toHaveURL(/\/directors\/michael-mann\/$/);
  await expect(page.getByRole('heading', { name: 'Michael Mann', level: 1 })).toBeVisible();

  await page.getByRole('link', { name: 'See on the map' }).click();
  await expect(page).toHaveURL(/\/map\/?#director:michael-mann$/);
  await expect(page.getByRole('heading', { name: 'The Map', level: 1 })).toBeVisible();
  await expect(page.locator('#graph')).toBeVisible();

  await page.getByRole('link', { name: /ES Español/ }).click();
  await expect(page).toHaveURL(/\/es\/map\/?$/);
  await expect(page.getByRole('heading', { name: 'El mapa', level: 1 })).toBeVisible();
});
