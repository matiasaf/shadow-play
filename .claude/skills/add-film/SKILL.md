---
name: add-film
description: Sumar una nueva película al cuaderno Shadowplay. Usar cuando el usuario pida agregar/crear una ficha de cine, sumar una película al archivo, o redactar el estudio bilingüe (en/es) de un film. Crea los dos Markdown (inglés y español), el frame y valida el build.
---

# Sumar una película a Shadowplay

Actuá como crítico y estudioso de cine. Cada película es un **estudio** (no una reseña):
por qué la película piensa como piensa. Salida bilingüe obligatoria: una ficha en inglés y
una en español rioplatense (voseo). Leé `CLAUDE.md` para la arquitectura completa.

## Datos que necesitás del usuario

Si no los dio, preguntá lo mínimo: **título**, **director**, **año**. Lo demás (país,
duración, rating, fecha en que la vio) inferilo o usá defaults razonables y confirmalo en el
resumen final. `watchedOn` por defecto = hoy (ordena el archivo: más reciente primero).

## Pasos

1. **Definí el slug** neutral en kebab-case a partir del título original (ej. `12-angry-men`,
   `perfect-days`). Será el nombre de archivo en ambos idiomas y el id de `connections`.

2. **Mirá una ficha existente** como referencia de profundidad y tono antes de escribir:
   `src/content/movies/en/double-indemnity.md` y su par en `es/`. La plantilla base está en
   `src/content/movies/_template.md`.

3. **Creá los dos archivos** con el **mismo nombre**:
   - `src/content/movies/en/<slug>.md`
   - `src/content/movies/es/<slug>.md`

   Frontmatter (schema en `src/content.config.ts`):
   - Requeridos: `title`, `director`, `year`, `watchedOn` (`YYYY-MM-DD`), `logline`.
   - Recomendados: `originalTitle`, `country`, `runtime`, `rating` (1–5), `tags`, `frameCaption`.
   - `connections`: lista de `{ slug, note }` hacia otras películas del archivo. El mapa une el
     par en ambos sentidos automáticamente, así que alcanza con declararlo en una; pero la
     conexión solo aparece en la *página individual* de la ficha donde la declarás.
   - `draft: false` para publicar.
   - `frame`: ver paso 5 (dejala como comentario hasta tener la imagen).

4. **Escribí el análisis** en el cuerpo, en ambos idiomas, con estas secciones base:
   - EN: `## The central idea` · `## Themes and ideas` · `## Screenplay and narrative` · `## The scene` · `## What I take`
   - ES: `## La idea central` · `## Temas e ideas` · `## Guion y narrativa` · `## La escena` · `## Me llevo`

   Podés sumar secciones extra (ej. `## Puesta en escena`, `## Notas filosóficas`) si la
   película lo amerita. El español es rioplatense ("vos", "mirá", "acá"); el inglés, neutro.
   Las dos versiones deben decir lo mismo, no ser traducción literal palabra por palabra.

5. **El frame (fotograma destacado):**
   - Si el usuario da una URL de imagen, descargala:
     `curl -fsSL -o src/assets/frames/<slug>.jpg "<url>"` y verificá con `file <ruta>`.
   - Referenciala en el frontmatter de **ambos** archivos:
     `frame: '../../../assets/frames/<slug>.jpg'` (tres niveles desde `content/movies/<lang>/`).
   - Si todavía no hay imagen, dejá la línea `frame:` comentada y completá igual `frameCaption`;
     la ficha mostrará un marcador "fotograma pendiente".

6. **Validá** con `npm run build`. Tiene que generar `/films/<slug>/` y `/es/films/<slug>/` sin
   errores de schema. Si aparece WARN de "Duplicate id", limpiá cache y rebuildeá:
   `rm -rf .astro/data-store.json dist && npm run build`.

7. **Cerrá** con un resumen al usuario: datos usados, conexiones agregadas, y ofrecé (a) levantar
   `npm run dev` para verla, y (b) agregar `connections` recíprocas en las películas vinculadas
   si querés que el enlace aparezca también en sus páginas individuales.

## Reglas

- **Nunca** una sola versión de idioma: siempre `en/` y `es/` con el mismo slug.
- **No** hardcodees strings de UI en componentes; van en `src/i18n/ui.ts` (en + es). Sumar una
  película no debería requerir tocar UI.
- Sin spoilers gratuitos, pero el análisis puede abordar el final cuando hace falta.
