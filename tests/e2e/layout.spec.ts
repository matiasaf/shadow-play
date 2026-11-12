import { expect, test } from '@playwright/test';

const phone = { width: 390, height: 844 };
const desktop = { width: 1280, height: 800 };

const routes = [
  '/',
  '/es/',
  '/films/heat/',
  '/directors/',
  '/directors/michael-mann/',
  '/map/',
  '/up-next/',
  '/es/up-next/',
];

test.describe('phone layout', () => {
  test.use({ viewport: phone });

  for (const route of routes) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow, route).toBeLessThanOrEqual(0);
    });
  }

  test('the sticky header stays compact', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('.site-header').boundingBox();
    expect(box?.height).toBeLessThanOrEqual(110);
  });
});

test.describe('desktop layout', () => {
  test.use({ viewport: desktop });

  test('the sticky archive controls stay compact', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('.dashboard-controls').boundingBox();
    expect(box?.height).toBeLessThanOrEqual(90);
  });
});
