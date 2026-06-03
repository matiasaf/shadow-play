// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://my-last-movies.example.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      // English lives at the root (/), Spanish under /es.
      prefixDefaultLocale: false,
    },
  },
});
