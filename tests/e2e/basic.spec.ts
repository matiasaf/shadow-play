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
  await expect(page.locator('#map-workspace')).toHaveAttribute('data-map-ready', 'true');

  await page.getByRole('button', { name: 'Maximize map' }).click();
  await expect(page.locator('#map-workspace')).toHaveClass(/is-expanded/);
  await expect(page.getByRole('button', { name: 'Exit expanded view' })).toBeVisible();

  await page.getByRole('combobox', { name: 'Find node' }).fill('Heat');
  await page.getByRole('combobox', { name: 'Find node' }).press('Enter');
  await expect(page.locator('#panel-title')).toHaveText('Heat');
  await expect(page.locator('.relation-card').first()).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#map-workspace')).not.toHaveClass(/is-expanded/);

  await page.getByRole('link', { name: /ES Español/ }).click();
  await expect(page).toHaveURL(/\/es\/map\/?$/);
  await expect(page.getByRole('heading', { name: 'El mapa', level: 1 })).toBeVisible();
});
