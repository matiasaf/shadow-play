import { expect, test } from './fixtures';

// Theme tags as links, recorded as demos/clickable-tags.{mp4,gif}:
// a study's dossier tag opens the archive filtered by that theme.
test('clickable tags', async ({ page, pause }) => {
  // Vertigo's first tag, "the double", is the most shared theme in the archive.
  await page.goto('/films/vertigo/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1000);

  const tags = page.locator('.dossier-tags a.tag');
  await tags.first().scrollIntoViewIfNeeded();
  await pause(600);
  for (const i of [0, 1, 2]) {
    await tags.nth(i).hover();
    await pause(500);
  }

  const tag = tags.first();
  await tag.hover();
  await pause(600);
  await tag.click();
  await expect(page.locator('[data-view-button="themes"]')).toHaveAttribute('aria-selected', 'true');
  await pause(1800);
  await page.mouse.wheel(0, 380);
  await pause(1800);
});
