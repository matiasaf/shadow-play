import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each film is a Markdown file under src/content/movies/<lang>/<slug>.md
// (e.g. en/heat.md, es/heat.md). The frontmatter holds the data + the short
// "study triggers"; the Markdown body holds the long analysis (Themes, etc.).
const movies = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/movies' }),
  schema: ({ image }) =>
    z.object({
      // --- Datos de la película ---
      title: z.string(),
      originalTitle: z.string().optional(),
      director: z.string(),
      year: z.number(),
      country: z.string().optional(),
      runtime: z.number().optional(), // minutos
      watchedOn: z.coerce.date(),

      // --- El frame destacado (un solo fotograma que la resume) ---
      frame: image().optional(),
      frameCaption: z.string().optional(),

      // --- Disparadores de estudio (cortos, viven en el frontmatter) ---
      logline: z.string(), // la película en una sola frase, con tus palabras
      rating: z.number().min(1).max(5).optional(),

      // --- Conexiones y temas (la base del futuro "mapa") ---
      tags: z.array(z.string()).default([]),
      connections: z
        .array(
          z.object({
            slug: z.string(), // id de otra película (nombre del archivo sin .md)
            note: z.string(), // por qué se conectan
          })
        )
        .default([]),

      // --- Material externo curado ---
      externalComments: z
        .array(
          z
            .object({
              source: z.string().default('FilmAffinity'),
              author: z.string().optional(),
              title: z.string().optional(),
              summary: z.string().optional(),
              body: z.string().optional(),
              quote: z.string().optional(), // legacy: use summary + body for new entries
              url: z.string().url(),
              note: z.string().optional(),
            })
            .refine((comment) => comment.summary || comment.body || comment.quote, {
              message: 'External comments need at least summary, body or quote.',
            })
        )
        .default([]),
      videos: z
        .array(
          z.object({
            platform: z.string().default('youtube'),
            title: z.string(),
            url: z.string().url(),
            channel: z.string().optional(),
            note: z.string().optional(),
            embed: z.boolean().default(false),
          })
        )
        .default([]),

      draft: z.boolean().default(false),
    }),
});

// Each director is a Markdown file under src/content/directors/<lang>/<slug>.md.
// The filename must be the slug derived from the director's name (see
// directorSlug() in src/lib/directors.ts). The body holds the essay on how
// they see the world. Director pages exist even without this file — it only
// adds the essay layer on top of the auto-generated filmography.
const directors = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/directors' }),
  schema: z.object({
    name: z.string(), // must match the `director` field of their films exactly
    worldview: z.string(), // their way of seeing the world, in one sentence
    born: z.number().optional(),
    country: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { movies, directors };
