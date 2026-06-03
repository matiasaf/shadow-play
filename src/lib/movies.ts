import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

// Movie entries live in src/content/movies/<lang>/<slug>.md, so the
// collection id looks like "en/heat". We expose a language-neutral slug
// ("heat") so connections and URLs stay the same across languages.
export type MovieEntry = CollectionEntry<'movies'>;

export function parseId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

/** All published movies for a language, sorted by most recently watched. */
export async function getMovies(lang: Lang): Promise<MovieEntry[]> {
  const all = await getCollection('movies', ({ data }) => !data.draft);
  return all
    .filter((m) => parseId(m.id).lang === lang)
    .sort((a, b) => b.data.watchedOn.valueOf() - a.data.watchedOn.valueOf());
}

/** The neutral slug ("heat") for an entry id ("en/heat"). */
export function slugOf(entry: MovieEntry): string {
  return parseId(entry.id).slug;
}
