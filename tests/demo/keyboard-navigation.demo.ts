import { expect, test } from './fixtures';

// Keyboard-only walkthrough, recorded as demos/keyboard-navigation.{mp4,gif}:
// skip link, visible focus in the nav, then the archive tabs driven by the arrow keys.
test('keyboard navigation', async ({ page, pause }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(800);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await pause(1200);

  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    await pause(450);
  }
  await pause(500);

  const directors = page.getByRole('tab', { name: 'Directors' });
  await directors.focus();
  await directors.scrollIntoViewIfNeeded();
  await pause(900);

  for (const name of ['Themes', 'Journal', 'Timeline']) {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true');
    await pause(1000);
  }

  await page.keyboard.press('Home');
  await expect(directors).toHaveAttribute('aria-selected', 'true');
  await pause(1200);
});
