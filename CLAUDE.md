# Shadowplay — guía del proyecto

Cuaderno personal de **estudio** de cine (no reseñas). Cada película es una ficha con su
idea central, temas, análisis de guion, una escena destacada y conexiones con otras
películas. Sitio estático y **bilingüe**: inglés en la raíz (`/`), español bajo `/es`.

Stack: **Astro 5** + Content Collections (todo Markdown, sin base de datos) + **D3** (solo
para el mapa de conexiones).

## Comandos

```bash
npm run dev      # servidor de desarrollo en http://localhost:4321
npm run build    # build estático a dist/ (valida el frontmatter de todas las fichas)
npm run preview  # previsualiza el build
```

Después de tocar fichas, corré `npm run build` para validar el frontmatter contra el schema.
Si aparece un WARN de "Duplicate id", suele ser cache del store de Astro: borralo y rebuildeá
(`rm -rf .astro/data-store.json dist && npm run build`).

## Arquitectura

```
src/
  content/movies/<lang>/<slug>.md   # una ficha por idioma (en/ y es/). El nombre de archivo es el slug
  content/movies/_template.md       # plantilla (ignorada por el loader: patrón [^_]*.md)
  content.config.ts                 # schema Zod del frontmatter de las fichas
  assets/frames/<slug>.jpg          # fotograma destacado de cada película (lo optimiza Astro)
  i18n/ui.ts                        # TODOS los strings de UI en en/es + helpers de idioma
  lib/movies.ts                     # getMovies(lang), slugOf(), parseId() — slug neutral por idioma
  lib/format.ts                     # helpers de formato (fechas, etc.)
  components/                       # HomeView, FilmView, MapView, MovieCard, Frame, LanguageSwitcher
  layouts/BaseLayout.astro
  pages/                            # wrappers finos que pasan `lang` a los *View compartidos
    index.astro, map.astro, films/[...slug].astro       # inglés (raíz)
    es/index.astro, es/map.astro, es/films/[...slug].astro  # español
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
- **El mapa de conexiones es bidireccional.** `MapView.astro` ordena el par de slugs
  (`keyFor`), así que declarar la conexión en **una** de las dos películas ya une ambas en el
  mapa. Además genera enlaces tenues automáticos entre películas que comparten `tags`. Las
  páginas individuales (`FilmView`), en cambio, listan solo las `connections` propias de esa
  ficha: si querés que el vínculo aparezca en las dos páginas, declaralo en ambas.
- **i18n:** cualquier string de UI nuevo va en `src/i18n/ui.ts`, en `en` **y** `es`. Las rutas
  se generan con `localizePath()`. No hardcodees texto de interfaz en los componentes.

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

### Cuerpo del Markdown (secciones de estudio)

Base de la plantilla: `## La idea central` · `## Temas e ideas` · `## Guion y narrativa` ·
`## La escena` · `## Me llevo` (sus equivalentes en inglés). Las fichas pueden sumar secciones
extra (ej. `## Puesta en escena`, `## Notas filosóficas`) cuando la película lo pide.

## Para sumar una película

Usá el skill **`/add-film`**, que tiene la receta paso a paso. Resumen: crear `en/<slug>.md` y
`es/<slug>.md` desde la plantilla, completar frontmatter + análisis en ambos idiomas, agregar
el frame en `src/assets/frames/`, poner `draft: false` y validar con `npm run build`.

## Tono editorial

Voz de crítico/estudioso de cine, primera persona, sin spoilers gratuitos pero sin miedo a
analizar el final. El español es **rioplatense** (voseo: "vos", "mirá", "acá"). El inglés es
neutro. No es una reseña con puntaje: es un estudio de por qué una película piensa como piensa.
