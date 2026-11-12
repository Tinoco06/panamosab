/* Tipos y utilidades de las fotografías del sitio (comanejo, biodiversidad, turismo). */

export interface Photo {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  /** encuadre en los recortes (object-position), si no basta el centro */
  focus?: string;
  /** procedencia: se muestra junto a la imagen */
  credit?: string;
}

/** Fotografía en dos tamaños: `src1` (grande, ancho `w1`) y `src2` (pequeño, ancho `w2`). */
export const photo = (src1: string, src2: string, w1: number, w2: number, width: number, height: number, alt: string, extra: Partial<Photo> = {}): Photo => ({
  src: src1, srcSet: `${src2} ${w2}w, ${src1} ${w1}w`, width, height, alt, ...extra,
});

/** Fotografía en varios anchos: `sources` = [[archivo, ancho], …] de menor a mayor (`src`: el mayor). */
export const sized = (sources: [string, number][], width: number, height: number, alt: string, extra: Partial<Photo> = {}): Photo => ({
  src: sources[sources.length - 1][0], srcSet: sources.map(([s, w]) => `${s} ${w}w`).join(', '), width, height, alt, ...extra,
});

/** Fotografía en un solo tamaño (recortes pequeños de documentos). */
export const single = (src: string, width: number, height: number, alt: string, extra: Partial<Photo> = {}): Photo => ({
  src, srcSet: `${src} ${width}w`, width, height, alt, ...extra,
});
