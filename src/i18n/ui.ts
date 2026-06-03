// Central place for every UI string in both languages.
// English is the default locale (served at /), Spanish lives under /es.

export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'brand': 'Shadowplay',
    'nav.films': 'Films',
    'nav.map': 'The Map',
    'nav.about': 'About',
    'footer.tagline': 'Handwritten, one film at a time',
    'footer.archive': 'Archive',
    'footer.map': 'Map',
    'footer.manifesto': 'Manifesto',
    'meta.home': 'Shadowplay — a film study journal: I study the films I watch.',
    'meta.map': 'How the films I watch connect to each other: themes, motifs and links.',

    'home.eyebrow': 'The study of the seventh art',
    'home.title.a': "I don't review films.",
    'home.title.b': 'I study them.',
    'home.intro':
      'Every film I watch becomes a study: a frame that sums it up, its themes and ideas, how the screenplay is built, and the connections to the rest of the archive. Less scoring, more thinking.',
    'home.archiveLabel': 'Film archive',
    'home.quote': "Cinema isn't a verdict: it's a way of looking twice.",
    'home.note':
      "In this journal I'm not trying to close a film with a score. I'm trying to understand why a scene comes back days later: the composition, the rhythm, the silences and the connections that surface once the archive starts talking to itself.",
    'home.summaryLabel': 'Archive summary',
    'home.stat.studies': 'Studies published',
    'home.stat.countries': 'Countries logged',

    'card.category.fallback': 'Study note',
    'card.framePending': 'Frame pending',

    'film.back': 'Back to the archive',
    'film.watched': 'Watched on',
    'film.ratingOf': 'of 5',
    'film.connections': 'Connections',
    'film.framePendingCaption': 'Study frame pending for',
    'film.frameAlt': 'Frame from',
    'film.framePendingLabel': 'Frame pending for',

    'map.title': 'The Map',
    'map.eyebrow': 'Relational archive',
    'map.intro':
      'Each film is a slide on the table. The bright lines are connections written by hand; the faint ones, automatic links through shared themes.',
    'map.svgLabel': 'Map of connections between films',
    'map.drag': 'Drag to pan',
    'map.zoom': 'Scroll to zoom',
    'map.studyFile': 'Study file',
    'map.close': 'Close',
    'map.selectFilm': 'Select a film',
    'map.observations': 'Notes',
    'map.placeholderDesc': 'Tap a slide to see its themes, connections and full study.',
    'map.seeStudy': 'See full study',
    'map.related': 'Related correlations',
    'map.noRelations': 'No correlations yet.',
    'map.shareNote': 'Shares',
    'map.empty':
      'No connections yet. Add tags or connections in your studies and they will show up here.',
    'map.emptyTags': 'tags',
    'map.emptyConnections': 'connections',
  },
  es: {
    'brand': 'Shadowplay',
    'nav.films': 'Películas',
    'nav.map': 'El mapa',
    'nav.about': 'Sobre el cuaderno',
    'footer.tagline': 'Escrito a mano, una película a la vez',
    'footer.archive': 'Archivo',
    'footer.map': 'Mapa',
    'footer.manifesto': 'Manifiesto',
    'meta.home': 'Shadowplay — un cuaderno de cine: estudio las películas que voy viendo.',
    'meta.map':
      'Cómo se conectan entre sí las películas que voy viendo: temas, motivos y vínculos.',

    'home.eyebrow': 'Estudio del séptimo arte',
    'home.title.a': 'No reseño películas.',
    'home.title.b': 'Las estudio.',
    'home.intro':
      'Cada película que veo se vuelve una ficha: un fotograma que la resume, sus temas e ideas, cómo está construido el guion, y las conexiones con el resto del archivo. Menos puntaje, más pensamiento.',
    'home.archiveLabel': 'Archivo de películas',
    'home.quote': 'El cine no es un veredicto: es una forma de mirar dos veces.',
    'home.note':
      'En este cuaderno no busco cerrar una película con un puntaje. Busco entender por qué una escena vuelve días después: la composición, el ritmo, los silencios y las conexiones que aparecen cuando el archivo empieza a hablar entre sí.',
    'home.summaryLabel': 'Resumen del archivo',
    'home.stat.studies': 'Estudios publicados',
    'home.stat.countries': 'Países registrados',

    'card.category.fallback': 'Ficha de estudio',
    'card.framePending': 'Fotograma pendiente',

    'film.back': 'Volver al archivo',
    'film.watched': 'Vista el',
    'film.ratingOf': 'de 5',
    'film.connections': 'Conexiones',
    'film.framePendingCaption': 'Fotograma de estudio pendiente para',
    'film.frameAlt': 'Fotograma de',
    'film.framePendingLabel': 'Fotograma pendiente de',

    'map.title': 'El mapa',
    'map.eyebrow': 'Archivo relacional',
    'map.intro':
      'Cada película es una diapositiva sobre la mesa. Las líneas claras son conexiones escritas a mano; las tenues, vínculos automáticos por temas en común.',
    'map.svgLabel': 'Mapa de conexiones entre películas',
    'map.drag': 'Arrastrar para navegar',
    'map.zoom': 'Scroll para zoom',
    'map.studyFile': 'Archivo de estudio',
    'map.close': 'Cerrar',
    'map.selectFilm': 'Seleccioná una película',
    'map.observations': 'Observaciones',
    'map.placeholderDesc':
      'Tocá una diapositiva para ver sus temas, conexiones y ficha completa.',
    'map.seeStudy': 'Ver ficha completa',
    'map.related': 'Correlaciones relacionadas',
    'map.noRelations': 'Sin correlaciones todavía.',
    'map.shareNote': 'Comparten',
    'map.empty':
      'Todavía no hay conexiones. Agregá tags o connections en tus fichas y van a aparecer acá.',
    'map.emptyTags': 'tags',
    'map.emptyConnections': 'connections',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Reads the active language from a URL pathname (/es/... → es, else default). */
export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  if (seg && seg in languages) return seg as Lang;
  return defaultLang;
}

/** Strips the language prefix, returning the language-neutral path (always starts with /). */
export function stripLangFromPath(pathname: string): string {
  const seg = pathname.split('/')[1];
  if (seg && seg in languages) {
    const rest = pathname.slice(seg.length + 1);
    return rest === '' ? '/' : rest;
  }
  return pathname || '/';
}

/** Builds a localized URL for a neutral path (en → no prefix, es → /es/...). */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Locale tag for Intl date formatting. */
export const dateLocale: Record<Lang, string> = {
  en: 'en-US',
  es: 'es-AR',
};
