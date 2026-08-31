---
name: add-film
description: Sumar una nueva película al cuaderno Shadowplay y conseguirle su fotograma. Usar cuando el usuario pida agregar/crear una ficha de cine, sumar una película al archivo, redactar el estudio bilingüe (en/es) de un film, o buscar/agregar el frame (fotograma destacado) y su frameCaption de una película. Crea los dos Markdown (inglés y español), busca la imagen del fotograma en la web, la descarga a src/assets/frames/ y valida el build.
---

# Sumar una película a Shadowplay

Actuá como crítico y estudioso de cine. Cada película es un **estudio** (no una reseña):
por qué la película piensa como piensa. Salida bilingüe obligatoria: una ficha en inglés y
una en español rioplatense (voseo). Leé `AGENTS.md` para la arquitectura completa.

El skill hace **las dos cosas**: escribe la ficha bilingüe **y** consigue el fotograma
(imagen + `frameCaption`). Si la película ya existe en el archivo y lo único que falta es el
frame, saltá directo al **paso 5**.

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
   - **`director` es la clave de agrupación del archivo**: escribilo exactamente igual que en
     las demás películas del mismo director (mismas mayúsculas, iniciales y acentos). De ese
     string se deriva el slug de su página (`/directors/<slug>`) y el cluster del mapa.
   - Recomendados: `originalTitle`, `country`, `runtime`, `rating` (1–5), `tags`, `frameCaption`.
   - `connections`: lista de `{ slug, note }` hacia otras películas del archivo. El mapa une el
     par en ambos sentidos automáticamente, así que alcanza con declararlo en una; pero la
     conexión solo aparece en la *página individual* de la ficha donde la declarás.
   - `draft: false` para publicar.
   - `frame`: ver paso 5 (dejala como comentario hasta tener la imagen).

4. **Escribí el análisis** en el cuerpo, en ambos idiomas, con estas secciones base:
   - EN: `## The central idea` · `## Themes and ideas` · `## Screenplay and narrative` · `## The scene` · `## What I take`
   - ES: `## La idea central` · `## Temas e ideas` · `## Guion y narrativa` · `## La escena` · `## Me llevo`

   Podés sumar secciones extra (ej. `## Puesta en escena`) si la película lo amerita. El
   español es rioplatense ("vos", "mirá", "acá"); el inglés, neutro. Las dos versiones deben
   decir lo mismo, no ser traducción literal palabra por palabra.

   **Notas de pensadores (recomendado cuando la trama lo pide):** una sección que conecte la
   película con filósofos, escritores o pensadores en general —clásicos o contemporáneos—,
   citando obras concretas (título y año) y explicando qué ilumina cada uno de la trama, no
   solo name-dropping. Formato: bullets de `**Pensador y concepto.**` + desarrollo.
   - Nombre por defecto: `## Notas filosóficas` / `## Philosophical notes` (ejemplo:
     `12-angry-men` — Sócrates, Arendt, Mill, Levinas). Va después de `## La escena` y antes
     de `## Me llevo`.
   - Si la ficha gira alrededor de un solo autor, la sección puede llevar su nombre (ejemplo:
     `## Borges y el laberinto` en `moebius`).
   - Opcional: cerrar la ficha con `## Para seguir leyendo` / `## Further reading` listando
     las obras citadas (ejemplo: `moebius`).

5. **El frame (fotograma destacado): buscalo en la web.** No esperes a que el usuario te pase
   una URL; salvo que ya te la haya dado, buscá vos el fotograma.

   a. **Elegí qué plano buscar.** Tiene que ser el mismo que analizás en `## La escena` /
      `## The scene`. Anotá una descripción concreta (personajes, acción, encuadre, luz) antes
      de buscar: eso es lo que vas a reconocer en los resultados.

   b. **Buscá la imagen** con la herramienta de búsqueda web que tengas a mano
      (`WebSearch`/`WebFetch` en Claude Code, `web_search` en Codex). Consultas útiles:
      `"<título original>" (<año>) film still <descripción del plano>`,
      `<título> screencap <escena>`, `site:film-grab.com <título>`.
      Fuentes buenas: film-grab.com, screenmusings, moviescreencaps, galerías de fotogramas de
      cinéfilos, backdrops de TMDB, Wikimedia Commons.
      **Evitá**: pósters y afiches, fotos de prensa posadas, bancos con marca de agua
      (Alamy, Getty, Shutterstock), thumbnails de YouTube, capturas con subtítulos quemados.

   c. **Criterios de aceptación**: fotograma real de la película (no promo), horizontal,
      ≥1200 px de ancho, sin watermark ni barras negras, y que se entienda el plano que
      describís. Las que ya están en el archivo van de 1100 a 2000 px de ancho y 150–350 KB.

   d. **Descargala y verificala**:

      ```bash
      curl -fsSL -A "Mozilla/5.0" -o src/assets/frames/<slug>.jpg "<url>"
      file src/assets/frames/<slug>.jpg          # tiene que decir JPEG/PNG, no HTML ni texto
      sips -g pixelWidth -g pixelHeight src/assets/frames/<slug>.jpg
      ```

      Si bajó un PNG/WebP, convertilo: `sips -s format jpeg <archivo> --out src/assets/frames/<slug>.jpg`
      (y borrá el intermedio). Si el archivo es HTML, una miniatura o no cumple los criterios,
      probá otro resultado. Después de **3 intentos fallidos**, pará: contale al usuario qué
      buscaste y pedile una URL, en vez de seguir descargando cualquier cosa.

   e. **Referenciala en el frontmatter de ambos archivos**:
      `frame: '../../../assets/frames/<slug>.jpg'` (tres niveles desde `content/movies/<lang>/`).
      Si la línea estaba comentada, descomentala.

   f. **Escribí el `frameCaption`** en los dos idiomas (inglés neutro / español rioplatense):
      1–3 frases que digan **qué se ve** y **por qué ese plano condensa la película**, en
      presente y en tu voz de estudioso. No es una descripción neutra ni un pie de foto de
      catálogo. Mirá `en/heat.md`, `en/barton-fink.md` y sus pares en `es/` como referencia.

   g. Si la ficha **ya tenía** un frame, no lo pises sin avisar: preguntá antes de reemplazarlo.

   h. Si aun así no conseguís imagen, dejá la línea `frame:` comentada y completá igual el
      `frameCaption`; la ficha muestra un marcador "fotograma pendiente".

6. **Validá** con `npm run build`. Tiene que generar `/films/<slug>/` y `/es/films/<slug>/` sin
   errores de schema. Si aparece WARN de "Duplicate id", limpiá cache y rebuildeá:
   `rm -rf .astro/data-store.json dist && npm run build`.

7. **La ficha del director (opcional pero recomendado):** la página del director se genera
   sola con sus películas; el ensayo sobre su mirada sale de
   `src/content/directors/<lang>/<slug-del-director>.md` (plantilla en
   `src/content/directors/_template.md`). Si el director es nuevo en el archivo y no tiene
   ficha, ofrecé crearla (en + es, mismo slug derivado del nombre). Mientras no exista, su
   página muestra "ficha pendiente" + filmografía.

8. **Cerrá** con un resumen al usuario: datos usados, **de dónde salió el fotograma (URL de
   origen)**, conexiones agregadas, y ofrecé (a) levantar
   `npm run dev` para verla, y (b) agregar `connections` recíprocas en las películas vinculadas
   si querés que el enlace aparezca también en sus páginas individuales.

## Reglas

- **Nunca** una sola versión de idioma: siempre `en/` y `es/` con el mismo slug.
- **No** hardcodees strings de UI en componentes; van en `src/i18n/ui.ts` (en + es). Sumar una
  película no debería requerir tocar UI.
- Sin spoilers gratuitos, pero el análisis puede abordar el final cuando hace falta.
- El frame se **busca en la web**, no se inventa ni se genera: siempre un fotograma real de la
  película, y siempre decile al usuario de qué página lo bajaste.
- Nunca dejes en `src/assets/frames/` un archivo que no verificaste con `file`.

## Mantenimiento del skill

Este skill vive en **dos** lugares, uno por agente:

- `.claude/skills/add-film/SKILL.md` → Claude Code (referencia `CLAUDE.md`)
- `.agents/skills/add-film/SKILL.md` → Codex, que descubre skills en `./.agents/skills/`
  (referencia `AGENTS.md`)

Si editás uno, **replicá el cambio en el otro**. El único diff esperado entre ambos es el
nombre del archivo de arquitectura (`CLAUDE.md` vs `AGENTS.md`). Para chequear:

```bash
diff .claude/skills/add-film/SKILL.md .agents/skills/add-film/SKILL.md
```
