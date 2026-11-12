# Plan 011: Add a site-wide search for films, directors and the watchlist

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/layouts/BaseLayout.astro src/components/ src/lib/ src/i18n/ui.ts tests/e2e/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (rebase on 005/006 if they touched the header first)
- **Category**: direction (UX)
- **Planned at**: commit `e077025`, 2026-11-12

## Why this matters

The only search on the site lives inside the map toolbar. To reach a specific film from
anywhere else, a reader must go to the home page and scroll or filter. With 36 studies,
19 directors and a watchlist that grows every week, "jump to a title" is the most common
shortcut missing. The data is small and static, so a build-time index with no dependency
is enough.

## Current state

- `src/layouts/BaseLayout.astro:42-55` — header with brand, `.site-nav` and
  `<LanguageSwitcher />` inside `.header-end`. Every page uses this layout.
- Data helpers:
  - `getMovies(lang)`, `slugOf(entry)` — `src/lib/movies.ts`
  - `getDirectors(lang)` (returns `{ name, slug, films, entry }`) — `src/lib/directors.ts`
  - `getWatchlist(lang)`, `watchSlugOf(entry)` — `src/lib/watchlist.ts`
- Routes: films `/films/<slug>/`, directors `/directors/<slug>/`, watchlist items have
  `id={watchSlugOf(entry)}` on their `<li>` in `/up-next/` (`UpNextView.astro`, around
  line 85), so `/up-next/#<slug>` works. Build all URLs with `localizePath(path, lang)`.
- Existing dialog pattern to copy (open/close, backdrop click, centering fix for the global
  `* { margin: 0 }` reset): `FilmView.astro:200-230` (markup), `:331-355` (script),
  `:800-815` (`.comment-modal` CSS).
- `MapView.astro` passes server data to its client script; follow the same approach
  (a `<script type="application/json">` block, or `define:vars`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| New spec | `npx playwright test tests/e2e/search.spec.ts --project=chromium` | all pass |
| Full e2e | `npm run test:e2e` | all pass |
| Demo | `npm run demo -- tests/demo/site-search.demo.ts` | GIF written |

## Scope

**In scope**:
- `src/components/SiteSearch.astro` (create)
- `src/layouts/BaseLayout.astro` (mount the component in the header)
- `src/i18n/ui.ts` (`search.*` keys, both languages)
- `tests/e2e/search.spec.ts` (create)
- `tests/demo/site-search.demo.ts` (create)

**Out of scope**:
- Full-text search of essay bodies (would make the index much larger; follow-up).
- Search libraries (Pagefind, Fuse, …) — no new dependencies.
- The map's own search box.

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: branch `feat/search`, commit such as
`feat: add site-wide search dialog`, PR with demo GIF.

## Steps

### Step 1: Build the index at build time

In `SiteSearch.astro` (frontmatter), with `lang` from `getLangFromUrl(Astro.url)`, build an
array of `{ kind: 'film' | 'director' | 'watchlist', title, sub, href, terms }`:

- film: title, `originalTitle`, director, year, tags → `/films/<slug>/`
- director: name, number of studies → `/directors/<slug>/`
- watchlist: title, director, year → `/up-next/#<slug>`

`terms` is one lowercase string with diacritics removed
(`s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()`). Emit it as JSON in a
`<script type="application/json" id="search-index">`.

**Verify**: build passes; the built `dist/index.html` contains `id="search-index"` and its
JSON has as many `film` entries as there are English studies.

### Step 2: Trigger and dialog

Render a button in the header (`aria-haspopup="dialog"`, label `search.open`, en `Search`,
es `Buscar`; show a magnifier icon plus the label on desktop, icon only under 640 px with the
label kept for screen readers). It opens a `<dialog>` with:

- an `<input type="search">` with `role="combobox"`, `aria-controls` the results list,
  `aria-expanded`, `aria-activedescendant`, placeholder `search.placeholder`
  (en `Films, directors, up next…`, es `Películas, directores, próximas…`)
- a `<ul role="listbox">` of results (max 8), each `role="option"` containing a link,
  with a small kind label (`search.kind.film|director|watchlist`)
- an empty-results line `search.empty` (en `Nothing in the archive yet.`,
  es `Nada en el archivo todavía.`)

Shortcuts: `/` (when focus is not in an input) and `Cmd/Ctrl+K` open it; Escape closes.

### Step 3: Matching and keyboard

Match every whitespace-separated query word against `terms` (all must match). Rank: title
starts with query > title contains > other terms. ArrowUp/ArrowDown move the active option,
Enter follows its link.

**Verify**: spec cases below.

### Step 4: Demo and gate

Demo: press `/`, type "vill", arrow down, Enter onto a Villeneuve page. Under 15 s.

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass; GIF written.

## Test plan

New `tests/e2e/search.spec.ts`:
- open with the button and with `/`; Escape closes and focus returns to the button
- "heat" → first option is the film Heat; Enter navigates to `/films/heat/`
- accent-insensitive: on `/es/`, typing "proxim" or a Spanish title without accents finds it
  (pick a real title with an accent from `src/content/movies/es/`)
- a director query ("mann") returns the director entry linking to `/directors/michael-mann/`
- a watchlist title links to `/up-next/#<slug>` and that element exists
- a nonsense query shows the empty message
- existing `navigation.spec.ts` still passes (the new header button must not change nav link names)

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0 including `search.spec.ts`
- [ ] `search.*` keys exist in `en` and `es`
- [ ] Mobile header still ≤ 110 px if plan 005 is merged (`tests/e2e/layout.spec.ts`)
- [ ] Only in-scope files changed
- [ ] `plans/README.md` row updated

## STOP conditions

- The search index JSON for one language exceeds 50 KB: report the size before shipping.
- Adding the trigger breaks the header layout at 390 px and the fix needs a header redesign.

## Maintenance notes

- New collections or routes should be added to the index in `SiteSearch.astro`.
- Searching essay text is the natural next step; if wanted, evaluate Pagefind (build-time,
  static) in a separate plan.
