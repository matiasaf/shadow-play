import { expect, test } from './fixtures';

// A short tour of the archive, recorded as demos/archive-tour.{mp4,gif}.
// Copy this file to record a demo for a specific PR (see README → Tests and demos).
// Keep demos under ~15 s: GIFs grow ~0.6 MB per second and GitHub caps uploads at 10 MB.
test('archive tour', async ({ page, pause, glide }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1000);

  await page.getByRole('tab', { name: 'Directors' }).click();
  await pause(600);
  await page.locator('[data-dashboard-panel="directors"] a.card[href="/films/heat/"]').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Heat' })).toBeVisible();
  await pause(800);
  await glide(600);
  await pause(800);

  await page.locator('.site-nav').getByRole('link', { name: 'The Map' }).click();
  await expect(page.locator('#map-workspace')).toHaveAttribute('data-map-ready', 'true');
  await page.getByRole('button', { name: 'Maximize map' }).click();
  await expect(page.locator('#map-workspace')).toHaveClass(/is-expanded/);
  await pause(1000);

  const search = page.getByRole('combobox', { name: 'Find node' });
  await search.click();
  await search.pressSequentially('Heat', { delay: 100 });
  await search.press('Enter');
  await expect(page.locator('#panel-title')).toHaveText('Heat');
  await pause(1500);

  await page.keyboard.press('Escape');
  await page.locator('.lang-switch a[hreflang="es"]').click();
  await expect(page.getByRole('heading', { level: 1, name: 'El mapa' })).toBeVisible();
  await pause(1000);
});
