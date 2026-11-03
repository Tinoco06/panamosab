/* Datos geográficos del terreno (generados por tools/build_terrain.py en public/assets):
     - Relieve: AWS Terrain Tiles (Mapzen/Tilezen, datos abiertos)
     - Imagen aérea: Esri World Imagery (Esri, Maxar, Earthstar Geographics)
   Cada archivo es un script que deja un PNG en base64 en window.PANAMOSAB_*. Se cargan una sola vez por
   página: la promesa queda en caché, así un segundo montaje (React StrictMode, navegación) no los repite. */

interface Layer { png: string; size?: number; extent: number; dem?: string }

declare global {
  interface Window {
    PANAMOSAB_DEM?: Layer & { size: number };
    PANAMOSAB_SAT?: { png: string };
    PANAMOSAB_FAR?: Layer & { size: number; dem: string };
    PANAMOSAB_DETAIL?: Layer;
  }
}

export interface TerrainData {
  dem: HTMLImageElement;
  sat: HTMLImageElement;
  far: HTMLImageElement;
  farDem: HTMLImageElement;
  detail: HTMLImageElement | null;
  meta: {
    dem: { size: number; extent: number };
    far: { size: number; extent: number };
    detail: { extent: number } | null;
  };
}

const base = `${import.meta.env.BASE_URL}assets/`;

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = () => resolve();
  s.onerror = () => reject(new Error('No se pudo cargar ' + src));
  document.head.appendChild(s);
});

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('No se pudo decodificar una imagen del terreno'));
  img.src = src;
});

const cache = new Map<string, Promise<TerrainData>>();

export function loadTerrainData(isMobile: boolean): Promise<TerrainData> {
  const key = isMobile ? 'mobile' : 'desktop';
  let p = cache.get(key);
  if (!p) {
    p = load(isMobile);
    p.catch(() => cache.delete(key)); // un fallo de red no queda en caché: se puede reintentar
    cache.set(key, p);
  }
  return p;
}

async function load(isMobile: boolean): Promise<TerrainData> {
  const scripts = [
    isMobile ? 'terrain-dem-m.js' : 'terrain-dem.js',
    isMobile ? 'terrain-sat-2k.js' : 'terrain-sat-4k.js',
    isMobile ? 'terrain-far-m.js' : 'terrain-far.js',
  ];
  if (!isMobile) scripts.push('terrain-detail.js');
  await Promise.all(scripts.map((s) => loadScript(base + s)));
  const D = window.PANAMOSAB_DEM, S = window.PANAMOSAB_SAT, F = window.PANAMOSAB_FAR, DT = window.PANAMOSAB_DETAIL;
  if (!D || !S || !F) throw new Error('Faltan datos del terreno');
  const [dem, sat, far, farDem, detail] = await Promise.all([
    loadImage(D.png),
    loadImage(S.png),
    loadImage(F.png),
    loadImage(F.dem),
    DT ? loadImage(DT.png) : Promise.resolve(null),
  ]);
  return {
    dem, sat, far, farDem, detail,
    meta: {
      dem: { size: D.size, extent: D.extent },
      far: { size: F.size, extent: F.extent },
      detail: DT ? { extent: DT.extent } : null,
    },
  };
}
