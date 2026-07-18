# Plan 004: Sincronizar CLAUDE.md y README con el estado real del repo

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3be62f7..HEAD -- CLAUDE.md README.md package.json`
> Si `package.json` cambió (p. ej. por los planes 001-003), este plan lo tiene en
> cuenta: los pasos dicen "reflejar los scripts presentes al momento de ejecutar".
> Un cambio en CLAUDE.md/README sí exige recomparar los excerpts.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: ninguno técnico, pero conviene ejecutarlo **último** (después de
  001-003) para documentar los comandos nuevos de una sola pasada.
- **Category**: docs
- **Planned at**: commit `3be62f7`, 2026-07-13

## Why this matters

`CLAUDE.md` es la fuente de verdad que los agentes leen antes de tocar el repo, y hoy
miente en algo básico: dice "Astro 5" cuando está instalado Astro 6.4.8 — un agente
puede razonar contra APIs de la versión equivocada. Además no lista los comandos de
test. El README quedó congelado en una era anterior del proyecto: no menciona
directores, watchlist/Up Next, streaming ni tests, que hoy son la mitad del sitio.
Docs activamente desactualizadas son peores que docs ausentes.

## Current state

- `CLAUDE.md:9` (aprox.) — texto actual:
  `Stack: **Astro 5** + Content Collections (todo Markdown, sin base de datos) + **D3** (solo para el mapa de conexiones).`
- Versión instalada real: `node -p "require('astro/package.json').version"` → `6.4.8`.
- Bloque de comandos de CLAUDE.md (líneas ~12-18): lista `dev`, `build`, `preview`,
  `streaming:update`. Falta `test:e2e` (existe en `package.json` desde el commit
  `7865984`) y, si los planes 001/002 ya corrieron, `check:content` y `check`.
- `README.md` — secciones actuales: intro, "Running it" (sin tests), "i18n" (menciona
  solo `HomeView`, `MapView`, `FilmView` como vistas; hoy también existen
  `DirectorsView`, `DirectorView`, `UpNextView`), "Adding a film" + tabla de
  frontmatter. **No existe** mención de: colección `directors`, colección `watchlist`
  / página Up Next, `src/data/streaming.json` + `npm run streaming:update` +
  `TMDB_API_TOKEN`/`.env.example`, ni Playwright.
- El detalle profundo de arquitectura ya vive en CLAUDE.md (en español). El README es
  la cara pública en inglés: debe ser correcto y apuntar, no duplicar todo.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Versión real de astro | `node -p "require('astro/package.json').version"` | `6.x.y` |
| Scripts reales | `node -p "Object.keys(require('./package.json').scripts).join(' ')"` | lista actual |
| Build (sanidad) | `npm run build` | exit 0 |

## Scope

**In scope**:
- `CLAUDE.md`
- `README.md`

**Out de scope** (NO tocar):
- Todo lo demás. Este plan **no toca código ni contenido** — si al documentar
  encontrás algo que parece un bug, anotalo en el reporte final, no lo arregles.
- No reestructurar CLAUDE.md ni cambiar su tono/idioma (español rioplatense, voseo).
- No traducir el README al español (es la cara en inglés del repo).

## Git workflow

- Branch: `advisor/004-docs-sync`
- Un commit: `docs: sync CLAUDE.md and README with current stack and features`
- NO pushear ni abrir PR salvo que el operador lo pida.

## Steps

### Step 1: Corregir el stack en CLAUDE.md

Reemplazar `**Astro 5**` por `**Astro 6**` en la línea del stack. Buscar cualquier
otra mención de "Astro 5": `grep -n "Astro 5" CLAUDE.md`.

**Verify**: `grep -c "Astro 5" CLAUDE.md` → `0`; `grep -c "Astro 6" CLAUDE.md` → `1`.

### Step 2: Completar el bloque de comandos de CLAUDE.md

Reflejar **todos** los scripts presentes en `package.json` al momento de ejecutar
(consultarlo con el comando de la tabla). Como mínimo agregar:

```bash
npm run test:e2e  # tests end-to-end con Playwright (levanta el dev server solo)
```

y, si existen: `check:content` (plan 001) y `check` (plan 002). Mantener el formato
de comentarios cortos alineados del bloque existente.

**Verify**: por cada script en `package.json` (excepto `astro`, `preview` ya está),
`grep -c "<nombre>" CLAUDE.md` → ≥ 1.

### Step 3: Actualizar README.md

Manteniendo la voz actual (inglés neutro, conciso):

1. **"Running it"**: agregar `npm run test:e2e` con una línea de explicación.
2. Nueva sección corta **"Directors"** después de "Adding a film": el archivo se
   organiza por director; página auto-generada por cada uno; ficha opcional en
   `src/content/directors/<lang>/<slug>.md` con `worldview` + ensayo; el nombre de
   archivo es el slug del nombre.
3. Nueva sección corta **"Up Next (watchlist)"**: entradas en
   `src/content/watchlist/<lang>/<slug>.md`; dónde ver cada película en Argentina
   viene de `src/data/streaming.json`, regenerado con `npm run streaming:update`
   (necesita `TMDB_API_TOKEN` en `.env`, ver `.env.example`; datos de JustWatch vía
   TMDB, mantener la atribución). El JSON generado se commitea.
4. En "i18n", actualizar la lista de vistas espejadas: agregar `/directors`,
   `/up-next` y sus equivalentes `/es/...`.
5. Cierre de una línea apuntando a CLAUDE.md para la guía profunda de arquitectura.

No copiar la tabla de schema de directors/watchlist al README — basta el pointer a
CLAUDE.md (evitar dos fuentes de verdad).

**Verify**:
- `grep -c "watchlist" README.md` → ≥ 1
- `grep -c "streaming:update" README.md` → ≥ 1
- `grep -c "test:e2e" README.md` → ≥ 1
- `grep -c "directors" README.md` → ≥ 1

### Step 4: Sanidad

**Verify**: `npm run build` → exit 0 (los .md de raíz no afectan el build; es solo
confirmación de que no se tocó nada más). `git status` → solo `CLAUDE.md` y
`README.md` modificados.

## Test plan

Docs: la verificación son los greps de los Steps 1-3 más la lectura del diff por el
revisor. Nada más.

## Done criteria

- [ ] `grep -c "Astro 5" CLAUDE.md` → 0
- [ ] `grep -n "test:e2e" CLAUDE.md README.md` → match en ambos
- [ ] README menciona directors, watchlist/Up Next y streaming:update
- [ ] `git status` → solo CLAUDE.md y README.md
- [ ] `npm run build` exit 0
- [ ] Fila de este plan actualizada en `plans/README.md`

## STOP conditions

- `astro` instalado ya no es 6.x (hubo una migración mayor después de este plan):
  documentar la versión real que reporta el comando, y si CLAUDE.md tiene
  instrucciones que dependan de la versión vieja, reportarlo en vez de adivinar.
- Al documentar descubrís una discrepancia funcional real (p. ej. un comando de
  CLAUDE.md que ya no existe en `package.json`): reportala; no inventes el comando ni
  lo borres sin confirmar.

## Maintenance notes

- Cada plan futuro que agregue un script npm debe tocar el bloque de comandos de
  CLAUDE.md en el mismo PR (los planes 001/002 ya lo hacen).
- La regla "README apunta, CLAUDE.md detalla" evita el drift doble; el revisor
  debería rechazar duplicaciones grandes de contenido entre ambos.
