# Plan 006: Add an accessibility baseline (visible focus, readable labels, current page, keyboard tabs)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/styles/global.css src/layouts/BaseLayout.astro src/components/ src/i18n/ui.ts tests/e2e/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (can run in parallel with 005; if both are open, rebase the second)
- **Category**: bug (accessibility)
- **Planned at**: commit `e077025`, 2026-11-12

## Why this matters

The site is dark (`--bg: #080807`) and leans on tiny uppercase monospace labels. Measured
on 2026-11-12:

- Keyboard focus shows the browser's default outline (`1px auto rgb(0, 95, 204)`), which is
  almost invisible on the dark background. Only the comment modal in `FilmView.astro` and
  the map nodes define their own focus style.
- 58 `font-size` declarations are below `0.68rem` (≈ 10.9 px), down to `0.55rem` (8.8 px),
  usually combined with `--text-faint`. They carry real information (case numbers, filter
  labels, tags, counts).
- The main nav does not say which section is current, for sighted users or screen readers.
- The archive view switcher declares `role="tablist"`/`role="tab"` but has no arrow-key
  behavior or roving `tabindex`, so it does not behave like the tabs it announces.
- There is no "skip to content" link; every page starts with header + nav.

Fixing these is cheap and keeps the noir look.

## Current state

- `src/styles/global.css:1-25` — design tokens. `--accent: #f4d08a`,
  `--text-faint: #81796b`, `--text-soft: #b7afa1`. No global `:focus-visible` rule exists.
- Small font sizes, per file (count of declarations under `0.68rem`):
  `global.css` 14, `MapView.astro` 14, `UpNextView.astro` 10, `FilmView.astro` 7,
  `DirectorView.astro` 5, `HomeView.astro` 4, `DirectorsView.astro` 3,
  `LanguageSwitcher.astro` 1. Find them with:
  `grep -rnE "font-size: 0\.(5[0-9]*|6[0-7]?[0-9]*)rem" src`
- `src/layouts/BaseLayout.astro:42-55` — header nav, plain links without `aria-current`:

  ```astro
  <nav class="site-nav">
    <a href={home}>{t('nav.films')}</a>
    <a href={directors}>{t('nav.directors')}</a>
    <a href={map}>{t('nav.map')}</a>
    <a href={upnext}>{t('nav.upnext')}</a>
  </nav>
  ```

  `src/i18n/ui.ts` exports `stripLangFromPath(pathname)` (line ~371), which turns
  `/es/films/heat/` into `/films/heat/`; use it to decide the current section.
- `src/components/HomeView.astro:225-240` — the tab buttons (`role="tab"`,
  `aria-selected`, `aria-controls`), and `HomeView.astro:618-629` — the click handler that
  switches panels. Panels (`role="tabpanel"`, line ~283) have no `aria-labelledby`.
- `src/components/FilmView.astro:711-718` — the one existing focus style, the pattern to
  reuse globally:

  ```css
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  ```

- All UI strings go in `src/i18n/ui.ts`, in **both** `en` and `es` (see `AGENTS.md`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| Full e2e | `npm run test:e2e` | all pass |
| New spec | `npx playwright test tests/e2e/a11y.spec.ts --project=chromium` | all pass |

## Scope

**In scope**:
- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/components/*.astro` — only `font-size` values and focus styles, plus the tab
  keyboard handling in `HomeView.astro`
- `src/i18n/ui.ts` — one new key, `a11y.skipToContent`, in both languages
- `tests/e2e/a11y.spec.ts` (create)
- `tests/demo/keyboard-navigation.demo.ts` (create)

**Out of scope**:
- Color token changes (`--text-faint` measures ~4.6:1 on `--bg`, which passes AA; leave it).
- Adding `@axe-core/playwright` or any other dependency. Note it as a follow-up in the PR.
- Map node keyboard behavior (`MapView.astro:795-812` already handles it).

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: branch `feat/a11y-baseline`, commit such as
`feat: add visible focus, readable labels and keyboard tabs`, PR with demo GIF.

## Steps

### Step 1: Global focus style

Add to `global.css`:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

Remove the now-duplicate rule in `FilmView.astro:711-718` only if it is identical. Do not
touch `MapView.astro:959-960` (it intentionally replaces the outline with a halo).

**Verify**: in `a11y.spec.ts`, load `/`, press Tab twice, and assert the active element's
computed `outline-style` is `solid` and `outline-color` is `rgb(244, 208, 138)`.

### Step 2: Skip link

In `BaseLayout.astro`, add a first child of `<body>`:
`<a class="skip-link" href="#main">{t('a11y.skipToContent')}</a>` and `id="main"` on
`<main>`. Style it visually hidden until focused (position it top-left over the header when
`:focus`). Add `a11y.skipToContent`: en `Skip to content`, es `Saltar al contenido`.

**Verify**: spec — first Tab on `/` focuses a link named "Skip to content"; on `/es/`,
"Saltar al contenido".

### Step 3: Mark the current section in the nav

In `BaseLayout.astro`, compute `const current = stripLangFromPath(Astro.url.pathname)` and
set `aria-current="page"` on the nav link whose section matches: `/` exactly for Films,
otherwise by prefix (`/directors`, `/map`, `/up-next`). A film page (`/films/...`) marks
Films. Style `.site-nav a[aria-current='page']` with the accent color and the existing
bottom border used on hover.

**Verify**: spec — on `/directors/michael-mann/` the nav link "Directors" has
`aria-current="page"` and no other nav link does; on `/es/map/`, "El mapa" does.

### Step 4: Raise the label font-size floor

Set every `font-size` below `0.68rem` found by the grep in "Current state" to `0.68rem`.
Where letter-spacing is `≥ 0.18em`, reduce it to `0.14em` so the wider text keeps fitting.
Check the archive cards, film dossier, map toolbar and Up Next cards visually at 1280 and
390 px widths (take Playwright screenshots into a scratch folder and look at them).

**Verify**: `grep -rnE "font-size: 0\.(5[0-9]*|6[0-7]?[0-9]*)rem" src` → no matches;
`npm run test:e2e` all pass.

### Step 5: Make the archive tabs keyboard-operable

In `HomeView.astro`:

- Give each tab an `id` (`dashboard-tab-${view.id}`) and each panel
  `aria-labelledby` pointing to it.
- Roving tabindex: the selected tab has `tabindex="0"`, the others `tabindex="-1"`.
- On `keydown` within the tablist: ArrowRight/ArrowLeft move to the next/previous tab
  (wrapping), Home/End to first/last; moving focus also activates the tab (call the same
  code as the click handler — extract it into a `selectView(button)` function).

**Verify**: spec — focus the "Directors" tab, press ArrowRight; the "Themes" tab is focused,
has `aria-selected="true"`, and `[data-dashboard-panel="themes"]` is visible.

### Step 6: Demo and gate

Create `tests/demo/keyboard-navigation.demo.ts` (copy `archive-tour.demo.ts`): Tab to the
skip link, Tab into the nav, then into the archive tabs and use the arrows. Under 15 s.

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass; demo GIF written.

## Test plan

New `tests/e2e/a11y.spec.ts` with: focus outline (Step 1), skip link in both languages
(Step 2), `aria-current` on three routes (Step 3), arrow-key tabs (Step 5). Model the file
on `tests/e2e/film.spec.ts`.

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0 including `a11y.spec.ts`
- [ ] The small-font grep returns no matches
- [ ] `a11y.skipToContent` exists in both `en` and `es` in `src/i18n/ui.ts`
- [ ] Only in-scope files changed
- [ ] `plans/README.md` row updated

## STOP conditions

- Raising font sizes breaks a layout you cannot fix by adjusting letter-spacing or padding
  in the same rule (for example, the map toolbar no longer fits on one line at 1280 px):
  report which selector and keep the old size there.
- Existing e2e tests fail because roles or names changed: you changed markup beyond scope.

## Maintenance notes

- New components should use `0.68rem` as the minimum label size; consider adding a
  `--fs-label` token if more labels appear.
- Follow-up: an automated axe check in CI (needs a new dev dependency — operator decision).
