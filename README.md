# 🎞️ Cuaderno de cine

Un sitio personal para **estudiar** las películas que voy viendo, no solo reseñarlas.
Cada película es una ficha con su idea central, sus temas, un análisis del guion, una
escena destacada y conexiones con otras películas.

Hecho con [Astro](https://astro.build/) + Content Collections (todo en Markdown, sin
base de datos).

## Cómo correrlo

```bash
npm install      # instala dependencias (solo la primera vez)
npm run dev      # servidor de desarrollo en http://localhost:4321
npm run build    # genera el sitio estático en dist/
npm run preview  # previsualiza el build
```

## Cómo agregar una película

1. Copiá `src/content/movies/_plantilla.md` y renombralo (ej: `dune.md`).
   El nombre del archivo es el `slug` (la URL será `/peliculas/dune/`).
2. Completá el frontmatter (datos + `logline` + `tags` + `connections`).
3. Escribí tu análisis en el cuerpo, usando las secciones de la plantilla.
4. Poné `draft: false`.
5. (Opcional) Agregá un fotograma en `src/assets/frames/` y referencialo con `frame:`.

### El frontmatter

| Campo           | Obligatorio | Qué es                                                  |
| --------------- | ----------- | ------------------------------------------------------- |
| `title`         | sí          | Título (en español o el que prefieras)                  |
| `originalTitle` | no          | Título original                                         |
| `director`      | sí          | Director/a                                              |
| `year`          | sí          | Año                                                     |
| `country`       | no          | País                                                    |
| `runtime`       | no          | Duración en minutos                                     |
| `watchedOn`     | sí          | Fecha en que la viste (`AAAA-MM-DD`)                    |
| `frame`         | no          | Ruta al fotograma destacado                             |
| `frameCaption`  | no          | Por qué ese fotograma resume la película                |
| `logline`       | sí          | La película en una frase, con tus palabras              |
| `rating`        | no          | Tu puntaje del 1 al 5                                   |
| `tags`          | no          | Temas y motivos (alimentan el futuro mapa de conexiones)|
| `connections`   | no          | Links a otras películas + por qué se conectan           |
| `draft`         | no          | `true` = no se publica todavía                          |

## Ideas para crecer

- **Mapa de conexiones:** los `tags` y `connections` ya guardan los datos para armar
  un grafo navegable de todo lo que viste.
- **Filtrar por tag:** página `/tema/[tag]` que liste las películas de cada tema.
- **Autocompletar datos** (poster, año, director) desde la API de TMDB.
- **RSS** para que te sigan el cuaderno.
