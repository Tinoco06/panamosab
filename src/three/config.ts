/* Configuración de la escena (distancias en km, ángulos en grados). Valores aprobados: no cambian con la
   migración a React. */

export type Vec3 = [number, number, number];

/** `mobileProfile`: perfil del dispositivo (datos del relieve, malla, lente y poses del hero y de 01), decidido una vez
 *  al crear el motor. No decide la composición de 02: esa la fija el CSS (ver TERR_STACK). */
export function createConfig(isMobile: boolean) {
  return {
    exaggeration: 1.15,                        // relieve vertical, apenas acentuado
    segments: isMobile ? 384 : 576,            // malla cercana; más densa en el centro (warp)
    warp: isMobile ? 0.45 : 0.35,              // 1 = uniforme; menor = más detalle en el macizo
    farSegments: isMobile ? 160 : 256,
    dpr: Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5),
    fov: isMobile ? 50 : 31,
    anchorY: 2.0,                              // punto de mira dentro del macizo (km)
    sun: [0.84, 0.46, 0.1] as Vec3,            // mañana: sol del este, a la derecha del encuadre
    // Hero: vista aérea suave (capas de cordilleras con niebla entre ellas); la cumbre algo a la derecha,
    // hacia donde irá en 01, y el cielo justo para el nombre del parque
    hero: { az: -22, el: isMobile ? 8 : 7.5, dist: isMobile ? 21 : 19.5, x: isMobile ? 0.56 : 0.6, y: isMobile ? 0.64 : 0.62 },
    drift: { az: 0.6, el: 0.15, dist: 0.006, period: 52 }, // deriva ambiental de la cámara (grados, fracción, s)
    // 01: la cámara se aleja y sube hasta ver el macizo como un fragmento de terreno flotando
    // (radio del fragmento 19.5 km: un 30 % más de territorio que los 15 km anteriores; pasados los 18.9 km
    // del relieve detallado, el borde con niebla usa la capa lejana)
    final: { az: -18, el: isMobile ? 34 : 30, dist: isMobile ? 68 : 80, y: isMobile ? 0.68 : 0.58 },
    fitRadius: 22.8,                           // radio visible del fragmento, con su borde (km)…
    fill: 0.94,                                // …que ocupa este porcentaje del ancho del hueco de la figura
    island: { from: 60, radius: 19.5, edge: 2.7, relief: 3.0 }, // radio inicial y final (km), borde (km), km de alcance por km de altura
    mouse: { yaw: 2.0, pitch: 0.7 },           // respuesta máxima al mouse (grados)
    // 02 El territorio: la cámara se eleva sobre el macizo (sin rotar) y luego se acerca apenas
    terr: {
      start: { el: 58, dist: 30, az: -12 },
      end: { el: 78, dist: 27, az: -4, pan: [0.3, -0.6] as [number, number] }, // la cámara rodea apenas el territorio (8°) y se desplaza
      radius: 6.5,                                   // radio del macizo (km)…
      // …en la composición lateral (texto a la izquierda): fracción del alto, sin pasar de una fracción del ancho
      // (solo limita en pantallas casi cuadradas o verticales), y centro. En la apilada se encaja en su hueco.
      side: { size: 0.52, maxW: 0.36, x: 0.82, y: 0.46 },
    },
  };
}
export type Config = ReturnType<typeof createConfig>;

/**
 * 02 El Territorio en composición apilada (CSS: ancho ≤ 820 px, o cuando la columna no cabe junto al mapa): el mapa
 * arriba, en su hueco (`territoryMap`), y el texto debajo, sobre papel. El motor encaja el macizo en el hueco con
 * estos valores y la sección los usa para decidir si la columna cabe en el escenario fijo sin empequeñecer el mapa;
 * si no cabe, el escenario muestra solo el mapa y el texto sigue debajo, con scroll normal.
 */
export const TERR_STACK = {
  fade: 56,          // px: el papel sube hasta aquí por encima del borde inferior del hueco (transición de niebla)
  top: 16,           // px libres sobre el macizo
  margin: 0.04,      // margen a cada lado, fracción del ancho del hueco
  extent: 0.98,      // semieje del disco de 6.5 km proyectado, en radios (vista cenital, medido en 02)
  lift: 0.15,        // el disco proyectado queda ~0.15 radios por debajo del punto de mira (relieve y perspectiva)
  minWidth: 0.72,    // con el texto en el escenario, el macizo mide al menos este ancho del hueco…
  minPx: 420,        // …o estos px (tablets): si no llega, el texto sale del escenario
};

/** Radio en px (del punto de mira) con el que el macizo cabe en un hueco de w × h px en la composición apilada. */
export function stackRadius(w: number, h: number) {
  const S = TERR_STACK;
  return Math.max(0, Math.min(w * (0.5 - S.margin), (h - S.fade - S.top) * 0.5)) / S.extent;
}

// Mañana clara sobre la montaña (colores sRGB; se pasan a lineal donde corresponde)
export const LOOK = {
  zenith: '#5f97cf', horizon: '#dfe9ef', sunGlow: '#ffe3b8',
  cloudLit: '#ffffff', cloudShade: '#d9e2e9',
  mistLit: '#f6f8f8', mistShade: '#d3dbdf',
  fogShade: '#c3ccd0', fogLit: '#f7f8f6',
  sunColor: [1.12, 1.04, 0.92] as Vec3, ambient: [0.46, 0.52, 0.6] as Vec3, tint: [1.03, 1.0, 0.95] as Vec3,
  exposure: 1.18, saturation: 0.86, relief: 0.8, localContrast: 0.72,
};

// Luz del hero (se funde con LOOK durante la transición; 01 y 02 no cambian): mañana con el sol bajo
// (~28°) entrando por la IZQUIERDA del encuadre y apenas desde detrás de la cámara, así baña de lado la
// cara del macizo que vemos y marca las crestas: volumen con el relieve real, sin inventarlo. El cálido
// sale del color del sol y del resplandor del cielo hacia la izquierda (glowWide), no de un filtro: el
// ambiente (el cielo) queda frío y la textura no se tiñe. Nubes bajas a 1.4 km: mar de nubes en los valles.
export const HERO_LOOK = {
  sun: [-0.885, 0.466, -0.023] as Vec3,
  sunColor: [1.72, 1.3, 0.82] as Vec3, sunGlow: '#ffc980', glow: 1.3, glowWide: 2.2,
  zenith: '#4a8ad0', horizon: '#b4d0e8',
  ambient: [0.33, 0.41, 0.54] as Vec3, tint: [1.0, 1.0, 0.99] as Vec3,
  exposure: 1.36, saturation: 1.14, relief: 0.95, localContrast: 1.1, haze: 0.016,
  mist: 0.26, mistRange: [0.7, 1.2], mistLit: '#fffaf2', mistShade: '#e4e8e9',
  fogLit: '#fffbf4', fogShade: '#e6eaea',
  clouds: { amount: 1.2, alt: 1.5, free: [1.0, 2.5], cover: [0.48, 0.72], opacity: 0.93, thin: 0.3, sun: 0.7 },
};
export const PAGE_CLOUDS = { alt: 3.9, free: [8.0, 14.0], cover: [0.64, 0.86], opacity: 0.55, thin: 0, sun: 0 };

// Marfil de la página. Debe coincidir con --color-ivory (src/styles/index.css).
export const PAGE_COLOR = '#f1f0e8';

// s: constante del suavizado del scroll. Corta a propósito: el navegador ya suaviza la rueda y el
// trackpad, y una constante larga hacía que la montaña fuera muy por detrás del texto (0.3 s → 1.2 s
// para alcanzarlo). Este filtro solo absorbe los saltos de una rueda sin desplazamiento suave.
export const SCROLL_LAG = 0.06;
