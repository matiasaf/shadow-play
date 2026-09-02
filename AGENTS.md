# Shadowplay — contrato canónico para agentes

Este archivo es la entrada autoritativa y neutral respecto del proveedor. Los adaptadores de
otras herramientas deben apuntar acá, no copiar estas reglas. La guía operativa del harness
está en [`docs/agent-harness.md`](docs/agent-harness.md).

## Misión

Shadowplay es un cuaderno personal de **estudio** de cine, no un sitio de reseñas. Organiza
las películas por director y por su forma de mirar el mundo. Es un sitio estático bilingüe:
inglés en `/` y español en `/es`.

Stack comprobado: Astro 6, Content Collections en Markdown, D3 sólo para el mapa y
Playwright para el recorrido e2e. No hay base de datos.

## Startup gate

Antes de editar:

1. Leé `PROGRESS.md`, `git status --short` y el pedido original. No descartes cambios ajenos.
2. Corré `npm run harness:verify`. Si faltan dependencias o el runtime no sirve, usá
   `npm run harness:init`; no improvises otro package manager.
3. Identificá la autoridad y la guía aplicable con el router de `docs/agent-harness.md`.
4. Reformulá el trabajo como un cambio acotado con criterios observables, chequeo enfocado,
   gate final y máximo de tres intentos, salvo que el usuario indique otro presupuesto.
5. Para trabajo que cruza sesiones, marcá `PROGRESS.md` como `active` antes de implementar.

## Mapa del repositorio

- `src/content.config.ts`: contrato Zod de `movies`, `directors` y `watchlist`.
- `src/content/{movies,directors,watchlist}/<lang>/`: contenido Markdown en pares `en`/`es`.
- `src/assets/frames/`: fotogramas locales procesados por Astro.
- `src/i18n/ui.ts`: todas las cadenas de interfaz en ambos idiomas.
- `src/lib/`: identidad, formato y acceso a contenido/streaming.
- `src/components/`: vistas compartidas; `src/pages/` contiene wrappers de rutas por idioma.
- `tests/e2e/basic.spec.ts`: recorrido de comportamiento representativo.
- `plans/`: planes pendientes; orientan trabajo futuro, no reemplazan un pedido actual.

## Invariantes globales

- Un film, director o entrada de watchlist existe en los dos idiomas con el mismo slug.
- Los slugs son neutrales al idioma. `connections` y `seeds` usan esos slugs.
- El nombre del director debe coincidir exactamente en todas sus películas; su URL deriva de
  `directorSlug()`.
- Cualquier texto nuevo de UI se agrega a `src/i18n/ui.ts` en `en` y `es`, y las rutas usan
  `localizePath()`.
- Los frames son opcionales y se referencian desde contenido como
  `../../../assets/frames/<slug>.jpg`.
- `src/data/streaming.json` es generado por `npm run streaming:update`; correcciones manuales
  van en `src/data/streaming.overrides.json`. No ejecutes el refresh sin autorización y
  `TMDB_API_TOKEN`; conservá la atribución a JustWatch.
- El mapa deduplica enlaces explícitos, de director y de tags en ese orden. `FilmView` sólo
  muestra las conexiones declaradas por la ficha actual.
- La voz editorial es estudio crítico en primera persona: inglés neutro y español rioplatense.
- Para agregar una película o un frame, seguí `.agents/skills/add-film/SKILL.md`.

El schema vigente siempre manda sobre tablas o ejemplos documentales. Las secciones sugeridas
de cada estudio están en `src/content/movies/_template.md` y las de director en su `_template.md`.

## Ciclo de trabajo

1. **Explorar (sólo lectura):** localizá contrato, implementación y tests; declará una
   hipótesis falsable, el chequeo más barato y riesgos.
2. **Implementar:** hacé un incremento atómico. Ejecutá enseguida el chequeo enfocado.
3. **Verificar (sólo lectura):** releé pedido, diff y criterios; asigná evidencia a cada uno y
   devolvé `PASS`, `REVISE` o `BLOCKED`. Si no hay contexto fresco, aclará que la separación
   es lógica, no independiente.
4. **Coordinar:** ante `REVISE`, corregí y repetí hasta el presupuesto. Terminá en `PASS`,
   `BLOCKED` o `BUDGET_EXHAUSTED`; nunca declares éxito sólo por exit code.

No ejecutes dos roles editores en el mismo checkout. Trabajo concurrente requiere worktrees y
estado separados.

## Escalera de verificación

- Siempre: `npm run harness:verify` y el chequeo más cercano al cambio.
- Contenido, schemas, rutas, componentes o configuración compartida: `npm run build`.
- Conducta visible o navegación: `npm run test:focused`; para cambios amplios, `npm run test:e2e`.
- Dependencias, configuración, release o cambios de gran alcance: build y suite e2e completa.

Inspeccioná warnings, tests omitidos, archivos generados stale y fallbacks externos. Separá
fallas nuevas, preexistentes y bloqueos de entorno. No uses `streaming:update` como validación.

## Entorno y seguridad

- Runtime: Node `>=22.12.0`; package manager: npm con `package-lock.json`; shell/OS indistinto.
- Setup reproducible: `npm run harness:init` (POSIX o PowerShell). Desarrollo: `npm run dev`.
- Nunca muestres ni commits `.env`, tokens o certificados; `.env.example` sólo declara nombres.
- No desactives TLS, no eleves privilegios y no despliegues, migres, pushees ni cambies servicios
  externos sin pedido explícito.
- Evitá comandos Git destructivos. Preservá todo cambio no relacionado.

## Definición de terminado

El cambio está terminado sólo cuando los criterios tienen evidencia, el chequeo enfocado y el
gate proporcional pasan, se revisó el diff por duplicación o cambios ajenos, y `PROGRESS.md`
queda `idle` (éxito) o `blocked` con un único próximo paso exacto.
