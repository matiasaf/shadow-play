import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { getMovies, parseId, type MovieEntry } from './movies';

// The director is the organizing axis of the archive. Their identity is a
// language-neutral slug derived from the `director` string of each film
// ("Stanley Kubrick" -> "stanley-kubrick"), so films group under the same
// director page in both languages without touching the movie frontmatter.
// An optional entry in the `directors` collection adds the worldview essay.

export type DirectorEntry = CollectionEntry<'directors'>;

export interface DirectorGroup {
  slug: string;
  name: string;
  films: MovieEntry[];
  entry?: DirectorEntry;
}

/** Language-neutral slug for a director's name ("Kim Ki-duk" -> "kim-ki-duk"). */
export function directorSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * All directors with published films in a language, sorted by their most
 * recently watched film. Films inside each group keep the watchedOn order.
 */
export async function getDirectors(lang: Lang): Promise<DirectorGroup[]> {
  const movies = await getMovies(lang);
  const entries = await getCollection('directors', ({ data }) => !data.draft);
  const entryBySlug = new Map(
    entries
      .filter((e) => parseId(e.id).lang === lang)
      .map((e) => [parseId(e.id).slug, e])
  );

  const groups = new Map<string, DirectorGroup>();
  for (const movie of movies) {
    const slug = directorSlug(movie.data.director);
    let group = groups.get(slug);
    if (!group) {
      group = { slug, name: movie.data.director, films: [], entry: entryBySlug.get(slug) };
      groups.set(slug, group);
    }
    group.films.push(movie);
  }

  // movies is already sorted newest-first, so insertion order = recency order.
  return [...groups.values()];
}

/** Tags that repeat across a director's films (their recurring obsessions). */
export function obsessionsOf(group: DirectorGroup): string[] {
  const counts = new Map<string, number>();
  for (const film of group.films) {
    for (const tag of new Set(film.data.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const repeated = [...counts.entries()].filter(([, n]) => n >= 2);
  if (repeated.length > 0) {
    return repeated.sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }
  // With a single studied film, its tags are the best signal we have.
  return group.films.length === 1 ? group.films[0]!.data.tags : [];
}
