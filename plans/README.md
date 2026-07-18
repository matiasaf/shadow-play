# Implementation Plans

Generados por el skill **improve** el 2026-07-13, contra el commit `3be62f7`.
Ejecutar en el orden de abajo salvo que las dependencias digan otra cosa. Cada
executor: leer el plan completo antes de empezar, respetar sus STOP conditions y
actualizar su fila al terminar.

## Execution order & status

| Plan | Título | Prioridad | Esfuerzo | Depende de | Status |
|------|--------|-----------|----------|------------|--------|
| 001 | Chequeo de integridad del contenido (`check:content`) | P1 | S | — | TODO |
| 002 | CI en GitHub Actions (build + typecheck + contenido + e2e) | P1 | S | 001 (soft) | TODO |
| 003 | `<head>` completo (canonical/hreflang/OG), sitemap, 404, escape JSON del mapa | P2 | M | URL de producción (operador) | TODO |
| 004 | Sincronizar CLAUDE.md y README | P3 | S | mejor al final (001-003) | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (con motivo en una línea) | REJECTED (con rationale)

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
