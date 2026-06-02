import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada película es un archivo Markdown en src/content/movies/.
// El frontmatter guarda los datos + los "disparadores de estudio" cortos,
// y el cuerpo del Markdown guarda el análisis largo (Temas, Guion, etc.).
const movies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/movies' }),
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

      draft: z.boolean().default(false),
    }),
});

export const collections = { movies };
