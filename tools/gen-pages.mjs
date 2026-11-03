// Genera <ruta>/index.html para cada página interior de pages.json (la portada es index.html, hecha a mano).
// Se ejecuta antes de `npm run dev` y `npm run build`; no hace falta editar estos HTML a mano.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = JSON.parse(readFileSync(join(root, 'pages.json'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

for (const p of pages) {
  if (!p.path) continue;
  const html = `<!doctype html>
<!-- Generado por tools/gen-pages.mjs a partir de pages.json: no editar a mano -->
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
  const dir = join(root, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}
console.log(`páginas generadas: ${pages.filter((p) => p.path).map((p) => p.path).join(' ')}`);
