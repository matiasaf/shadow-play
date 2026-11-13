# Implementation Plans

Generados por el skill **improve** el 2026-07-13, contra el commit `3be62f7`.
Ejecutar en el orden de abajo salvo que las dependencias digan otra cosa. Cada
executor: leer el plan completo antes de empezar, respetar sus STOP conditions y
actualizar su fila al terminar.

## Execution order & status

| Plan | Título | Prioridad | Esfuerzo | Depende de | Status |
|------|--------|-----------|----------|------------|--------|
| 001 | Chequeo de integridad del contenido (`check:content`) | P1 | S | — | TODO |
| 002 | CI en GitHub Actions (build + typecheck + contenido + e2e) | P1 | S | 001 (soft) | IN PROGRESS: `ci.yml` con build + e2e (+ demos en PR); faltan `astro check` y `check:content` |
| 003 | `<head>` completo (canonical/hreflang/OG), sitemap, 404, escape JSON del mapa | P2 | M | URL de producción (operador) | TODO |
| 004 | Sincronizar CLAUDE.md y README | P3 | S | mejor al final (001-003) | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (con motivo en una línea) | REJECTED (con rationale)

## UI/UX batch (2026-11-12)

Planned against commit `e077025` after a review of all six views at 1280×800 and 390×844.
Each plan ships as its own PR through `.agents/skills/ship-pr/SKILL.md`, with a demo GIF.

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| 005 | Fix the mobile layout (overflow, compact header, archive controls) | P1 | S | — | DONE: mobile overflow, one-row phone nav, compact desktop controls (`fix/mobile-layout`) |
| 006 | Accessibility baseline (focus, label size, current page, keyboard tabs) | P1 | S | — | DONE: global focus ring, skip link, `aria-current` nav, 0.68rem label floor, keyboard tabs (`feat/a11y-baseline`) |
| 007 | Keep the archive's view, filters and sort in the URL | P1 | M | 006 (soft) | DONE: `view`/`director`/`theme`/`country`/`sort` in the query (defaults omitted, `replaceState`), `#archive` anchor, bfcache re-read, clear button + live count (`feat/archive-state`) |
| 008 | Theme tags link to the filtered archive | P2 | S | 007 (hard) | DONE: film and director dossier tags (plus the director's full obsessions list) link to `/?view=themes&theme=<tag>#archive` via `themeHref()` (`feat/clickable-tags`) |
| 009 | Film page navigation (previous/next, outline rail, reading time, back link) | P2 | M | 007 (soft) | DONE: reading time, `##` outline in the rail with scroll-tracked `aria-current`, previous/next pager, referrer-aware back link (`feat/film-navigation`) |
| 010 | Lighten the home archive (on-demand views, list mode) | P2 | M–L | 007 | DONE: hidden views in `<template>` hydrated on first open (DOM 13.2k → 1.8k nodes), Grid/List toggle (`density=list` in the URL + localStorage) with `MovieRow` (`feat/archive-density`) |
| 011 | Site-wide search | P3 | M | — | DONE: header search dialog (`/`, Cmd/Ctrl+K) over a build-time index of films, directors and the watchlist, accent-insensitive, ~13 KB per language (`feat/search`) |

Notes:

- **005 and 006 first**: small, fix visible defects and do not change the design. They
  touch some of the same files; whichever lands second rebases.
- **008 requires 007**: tags link to `/?view=themes&theme=<tag>#archive`.
- **010 needs an operator decision** for its list mode (Step 3); Steps 1–2 can ship alone.
- **Not planned this round**: map touch behavior on phones (005 Step 5 only investigates
  it), automated axe checks (new dependency), full-text search of essays.

## Dependency notes

- **002 después de 001**: el workflow corre `npm run check:content`; si 001 no está,
  el 002 indica omitir esa línea y anotarlo acá.
- **003 requiere input del operador**: la URL real de producción (hoy `site` es el
  placeholder `my-last-movies.example.com`). Sin URL, el 003 arranca BLOCKED.
- **004 al final**: documenta los scripts nuevos (`check:content`, `check`) de una
  sola pasada.

## Findings considered and rejected / no seleccionados

Auditoría `standard` del 2026-07-13 (repo completo, sin subagentes). El contenido
bilingüe se verificó programáticamente y estaba limpio: pares en/es completos, sin
conexiones colgantes, seeds válidos, nombres de director consistentes, streaming.json
sincronizado.

- **Bundle de d3 en /map** (68 KB min, solo esa página, treeshaking funciona):
  no vale la pena tocarlo.
- **`npm audit`: 2 avisos low en esbuild** (tooling de dev, no alcanzable en runtime):
  no reportable.
- **`caseIndexOf` O(n²) en `DirectorView.astro:33`**: n≈20, irrelevante.
- **12 strings i18n muertos en `src/i18n/ui.ts`** (`map.empty`, `card.framePending`,
  `upnext.why`, etc.): hallazgo real pero no seleccionado esta ronda; limpieza S
  cuando se quiera.
- **Cobertura e2e finita** (un solo spec happy-path): no seleccionado esta ronda;
  candidato a plan futuro después de que el 002 (CI) esté andando.
- **Dirección (opciones, sin plan)**: automatizar refresh semanal de
  `streaming.json` (workflow cron + `TMDB_API_TOKEN` secret, apoyarse en el 002);
  feed RSS de estudios (`@astrojs/rss`, requiere el `site` real del 003); deploy
  automatizado si el sitio aún no está publicado.
