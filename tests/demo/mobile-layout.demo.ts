import { expect, test } from './fixtures';

// Phone-size walkthrough of the mobile layout fixes, recorded as demos/mobile-layout.{mp4,gif}.
const phone = { width: 390, height: 844 };
test.use({ viewport: phone, video: { mode: 'on', size: phone } });

test('mobile layout', async ({ page, pause, glide }) => {
  await page.goto('/es/up-next/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1000);

  await glide(900);
  await pause(900);
  await glide(1400);
  await pause(1000);

  await page.goto('/es/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1200);
  await glide(700);
  await pause(1000);

  await page.locator('.site-nav').getByRole('link', { name: 'Próximas sesiones', exact: true }).click();
  await expect(page).toHaveURL(/\/es\/up-next\/?$/);
  await pause(1200);
});
