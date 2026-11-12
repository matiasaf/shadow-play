# Plan 008: Make theme tags on film and director pages link to the filtered archive

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/components/FilmView.astro src/components/DirectorView.astro src/styles/global.css tests/e2e/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/007-archive-state-in-url.md (**hard**: the archive must read `?view=themes&theme=` from the URL and have `id="archive"`)
- **Category**: direction (UX)
- **Planned at**: commit `e077025`, 2026-11-12

## Why this matters

Themes ("obsessions") are how the notebook connects films, but every tag on the site is a
dead `<span>`. A reader who sees "identity" on a study has no way to ask "what else in the
archive is about this?" short of opening the home page and finding the right select. With
plan 007 in place, a tag can simply be a link to the archive filtered by that theme.

## Current state

- `src/components/FilmView.astro:137-148` — dossier tags:

  ```astro
  <div class="dossier-tags">
    <span>{t('director.obsessions')}</span>
    <div class="tag-row">
      {data.tags.map((tag) => (
        <span class="tag">{tag}</span>
      ))}
    </div>
  </div>
  ```

- `src/components/DirectorView.astro` — dossier tags (around lines 95-104), same pattern
  with `obsessions.slice(0, 10)`. `obsessionsOf()` (in `src/lib/directors.ts`) returns tags
  taken from the director's films, so every value is a valid theme filter value.
- `src/components/MovieCard.astro` and `src/components/DirectorsView.astro` also render
  `.tag` spans, but **inside an `<a>`** (the whole card is a link). Nested links are invalid
  HTML, so those stay as spans.
- `src/styles/global.css:623-640` — `.tag` style (pill, border `var(--border)`).
- `localizePath(path, lang)` from `src/i18n/ui.ts` builds language-prefixed URLs. Tags are
  language-specific strings, so a Spanish page must link to `/es/` with the Spanish tag —
  which is what `localizePath('/', lang)` plus the page's own tag gives.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| Full e2e | `npm run test:e2e` | all pass |
| Demo | `npm run demo -- tests/demo/clickable-tags.demo.ts` | GIF written |

## Scope

**In scope**:
- `src/components/FilmView.astro` (dossier tags)
- `src/components/DirectorView.astro` (dossier tags)
- `src/styles/global.css` (`a.tag` hover/focus style)
- `tests/e2e/film.spec.ts` (extend)
- `tests/demo/clickable-tags.demo.ts` (create)

**Out of scope**:
- Tags inside card links (`MovieCard.astro`, `DirectorsView.astro`).
- Tags rendered by the map panel script in `MapView.astro` (client-rendered; follow-up).
- Any change to `HomeView.astro` (plan 007 owns it).

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: branch `feat/clickable-tags`, commit such as
`feat: link study tags to the filtered archive`, PR with demo GIF.

## Steps

### Step 1: Add a small href helper

In each of the two components (or in `src/lib/format.ts` if you prefer one shared helper),
add:

```ts
const themeHref = (tag: string) =>
  `${localizePath('/', lang)}?view=themes&theme=${encodeURIComponent(tag)}#archive`;
```

Check what `localizePath('/', 'es')` returns (`/es` or `/es/`) and make sure the result is
a valid URL in both languages.

### Step 2: Render the tags as links

Replace `<span class="tag">{tag}</span>` with `<a class="tag" href={themeHref(tag)}>{tag}</a>`
in both dossiers. In `global.css`, add `a.tag:hover { border-color: var(--accent-muted);
color: var(--accent); }` and rely on the global focus style (plan 006) for focus.

**Verify**: `npm run build` exit 0.

### Step 3: Test the round trip

Extend `tests/e2e/film.spec.ts` with a test: on `/films/heat/`, click the first dossier
tag link; expect the URL to contain `view=themes` and the tag; expect the Themes tab to be
selected and every visible `.dashboard-card` to include that tag in `data-tags`. Repeat on
`/es/films/heat/` and expect a URL under `/es`.

**Verify**: `npm run test:e2e` all pass.

### Step 4: Demo

`tests/demo/clickable-tags.demo.ts`: open a film, scroll to the dossier, click a tag, show
the filtered archive. Under 15 s.

## Test plan

Two new tests in `tests/e2e/film.spec.ts` (English and Spanish round trip).

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0 including the new tests
- [ ] `grep -n 'class="tag"' src/components/FilmView.astro src/components/DirectorView.astro`
      shows only `<a class="tag"` in the dossiers
- [ ] Only in-scope files changed
- [ ] `plans/README.md` row updated

## STOP conditions

- Plan 007 is not merged (`grep -n 'id="archive"' src/components/HomeView.astro` returns
  nothing, or `/?view=themes` does not select Themes): stop, this plan depends on it.
- A tag clicked on a film page shows an empty archive: the filter values and tag strings
  differ (for example, case or whitespace). Report the example instead of normalizing data.

## Maintenance notes

- If cards ever stop being a single big link, their tags can become links too with the same
  helper.
- The map panel (`MapView.astro`) builds tags in its client script; it could reuse the same
  URL shape in a later change.
