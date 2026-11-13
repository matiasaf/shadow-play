import { expect, test } from '@playwright/test';

test('film study shows its frame, connections and links onward', async ({ page }) => {
  await page.goto('/films/heat/');

  await expect(page.getByRole('heading', { level: 1, name: 'Heat' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Frame from Heat', exact: true })).toBeVisible();

  const connections = page.locator('#study-connections');
  await expect(connections.getByRole('heading', { level: 2, name: 'Connections' })).toBeVisible();

  const firstLink = connections.locator('a[href^="/films/"]').first();
  const href = await firstLink.getAttribute('href');
  expect(href).toMatch(/^\/films\/[a-z0-9-]+\/$/);

  await firstLink.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('language switch keeps the same film', async ({ page }) => {
  await page.goto('/films/heat/');

  await page.locator('.lang-switch a[hreflang="es"]').click();
  await expect(page).toHaveURL(/\/es\/films\/heat\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('img', { name: 'Fotograma de Heat', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Conexiones' })).toBeVisible();

  await page.locator('.lang-switch a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/films\/heat\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('film study shows its reading time in both languages', async ({ page }) => {
  await page.goto('/films/heat/');
  await expect(page.locator('.film-reading-time')).toHaveText(/^\d+ min read$/);

  await page.goto('/es/films/heat/');
  await expect(page.locator('.film-reading-time')).toHaveText(/^\d+ min de lectura$/);
});

test('study rail outlines the essay and highlights the section in view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/films/heat/');

  const rail = page.getByRole('complementary', { name: 'Study navigation' });
  const outlineLink = rail.locator('a[href="#the-central-idea"]');
  await expect(outlineLink).toBeVisible();
  await expect(outlineLink).toHaveText('The central idea');

  // Put a target a little above the reading line (40% down the viewport), instantly.
  const readAt = (selector: string) =>
    page.locator(selector).evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3,
        behavior: 'instant',
      })
    );

  await readAt('#the-central-idea');
  await expect(outlineLink).toHaveAttribute('aria-current', 'true');

  await readAt('#study-connections');
  await expect(rail.locator('a[href="#study-connections"]')).toHaveAttribute('aria-current', 'true');
  await expect(outlineLink).not.toHaveAttribute('aria-current', 'true');
});

test('pager moves to the neighbouring studies in archive order', async ({ page }) => {
  const caseNumber = async () =>
    Number((await page.locator('.film-dossier .dossier-row strong').first().textContent())?.replace(/\D/g, ''));

  // Heat is the oldest study: only "Next study" exists.
  await page.goto('/films/heat/');
  const pager = page.getByRole('navigation', { name: 'More studies' });
  await expect(pager.locator('[data-pager="previous"]')).toHaveCount(0);
  const start = await caseNumber();

  await pager.getByRole('link', { name: /Next study/ }).click();
  await expect(page).not.toHaveURL(/\/films\/heat\/$/);
  expect(await caseNumber()).toBe(start + 1);

  await page.getByRole('navigation', { name: 'More studies' }).getByRole('link', { name: /Previous study/ }).click();
  await expect(page).toHaveURL(/\/films\/heat\/$/);
  expect(await caseNumber()).toBe(start);
});

test('back link returns to the archive the reader came from', async ({ page }) => {
  await page.goto('/?view=journal');
  await page.locator('a[href^="/films/"]').first().click();
  await expect(page).toHaveURL(/\/films\/[a-z0-9-]+\/$/);

  const back = page.locator('[data-back-link]');
  await expect(back).toHaveAttribute('href', /\?view=journal/);
  await back.click();
  await expect(page).toHaveURL(/\?view=journal/);
});

test('back link falls back to the archive home when opened directly', async ({ page }) => {
  await page.goto('/es/films/heat/');
  await expect(page.locator('[data-back-link]')).toHaveAttribute('href', /^\/es\/?$/);
});
