import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from './fixtures';

// Walkthrough of one film study, recorded as demos/film-<slug>.{mp4,gif}.
// Records DEMO_FILM=<slug>, or by default the most recent study (highest watchedOn),
// which is the film a new film PR adds.
const moviesDir = 'src/content/movies/en';

function latestFilm(): string {
  let latest = { slug: '', watchedOn: '' };
  for (const file of readdirSync(moviesDir).filter((f) => f.endsWith('.md'))) {
    const text = readFileSync(`${moviesDir}/${file}`, 'utf8');
    if (/^draft:\s*true/m.test(text)) continue;
    const watchedOn = text.match(/^watchedOn:\s*['"]?([\d-]+)/m)?.[1] ?? '';
    if (watchedOn > latest.watchedOn) latest = { slug: file.replace(/\.md$/, ''), watchedOn };
  }
  return latest.slug;
}

const slug = process.env.DEMO_FILM || latestFilm();

test(`film ${slug}`, async ({ page, pause, glide }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1000);

  const latest = page.locator(`a.latest-file[href="/films/${slug}/"]`);
  if (await latest.count()) await latest.click();
  else await page.goto(`/films/${slug}/`);
  await expect(page).toHaveURL(new RegExp(`/films/${slug}/$`));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await pause(1200);

  await glide(550);
  await pause(1200);
  await glide(700);
  await pause(1000);

  const connections = page.locator('#study-connections');
  if (await connections.count()) {
    await connections.scrollIntoViewIfNeeded();
    await pause(1200);
  }

  await page.locator('.lang-switch a[hreflang="es"]').click();
  await expect(page).toHaveURL(new RegExp(`/es/films/${slug}/$`));
  await pause(1200);
});
