# PANAMOSAB — Parque Nacional Montaña de Santa Bárbara

Sitio institucional con un hero inmersivo sobre el relieve real del macizo y una transición por scroll
hacia «El Parque» y «El Territorio».

**Stack:** React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS 4 · Three.js r128 · GSAP 3.12 (ScrollTrigger)

## Uso

Requiere Node 20.19+ o 22.12+.

```bash
npm install
npm run dev        # desarrollo: http://localhost:5173
npm run build      # comprobación de tipos + compilación de producción en dist/
npm run preview    # sirve dist/ localmente
npm run typecheck  # solo tipos
```

Parámetros de URL útiles: `?skip` salta la intro · `?perf` expone contadores para las pruebas de
rendimiento (`window.PANAMOSAB_SCROLL`, `__js`, `__dpr`, `__R`, `__renderFull`).

## Páginas

Sitio de varias páginas (una entrada HTML por página, sin enrutador en el navegador; funciona en
cualquier hosting estático). El mapa del sitio está en `pages.json`: de ahí salen el menú, el pie, las
entradas de Vite y los HTML de las páginas interiores (`tools/gen-pages.mjs`, se ejecuta solo antes de
`dev` y `build`; no se editan a mano ni se versionan: están en `.gitignore`).

| Ruta | Contenido |
|---|---|
| `/` | Portada y relato del parque: hero 3D · 01 El Parque · 02 El Territorio · 03 Cómo se protege · 04 Agua · 05 Comanejo (carrusel de logotipos y enlace a su página) |
| `/comanejo/` | La alianza del convenio y los perfiles de ASIDE y CASM |
| `/biodiversidad/` `/conservacion/` `/investigacion/` `/visitanos/` `/contacto/` | Aviso «en preparación» (`ready: false`) |

Para publicar una sección pendiente: crear su componente en `src/pages/`, añadirlo en `src/inner.tsx` y
poner `"ready": true` en `pages.json`.

## Estructura

```
index.html                 entrada de la portada (fuentes de Google, raíz de React)
pages.json                 mapa del sitio (rutas, títulos, descripciones)
<ruta>/index.html          páginas interiores, generadas a partir de pages.json
src/inner.tsx              entrada de las páginas interiores (no carga el motor 3D)
src/pages/                 ComanejoPage · PendingPage
src/content/parque.ts      textos del parque (Plan de Manejo); src/content/comanejo.ts, los de comanejo
public/assets/             datos del terreno (PNG en base64; los genera tools/build_terrain.py)
src/
  main.tsx                 monta <App> en StrictMode
  app/App.tsx              composición de la página; crea y destruye el motor 3D (un useEffect)
  app/pageRefs.ts          elementos del DOM que el motor mide
  sections/                HeroSection · ParkSection · TerritorySection · ComanejoSection
  components/              Header · Navigation · HeroTitle · ScrollIndicator · Eyebrow · Loader · Reveal
  components/comanejo/     página de comanejo: Intro · Signatories · Aim · OrgProfile (sistema en ui.ts)
  content/comanejo.ts      textos de «Comanejo» con su fuente; para sumar una organización, añadir su
                           perfil a PROFILES y su id en SIGNATORIES (sin perfil, solo aparece por su nombre y logotipo)
  assets/comanejo/         fotografías de ASIDE (de recursos/) y de Árbol de Misericordia (de su sitio
                           institucional), optimizadas
  lib/                     máscara de niebla del título · scroll suave a una sección
  three/
    engine.ts              motor imperativo: capas WebGL, cámara, scroll, niebla, antialiasing de
                           bordes, resolución adaptativa, intro y animaciones de scroll (GSAP)
    terrain.ts             construcción del terreno (mallas, normales, materiales) por pasos
    terrainData.ts         carga de los datos geográficos (una sola vez por página)
    shaders.ts             GLSL (terreno, cielo, niebla, velo, antialiasing de bordes)
    config.ts              parámetros de cámara, luz y nubes
    noise.ts · math.ts
  styles/index.css         Tailwind: tokens de diseño (@theme), base y la utilidad focus-ring
tools/                     generación de los datos del terreno (Python)
legacy/                    versión anterior (HTML + JS), solo como respaldo: no forma parte del build
```

## Cómo se integra Three.js con React

- El motor (`createExperience`) es imperativo y vive fuera del render de React: un único
  `requestAnimationFrame` mueve cámara, atmósfera y las tres capas WebGL. React no recibe ninguna
  actualización por fotograma; solo el estado de carga (`loading` · `ready` · `error`) una vez.
- `App` lo crea en un `useEffect` y lo destruye en su limpieza. El motor crea sus propios `<canvas>` y
  los retira al terminar, así el doble montaje de StrictMode (desarrollo) parte siempre de contextos
  WebGL nuevos.
- `dispose()` cancela el bucle, quita los listeners (`resize`, `pointermove`), revierte el
  `gsap.context()` (ScrollTriggers, timeline de la intro y sus estilos en línea), libera geometrías,
  materiales, texturas y render targets, y fuerza la pérdida de los contextos.
- Los datos del terreno se cargan una vez por página (promesa en caché).
- Sin WebGL, la página sigue siendo legible: todo el texto visible sobre el azul niebla de la paleta.

## Rendimiento (conservado de la versión anterior)

Sin MSAA (antialiasing de bordes propio, solo donde hay perfiles contra el cielo) · búfer intermedio
con profundidad de 24 bits · resolución adaptativa con recuperación progresiva · subida de texturas y
compilación de shaders repartidas en la carga · nubes, su sombra y la silueta del fragmento calculadas
por vértice · máscara del título a 256×80 · un solo bucle y una sola fuente de progreso del scroll
(suavizado de 0.06 s sobre el scroll nativo).

## Recursos gráficos

- `src/assets/park/contours.svg`: curvas de nivel del macizo generadas con `python tools/build_contours.py`
  a partir del mismo modelo de elevación del relieve 3D. Es una ilustración, no el límite oficial.
- `src/components/react-bits/CircularCarousel.*`: componente de [React Bits](https://reactbits.dev)
  (registro `@react-bits/CircularCarousel-JS-CSS`), copiado como haría `npx shadcn add`; solo se añadieron
  las props `ariaLabel` y `ofText`.
- `src/assets/logos/*.webp` (carrusel de la portada; fondo transparente) y `logos/trim/*.webp` (los mismos,
  recortados al trazo, para la página de comanejo): ASIDE, de su presentación 2026; CASM, de casm.hn;
  CODEMUSSBA, de codemussba.org; Árbol de Misericordia, archivo oficial facilitado por el equipo; ICF,
  recortado del convenio escaneado (provisional: sustituir por el archivo oficial).

## Créditos

Relieve: AWS Terrain Tiles (Mapzen/Tilezen, datos abiertos). Imagen aérea: Esri World Imagery (Esri,
Maxar, Earthstar Geographics) — revisar la licencia antes de publicar en producción. Fuentes: Instrument
Sans y Manrope (Google Fonts, SIL Open Font License). Three.js (MIT), React (MIT), Tailwind CSS (MIT),
GSAP (licencia estándar de GreenSock).
