import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { parseId } from './movies';

// Watchlist entries live in src/content/watchlist/<lang>/<slug>.md, mirroring
// the movies collection: the id is "<lang>/<slug>" and the slug is neutral so
// `seeds` (links back to studied films) stay the same across languages.
export type WatchlistEntry = CollectionEntry<'watchlist'>;

/** The neutral slug ("persona") for a watchlist entry id ("en/persona"). */
export function watchSlugOf(entry: WatchlistEntry): string {
  return parseId(entry.id).slug;
}

/** All published watchlist entries for a language, in curated order. */
export async function getWatchlist(lang: Lang): Promise<WatchlistEntry[]> {
  const all = await getCollection('watchlist', ({ data }) => !data.draft);
  return all
    .filter((e) => parseId(e.id).lang === lang)
    .sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity));
}

export interface WatchlistThread {
  name: string;
  entries: WatchlistEntry[];
}

/**
 * Groups entries by their `thread`, keeping both the threads and the entries
 * within them in curated order (threads appear in order of their first entry).
 */
export function groupByThread(entries: WatchlistEntry[]): WatchlistThread[] {
  const threads: WatchlistThread[] = [];
  for (const entry of entries) {
    const name = entry.data.thread;
    let thread = threads.find((t) => t.name === name);
    if (!thread) {
      thread = { name, entries: [] };
      threads.push(thread);
    }
    thread.entries.push(entry);
  }
  return threads;
}
