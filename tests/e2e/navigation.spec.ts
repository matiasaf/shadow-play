import { expect, test } from '@playwright/test';

const sections = {
  en: {
    home: '/',
    links: [
      { name: 'Directors', url: /\/directors\/?$/, heading: 'The Directors' },
      { name: 'The Map', url: /\/map\/?$/, heading: 'The Map' },
      { name: 'Up Next', url: /\/up-next\/?$/, heading: 'Up Next' },
      { name: 'Films', url: /\/$/, heading: /I don't review films\.\s*I study them\./i },
    ],
  },
  es: {
    home: '/es/',
    links: [
      { name: 'Directores', url: /\/es\/directors\/?$/, heading: 'Los directores' },
      { name: 'El mapa', url: /\/es\/map\/?$/, heading: 'El mapa' },
      { name: 'Próximas sesiones', url: /\/es\/up-next\/?$/, heading: 'Próximas sesiones' },
      { name: 'Películas', url: /\/es\/?$/, heading: /No reseño películas\.\s*Las estudio\./i },
    ],
  },
} as const;

for (const [lang, { home, links }] of Object.entries(sections)) {
  test(`main navigation reaches every section (${lang})`, async ({ page }) => {
    await page.goto(home);
    const nav = page.locator('.site-nav');

    for (const link of links) {
      await nav.getByRole('link', { name: link.name, exact: true }).click();
      await expect(page).toHaveURL(link.url);
      await expect(page.getByRole('heading', { level: 1, name: link.heading })).toBeVisible();
    }
  });
}

for (const home of ['/', '/es/']) {
  test(`every film and director linked from ${home} responds`, async ({ page }) => {
    await page.goto(home);
    const hrefs = await page
      .locator('a[href*="/films/"], a[href*="/directors/"]')
      .evaluateAll((anchors) => [...new Set(anchors.map((a) => a.getAttribute('href') ?? ''))]);

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });
}
