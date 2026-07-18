# Plan 003: Completar el `<head>` (canonical, hreflang, Open Graph), sitemap y 404

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 3be62f7..HEAD -- src/layouts/ src/components/ src/pages/ src/i18n/ astro.config.mjs package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (pero **requiere un dato del operador**: la URL de producción
  — ver STOP conditions)
- **Category**: seo / security (hardening menor incluido)
- **Planned at**: commit `3be62f7`, 2026-07-13

## Why this matters

El sitio es bilingüe (inglés en `/`, español en `/es`) pero el `<head>` no emite
canonical ni alternates `hreflang`, así que los buscadores ven contenido duplicado sin
señales para resolverlo. No hay Open Graph ni Twitter card: compartir un link por
WhatsApp/redes muestra un preview vacío — con la ironía de que cada película tiene un
fotograma (`frame`) perfecto para `og:image`. Además `astro.config.mjs` tiene un `site`
placeholder (`https://my-last-movies.example.com`), no hay sitemap ni página 404.
Este plan también incluye un hardening de una línea en `MapView.astro` (escape de `<`
en JSON inyectado con `set:html`).

## Current state

- `astro.config.mjs:6` — `site: 'https://my-last-movies.example.com'` (placeholder).
  Config i18n ya presente: `defaultLocale: 'en'`, `locales: ['en','es']`,
  `prefixDefaultLocale: false`.
- `src/layouts/BaseLayout.astro` — único layout; **todas** las páginas pasan por acá.
  El `<head>` (líneas 25-39) tiene: charset, viewport, description, preconnect +
  stylesheet de Google Fonts, favicon inline SVG y `<title>`. Nada más. Props
  actuales: `{ title: string; description?: string; lang?: Lang }` (líneas 6-10).
- `src/i18n/ui.ts` — helpers existentes que este plan debe **reutilizar, no
  reinventar**:
  - `stripLangFromPath(pathname)` (líneas 359-366): `/es/films/heat/` → `/films/heat/`.
  - `localizePath(path, lang)` (líneas 369-373): `/films/heat/` + `es` → `/es/films/heat/`.
  - `languages` = `{ en, es }`, `defaultLang = 'en'`.
  - Convención (CLAUDE.md): **todo string de UI nuevo va en `ui.ts` en `en` y `es`**;
    no hardcodear texto de interfaz en componentes.
- `src/components/FilmView.astro:78` — la ficha renderiza
  `<BaseLayout title={...} description={data.logline} lang={lang}>`. Tiene acceso a
  `data.frame` (tipo `ImageMetadata | undefined`, importado por el schema con
  `image()`).
- `src/components/MapView.astro:198-199` — el hardening:

  ```astro
  <script type="application/json" id="graph-data" set:html={JSON.stringify(graph)} />
  <script type="application/json" id="map-config" set:html={JSON.stringify(config)} />
  ```

  `set:html` no escapa nada: si una `note`/`logline` del contenido contuviera
  `</script>`, rompería el HTML. Contenido de autor único → riesgo bajo, pero el fix
  es gratis.
- No existe `src/pages/404.astro` ni integración de sitemap. `@astrojs/sitemap` no
  está en `package.json`.
- Los tests e2e (`tests/e2e/basic.spec.ts`) navegan home → film → director → map y
  cambian de idioma; no tocan el `<head>`, así que no deberían romperse.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `npm run build` | exit 0 |
| E2E | `npm run test:e2e` | exit 0, 1 passed |
| Ver head generado | `grep -o '<link rel="canonical"[^>]*>' dist/films/heat/index.html` | 1 match |

## Scope

**In scope**:
- `astro.config.mjs` (URL real de `site` + integración sitemap)
- `package.json` / `package-lock.json` (agregar `@astrojs/sitemap`)
- `src/layouts/BaseLayout.astro`
- `src/components/FilmView.astro` (pasar `ogImage`)
- `src/components/MapView.astro` (solo líneas 198-199, el escape)
- `src/pages/404.astro` (crear)
- `src/i18n/ui.ts` (strings del 404)
- `public/robots.txt` (crear, apuntando al sitemap)

**Out of scope** (NO tocar):
- El resto de `MapView.astro` (D3, estilos) — solo las dos líneas del JSON.
- `src/pages/**` existentes — el head se hereda de BaseLayout; no editar wrappers.
- RSS feed — dirección futura, no entra acá.
- Cualquier cambio visual/CSS fuera del 404 nuevo.

## Git workflow

- Branch: `advisor/003-seo-head`
- Commits por paso lógico, estilo repo: `feat: add canonical/hreflang/OG meta`,
  `feat: add sitemap and robots.txt`, `feat: add 404 page`, `fix: escape </script> in map JSON`
- NO pushear ni abrir PR salvo que el operador lo pida.

## Steps

### Step 0: Obtener la URL de producción

El valor actual de `site` es un placeholder. La URL real la define el operador
(ver STOP conditions). En los pasos siguientes se usa `<SITE_URL>` como marcador.

### Step 1: `site` real + sitemap

```bash
npm install @astrojs/sitemap
```

En `astro.config.mjs`: reemplazar el placeholder por `<SITE_URL>` y agregar la
integración con i18n (mapea cada URL con sus alternates en el XML):

```js
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: '<SITE_URL>',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
  ],
  i18n: { /* sin cambios */ },
});
```

**Verify**: `npm run build` → exit 0 y existe `dist/sitemap-index.xml`.

### Step 2: canonical + hreflang + OG en `BaseLayout.astro`

Ampliar las Props con `ogImage?: string` (URL absoluta o path absoluto del asset).
En el frontmatter del layout, derivar:

```ts
const neutralPath = stripLangFromPath(Astro.url.pathname);
const canonical = new URL(Astro.url.pathname, Astro.site);
const alternates = (Object.keys(languages) as Lang[]).map((l) => ({
  lang: l,
  href: new URL(localizePath(neutralPath, l), Astro.site),
}));
const ogImageUrl = Astro.props.ogImage ? new URL(Astro.props.ogImage, Astro.site) : null;
```

(importar `stripLangFromPath` y `languages` desde `../i18n/ui`, ya se importan otros
helpers de ahí en la línea 4).

En el `<head>`, después de la meta description, agregar:

```astro
<link rel="canonical" href={canonical} />
{alternates.map((a) => <link rel="alternate" hreflang={a.lang} href={a.href} />)}
<link rel="alternate" hreflang="x-default" href={new URL(localizePath(neutralPath, 'en'), Astro.site)} />
<meta property="og:type" content="website" />
<meta property="og:site_name" content={t('brand')} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:locale" content={lang === 'es' ? 'es_AR' : 'en_US'} />
{ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
<meta name="twitter:card" content={ogImageUrl ? 'summary_large_image' : 'summary'} />
```

**Verify**: `npm run build` y después:
- `grep -c 'rel="alternate"' dist/index.html` → `3` (en, es, x-default)
- `grep -o 'hreflang="es" href="[^"]*"' dist/films/heat/index.html` → termina en
  `/es/films/heat/`
- `grep -c 'property="og:title"' dist/es/index.html` → `1`

### Step 3: `og:image` por película en `FilmView.astro`

En el frontmatter de `FilmView.astro`, generar una versión social del frame con
`getImage` (de `astro:assets`) cuando exista:

```ts
import { getImage } from 'astro:assets';
const ogFrame = data.frame
  ? (await getImage({ src: data.frame, width: 1200, height: 630, format: 'jpeg' })).src
  : undefined;
```

y en la línea 78 pasar `ogImage={ogFrame}` al `<BaseLayout ...>`.

**Verify**: `npm run build` y
`grep -o 'property="og:image" content="[^"]*"' dist/films/heat/index.html` → 1 match
con una URL absoluta que contiene `/_astro/heat`.

### Step 4: página 404

Crear `src/pages/404.astro` usando `BaseLayout` (lang `en` por defecto — los hosts
estáticos sirven un único `/404.html`), con el mismo tono visual mínimo: título, una
línea y links a `/` y `/es`. Strings nuevos en `src/i18n/ui.ts` en **ambos** idiomas
(claves sugeridas: `notfound.title`, `notfound.body`, `notfound.back`); en la página,
mostrar ambos idiomas o el del default — criterio del executor, pero sin hardcodear
los textos fuera de `ui.ts`.

**Verify**: `npm run build` → existe `dist/404.html` y
`grep -c 'canonical' dist/404.html` → `1`.

### Step 5: `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: <SITE_URL>/sitemap-index.xml
```

**Verify**: tras `npm run build`, `cat dist/robots.txt` muestra la URL real.

### Step 6: escape del JSON en `MapView.astro`

Reemplazar las líneas 198-199 por:

```astro
<script type="application/json" id="graph-data" set:html={JSON.stringify(graph).replace(/</g, '\\u003c')} />
<script type="application/json" id="map-config" set:html={JSON.stringify(config).replace(/</g, '\\u003c')} />
```

(el JSON emitido contiene la secuencia de seis caracteres `\u003c`, que `JSON.parse` del lado cliente
decodifica de vuelta a `<` — cero cambio de comportamiento, pero el HTML ya no puede
contener un `</script>` literal).

**Verify**: `npm run test:e2e` → 1 passed (el spec cubre el mapa: selecciona nodos vía
el JSON parseado).

## Test plan

- Sin tests unitarios nuevos (no hay framework); la verificación es build + greps del
  Step 2-5 + el e2e existente.
- `npm run test:e2e` → 1 passed (cubre home, film, director, map y el switch a /es).
- Manual opcional para el operador: pegar la URL de una ficha en
  https://www.opengraph.xyz/ una vez deployado.

## Done criteria

- [ ] `npm run build` exit 0
- [ ] `dist/sitemap-index.xml` y `dist/404.html` existen
- [ ] `grep -c 'rel="alternate"' dist/index.html` → 3
- [ ] `grep -c 'property="og:image"' dist/films/heat/index.html` → 1
- [ ] `grep -rn 'my-last-movies.example.com' . --include='*.mjs' --include='*.txt' --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=plans` → sin matches
- [ ] `npm run test:e2e` exit 0
- [ ] Solo archivos in-scope modificados (`git status`)
- [ ] Fila de este plan actualizada en `plans/README.md`

## STOP conditions

- **El operador no proporcionó la URL de producción**: frenar antes del Step 1 y
  pedirla. No inventar un dominio ni dejar el placeholder.
- `getImage` en el frontmatter de `FilmView` falla en build (p. ej. por límites del
  servicio de imágenes con 20 frames): reportar el error exacto; no cambiar el
  service de imágenes global para esquivarlo.
- El e2e falla después del Step 6: revertir solo ese step y reportar (el escape no
  debería alterar el JSON parseado; si lo hace, algo más está pasando).
- `@astrojs/sitemap` requiere una versión de `astro` distinta a la instalada
  (conflicto de peer deps): frenar y reportar; no forzar con `--force`.

## Maintenance notes

- Al agregar una página nueva (p. ej. una futura `/about`), el canonical/hreflang
  salen gratis de BaseLayout; solo asegurarse de que la ruta exista en ambos idiomas
  (el alternate se emite incondicionalmente para en y es).
- Si algún día el español deja de ser espejo 1:1 del inglés, los alternates de
  BaseLayout deben condicionarse a que la página exista en el otro idioma.
- El plan 004 (docs) debería mencionar el `site` real en README si se ejecuta después.
- Revisor: chequear que las URLs de `og:image` sean absolutas (WhatsApp no resuelve
  relativas) y que el 404 no emita hreflang hacia páginas inexistentes.
