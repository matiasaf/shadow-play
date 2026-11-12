import { expect, test } from '@playwright/test';

test('keyboard focus is clearly visible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as Element);
    return { style: style.outlineStyle, color: style.outlineColor };
  });
  expect(outline).toEqual({ style: 'solid', color: 'rgb(244, 208, 138)' });
});

for (const [home, name] of [
  ['/', 'Skip to content'],
  ['/es/', 'Saltar al contenido'],
] as const) {
  test(`the first Tab reaches the skip link (${home})`, async ({ page }) => {
    await page.goto(home);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name, exact: true })).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
}

for (const [route, current] of [
  ['/directors/michael-mann/', 'Directors'],
  ['/films/heat/', 'Films'],
  ['/es/map/', 'El mapa'],
] as const) {
  test(`the nav marks the current section on ${route}`, async ({ page }) => {
    await page.goto(route);
    const nav = page.locator('.site-nav');
    await expect(nav.getByRole('link', { name: current, exact: true })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(nav.locator('a[aria-current]')).toHaveCount(1);
  });
}

test('the archive tabs work with the arrow keys', async ({ page }) => {
  await page.goto('/');
  const directors = page.getByRole('tab', { name: 'Directors' });
  const themes = page.getByRole('tab', { name: 'Themes' });

  await expect(directors).toHaveAttribute('tabindex', '0');
  await expect(themes).toHaveAttribute('tabindex', '-1');

  await directors.focus();
  await page.keyboard.press('ArrowRight');
  await expect(themes).toBeFocused();
  await expect(themes).toHaveAttribute('aria-selected', 'true');
  await expect(themes).toHaveAttribute('tabindex', '0');
  await expect(page.locator('[data-dashboard-panel="themes"]')).toBeVisible();
  await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Themes');

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab').last()).toBeFocused();
  await expect(page.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  await expect(directors).toBeFocused();
  await expect(page.locator('[data-dashboard-panel="directors"]')).toBeVisible();
});
