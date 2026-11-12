import { expect, test } from './fixtures';

// The archive keeps its view and filters in the URL, recorded as demos/archive-state.{mp4,gif}:
// filter by a theme, open a film, come back to the same filtered view, then clear it.
test('archive state', async ({ page, pause }) => {
  await page.goto('/#archive');
  await expect(page.getByRole('tab', { name: 'Directors' })).toBeVisible();
  await pause(900);

  await page.getByRole('tab', { name: 'Themes' }).click();
  await pause(700);
  await page.locator('[data-dashboard-filter="theme"]').selectOption('identity');
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  await pause(1500);

  await page
    .locator('[data-dashboard-panel="themes"] .dashboard-card:not([hidden]) a.card')
    .first()
    .click();
  await expect(page).toHaveURL(/\/films\//);
  await pause(1200);

  await page.goBack();
  await expect(page.locator('[data-dashboard-filter="theme"]')).toHaveValue('identity');
  await page.locator('.dashboard-controls').scrollIntoViewIfNeeded();
  await pause(1800);

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeHidden();
  await pause(1500);
});
