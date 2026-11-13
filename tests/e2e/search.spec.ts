import { expect, test, type Page } from '@playwright/test';

const trigger = (page: Page) => page.locator('.site-header [data-search-open]');
const dialog = (page: Page) => page.locator('#site-search');
const input = (page: Page) => dialog(page).getByRole('combobox');
const options = (page: Page) => page.locator('#site-search-results [role="option"]');

test('opens with the button and with "/", Escape closes and returns focus', async ({ page }) => {
  await page.goto('/');

  await trigger(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(trigger(page)).toBeFocused();

  await page.locator('body').click({ position: { x: 5, y: 300 } });
  await page.keyboard.press('/');
  await expect(dialog(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveValue('');

  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+k');
  await expect(dialog(page)).toBeVisible();
});

test('a film title ranks first and Enter opens it', async ({ page }) => {
  await page.goto('/directors/');
  await trigger(page).click();
  await input(page).fill('heat');

  const first = options(page).first();
  await expect(first).toContainText('Heat');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(input(page)).toHaveAttribute('aria-activedescendant', (await first.getAttribute('id'))!);

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/films\/heat\/$/);
});

test('arrow keys move the active option', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await input(page).fill('villeneuve');
  await expect(options(page).nth(1)).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await expect(options(page).nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(options(page).first()).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('ArrowUp');
  await expect(options(page).first()).toHaveAttribute('aria-selected', 'true');
});

test('Spanish search ignores accents and stays in Spanish', async ({ page }) => {
  await page.goto('/es/');
  await trigger(page).click();
  await expect(input(page)).toHaveAttribute('placeholder', 'Películas, directores, próximas…');

  await input(page).fill('vertigo');
  const first = options(page).first();
  await expect(first).toContainText('Vértigo');
  await expect(first.locator('a')).toHaveAttribute('href', '/es/films/vertigo/');

  await input(page).fill('debiles');
  await expect(options(page).first()).toContainText('Sin lugar para los débiles');
});

test('every query word must match', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await input(page).fill('dune two');
  await expect(options(page)).toHaveCount(1);
  await expect(options(page).first()).toContainText('Dune: Part Two');
});

test('a director query links to the director page', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await input(page).fill('mann');

  const director = options(page).filter({ hasText: 'Director' }).first();
  await expect(director.locator('a')).toHaveAttribute('href', '/directors/michael-mann/');
});

test('a watchlist title links to its entry on Up Next', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await input(page).fill('inside man');

  const first = options(page).first();
  await expect(first).toContainText('Up next');
  await expect(first.locator('a')).toHaveAttribute('href', '/up-next/#inside-man');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/up-next\/#inside-man$/);
  await expect(page.locator('#inside-man')).toBeVisible();
});

test('a query with no match shows the empty message', async ({ page }) => {
  await page.goto('/');
  await trigger(page).click();
  await input(page).fill('zzzqqq');
  await expect(page.getByText('Nothing in the archive yet.')).toBeVisible();
  await expect(options(page)).toHaveCount(0);
  await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
});
