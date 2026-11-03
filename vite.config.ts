import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Sitio de varias páginas: una entrada HTML por página de pages.json (las interiores las genera
// tools/gen-pages.mjs). Solo la portada carga el motor 3D; las demás comparten un paquete ligero.
// Los recursos geográficos (public/assets/*.js, ~16 MB de PNG en base64) se sirven tal cual y se cargan
// bajo demanda desde el motor 3D: no pasan por el bundle.
const pages: { id: string; path: string }[] = JSON.parse(readFileSync(new URL('./pages.json', import.meta.url), 'utf8'));
const input = Object.fromEntries(
  pages.map((p) => [p.id, fileURLToPath(new URL(`./${p.path}index.html`, import.meta.url))]),
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: { input },
    // three r128 no se puede trocear por módulos (~600 kB minificado): el aviso por defecto no aporta nada
    chunkSizeWarningLimit: 900,
  },
});
