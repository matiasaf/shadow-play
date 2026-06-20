# 🎞️ Shadowplay

A personal site to **study** the films I watch, not just review them. Each film is a
study with its central idea, its themes, a screenplay analysis, a standout scene and
connections to other films.

Built with [Astro](https://astro.build/) + Content Collections (all Markdown, no
database). The site is **bilingual**: English is the default (served at `/`) and Spanish
lives under `/es`.

## Running it

```bash
npm install      # install dependencies (first time only)
npm run dev      # dev server at http://localhost:4321
npm run build    # build the static site into dist/
npm run preview  # preview the build
```

## Internationalization (i18n)

- Languages are configured in `astro.config.mjs` (`defaultLocale: 'en'`, `locales: ['en','es']`).
- UI strings live in `src/i18n/ui.ts` — add a key to **both** `en` and `es`.
- The language switcher is in `src/components/LanguageSwitcher.astro`.
- Routes mirror per language: `/`, `/map`, `/films/<slug>` and `/es/`, `/es/map`,
  `/es/films/<slug>`. The page files are thin wrappers around the shared views
  (`HomeView`, `MapView`, `FilmView`) that take a `lang` prop.

## Adding a film

Each film has one Markdown file **per language** under `src/content/movies/<lang>/`:

1. Copy `src/content/movies/_template.md` into both `en/` and `es/` with the same file
   name (the file name is the language-neutral `slug`, e.g. `dune.md` → `/films/dune/`).
2. Fill in the frontmatter (data + `logline` + `tags` + `connections`).
3. Write your analysis in the body, using the template sections.
4. Set `draft: false`.
5. (Optional) Add a frame in `src/assets/frames/` and reference it with `frame:`
   (use `../../../assets/frames/your-frame.jpg` — three levels up from the lang folder).

> `connections` reference the language-neutral `slug` (e.g. `paterson`), so they resolve
> within whichever language is being viewed.

### The frontmatter

| Field           | Required | What it is                                              |
| --------------- | -------- | ------------------------------------------------------- |
| `title`         | yes      | Title in this language                                  |
| `originalTitle` | no       | Original title                                          |
| `director`      | yes      | Director                                                |
| `year`          | yes      | Year                                                    |
| `country`       | no       | Country                                                 |
| `runtime`       | no       | Runtime in minutes                                      |
| `watchedOn`     | yes      | Date you watched it (`YYYY-MM-DD`)                      |
| `frame`         | no       | Path to the standout frame                              |
| `frameCaption`  | no       | Why that frame sums up the film                         |
| `logline`       | yes      | The film in one sentence, in your words                 |
| `rating`        | no       | Your 1–5 score                                          |
| `tags`          | no       | Themes and motifs (feed the connection map)             |
| `connections`   | no       | Links to other films + why they connect                 |
| `externalComments` | no    | Curated external comments, with source, quote and URL    |
| `videos`        | no       | Curated videos, usually YouTube links                    |
| `draft`         | no       | `true` = not published yet                              |

`externalComments` is meant for short curated excerpts or notes, not wholesale
republication. Each item needs a `quote` and `url`; `source`, `author`, `title` and
`note` are optional helpers for display.

`videos` renders as linked video cards by default. Set `embed: true` on a YouTube item
only when you want the player embedded directly in the film page.

## Ideas to grow

- **Filter by tag:** a `/tag/[tag]` page listing the films for each theme.
- **Autofill data** (poster, year, director) from the TMDB API.
- **RSS** so people can follow the journal.
