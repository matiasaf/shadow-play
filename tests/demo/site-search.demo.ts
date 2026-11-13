import { expect, test } from './fixtures';

// Site-wide search, recorded as demos/site-search.{mp4,gif}:
// press "/", type part of a name, move with the arrows, Enter opens the page.
test('site search', async ({ page, pause }) => {
  await page.goto('/directors/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1000);

  await page.locator('.site-header [data-search-open]').hover();
  await pause(600);
  await page.keyboard.press('/');
  const input = page.locator('#site-search').getByRole('combobox');
  await expect(input).toBeFocused();
  await pause(600);

  await input.pressSequentially('vill', { delay: 180 });
  await pause(1200);
  await page.keyboard.press('ArrowDown');
  await pause(700);
  await page.keyboard.press('ArrowDown');
  await pause(900);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/films\//);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1500);

  await page.keyboard.press('ControlOrMeta+k');
  await input.pressSequentially('denis', { delay: 150 });
  await pause(900);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/directors\/denis-villeneuve\/$/);
  await pause(1500);
});
