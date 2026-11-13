import { expect, test } from './fixtures';

// Archive density, recorded as demos/archive-density.{mp4,gif}:
// switch to the compact list, change view, filter, and go back to the grid.
test('archive density', async ({ page, pause, glide }) => {
  await page.goto('/#archive');
  await expect(page.getByRole('button', { name: 'List' })).toBeVisible();
  await page.locator('.dashboard-head').scrollIntoViewIfNeeded();
  await pause(1000);

  await page.getByRole('button', { name: 'List' }).click();
  await pause(1100);
  await glide(500);
  await pause(800);

  await page.getByRole('tab', { name: 'Themes' }).click();
  await pause(1200);
  await page.locator('[data-dashboard-filter="theme"]').selectOption('the double');
  await pause(1500);

  await page.locator('.dashboard-head').scrollIntoViewIfNeeded();
  await pause(500);
  await page.getByRole('button', { name: 'Grid' }).click();
  await pause(1200);
  await glide(400);
  await pause(1300);
});
