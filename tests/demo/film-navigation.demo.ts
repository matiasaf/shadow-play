import { expect, test } from './fixtures';

// Film page navigation, recorded as demos/film-navigation.{mp4,gif}:
// reading time, the essay outline in the rail following the scroll, and the
// previous/next pager at the end of the study.
test('film navigation', async ({ page, pause, glide }) => {
  await page.goto('/films/double-indemnity/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('.film-reading-time').hover();
  await pause(1300);

  await glide(900);
  await pause(700);
  for (let i = 0; i < 3; i++) {
    await glide(600);
    await pause(550);
  }

  const pager = page.getByRole('navigation', { name: 'More studies' });
  await pager.scrollIntoViewIfNeeded();
  await pause(900);
  const next = pager.getByRole('link', { name: /Next study/ });
  await next.hover();
  await pause(700);
  await next.click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1500);
});
