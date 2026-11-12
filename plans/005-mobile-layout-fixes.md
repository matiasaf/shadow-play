# Plan 005: Fix the mobile layout (no horizontal overflow, compact header, non-blocking archive controls)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e077025..HEAD -- src/components/UpNextView.astro src/layouts/BaseLayout.astro src/components/HomeView.astro src/styles/global.css tests/e2e/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (UI)
- **Planned at**: commit `e077025`, 2026-11-12

## Why this matters

Three layout problems were measured on 2026-11-12 with Playwright at 390×844 (iPhone-size)
and 1280×800:

1. `/up-next/` scrolls horizontally on mobile: the page is **98 px wider** than the
   viewport. The thread headers do not fit.
2. The sticky site header is **147 px tall on mobile** (~17 % of the screen) on every page,
   because the nav wraps into a 2×2 grid under the brand.
3. On the home page (desktop), the sticky archive controls (view tabs + four selects,
   **143 px** tall) sit under the sticky header and cover the top of each group while
   scrolling, so group titles and director quotes are cut off.

All three make the reading experience worse on the devices people use most, and none of
them needs a redesign to fix.

## Current state

- `src/components/UpNextView.astro:68-72` — thread header markup:

  ```astro
  <header class="upnext-thread-head">
    <span class="upnext-thread-rule" aria-hidden="true" />
    <h2>{thread.name}</h2>
    <span class="upnext-thread-count">{String(thread.entries.length).padStart(2, '0')}</span>
  </header>
  ```

  and its CSS at `UpNextView.astro:255-282`. The cause of the overflow is `flex: none` on
  the `h2`: long thread names ("The silence of God and the absurd") cannot wrap.

  ```css
  .upnext-thread-head { display: flex; align-items: baseline; gap: 1.25rem; margin-bottom: 2rem; }
  .upnext-thread-head h2 { flex: none; font-size: clamp(1.6rem, 3vw, 2.4rem); line-height: 1; }
  .upnext-thread-rule { order: 3; flex: 1; height: 1px; background: var(--border); }
  ```

- `src/layouts/BaseLayout.astro:78-128` — header responsive CSS. At `max-width: 960px` the
  nav moves to its own full-width row (`order: 3; width: 100%`), and at `max-width: 640px`
  it becomes `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr))`, which
  produces two rows of links. Base header styles are in `src/styles/global.css`
  (`.site-header`, `.site-nav`, around lines 85-140); the header is `position: sticky; top: 0`.

- `src/components/HomeView.astro:395-404` — the archive controls:

  ```css
  .dashboard-controls {
    position: sticky;
    top: 5.4rem;
    z-index: 10;
    margin-bottom: 3.5rem;
    border: 1px solid var(--border);
    padding: 1rem;
    ...
  }
  ```

  Inside it: `.view-switcher` (5 tab buttons, `margin-bottom: 1rem`) and
  `.dashboard-filters` (`grid-template-columns: repeat(4, minmax(0, 1fr))`). Under
  `max-width: 820px` the controls are already `position: static`.

- Conventions: component styles live in the component's `<style>` block; global tokens
  (`--border`, `--text-faint`, `--accent`, …) are in `src/styles/global.css:1-25`. Reuse
  the tokens; do not add new colors.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| Full e2e | `npm run test:e2e` | all pass |
| Single spec | `npx playwright test tests/e2e/layout.spec.ts --project=chromium` | all pass |
| Demo | `npm run demo -- tests/demo/mobile-layout.demo.ts` | writes `demos/mobile-layout.gif` |

If another dev server already uses port 4321, prefix Playwright commands with
`PLAYWRIGHT_PORT=4322`.

## Scope

**In scope**:
- `src/components/UpNextView.astro` (thread header CSS only)
- `src/layouts/BaseLayout.astro` (header responsive CSS only)
- `src/components/HomeView.astro` (`.dashboard-controls`, `.view-switcher`, `.dashboard-filters` CSS only)
- `tests/e2e/layout.spec.ts` (create)
- `tests/demo/mobile-layout.demo.ts` (create)

**Out of scope**:
- Any change to markup order, copy or i18n strings.
- The map (`MapView.astro`) — see Step 5, which is investigation only.
- Font sizes and focus styles — that is plan 006.

## Git workflow

Follow `.agents/skills/ship-pr/SKILL.md`: worktree and branch `fix/mobile-layout` from
`origin/main`, one commit such as `fix: remove mobile overflow and compact sticky headers`,
PR in English with the demo GIF.

## Steps

### Step 1: Write the failing layout test first

Create `tests/e2e/layout.spec.ts`. For each route in `['/', '/es/', '/films/heat/',
'/directors/', '/directors/michael-mann/', '/map/', '/up-next/', '/es/up-next/']`, at
viewport `{ width: 390, height: 844 }`, assert:

```ts
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth
);
expect(overflow, route).toBeLessThanOrEqual(0);
```

Add a second test: at 390×844 on `/`, `page.locator('.site-header')` has a bounding box
height `<= 110`.

**Verify**: `npx playwright test tests/e2e/layout.spec.ts --project=chromium` → fails on
`/up-next/` (overflow 98) and on the header height (147). Any other failure is a STOP
condition (the baseline differs from this plan).

### Step 2: Let Up Next thread titles wrap

In `UpNextView.astro`, change `.upnext-thread-head h2` from `flex: none` to
`flex: 0 1 auto; min-width: 0; overflow-wrap: anywhere;`. Give `.upnext-thread-rule` a
`min-width: 2rem` so it does not collapse to nothing. Keep the visual order.

**Verify**: the overflow assertions in `layout.spec.ts` pass for `/up-next/` and
`/es/up-next/`.

### Step 3: Compact the mobile header to one nav row

In `BaseLayout.astro`, replace the `max-width: 640px` grid rule for `.site-nav` with a
single horizontally scrollable row:

```css
.site-nav {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 1.25rem;
}
.site-nav::-webkit-scrollbar { display: none; }
.site-nav a { flex: none; white-space: nowrap; }
```

Reduce `.site-header .wrap` `padding-block` at that breakpoint so the header fits in
≤ 110 px. The four links must stay visible or reachable by horizontal swipe; check the
Spanish labels ("Próximas sesiones" is the longest).

**Verify**: header-height test passes; `npm run test:e2e` still passes
(`navigation.spec.ts` clicks every nav link in both languages).

### Step 4: Stop the archive controls from covering content (desktop)

In `HomeView.astro`, at `min-width: 821px`, make the sticky controls compact:

- Put the tabs and the filters on **one row**: `.dashboard-controls { display: flex;
  flex-wrap: wrap; align-items: end; gap: 0.75rem 1.5rem; padding: 0.6rem 0.75rem; }`,
  `.view-switcher { margin-bottom: 0; }`, `.dashboard-filters { flex: 1 1 32rem; }`.
- Make sure `top` matches the real desktop header height (measure
  `.site-header` with Playwright at 1280×800 and use that value, not a guess).

Target: `.dashboard-controls` height **≤ 90 px** at 1280×800. Add that assertion to
`layout.spec.ts` (desktop viewport, `/`).

**Verify**: `npx playwright test tests/e2e/layout.spec.ts --project=chromium` → all pass.

### Step 5: Check map touch behavior (investigation only)

At 390×844 with `hasTouch: true`, load `/map/` and try to scroll the page by swiping
over `#graph` (`page.touchscreen` or a dispatched `touchstart/touchmove`). Record whether
the page scrolls or the graph pans. **Do not change `MapView.astro`.** Write the result
in the PR description under a "Follow-ups" heading.

### Step 6: Demo and full gate

Create `tests/demo/mobile-layout.demo.ts` from `tests/demo/archive-tour.demo.ts`, using a
390×844 viewport (`test.use({ viewport: { width: 390, height: 844 } })`): open `/up-next/`,
glide down past two thread headers, then open `/` and show the header. Keep it under 15 s.

**Verify**: `npm run build` exit 0; `npm run test:e2e` all pass;
`npm run demo -- tests/demo/mobile-layout.demo.ts` writes the GIF (< 10 MB).

## Test plan

- New: `tests/e2e/layout.spec.ts` — no horizontal overflow on 8 routes at 390 px; mobile
  header ≤ 110 px; desktop archive controls ≤ 90 px.
- Existing: `basic.spec.ts`, `navigation.spec.ts`, `film.spec.ts` must keep passing.

## Done criteria

- [ ] `npm run build` exits 0
- [ ] `npm run test:e2e` exits 0, including the new `layout.spec.ts`
- [ ] Only the in-scope files changed (`git status`)
- [ ] PR opened with the demo GIF and the Step 5 finding
- [ ] `plans/README.md` row updated

## STOP conditions

- Step 1 shows overflow on a route other than Up Next, or the measured numbers differ a lot
  from 98 px / 147 px / 143 px: report the new numbers before changing CSS.
- The one-row nav cannot fit the four Spanish labels without hiding one entirely at 390 px
  and horizontal scroll feels wrong to you: stop and ask the operator for a menu button
  design instead of inventing one.
- Fixing a test requires changing markup or i18n strings.

## Maintenance notes

- Any new nav item must be checked against the one-row mobile nav.
- Plan 007 adds a "clear filters" button and a result count to the archive controls; it must
  keep the ≤ 90 px assertion green.
