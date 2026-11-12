# Plan 010: Lighten the home archive (render hidden views on demand, add a compact list mode)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/components/HomeView.astro src/components/MovieCard.astro src/styles/global.css src/i18n/ui.ts tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Plan 007 changes the `HomeView.astro` script;
> that drift is expected — build on it.)

## Status

- **Priority**: P2
- **Effort**: M–L
- **Risk**: MED
- **Depends on**: plans/007-archive-state-in-url.md (the `density` parameter uses its URL helpers)
- **Category**: perf / direction (UX)
- **Planned at**: commit `e077025`, 2026-11-12

> **Operator decision before starting**: Step 3 adds a list mode, which changes how the home
> page looks. Steps 1–2 (render on demand) are invisible to readers and can ship alone. If
> the operator has not approved the list mode, do Steps 1–2 only and mark Step 3 as
> deferred in the README row.

## Why this matters

Measured on 2026-11-12 with 36 films: the home page renders **all five archive views at
once** — 426 movie cards (each film appears once per view, and several times in Themes),
12,806 DOM nodes and 918 KB of HTML. Four of the five panels are `hidden`, but the browser
still parses and lays out everything. The visible page is also long: ~20,000 px on desktop,
~29,000 px on mobile, because every view is a grid of large image cards. The archive grows by
one film per study, so this gets worse with every PR.

## Current state

- `src/components/HomeView.astro:277-316` — every view is rendered server-side:

  ```astro
  {dashboardViews.map((view, index) => (
    <div class="dashboard-panel" id={`dashboard-${view.id}`} data-dashboard-panel={view.id}
         role="tabpanel" hidden={index !== 0}>
      {view.groups.map((group) => (
        <section class="dashboard-group" data-dashboard-group …>
          …
          <div class="movie-grid dashboard-grid">
            {group.films.map((movie) => (
              <div class="dashboard-card" {...movieAttrs(movie)}>
                <MovieCard movie={movie} index={caseIndexById.get(movie.id)} lang={lang} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ))}
  ```

- `HomeView.astro:635-658` — scroll animation: when motion is allowed, the script adds
  `js-anim` to `<html>` and an `IntersectionObserver` adds `is-hit` to each `.movie-grid .card`.
  `src/styles/global.css` (around line 1052) hides `.js-anim .card` until it has `is-hit`.
  **Cards inserted later must be observed too, or they stay invisible.**
- `src/components/MovieCard.astro` — the card: case number, frame image (`<Image>` 520×293,
  lazy), director, timecode, title, meta, logline, up to 3 tags, action label.
- `tests/e2e/navigation.spec.ts` collects every `a[href*="/films/"]` on `/` and `/es/` and
  requests each one. The default Directors view contains every film, so links in other
  panels are not needed for that test.
- `tests/e2e/basic.spec.ts` clicks the Themes tab and then a card in the Directors panel.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| Full e2e | `npm run test:e2e` | all pass |
| Measure | see Step 0 | numbers recorded |
| Demo | `npm run demo -- tests/demo/archive-density.demo.ts` | GIF written |

## Scope

**In scope**:
- `src/components/HomeView.astro`
- `src/components/MovieRow.astro` (create, Step 3)
- `src/styles/global.css` (list-mode styles only)
- `src/i18n/ui.ts` (`dashboard.density.*` keys, both languages)
- `tests/e2e/archive-density.spec.ts` (create)
- `tests/demo/archive-density.demo.ts` (create)

**Out of scope**:
- `MovieCard.astro` visual changes.
- Pagination or "load more" for the default view.
- Changing which views exist.

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: branch `feat/archive-density`. If Steps 1–2 ship
alone, use commit `perf: render hidden archive views on demand`; Step 3 can be a second
commit `feat: add compact list mode to the archive`.

## Steps

### Step 0: Measure the baseline

With the dev server running, record for `/` at 1280×800: number of `a.card`, total DOM
nodes (`document.querySelectorAll('*').length`), HTML size of the built
`dist/index.html` (`wc -c`), and `document.documentElement.scrollHeight`. Expect roughly
426 / 12,800 / 918 KB / 20,000 at 36 films. Put the numbers in the PR description.

### Step 1: Wrap hidden panels in `<template>`

Render the first (default) panel as today. For every other view, render its groups inside
`<template data-panel-template={view.id}>` placed in the empty panel `<div>`. Template
content is parsed but not rendered: no layout, no image requests, and the nodes are not in
the live DOM.

In the script, before showing a panel (tab click and URL restore from plan 007), if it still
has a template, `panel.replaceChildren(template.content.cloneNode(true))` once, then run
`applyDashboard()`. Then observe the new `.card` elements with the same
`IntersectionObserver` (move it to module scope and expose `observeCards(root)`).

**Verify**: Playwright — on load, `document.querySelectorAll('a.card').length` equals the
number of films (36 at planning time; compare with the hero "studies published" number);
after clicking Themes, Themes cards are visible (not `opacity: 0`) and the existing
`basic.spec.ts` passes.

### Step 2: Re-check the gate

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass; re-run Step 0 and record
the new numbers (DOM nodes should drop by more than half).

### Step 3: Compact list mode (needs operator approval — see top)

- Create `src/components/MovieRow.astro`: one line per film — case number, title (link),
  director, year, up to 3 tags — no image. Use the existing mono/serif tokens.
- Render, inside each `.dashboard-card`, both the card and the row; show one or the other
  with a class on the archive section (`data-density="grid|list"`) and CSS, so filtering
  and sorting keep working unchanged.
- Add a two-button toggle in `.dashboard-controls` (`aria-pressed`), labels
  `dashboard.density.grid` (en `Grid`, es `Grilla`) and `dashboard.density.list`
  (en `List`, es `Lista`). Store it in the URL as `density=list` using the plan 007 helpers
  (default `grid` omitted), and remember the last choice in `localStorage` inside a
  `try/catch`.

**Verify**: spec — click List: `.dashboard-card a.card` hidden, rows visible; page height
at 1280×800 is under 40 % of the grid height; reload with `?density=list` keeps the list.

### Step 4: Demo and gate

Demo: switch to List, change view, filter, switch back to Grid. Under 15 s.

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass; GIF written.

## Test plan

New `tests/e2e/archive-density.spec.ts`: initial card count equals film count; switching
views hydrates panels and their cards become visible; list mode toggles and persists via URL.
Run with default motion settings (the reveal animation is on) so the invisible-card risk is
covered.

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0 including the new spec
- [ ] Before/after numbers from Step 0 are in the PR description
- [ ] Only in-scope files changed
- [ ] `plans/README.md` row updated (note if Step 3 was deferred)

## STOP conditions

- Cards in hydrated panels stay invisible and observing them does not fix it.
- Plan 007 is not merged and Step 3 needs the URL helpers: ship Steps 1–2 and stop.
- The list mode needs changes to `MovieCard.astro` to work.

## Maintenance notes

- New archive views must follow the template pattern, not render eagerly.
- If the archive passes a few hundred films, the default Directors view itself will need
  paging or per-group collapse; that is a separate plan.
