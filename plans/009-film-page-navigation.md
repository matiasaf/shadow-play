# Plan 009: Improve navigation on the film study page (previous/next, outline rail, reading time, smart back link)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/components/FilmView.astro src/i18n/ui.ts src/lib/format.ts tests/e2e/film.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (the smart back link is more useful after plan 007)
- **Category**: direction (UX)
- **Planned at**: commit `e077025`, 2026-11-12

## Why this matters

The film page is where readers spend most time (studies are long essays), but it is a dead
end: the back link always goes to the unfiltered home page, there is no way to move to the
neighbouring study in the archive, and the left rail only lists fixed blocks ("Study frame",
"Study notes", "Connections") — not the essay's own sections — and never shows where the
reader is. Readers also get no hint of how long a study is.

## Current state

- `src/pages/films/[...slug].astro` and `src/pages/es/films/[...slug].astro` pass
  `{ movie, all }` to `FilmView`, where `all = await getMovies(lang)` — **sorted newest
  first** by `watchedOn` (`src/lib/movies.ts`).
- `src/components/FilmView.astro`:
  - line 19: `const { Content } = await render(movie);` — Astro's `render()` also returns
    `headings` (`{ depth, slug, text }[]`); Markdown headings get matching `id`s.
  - lines 25-27: case number = `all.length - idx` (newest = highest).
  - lines 80-84: back link, always `localizePath('/', lang)`:

    ```astro
    <a href={localizePath('/', lang)} class="back-link"><span aria-hidden="true">←</span> {t('film.back')}</a>
    ```

  - lines 171-177: the rail:

    ```astro
    <aside class="study-rail" aria-label={t('film.studyNavigation')}>
      <a href="#study-frame">{t('film.studyFrame')}</a>
      <a href="#study-notes">{t('film.readingNotes')}</a>
      {externalComments.length > 0 && <a href="#curated-comments">…</a>}
      {data.videos.length > 0 && <a href="#study-videos">…</a>}
      {data.connections.length > 0 && <a href="#study-connections">…</a>}
    </aside>
    ```

    CSS at lines 593-617 (`position: sticky; top: 7rem`) and the `max-width: 960px` block
    (lines 623-648) where the rail becomes a static grid of boxes.
  - The essays use `##` headings such as "The central idea", "Themes and ideas" (see
    `src/content/movies/en/heat.md`).
- Collection entries from the glob loader expose the raw Markdown as `movie.body`.
- i18n strings in `src/i18n/ui.ts`, film keys `film.*` (around line 95 en, matching block in es).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| Film spec | `npx playwright test tests/e2e/film.spec.ts --project=chromium` | all pass |
| Full e2e | `npm run test:e2e` | all pass |
| Demo | `npm run demo -- tests/demo/film-navigation.demo.ts` | GIF written |

## Scope

**In scope**:
- `src/components/FilmView.astro`
- `src/lib/format.ts` (a `readingMinutes(text)` helper)
- `src/i18n/ui.ts` (new `film.*` keys, both languages)
- `tests/e2e/film.spec.ts` (extend)
- `tests/demo/film-navigation.demo.ts` (create)

**Out of scope**:
- Content files: do not add or rename headings in studies.
- `DirectorView.astro` (its back link and layout stay as they are).

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: branch `feat/film-navigation`, commit such as
`feat: add study outline, reading time and previous/next links`, PR with demo GIF.

## Steps

### Step 1: Reading time

Add to `src/lib/format.ts`:

```ts
/** Minutes to read a Markdown body at ~220 words per minute, at least 1. */
export function readingMinutes(markdown: string): number {
  const words = markdown.replace(/[#>*_`\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
```

Show it in the film overline (`.film-overline`, lines 88-94) after the timecode, as
`t('film.readingTime')` with `{n}` replaced: en `{n} min read`, es `{n} min de lectura`.

**Verify**: build passes; on `/films/heat/` the overline contains "min read".

### Step 2: Essay outline in the rail

Destructure `headings` from `render(movie)`. Under the "Study notes" rail link, render a
nested list of the `depth === 2` headings linking to `#${h.slug}`. Indent and dim them
(reuse rail styles, smaller left padding). On ≤ 960 px, hide the nested list (the rail is a
grid of boxes there) — keep only the top-level links.

**Verify**: spec — on `/films/heat/` (1280×800) the rail has a link to `#the-central-idea`
(confirm the slug in the built HTML first).

### Step 3: Highlight the active section

Add a small script: an `IntersectionObserver` over the rail targets (the top-level section
ids and the heading ids) with `rootMargin: '-30% 0px -60% 0px'`; set
`aria-current="true"` on the matching rail link and remove it from the others. Style
`.study-rail a[aria-current='true']` with `color: var(--accent)`. Respect reduced motion
(no animated transitions when `prefers-reduced-motion: reduce`).

**Verify**: spec — scroll `#study-connections` into view; the rail's Connections link gets
`aria-current="true"`.

### Step 4: Previous / next study

Compute `older = all[idx + 1]` and `newer = all[idx - 1]`. After `.study-main`, add a
`<nav class="study-pager" aria-label={t('film.pagerLabel')}>` with up to two links, each
showing case number, title and director. Labels: `film.previous` (en `Previous study`,
es `Estudio anterior`) for the older one, `film.next` (en `Next study`,
es `Estudio siguiente`) for the newer one. Reuse the card look from `.connection`.

**Verify**: spec — on `/films/heat/` follow "Previous study" and land on a page whose case
number is one less (read both from `.film-dossier`).

### Step 5: Smart back link

Add a script: if `document.referrer` has the same origin and its pathname is the home page
for this language (`/` or `/es/`), set the back link's `href` to `document.referrer`, so the
archive comes back with its query (plan 007) and the `#archive` position. Otherwise keep the
server-rendered href. Do not use `history.back()` (it breaks when the page was opened
directly).

**Verify**: spec — visit `/?view=journal`, click a card, click the back link; the URL
contains `view=journal`. (If plan 007 is not merged, assert only that the back link equals
the referrer URL.)

### Step 6: Demo and gate

Demo: open a study, scroll to show the rail highlight moving, follow "Next study". Under 15 s.

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass; GIF written.

## Test plan

Extend `tests/e2e/film.spec.ts` with: reading time visible (en and es), outline link exists,
active-section highlight, previous/next case numbers, back link uses the referrer.

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0 including the new tests
- [ ] New `film.*` keys exist in `en` and `es`
- [ ] Only in-scope files changed
- [ ] `plans/README.md` row updated

## STOP conditions

- `render(movie)` does not return `headings`, or the heading ids in the HTML do not match
  `heading.slug`: report the Astro version and what you see.
- `movie.body` is undefined for collection entries: report it (do not read files from disk
  as a workaround).
- The oldest or newest study renders an empty pager slot that breaks the layout and the fix
  needs markup outside `FilmView.astro`.

## Maintenance notes

- The pager order follows `watchedOn`; if drafts or a different sort are introduced in
  `getMovies()`, the pager follows automatically.
- The outline relies on `##` headings in studies; the study template
  (`src/content/movies/_template.md`) already uses them.
