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
    'nav.directors': 'Directors',
    'nav.map': 'The Map',
    'nav.upnext': 'Up Next',
    'footer.tagline': 'Handwritten, one film at a time',
    'footer.archive': 'Archive',
    'footer.directors': 'Directors',
    'footer.map': 'Map',
    'footer.upnext': 'Up Next',
    'footer.manifesto': 'Manifesto',
    'meta.home': 'Shadowplay — a film study journal: I study the films I watch.',
    'meta.map': 'How the films I watch connect to each other: themes, motifs and links.',
    'meta.directors':
      'The directors behind the archive: each one a way of seeing the world, studied film by film.',
    'meta.upnext':
      'Up Next: the films still on the table, chosen out of the obsessions the archive keeps circling — each with why to watch it and spoiler-free viewing keys.',

    'home.eyebrow': 'The study of the seventh art',
    'home.title.a': "I don't review films.",
    'home.title.b': 'I study them.',
    'home.intro':
      'Every film I watch becomes a study: a frame that sums it up, its themes and ideas, how the screenplay is built, and the connections to the rest of the archive. Less scoring, more thinking.',
    'home.archiveLabel': 'Film archive',
    'home.archiveTag': 'Archive',
    'home.scroll': 'Scroll',
    'home.latest': 'Latest study',
    'home.quote': "Cinema isn't a verdict: it's a way of looking twice.",
    'home.note':
      "In this journal I'm not trying to close a film with a score. I'm trying to understand why a scene comes back days later: the composition, the rhythm, the silences and the connections that surface once the archive starts talking to itself.",
    'home.summaryLabel': 'Archive summary',
    'home.stat.studies': 'Studies published',
    'home.stat.directors': 'Directors studied',
    'home.stat.countries': 'Countries logged',
    'dashboard.eyebrow': 'Archive dashboard',
    'dashboard.title': 'Ways into the archive',
    'dashboard.intro':
      'The director remains the main axis, but the same studies can be read by recurring ideas, viewing date, film history and written links.',
    'dashboard.controls': 'Dashboard controls',
    'dashboard.viewLabel': 'Archive views',
    'dashboard.view.directors': 'Directors',
    'dashboard.view.themes': 'Themes',
    'dashboard.view.journal': 'Journal',
    'dashboard.view.timeline': 'Timeline',
    'dashboard.view.connections': 'Connections',
    'dashboard.filter.director': 'Director',
    'dashboard.filter.theme': 'Theme',
    'dashboard.filter.country': 'Country',
    'dashboard.sort': 'Sort',
    'dashboard.sort.recency': 'Recent',
    'dashboard.sort.count': 'Quantity',
    'dashboard.sort.alpha': 'A-Z',
    'dashboard.all': 'All',
    'dashboard.empty': 'No studies match those filters.',
    'dashboard.connection': 'link',
    'dashboard.connections': 'links',

    'card.category.fallback': 'Study note',
    'card.framePending': 'Frame pending',

    'frame.noFrame': 'No frame',

    'directors.title': 'The Directors',
    'directors.eyebrow': 'Ways of seeing',
    'directors.intro':
      'The archive is organized around the people behind the camera. Each director is a way of seeing the world; each film, one more session studying that gaze.',
    'directors.summary': 'Archive summary',
    'directors.viewpoints': 'Viewpoints',
    'directors.films': 'Films studied',
    'directors.open': 'Open file',
    'director.study': 'study',
    'director.studies': 'studies',
    'director.worldview': 'Worldview',
    'director.obsessions': 'Obsessions',
    'director.filmography': 'Studied filmography',
    'director.back': 'All directors',
    'director.essayPending':
      'Director study pending. For now, the films speak for themselves.',
    'director.dossier': 'Director file',
    'director.born': 'b.',

    'film.back': 'Back to the archive',
    'film.studyFile': 'Study file',
    'film.studyFrame': 'Study frame',
    'film.watched': 'Watched on',
    'film.ratingOf': 'of 5',
    'film.connections': 'Connections',
    'film.readingNotes': 'Study notes',
    'film.studyNavigation': 'Study navigation',
    'film.externalComments': 'Curated comments',
    'film.externalComment': 'Curated comment',
    'film.readComment': 'Read comment',
    'film.closeModal': 'Close',
    'film.openExternal': 'Open original',
    'film.videos': 'Videos',
    'film.videoFallback': 'Open video',
    'film.framePendingCaption': 'Study frame pending for',
    'film.frameAlt': 'Frame from',
    'film.framePendingLabel': 'Frame pending for',

    'map.title': 'The Map',
    'map.eyebrow': 'Relational archive',
    'map.intro':
      'Directors are the territories of the archive; their films orbit around them. Turn on ideas and themes to remember how those worlds speak to each other.',
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
    'map.sameDirector': 'Same director',
    'map.empty':
      'No connections yet. Add tags or connections in your studies and they will show up here.',
    'map.emptyTags': 'tags',
    'map.emptyConnections': 'connections',
    'map.layers': 'Map layers',
    'map.readingTitle': 'A map of viewpoints',
    'map.readingHelp': 'Start with a director, then follow their films and handwritten ideas.',
    'map.ideas': 'Written ideas',
    'map.themes': 'Shared themes',
    'map.memoryFile': 'Memory file',
    'map.selectNode': 'Select a director or film',
    'map.filmLabel': 'film',
    'map.filmsLabel': 'films',
    'map.ideaLabel': 'Idea',
    'map.themeLabel': 'Theme',
    'map.seeDirector': 'Open director file',
    'map.summary': 'Map summary',
    'map.directorsCount': 'Viewpoints',
    'map.filmsCount': 'Films',
    'map.linksCount': 'Written links',
    'map.fieldLabel': 'Memory field',
    'map.find': 'Find in the map',
    'map.searchLabel': 'Find node',
    'map.searchPlaceholder': 'Search films or directors',
    'map.resetView': 'Reset view',
    'director.openMap': 'See on the map',

    'upnext.eyebrow': "What's still on the table",
    'upnext.title': 'Up Next',
    'upnext.intro':
      "Not studies yet — a watchlist. These are films I haven't seen, chosen mostly out of the obsessions this archive keeps circling: the double, noir and fatalism, craft, the silence of God, the films from down here. Each one comes with why it's worth watching and a few keys for how to look at it. No spoilers.",
    'upnext.summaryLabel': 'Watchlist summary',
    'upnext.films': 'Films queued',
    'upnext.threads': 'Threads',
    'upnext.spoilerFree': 'Spoiler-free',
    'upnext.why': 'Why watch it',
    'upnext.tips': 'Viewing keys',
    'upnext.seeds': 'On the list because of',
    'upnext.untracked': 'in the archive',
  },
  es: {
    'brand': 'Shadowplay',
    'nav.films': 'Películas',
    'nav.directors': 'Directores',
    'nav.map': 'El mapa',
    'nav.upnext': 'Próximas sesiones',
    'footer.tagline': 'Escrito a mano, una película a la vez',
    'footer.archive': 'Archivo',
    'footer.directors': 'Directores',
    'footer.map': 'Mapa',
    'footer.upnext': 'Próximas sesiones',
    'footer.manifesto': 'Manifiesto',
    'meta.home': 'Shadowplay — un cuaderno de cine: estudio las películas que voy viendo.',
    'meta.map':
      'Cómo se conectan entre sí las películas que voy viendo: temas, motivos y vínculos.',
    'meta.directors':
      'Los directores detrás del archivo: cada uno una forma de ver el mundo, estudiada película a película.',
    'meta.upnext':
      'Próximas sesiones: las películas que todavía están sobre la mesa, elegidas a partir de las obsesiones que el archivo no deja de rondar, cada una con su por qué verla y claves de visionado sin spoilers.',

    'home.eyebrow': 'Estudio del séptimo arte',
    'home.title.a': 'No reseño películas.',
    'home.title.b': 'Las estudio.',
    'home.intro':
      'Cada película que veo se vuelve una ficha: un fotograma que la resume, sus temas e ideas, cómo está construido el guion, y las conexiones con el resto del archivo. Menos puntaje, más pensamiento.',
    'home.archiveLabel': 'Archivo de películas',
    'home.archiveTag': 'Archivo',
    'home.scroll': 'Scroll',
    'home.latest': 'Última ficha',
    'home.quote': 'El cine no es un veredicto: es una forma de mirar dos veces.',
    'home.note':
      'En este cuaderno no busco cerrar una película con un puntaje. Busco entender por qué una escena vuelve días después: la composición, el ritmo, los silencios y las conexiones que aparecen cuando el archivo empieza a hablar entre sí.',
    'home.summaryLabel': 'Resumen del archivo',
    'home.stat.studies': 'Estudios publicados',
    'home.stat.directors': 'Directores estudiados',
    'home.stat.countries': 'Países registrados',
    'dashboard.eyebrow': 'Dashboard del archivo',
    'dashboard.title': 'Formas de entrar al archivo',
    'dashboard.intro':
      'El director sigue siendo el eje principal, pero las mismas fichas también se pueden leer por ideas recurrentes, fecha de visualización, historia del cine y vínculos escritos.',
    'dashboard.controls': 'Controles del dashboard',
    'dashboard.viewLabel': 'Vistas del archivo',
    'dashboard.view.directors': 'Directores',
    'dashboard.view.themes': 'Temas',
    'dashboard.view.journal': 'Diario',
    'dashboard.view.timeline': 'Línea histórica',
    'dashboard.view.connections': 'Conexiones',
    'dashboard.filter.director': 'Director',
    'dashboard.filter.theme': 'Tema',
    'dashboard.filter.country': 'País',
    'dashboard.sort': 'Orden',
    'dashboard.sort.recency': 'Reciente',
    'dashboard.sort.count': 'Cantidad',
    'dashboard.sort.alpha': 'A-Z',
    'dashboard.all': 'Todo',
    'dashboard.empty': 'No hay fichas para esos filtros.',
    'dashboard.connection': 'vínculo',
    'dashboard.connections': 'vínculos',

    'card.category.fallback': 'Ficha de estudio',
    'card.framePending': 'Fotograma pendiente',

    'frame.noFrame': 'Sin fotograma',

    'directors.title': 'Los directores',
    'directors.eyebrow': 'Formas de mirar',
    'directors.intro':
      'El archivo se organiza alrededor de quienes están detrás de cámara. Cada director es una forma de ver el mundo; cada película, una sesión más estudiando esa mirada.',
    'directors.summary': 'Resumen del archivo',
    'directors.viewpoints': 'Miradas',
    'directors.films': 'Películas estudiadas',
    'directors.open': 'Abrir ficha',
    'director.study': 'estudio',
    'director.studies': 'estudios',
    'director.worldview': 'Su mirada',
    'director.obsessions': 'Obsesiones',
    'director.filmography': 'Filmografía estudiada',
    'director.back': 'Todos los directores',
    'director.essayPending':
      'Ficha del director pendiente. Por ahora, hablan sus películas.',
    'director.dossier': 'Legajo de director',
    'director.born': 'n.',

    'film.back': 'Volver al archivo',
    'film.studyFile': 'Ficha de estudio',
    'film.studyFrame': 'Fotograma de estudio',
    'film.watched': 'Vista el',
    'film.ratingOf': 'de 5',
    'film.connections': 'Conexiones',
    'film.readingNotes': 'Notas de estudio',
    'film.studyNavigation': 'Navegación de la ficha',
    'film.externalComments': 'Comentarios curados',
    'film.externalComment': 'Comentario curado',
    'film.readComment': 'Leer comentario',
    'film.closeModal': 'Cerrar',
    'film.openExternal': 'Abrir original',
    'film.videos': 'Videos',
    'film.videoFallback': 'Abrir video',
    'film.framePendingCaption': 'Fotograma de estudio pendiente para',
    'film.frameAlt': 'Fotograma de',
    'film.framePendingLabel': 'Fotograma pendiente de',

    'map.title': 'El mapa',
    'map.eyebrow': 'Archivo relacional',
    'map.intro':
      'Los directores son los territorios del archivo; sus películas orbitan alrededor. Activá ideas y temas para recordar cómo dialogan esas miradas.',
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
    'map.sameDirector': 'Mismo director',
    'map.empty':
      'Todavía no hay conexiones. Agregá tags o connections en tus fichas y van a aparecer acá.',
    'map.emptyTags': 'tags',
    'map.emptyConnections': 'connections',
    'map.layers': 'Capas del mapa',
    'map.readingTitle': 'Un mapa de miradas',
    'map.readingHelp': 'Empezá por un director y seguí sus películas y las ideas escritas a mano.',
    'map.ideas': 'Ideas escritas',
    'map.themes': 'Temas compartidos',
    'map.memoryFile': 'Ficha de memoria',
    'map.selectNode': 'Elegí un director o una película',
    'map.filmLabel': 'película',
    'map.filmsLabel': 'películas',
    'map.ideaLabel': 'Idea',
    'map.themeLabel': 'Tema',
    'map.seeDirector': 'Abrir ficha del director',
    'map.summary': 'Resumen del mapa',
    'map.directorsCount': 'Miradas',
    'map.filmsCount': 'Películas',
    'map.linksCount': 'Vínculos escritos',
    'map.fieldLabel': 'Campo de memoria',
    'map.find': 'Buscar en el mapa',
    'map.searchLabel': 'Buscar nodo',
    'map.searchPlaceholder': 'Buscar películas o directores',
    'map.resetView': 'Reencuadrar',
    'director.openMap': 'Ver en el mapa',

    'upnext.eyebrow': 'Lo que sigue sobre la mesa',
    'upnext.title': 'Próximas sesiones',
    'upnext.intro':
      'Todavía no son fichas: es una lista de pendientes. Películas que no vi, elegidas sobre todo a partir de las obsesiones que este archivo no deja de rondar: el doble, el noir y el fatalismo, el oficio, el silencio de Dios, el cine de acá. Cada una viene con por qué verla y un par de claves para mirarla. Sin spoilers.',
    'upnext.summaryLabel': 'Resumen de pendientes',
    'upnext.films': 'Películas en cola',
    'upnext.threads': 'Hilos',
    'upnext.spoilerFree': 'Sin spoilers',
    'upnext.why': 'Por qué verla',
    'upnext.tips': 'Claves para verla',
    'upnext.seeds': 'En la lista por',
    'upnext.untracked': 'en el archivo',
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
