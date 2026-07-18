# Plan 001: Agregar un chequeo de integridad del contenido (`npm run check:content`)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3be62f7..HEAD -- scripts/ src/content/ package.json CLAUDE.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (prevención) / dx
- **Planned at**: commit `3be62f7`, 2026-07-13

## Why this matters

El sitio es un archivo bilingüe donde cada película vive en **dos** archivos Markdown
(`src/content/movies/en/<slug>.md` y `es/<slug>.md`) que deben mantenerse en espejo.
Zod (via `src/content.config.ts`) valida cada archivo **aislado**, pero ninguno de los
invariantes *entre* archivos que `CLAUDE.md` exige se verifica con tooling: si falta el
par en español, la película desaparece del sitio en español sin error; si una
`connection` apunta a un slug inexistente, `FilmView` renderiza una card muerta sin
link; si el nombre del director tiene un typo en una ficha, el director se parte en dos
páginas distintas. Hoy el contenido está limpio (auditado el 2026-07-13), pero solo por
disciplina manual. Este plan agrega `scripts/check-content.mjs` + `npm run check:content`
para que esas roturas se detecten con un comando (y después, en CI — ver plan 002).

## Current state

- `src/content.config.ts` — define las 3 colecciones (`movies`, `directors`,
  `watchlist`) con schemas Zod **por archivo**. No hay validación cruzada.
- `src/content/movies/<lang>/<slug>.md` — 20 películas × 2 idiomas. El frontmatter
  relevante: `director` (string), `year` (number), `watchedOn` (fecha), `rating`
  (number opcional), `connections` (lista de `{ slug, note }` con slugs neutrales).
- `src/content/watchlist/<lang>/<slug>.md` — 17 entradas × 2 idiomas. Frontmatter
  relevante: `director`, `year`, `order` (number opcional), `seeds` (lista de slugs
  neutrales que deben existir en `movies`).
- `src/content/directors/<lang>/<slug>.md` — 11 fichas × 2 idiomas. El **nombre de
  archivo** debe ser el slug derivado del campo `name` con la misma regla que
  `directorSlug()` de `src/lib/directors.ts:21-28`:

  ```ts
  export function directorSlug(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  ```

- `src/data/streaming.json` — dato derivado, keyeado por slug neutral de watchlist:
  `{ "region": "AR", "checkedOn": "...", "films": { "<slug>": {...} } }`.
- Los templates `_template.md` empiezan con `_` y deben **ignorarse** (mismo criterio
  que el loader de Astro: patrón `[^_]*.md`).
- Ya existe un script Node ESM sin dependencias en el repo que parsea frontmatter a
  mano — usalo como patrón de estilo: `scripts/update-streaming.mjs:45-61`:

  ```js
  /** Pulls the scalar fields we need out of a watchlist file's frontmatter. */
  function parseFrontmatter(raw) {
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    ...
  }
  ```

- `package.json:6-13` — scripts actuales: `dev`, `build`, `preview`,
  `streaming:update`, `test:e2e`, `test:e2e:ui`, `astro`. No hay linter ni framework
  de tests unitarios: el script debe ser **Node puro, sin dependencias nuevas**.
- Convención del repo: comentarios y mensajes en inglés dentro del código, docs en
  español rioplatense. Los scripts usan `console.log`/`console.warn`/`console.error`
  y `process.exit(1)` en error (ver `scripts/update-streaming.mjs:29-32`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Chequeo nuevo | `npm run check:content` | exit 0, resumen "OK" |
| Build (valida schemas + imágenes) | `npm run build` | exit 0, "76 page(s) built" (o más si se sumaron fichas) |

## Scope

**In scope** (los únicos archivos a modificar/crear):
- `scripts/check-content.mjs` (crear)
- `package.json` (solo agregar el script `check:content`)
- `CLAUDE.md` (solo agregar una línea al bloque de comandos)

**Out of scope** (NO tocar aunque parezcan relacionados):
- `src/content/**` — el chequeo **lee** contenido; jamás lo corrige ni lo formatea.
- `src/content.config.ts` — la validación por archivo ya funciona; no duplicarla.
- `scripts/update-streaming.mjs` — solo se usa como referencia de estilo.
- `src/lib/directors.ts` — no importar desde el script (usa `astro:content`, no corre
  en Node puro); **copiá** la función `directorSlug` al script con un comentario que
  diga de dónde viene.

## Git workflow

- Branch: `advisor/001-content-integrity-check`
- Un commit, estilo del repo (conventional-ish, ver `git log`): p. ej.
  `feat: add content integrity check script (check:content)`
- NO pushear ni abrir PR salvo que el operador lo pida.

## Steps

### Step 1: Crear `scripts/check-content.mjs`

Script Node ESM sin dependencias (mismo estilo que `scripts/update-streaming.mjs`:
imports de `node:fs/promises` / `node:path`, top-level await). Estructura:

1. Un parser de frontmatter genérico: extraer el bloque `---...---` y quedarse con
   los campos escalares (`title`, `director`, `year`, `watchedOn`, `rating`, `order`,
   `name`) y las listas necesarias:
   - `connections`: los valores de las líneas `slug: <valor>` dentro del bloque
     `connections:` (cada item es `- slug: ...` seguido de `note: ...`).
   - `seeds`: los items `- <slug>` dentro del bloque `seeds:`.
   No hace falta un parser YAML completo — el frontmatter del repo es plano y
   consistente; alcanza con regex por línea como en `update-streaming.mjs`.
2. Cargar las tres colecciones desde `src/content/{movies,directors,watchlist}/{en,es}/`,
   ignorando archivos que empiecen con `_`. El slug es el nombre de archivo sin `.md`.
3. Acumular errores en una lista (no cortar en el primero) y al final: si hay errores,
   imprimirlos uno por línea con prefijo `ERROR:` y `process.exit(1)`; si no,
   `console.log("OK — <n> movies, <n> watchlist, <n> directors checked")`.

Chequeos (cada uno con un mensaje que incluya el archivo culpable):

| # | Invariante | Severidad |
|---|-----------|-----------|
| a | Todo slug de `movies` existe en `en/` **y** `es/` | ERROR |
| b | En cada par de `movies`: `director`, `year`, `watchedOn` y `rating` idénticos entre idiomas (comparar como strings crudos del frontmatter) | ERROR |
| c | Todo `connections[].slug` (ambos idiomas) existe como slug de `movies` y no es el propio archivo | ERROR |
| d | Todo slug de `watchlist` existe en `en/` y `es/`; `director`, `year` y `order` idénticos entre idiomas | ERROR |
| e | Todo `seeds[]` de watchlist existe como slug de `movies` | ERROR |
| f | Ningún slug está a la vez en `movies` y `watchlist` (una película estudiada debe salir de la watchlist) | ERROR |
| g | Todo slug de `directors` existe en `en/` y `es/`, y el nombre de archivo == `directorSlug(name)` (con la copia local de la función) | ERROR |
| h | El `name` de cada ficha de director coincide exactamente con el campo `director` de al menos una película | ERROR |
| i | Toda key de `src/data/streaming.json → films` existe como slug de watchlist | WARN (prefijo `WARN:`, no afecta el exit code) |
| j | Todo slug de watchlist (sin override `skip` en `src/data/streaming.overrides.json`, si el archivo existe) tiene entrada en `streaming.json` | WARN |

**Verify**: `node scripts/check-content.mjs` → exit 0 y línea final
`OK — 20 movies, 17 watchlist, 11 directors checked` (los números pueden ser mayores
si se agregó contenido después del 2026-07-13; lo importante es `OK` y exit 0).

### Step 2: Probar que el chequeo detecta roturas (negativo)

Crear un archivo trampa temporal y verificar que el script falla:

```bash
printf -- '---\ntitle: Test\ndirector: Nobody\nyear: 2000\nwatchedOn: 2026-01-01\nlogline: test\n---\n' \
  > src/content/movies/en/zz-integrity-test.md
node scripts/check-content.mjs; echo "exit=$?"
```

**Verify**: exit=1 y un `ERROR:` que menciona `zz-integrity-test` (par `es/` faltante).
Después limpiar: `rm src/content/movies/en/zz-integrity-test.md` y
`node scripts/check-content.mjs` → exit 0 de nuevo.

### Step 3: Registrar el script en `package.json`

En `package.json`, dentro de `scripts`, agregar (después de `"preview"`):

```json
"check:content": "node scripts/check-content.mjs",
```

**Verify**: `npm run check:content` → exit 0, `OK — ...`.

### Step 4: Documentar el comando en `CLAUDE.md`

En el bloque de comandos de `CLAUDE.md` (líneas ~12-18, el bloque ```bash con
`npm run dev` etc.), agregar una línea:

```bash
npm run check:content  # valida invariantes entre archivos (pares en/es, connections, seeds)
```

**Verify**: `grep -n "check:content" CLAUDE.md` → 1 match.

## Test plan

No hay framework de tests unitarios en el repo (solo Playwright e2e) — no agregar uno.
La cobertura del script es el test negativo del Step 2 más el build:

- `npm run check:content` → exit 0 sobre el contenido actual.
- Step 2 (fixture roto) → exit 1 con mensaje claro; tras limpiar, exit 0.
- `npm run build` → exit 0 (nada del build cambió).

## Done criteria

- [ ] `npm run check:content` exit 0 con resumen `OK — ...`
- [ ] El test negativo del Step 2 devolvió exit 1 y el fixture fue borrado
      (`git status` no muestra `zz-integrity-test.md`)
- [ ] `npm run build` exit 0
- [ ] `grep -n "check:content" package.json CLAUDE.md` → 1 match en cada archivo
- [ ] Solo `scripts/check-content.mjs`, `package.json` y `CLAUDE.md` modificados (`git status`)
- [ ] Fila de este plan actualizada en `plans/README.md`

## STOP conditions

- El frontmatter real no matchea el formato asumido (p. ej. `connections` escrito en
  formato flow `[{...}]` en algún archivo y el parser por líneas no lo ve): reportar
  qué archivo rompe el supuesto en vez de complejizar el parser.
- El chequeo encuentra **errores reales en el contenido actual** (al 2026-07-13 estaba
  limpio; si HEAD avanzó y hay violaciones nuevas): NO corregir el contenido — reportar
  la lista y frenar, la corrección editorial es del autor.
- `directorSlug` copiada produce un slug distinto al nombre de archivo de una ficha
  existente: verificá la copia contra `src/lib/directors.ts:21-28` antes de reportar.

## Maintenance notes

- Si se agrega un campo nuevo al frontmatter que deba mantenerse en espejo entre
  idiomas (p. ej. `country`), sumarlo a la lista del chequeo (b)/(d).
- Si algún día `movies` adopta co-direcciones con campo múltiple, el chequeo (h) debe
  adaptarse.
- El plan 002 (CI) asume que este script existe y lo corre en el pipeline; si este
  plan se ejecuta después del 002, agregar el paso al workflow.
- Deuda deliberada: el parser no es YAML completo; si el frontmatter se vuelve más
  rico (strings multilínea en campos chequeados), migrar a un parser real (p. ej.
  `yaml` como devDependency) en ese momento.
