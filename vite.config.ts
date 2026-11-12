import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { PARQUE } from './src/content/parque.ts';

// Sitio de varias páginas: una entrada HTML por página de pages.json. La portada es index.html (hecha a mano);
// las interiores no existen en disco: las crea en memoria el plugin `innerPages` a partir de pages.json, tanto
// en desarrollo como al compilar (dist/<ruta>/index.html). Solo la portada carga el motor 3D; las demás
// comparten un paquete ligero. Los recursos geográficos (public/assets/*.js, ~16 MB de PNG en base64) se sirven
// tal cual y se cargan bajo demanda desde el motor 3D: no pasan por el bundle.
interface PageInfo { id: string; path: string; title: string; description: string }
const root = fileURLToPath(new URL('.', import.meta.url));
const pages: PageInfo[] = JSON.parse(readFileSync(resolve(root, 'pages.json'), 'utf8'));
const inner = pages.filter((p) => p.path);
const entryOf = (p: PageInfo) => resolve(root, p.path, 'index.html');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const html = (p: PageInfo) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!--panamosab:head ${p.id}-->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..600&family=Manrope:wght@800&display=swap">
</head>
<body>
  <div id="root" data-page="${esc(p.id)}"></div>
  <script type="module" src="/src/inner.tsx"></script>
</body>
</html>
`;

// ---------------------------------------------------------------------------------------------------------------
// SEO: el <head> de cada página (portada e interiores) sale de aquí, a partir de pages.json.
// - SITE_URL (variable de entorno al compilar, p. ej. `SITE_URL=https://dominio npm run build`): dominio público
//   definitivo. Sin él no se emiten canonical, og:url, imagen para compartir (exige URL absoluta) ni sitemap.xml:
//   nunca se inventa un dominio.
// - SITE_NOINDEX=1: copias de prueba (staging). Añade `noindex, nofollow` y no genera sitemap. La versión pública
//   se compila sin esta variable.
// ---------------------------------------------------------------------------------------------------------------
interface Site { url: string | null; index: boolean }
const SITE_NAME = 'Parque Nacional Montaña de Santa Bárbara';
// fotografía propia del parque (vista aérea de sus laderas), recortada a 1200 × 630 en public/og/
const SHARE_IMAGE = {
  path: 'og/panamosab-montana-1200x630.jpg', width: 1200, height: 630,
  alt: 'Vista aérea de laderas cubiertas de bosque denso, con paredes de roca y nubes sobre las cumbres.',
};

function siteFrom(env: Record<string, string>): Site {
  const raw = (env.SITE_URL ?? '').trim().replace(/\/+$/, '');
  if (raw && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw)) {
    throw new Error(`SITE_URL debe ser el dominio público con https y sin ruta (recibido: «${raw}»)`);
  }
  return { url: raw || null, index: !/^(1|true|yes)$/i.test(env.SITE_NOINDEX ?? '') };
}

const pageUrl = (site: Site, p: PageInfo) => `${site.url}/${p.path}`;

/** Datos estructurados de la portada: el sitio y el parque, solo con lo que el propio sitio afirma. */
function jsonLd(site: Site) {
  const url = site.url ? `${site.url}/` : undefined;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: SITE_NAME, alternateName: 'PANAMOSAB', inLanguage: 'es', ...(url && { url }) },
      {
        '@type': 'Park',
        name: SITE_NAME,
        alternateName: 'PANAMOSAB',
        description: PARQUE.lead,
        address: { '@type': 'PostalAddress', addressRegion: 'Santa Bárbara', addressCountry: 'HN' },
        ...(url && { url, image: `${site.url}/${SHARE_IMAGE.path}` }),
      },
    ],
  };
  // `<` escapado: el JSON va dentro de una etiqueta <script>
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function seoHead(p: PageInfo, site: Site) {
  const t = esc(p.title), d = esc(p.description);
  const img = site.url ? `${site.url}/${SHARE_IMAGE.path}` : null;
  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<meta name="robots" content="${site.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}">`,
    // símbolo del sitio web (no es un logotipo oficial): public/favicon.*
    `<link rel="icon" href="/favicon.ico" sizes="48x48">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    site.url && `<link rel="canonical" href="${pageUrl(site, p)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:locale" content="es_HN">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    site.url && `<meta property="og:url" content="${pageUrl(site, p)}">`,
    img && `<meta property="og:image" content="${img}">`,
    img && `<meta property="og:image:type" content="image/jpeg">`,
    img && `<meta property="og:image:width" content="${SHARE_IMAGE.width}">`,
    img && `<meta property="og:image:height" content="${SHARE_IMAGE.height}">`,
    img && `<meta property="og:image:alt" content="${esc(SHARE_IMAGE.alt)}">`,
    `<meta name="twitter:card" content="${img ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    img && `<meta name="twitter:image" content="${img}">`,
    img && `<meta name="twitter:image:alt" content="${esc(SHARE_IMAGE.alt)}">`,
    p.id === 'inicio' && `<script type="application/ld+json">${jsonLd(site)}</script>`,
  ];
  return tags.filter(Boolean).join('\n  ');
}

/** Rellena el marcador <!--panamosab:head id--> de cada HTML y, al compilar, completa robots.txt y genera sitemap.xml. */
function seo(site: Site): Plugin {
  let outDir = '';
  return {
    name: 'panamosab-seo',
    configResolved(c) { outDir = resolve(c.root, c.build.outDir); },
    transformIndexHtml: {
      order: 'pre',
      handler(source) {
        return source.replace(/<!--panamosab:head (\w+)-->/, (_, id: string) => {
          const p = pages.find((q) => q.id === id);
          if (!p) throw new Error(`pages.json no tiene la página «${id}»`);
          return seoHead(p, site);
        });
      },
    },
    closeBundle() {
      const robots = resolve(outDir, 'robots.txt');
      if (!site.index || !site.url || !existsSync(robots)) return;
      appendFileSync(robots, `\nSitemap: ${site.url}/sitemap.xml\n`);
      const urls = pages.map((p) => `  <url><loc>${pageUrl(site, p)}</loc></url>`).join('\n');
      writeFileSync(resolve(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    },
  };
}

/** Páginas interiores virtuales: el HTML de cada una se genera en memoria a partir de pages.json. */
function innerPages(): Plugin {
  const byEntry = new Map(inner.map((p) => [entryOf(p), p]));
  return {
    name: 'panamosab-inner-pages',
    // compilación: las entradas de rollupOptions.input no existen en disco; se resuelven y se cargan aquí
    resolveId(id) {
      return byEntry.has(resolve(id)) ? resolve(id) : null;
    },
    load(id) {
      const p = byEntry.get(resolve(id));
      return p ? html(p) : null;
    },
    // desarrollo: /comanejo/ (o /comanejo, /comanejo/index.html) responde con el HTML transformado por Vite
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        const p = inner.find((q) => url === `/${q.path}` || url === `/${q.path}index.html`);
        if (!p) {
          const bare = inner.find((q) => url === `/${q.path.replace(/\/$/, '')}`);
          if (bare) { res.statusCode = 301; res.setHeader('Location', `/${bare.path}`); res.end(); return; }
          return next();
        }
        try {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(await server.transformIndexHtml(req.url ?? url, html(p)));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [innerPages(), seo(siteFrom(loadEnv(mode, root, ''))), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: { inicio: resolve(root, 'index.html'), ...Object.fromEntries(inner.map((p) => [p.id, entryOf(p)])) },
    },
    // three r128 no se puede trocear por módulos (~600 kB minificado): el aviso por defecto no aporta nada
    chunkSizeWarningLimit: 900,
  },
}));
