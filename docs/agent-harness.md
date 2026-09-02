# Harness de ingeniería para agentes

Esta guía desarrolla el contrato conciso de [`../AGENTS.md`](../AGENTS.md). Aplica a cualquier
cambio asistido por un agente. Su evidencia son los manifests, schemas, tests y convenciones
versionadas; revisarla cuando cambien runtime, scripts, colecciones o integraciones de agentes.

## Autoridad y router

Cuando dos fuentes discrepan, usá este orden:

1. pedido actual y decisiones explícitas del propietario;
2. contratos ejecutables (`src/content.config.ts`, config de Astro/Playwright, manifests);
3. tests que expresan conducta intencional;
4. `AGENTS.md` y guías locales aplicables;
5. implementación actual;
6. `README.md`, `plans/` y contexto externo.

| Tarea | Cargar primero | Evidencia / cuándo revisar |
| --- | --- | --- |
| Película o frame | `.agents/skills/add-film/SKILL.md`, templates, schema | Build; revisar si cambia la colección o el workflow editorial |
| Director/watchlist | template de la colección, schema, fichas vecinas | Build; retirar reglas superadas por el schema |
| UI, rutas o i18n | `src/i18n/ui.ts`, vista y wrappers vecinos | Build + e2e; revisar si cambia el routing |
| Mapa | `MapView.astro`, `lib/movies.ts`, e2e | Build + recorrido del mapa; revisar si cambia D3 o la semántica de enlaces |
| Streaming | `scripts/update-streaming.mjs`, overrides, `.env.example` | Build sin red; revisar si cambia TMDB/JustWatch |
| Tooling/harness | manifests, este documento, adapters | `npm run harness:verify`; revisar al cambiar scripts/runtime/CLI |
| Plan pendiente | plan completo y `plans/README.md` | gates del plan; retirar al marcarlo `DONE` o `REJECTED` |

Un plan no autoriza por sí solo trabajo fuera del pedido actual. El schema prevalece sobre
ejemplos viejos. Contexto web sólo complementa fuentes versionadas y nunca aporta secretos.

## Preparación reproducible

Requisitos: Git y Node `>=22.12.0`. El lockfile hace de npm la única ruta soportada.

- macOS/Linux (zsh, bash u otro shell POSIX): `npm run harness:init`
- Windows PowerShell: `npm run harness:init`
- Sólo diagnóstico, sin escribir: `npm run harness:verify`

`harness:init` es idempotente: valida Node, ejecuta `npm ci`, instala mediante el CLI local el Chromium administrado
por Playwright y prueba verifier, build y el spec enfocado. Escribe sólo dependencias, caches y
artefactos ignorados del repo. Puede requerir red, pero nunca sudo ni cambios globales. Si la
descarga del browser falla en Linux por librerías del sistema, detenete con el diagnóstico;
no uses `--with-deps` ni eleves privilegios sin autorización.

El gate de arranque prueba cuatro resultados: `npm run dev` tiene configuración comprobada por
el build, Playwright puede ejecutar un test, `PROGRESS.md` expone el estado, y su campo
`Next action` identifica una sola acción. Secretos sólo se cargan localmente desde `.env`; el
desarrollo normal, build y e2e no necesitan servicios externos.

## Estado entre sesiones

`PROGRESS.md` es contexto operacional temporal, no un changelog. Estados válidos:

- `idle`: no hay trabajo recuperable; los campos de trabajo llevan `n/a` y `Next action`
  conserva el gate de arranque.
- `active`: actualizar branch, HEAD, resumen del worktree, timestamp ISO-8601, objetivo,
  criterios ordenados, decisiones, avance, resultados exactos y una próxima acción.
- `blocked`: igual que `active`, más un bloqueo concreto y la condición para resolverlo.

Actualizalo en hitos recuperables, antes de entregar y al cambiar de branch/HEAD. Git conserva
la historia durable. Cada edición concurrente necesita su propio worktree y `PROGRESS.md`.

## Contrato de una ejecución

Normalizá el pedido antes de editar:

- meta observable;
- criterios de aceptación ordenados;
- restricciones y acciones fuera de alcance;
- chequeo enfocado y gate final;
- condición de parada y presupuesto (tres intentos por defecto).

La fase Explorer es de sólo lectura y produce ruta controladora, autoridad, hipótesis falsable,
chequeo discriminante y riesgos. Implementer edita un incremento y corre el chequeo enfocado,
pero no se aprueba a sí mismo. Verifier es de sólo lectura, relee meta y diff, vincula cada
criterio con código y ejecución, e informa `PASS`, `REVISE` o `BLOCKED`. Coordinator reintenta
`REVISE` dentro del presupuesto y termina en `PASS`, `BLOCKED` o `BUDGET_EXHAUSTED`.

Si la herramienta no ofrece un verificador con contexto fresco, ejecutá las fases en secuencia,
descartá notas de implementación si es posible y declará que la independencia fue lógica.

## Feedback, recuperación y parada

Después del primer cambio sustantivo, corré el chequeo más barato que pueda refutarlo. Escalá
desde verifier a build y luego e2e según el radio de impacto descrito en `AGENTS.md`. Leé la
salida, no sólo el código: warnings, skips o fallbacks pueden invalidar un `0`.

Ante una falla, registrá comando y síntoma, decidí si es nueva, preexistente o ambiental, y
cambiá una sola hipótesis por intento. No limpies caches destructivamente salvo evidencia
concreta. Pará con éxito probado, un bloqueo que requiere autoridad/entorno externo, o presupuesto
agotado; en los dos últimos casos dejá un único próximo paso ejecutable en `PROGRESS.md`.
