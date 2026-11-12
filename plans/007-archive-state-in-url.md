# Plan 007: Keep the archive's view, filters and sort in the URL

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/components/HomeView.astro src/i18n/ui.ts tests/e2e/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Plans 005 and 006 change CSS and the tab
> keyboard code in `HomeView.astro`; that drift is expected — build on it.)

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none; easier after 006 (which extracts `selectView()`)
- **Category**: direction (UX)
- **Planned at**: commit `e077025`, 2026-11-12

## Why this matters

The home page archive has five views (Directors, Themes, Journal, Timeline, Connections),
three filters (director, theme, country) and a sort. That state lives only in the DOM:
open a film, press Back, and the archive resets to "Directors / All / Recent". A filtered
view cannot be shared or bookmarked, and other pages cannot link to "all films about
identity" (plan 008 needs exactly that). There is also no quick way to clear filters and
no count of what is shown.

## Current state

- `src/components/HomeView.astro` — server part builds `dashboardViews` (lines 156-162) with
  ids `directors | themes | journal | timeline | connections`. Controls markup is at lines
  224-273:
  - tabs: `<button data-view-button={view.id} role="tab" aria-selected=…>`
  - filters: `<select data-dashboard-filter="director|theme|country">` with `value=""` for
    "All"; option values are the raw director name, tag and country strings
  - sort: `<select data-dashboard-sort>` with values `recency | count | alpha`
  - empty state: `<div data-dashboard-empty hidden>`
- Client script at `HomeView.astro:567-633`: `applyDashboard()` sorts and filters the
  active panel; tab clicks toggle `panel.hidden` and call `applyDashboard()`; every select
  `change` calls `applyDashboard()`.
- The archive `<section>` (`HomeView.astro:210`) has no `id`.
- Tags and countries are **language-specific strings** (the Spanish files use Spanish
  tags), so a theme value from `/` is not valid on `/es/`.
- i18n: all strings in `src/i18n/ui.ts`, keys `dashboard.*` at lines ~48-69 (en) and
  ~218-239 (es).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| Full e2e | `npm run test:e2e` | all pass |
| New spec | `npx playwright test tests/e2e/archive-state.spec.ts --project=chromium` | all pass |
| Demo | `npm run demo -- tests/demo/archive-state.demo.ts` | GIF written |

## Scope

**In scope**:
- `src/components/HomeView.astro`
- `src/i18n/ui.ts` (new `dashboard.*` keys, both languages)
- `tests/e2e/archive-state.spec.ts` (create)
- `tests/demo/archive-state.demo.ts` (create)

**Out of scope**:
- Carrying the query string across the language switcher (values are localized; see
  Maintenance notes).
- Server-side filtering: the site is static, state is applied on the client only.
- Changing which views or filters exist.

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: branch `feat/archive-state`, commit such as
`feat: keep archive view and filters in the URL`, PR with demo GIF.

## Steps

### Step 1: Add an anchor to the archive section

Add `id="archive"` to the `<section class="wrap archive-section dashboard">`. Give it
`scroll-margin-top` equal to the sticky header height so `/#archive` lands below the header.

**Verify**: `npm run build` exit 0.

### Step 2: Read state from the URL on load

In the client script, before the first `applyDashboard()`:

- Parse `new URLSearchParams(location.search)`. Supported keys: `view`, `director`,
  `theme`, `country`, `sort`.
- `view`: if it matches a `data-view-button`, select that view (reuse the click logic —
  extract `selectView(id)` if plan 006 has not already).
- Filters: set the select's value only if an `<option>` with that exact value exists;
  otherwise ignore it silently (stale or other-language link).
- `sort`: same rule.

**Verify**: spec — `/?view=themes&theme=identity` shows the Themes panel and every visible
`.dashboard-card` has `identity` in its `data-tags`. Check first that `identity` is a real
English tag (`grep -l "identity" src/content/movies/en/*.md`); pick another tag if not.

### Step 3: Write state to the URL on change

After each tab change or select `change`, build the query from the current controls,
**omitting defaults** (`view=directors`, empty filters, `sort=recency`), and call
`history.replaceState(null, '', url)` keeping `location.hash`. Use `replaceState`, not
`pushState`, so filter tweaks do not flood the Back button.

**Verify**: spec — choose Themes and a country; `page.url()` contains `view=themes` and
`country=`; choose "All" again for the country; `country` disappears from the URL.

### Step 4: Restore on Back

Because the current history entry already holds the query, Back from a film page restores
it. Handle the bfcache case too: listen for `pageshow` and re-apply the URL state when
`event.persisted` is true.

**Verify**: spec — go to `/?view=journal`, click the first visible card, `page.goBack()`,
expect the Journal tab `aria-selected="true"`.

### Step 5: Clear button and result count

Inside `.dashboard-controls`, add:

- a `<button type="button" data-dashboard-clear hidden>` labelled `dashboard.clear`
  (en `Clear filters`, es `Limpiar filtros`), shown only when any filter is non-empty;
  it resets the three filters and re-applies.
- a live count `<p data-dashboard-count aria-live="polite">` with
  `dashboard.count.one` / `dashboard.count.other` (en `1 study` / `{n} studies`,
  es `1 estudio` / `{n} estudios`). Count **unique films** visible in the active panel
  (a film can appear in several theme groups; dedupe by the card's link `href`).

Pass the translated templates to the script with `define:vars` or a `data-*` attribute
(look at how `MapView.astro` passes its `config` object to the client and match it).
If plan 005 is merged, keep `.dashboard-controls` ≤ 90 px tall at 1280 px
(`tests/e2e/layout.spec.ts`).

**Verify**: spec — with a theme filter set, the clear button is visible; clicking it hides
it and the count goes back to the total number of films (36 at planning time; read the real
number from the hero ledger instead of hard-coding it).

### Step 6: Demo and gate

Demo `tests/demo/archive-state.demo.ts`: filter by a theme, open a film, go back, show the
filter still applied, clear it. Under 15 s.

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass; GIF written.

## Test plan

New `tests/e2e/archive-state.spec.ts`: URL → state (Step 2), state → URL with defaults
omitted (Step 3), Back restores (Step 4), clear + count (Step 5), and an invalid value
(`/?theme=does-not-exist`) is ignored without errors (listen to `page.on('pageerror')`).

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0 including the new spec
- [ ] New i18n keys exist in both `en` and `es`
- [ ] Only in-scope files changed
- [ ] `plans/README.md` row updated

## STOP conditions

- `applyDashboard()` or the tab handler no longer match the "Current state" description
  (for example, a framework island replaced the inline script): report before adapting.
- The count cannot be computed without changing `MovieCard.astro` markup.
- `basic.spec.ts` or `navigation.spec.ts` start failing.

## Maintenance notes

- Plan 008 links to `/?view=themes&theme=<tag>#archive`; keep those parameter names stable.
- Plan 010 adds a `density` parameter through the same read/write helpers.
- Carrying `view` and `sort` (not filters) across languages is a possible follow-up in
  `LanguageSwitcher.astro`, which builds its links server-side from the pathname only.
