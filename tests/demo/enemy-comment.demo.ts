import { expect, test } from './fixtures';

test('enemy curated comment', async ({ page, pause }) => {
  for (const prefix of ['/es', '']) {
    await page.goto(`${prefix}/films/enemy/#curated-comments`);
    const card = page.locator('#curated-comments .comment-card');
    await expect(card).toContainText('ribeirosnake');
    await expect(card.locator('.comment-original-link')).toHaveAttribute(
      'href',
      'https://www.filmaffinity.com/ar/user/rating/651126/617900.html',
    );
    await card.locator('[data-comment-open]').click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('spoilers');
    await pause(1200);
    await modal.locator('.comment-modal-close').click();
    await expect(modal).not.toBeVisible();
  }
});
