# Plan 002: Agregar CI en GitHub Actions (build + typecheck + contenido + e2e)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3be62f7..HEAD -- package.json playwright.config.ts .github/ tsconfig.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-content-integrity-check.md (soft: el workflow corre
  `check:content` si existe; si el 001 no se ejecutó aún, omitir ese paso del
  workflow y anotarlo en `plans/README.md`)
- **Category**: dx
- **Planned at**: commit `3be62f7`, 2026-07-13

## Why this matters

No existe `.github/`: el build, la validación de contenido y los tests e2e solo corren
si el autor se acuerda de correrlos localmente. Una ficha con frontmatter inválido o
una regresión de UI llega a `main` sin ningún aviso. La intención de CI ya está en el
repo (`playwright.config.ts` ramifica con `process.env.CI`) — solo falta el workflow.
Además hoy no hay typecheck: Vite compila TypeScript sin chequear tipos, así que un
error de tipos en los `<script>` de los `.astro` pasa silencioso; este plan agrega
`astro check` como gate.

## Current state

- No existe `.github/` (verificado al 2026-07-13).
- `package.json:6-13` — scripts: `dev`, `build`, `preview`, `streaming:update`,
  `test:e2e` (= `playwright test`), `test:e2e:ui`, `astro`. Dependencias: `astro
  ^6.4.8`, `d3 ^7.9.0`; devDependencies: `@playwright/test ^1.61.1`, `@types/d3`.
  No hay `@astrojs/check` ni `typescript` instalados.
- `playwright.config.ts` — un solo project (chromium), `webServer` levanta
  `npm run dev -- --host 127.0.0.1` en `http://127.0.0.1:4321` con
  `reuseExistingServer: !process.env.CI` y timeout de 120 s. Un solo spec:
  `tests/e2e/basic.spec.ts`.
- `.gitignore` ya ignora `dist/`, `.astro/`, `playwright-report/`, `test-results/`.
- El build actual: `npm run build` → exit 0, "76 page(s) built" en ~1 s.
- El streaming script necesita `TMDB_API_TOKEN`, pero **ni el build ni los tests lo
  usan** — el CI no necesita ningún secret.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Instalar deps | `npm ci` | exit 0 |
| Typecheck (nuevo) | `npm run check` | exit 0, `0 errors` |
| Contenido (si existe el plan 001) | `npm run check:content` | exit 0 |
| Build | `npm run build` | exit 0 |
| E2E local | `npm run test:e2e` | exit 0, 1 passed |
| Lint del YAML | `npx --yes yaml-lint .github/workflows/ci.yml` | exit 0 |

## Scope

**In scope**:
- `.github/workflows/ci.yml` (crear)
- `package.json` + `package-lock.json` (agregar devDeps `@astrojs/check` y
  `typescript`, y el script `check`)

**Out of scope** (NO tocar):
- `playwright.config.ts` — ya está preparado para CI.
- `tests/e2e/**` — ampliar cobertura es otro trabajo (quedó sin plan esta ronda).
- `scripts/update-streaming.mjs` y cualquier automatización del streaming (candidato
  a workflow aparte, fuera de este plan).
- Deploy: este workflow **no** publica el sitio; solo valida.

## Git workflow

- Branch: `advisor/002-ci-pipeline`
- Commits estilo repo: `feat: add CI workflow (build, typecheck, content check, e2e)`
- NO pushear ni abrir PR salvo que el operador lo pida. (Nota: el workflow solo se
  puede ver corriendo una vez pusheado; el criterio de done local es que cada comando
  que el YAML invoca pase localmente.)

## Steps

### Step 1: Agregar typecheck (`astro check`)

```bash
npm install --save-dev @astrojs/check typescript
```

y en `package.json` → `scripts`, agregar (después de `"build"`):

```json
"check": "astro check",
```

**Verify**: `npm run check` → exit 0. Si reporta errores de tipos preexistentes,
ver STOP conditions.

### Step 2: Crear `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check:content   # omitir esta línea si el plan 001 no se ejecutó aún
      - run: npm run check
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Notas:
- `node-version: 22` — LTS actual; el repo no fija engine, cualquier LTS ≥ 20 sirve.
- Solo chromium: es el único project en `playwright.config.ts`.

**Verify**: `npx --yes yaml-lint .github/workflows/ci.yml` → exit 0.

### Step 3: Paridad local — correr exactamente lo que corre el CI

```bash
npm ci && npm run check:content && npm run check && npm run build && npm run test:e2e
```

(si el 001 no está ejecutado, sin `check:content`; `npm ci` borra y reinstala
`node_modules` — es esperable y seguro).

**Verify**: los comandos encadenados terminan con exit 0; Playwright reporta
`1 passed`.

## Test plan

El workflow **es** la infraestructura de tests; su validación es el Step 3 (paridad
local de cada comando) más el lint del YAML. La primera corrida real ocurre cuando el
operador pushee; si falla ahí por diferencias de entorno (p. ej. fonts del runner),
tratarlo como issue de seguimiento, no como fracaso de este plan.

## Done criteria

- [ ] `.github/workflows/ci.yml` existe y `npx --yes yaml-lint` lo acepta (exit 0)
- [ ] `npm run check` exit 0
- [ ] `npm run build` exit 0
- [ ] `npm run test:e2e` exit 0 (1 passed)
- [ ] `git status` solo muestra `.github/workflows/ci.yml`, `package.json`,
      `package-lock.json`
- [ ] Fila de este plan actualizada en `plans/README.md`

## STOP conditions

- `npm run check` (Step 1) reporta errores de tipos **preexistentes** en el código:
  no los corrijas dentro de este plan. Reportá la lista completa y frená — decidir si
  se arreglan o se excluye el gate es del operador. (Al 2026-07-13 el código compila,
  pero `astro check` nunca corrió; puede encontrar cosas.)
- `npm run test:e2e` falla localmente antes de tus cambios (regresión previa): frená
  y reportá; el workflow no debe nacer en rojo.
- `npm install --save-dev @astrojs/check` trae un cambio mayor de versión de `astro`
  en el lockfile: frená; el lockfile no debe mover `astro`.

## Maintenance notes

- Cuando se ejecute el plan 003 (SEO), el CI ya cubre su regresión (build + e2e).
- Si se agrega la automatización semanal del streaming (dirección detectada en la
  auditoría: workflow con cron que corra `npm run streaming:update` y commitee),
  va en un archivo aparte (`.github/workflows/streaming.yml`) con `TMDB_API_TOKEN`
  como repo secret — no mezclarlo con este `ci.yml`.
- Revisor: verificar que el job e2e no requiera secrets y que `retention-days` esté
  para no acumular artifacts.
