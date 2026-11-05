import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

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
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}">
  <link rel="icon" href="data:,">
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

export default defineConfig({
  plugins: [innerPages(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: { inicio: resolve(root, 'index.html'), ...Object.fromEntries(inner.map((p) => [p.id, entryOf(p)])) },
    },
    // three r128 no se puede trocear por módulos (~600 kB minificado): el aviso por defecto no aporta nada
    chunkSizeWarningLimit: 900,
  },
});
