// Refreshes src/data/streaming.json: where each watchlist film can be watched
// in Argentina. Data comes from TMDB's watch-providers endpoint (powered by
// JustWatch), region AR. The JSON is derived data — the curated content stays
// in the Markdown files; this file just gets regenerated when you run:
//
//   npm run streaming:update
//
// Needs TMDB_API_TOKEN in .env (read access token, see .env.example).
//
// Matching quirks can be fixed in src/data/streaming.overrides.json:
//   { "<slug>": { "tmdbId": 123 } }          force a TMDB id
//   { "<slug>": { "skip": true } }           leave the film out entirely
//   { "<slug>": { "flatrate": ["CINE.AR"] }} override/add fields by hand

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const WATCHLIST_DIR = path.join(ROOT, 'src/content/watchlist/en');
const OUT_FILE = path.join(ROOT, 'src/data/streaming.json');
const OVERRIDES_FILE = path.join(ROOT, 'src/data/streaming.overrides.json');
const REGION = 'AR';
const API = 'https://api.themoviedb.org/3';

if (existsSync(path.join(ROOT, '.env'))) process.loadEnvFile(path.join(ROOT, '.env'));
const TOKEN = process.env.TMDB_API_TOKEN;
if (!TOKEN) {
  console.error('Missing TMDB_API_TOKEN (put it in .env, see .env.example).');
  process.exit(1);
}

async function tmdb(pathname, params = {}) {
  const url = new URL(API + pathname);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TMDB ${pathname} -> ${res.status} ${await res.text()}`);
  return res.json();
}

/** Pulls the scalar fields we need out of a watchlist file's frontmatter. */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(title|originalTitle|director|year):\s*(.+?)\s*$/);
    if (!kv) continue;
    let value = kv[2];
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replaceAll("''", "'");
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = JSON.parse(value);
    }
    fields[kv[1]] = kv[1] === 'year' ? Number(value) : value;
  }
  return fields;
}

/** Finds the TMDB id for a film, trying the original title first. */
async function findTmdbId({ title, originalTitle, year }) {
  const queries = [...new Set([originalTitle, title].filter(Boolean))];
  for (const query of queries) {
    const strict = await tmdb('/search/movie', { query, primary_release_year: year });
    if (strict.results?.length) return strict.results[0].id;
  }
  // Fall back to a loose search and accept a ±1 year release (regional dates differ).
  for (const query of queries) {
    const loose = await tmdb('/search/movie', { query });
    const hit = loose.results?.find((r) => {
      const y = Number((r.release_date ?? '').slice(0, 4));
      return y && Math.abs(y - year) <= 1;
    });
    if (hit) return hit.id;
  }
  return null;
}

/** Cleans a provider list: names only, no ad-tier duplicates, stable order. */
function providerNames(list = []) {
  const names = [
    ...new Set(
      list
        .sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99))
        .map((p) => p.provider_name)
        .filter((name) => !/with ads/i.test(name))
    ),
  ];
  // "MUBI Amazon Channel" next to "MUBI" is noise; keep channel variants only
  // when they are the sole way in (e.g. "MGM+ Apple TV Channel").
  return names.filter((name) => {
    const base = name.replace(/ (Amazon|Apple TV) Channel$/i, '');
    return base === name || !names.includes(base);
  });
}

const files = (await readdir(WATCHLIST_DIR)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
const overrides = existsSync(OVERRIDES_FILE)
  ? JSON.parse(await readFile(OVERRIDES_FILE, 'utf8'))
  : {};

const films = {};
for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '');
  const override = overrides[slug] ?? {};
  if (override.skip) {
    console.log(`- ${slug}: skipped (override)`);
    continue;
  }

  const meta = parseFrontmatter(await readFile(path.join(WATCHLIST_DIR, file), 'utf8'));
  if (!meta?.title || !meta?.year) {
    console.warn(`- ${slug}: could not read title/year, skipping`);
    continue;
  }

  const tmdbId = override.tmdbId ?? (await findTmdbId(meta));
  if (!tmdbId) {
    console.warn(`- ${slug}: no TMDB match for "${meta.title}" (${meta.year}) — add a tmdbId override`);
    continue;
  }

  const providers = await tmdb(`/movie/${tmdbId}/watch/providers`);
  const ar = providers.results?.[REGION] ?? {};
  const entry = {
    tmdbId,
    link: override.link ?? ar.link ?? null,
    flatrate: override.flatrate ?? providerNames(ar.flatrate),
    rent: override.rent ?? providerNames([...(ar.rent ?? []), ...(ar.buy ?? [])]),
  };
  films[slug] = entry;

  const summary = entry.flatrate.length
    ? entry.flatrate.join(', ')
    : entry.rent.length
      ? `rent only (${entry.rent.join(', ')})`
      : 'not streaming in AR';
  console.log(`- ${slug}: ${summary}`);
}

const out = {
  region: REGION,
  checkedOn: new Date().toISOString().slice(0, 10),
  films,
};

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(films).length} films to ${path.relative(ROOT, OUT_FILE)}`);
