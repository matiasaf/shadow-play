# Shadowplay — guía del proyecto

Cuaderno personal de **estudio** de cine (no reseñas). Cada película es una ficha con su
idea central, temas, análisis de guion, una escena destacada y conexiones con otras
películas. El eje organizador del archivo es **el director y su forma de ver el mundo**:
la home agrupa por director, cada director tiene su página (con ensayo opcional) y el mapa
clusteriza sus películas. Sitio estático y **bilingüe**: inglés en la raíz (`/`), español
bajo `/es`.

Stack: **Astro 5** + Content Collections (todo Markdown, sin base de datos) + **D3** (solo
para el mapa de conexiones).

## Comandos

```bash
npm run dev      # servidor de desarrollo en http://localhost:4321
npm run build    # build estático a dist/ (valida el frontmatter de todas las fichas)
npm run preview  # previsualiza el build
npm run streaming:update  # refresca src/data/streaming.json (dónde ver la watchlist en AR)
```

Después de tocar fichas, corré `npm run build` para validar el frontmatter contra el schema.
Si aparece un WARN de "Duplicate id", suele ser cache del store de Astro: borralo y rebuildeá
(`rm -rf .astro/data-store.json dist && npm run build`).

## Arquitectura

```
src/
  content/movies/<lang>/<slug>.md   # una ficha por idioma (en/ y es/). El nombre de archivo es el slug
  content/movies/_template.md       # plantilla (ignorada por el loader: patrón [^_]*.md)
  content/directors/<lang>/<slug>.md # ficha opcional del director (ensayo sobre su mirada)
  content/directors/_template.md    # plantilla de ficha de director
  content.config.ts                 # schemas Zod de ambas colecciones (movies y directors)
  assets/frames/<slug>.jpg          # fotograma destacado de cada película (lo optimiza Astro)
  i18n/ui.ts                        # TODOS los strings de UI en en/es + helpers de idioma
  lib/movies.ts                     # getMovies(lang), slugOf(), parseId() — slug neutral por idioma
  lib/directors.ts                  # directorSlug(), getDirectors(lang), obsessionsOf()
  lib/format.ts                     # helpers de formato (fechas, etc.)
  components/                       # HomeView, FilmView, DirectorView, DirectorsView, MapView, MovieCard, Frame, LanguageSwitcher
  layouts/BaseLayout.astro
  pages/                            # wrappers finos que pasan `lang` a los *View compartidos
    index.astro, map.astro, films/[...slug].astro,
    directors/index.astro, directors/[...slug].astro        # inglés (raíz)
    es/...                                                  # espejo en español
  styles/global.css
```

### Conceptos clave

- **El slug es neutral por idioma.** El id de colección es `<lang>/<slug>` (ej. `en/heat`),
  pero `slugOf()` devuelve `heat`. Por eso `connections`, URLs y el mapa funcionan igual en
  ambos idiomas. Las dos fichas de una película comparten exactamente el mismo nombre de
  archivo.
- **Una película = dos archivos.** Siempre `en/<slug>.md` **y** `es/<slug>.md`. Si falta uno,
  esa película no existe en ese idioma.
- **El frame es opcional.** Si no hay `frame:`, la tarjeta muestra un marcador "Sin fotograma"
  y la ficha usa el `frameCaption` como pie. La ruta es relativa desde la carpeta del idioma:
  `'../../../assets/frames/<slug>.jpg'` (tres niveles para subir desde `content/movies/<lang>/`).
- **El director se identifica por su nombre.** El campo `director` de las películas es la
  clave de agrupación: `directorSlug()` (`src/lib/directors.ts`) deriva el slug neutral
  (`"Stanley Kubrick"` → `stanley-kubrick`) para URLs, agrupación de la home y clusters del
  mapa. Por eso el nombre debe escribirse **exactamente igual** en todas sus películas
  (mayúsculas, iniciales, acentos).
- **Página de director = híbrida.** Toda película genera la página de su director
  (`/directors/<slug>`) con filmografía y obsesiones (tags repetidos). Si además existe
  `content/directors/<lang>/<slug>.md`, la página suma el `worldview` (su mirada en una
  frase) y el ensayo del cuerpo. El nombre de archivo debe ser el slug derivado del nombre,
  y la ficha va siempre en los dos idiomas.
- **El mapa de conexiones es bidireccional.** `MapView.astro` ordena el par de slugs
  (`keyFor`), así que declarar la conexión en **una** de las dos películas ya une ambas en el
  mapa. Además genera enlaces automáticos entre películas del mismo director (clusters, línea
  continua) y entre películas que comparten `tags` (línea tenue). Prioridad al deduplicar:
  explícitas > director > tags. Las páginas individuales (`FilmView`), en cambio, listan solo
  las `connections` propias de esa ficha: si querés que el vínculo aparezca en las dos
  páginas, declaralo en ambas.
- **i18n:** cualquier string de UI nuevo va en `src/i18n/ui.ts`, en `en` **y** `es`. Las rutas
  se generan con `localizePath()`. No hardcodees texto de interfaz en los componentes.
- **Streaming de la watchlist (dato derivado, no contenido).** La página Up Next muestra
  dónde ver cada película pendiente en Argentina leyendo `src/data/streaming.json`, keyeado
  por slug neutral. Ese JSON **no se edita a mano**: lo regenera `npm run streaming:update`
  (`scripts/update-streaming.mjs`), que consulta los watch providers de TMDB (datos de
  JustWatch, región AR) y necesita `TMDB_API_TOKEN` en `.env` (ver `.env.example`). Para
  corregir matches o cargar plataformas a mano existe `src/data/streaming.overrides.json`
  (`tmdbId`, `skip`, o campos como `flatrate`). El JSON generado sí se commitea (el build lo
  importa). Al mostrar los datos hay que mantener la atribución a JustWatch.

### Schema del frontmatter (`content.config.ts`)

| Campo           | Req. | Tipo / nota                                                      |
| --------------- | ---- | ---------------------------------------------------------------- |
| `title`         | sí   | título en ese idioma                                             |
| `originalTitle` | no   | título original                                                  |
| `director`      | sí   | string                                                           |
| `year`          | sí   | number                                                           |
| `country`       | no   | string                                                           |
| `runtime`       | no   | number (minutos)                                                 |
| `watchedOn`     | sí   | fecha `YYYY-MM-DD` (ordena el archivo: más reciente primero)     |
| `frame`         | no   | ruta `'../../../assets/frames/<slug>.jpg'`                       |
| `frameCaption`  | no   | por qué ese fotograma resume la película                         |
| `logline`       | sí   | la película en una frase, con tus palabras                       |
| `rating`        | no   | number 1–5                                                       |
| `tags`          | no   | array de strings (alimentan los enlaces automáticos del mapa)    |
| `connections`   | no   | array de `{ slug, note }` hacia otras películas                  |
| `draft`         | no   | `true` = no se publica (default `false`)                         |

### Schema de fichas de director (`content.config.ts`, colección `directors`)

| Campo       | Req. | Tipo / nota                                                       |
| ----------- | ---- | ------------------------------------------------------------------ |
| `name`      | sí   | debe coincidir exactamente con el `director` de sus películas       |
| `worldview` | sí   | su forma de ver el mundo en una frase (el "logline" del director)   |
| `born`      | no   | number (año de nacimiento)                                          |
| `country`   | no   | string                                                              |
| `draft`     | no   | `true` = no se publica (default `false`)                            |

Cuerpo sugerido: `## Cómo mira el mundo` · `## Obsesiones` · `## Por dónde seguir` (y sus
equivalentes en inglés). Ejemplo completo: `content/directors/es/stanley-kubrick.md`.

### Cuerpo del Markdown (secciones de estudio)

Base de la plantilla: `## La idea central` · `## Temas e ideas` · `## Guion y narrativa` ·
`## La escena` · `## Me llevo` (sus equivalentes en inglés). Las fichas pueden sumar secciones
extra (ej. `## Puesta en escena`, `## Notas filosóficas`) cuando la película lo pide.

## Para sumar una película

Usá el skill **`/add-film`**, que tiene la receta paso a paso. Resumen: crear `en/<slug>.md` y
`es/<slug>.md` desde la plantilla, completar frontmatter + análisis en ambos idiomas, agregar
el frame en `src/assets/frames/`, poner `draft: false` y validar con `npm run build`. Si el
director es nuevo en el archivo, considerá crear también su ficha en
`content/directors/<lang>/` (la página existe igual sin ella, pero sin ensayo ni worldview).

## Tono editorial

Voz de crítico/estudioso de cine, primera persona, sin spoilers gratuitos pero sin miedo a
analizar el final. El español es **rioplatense** (voseo: "vos", "mirá", "acá"). El inglés es
neutro. No es una reseña con puntaje: es un estudio de por qué una película piensa como piensa.
