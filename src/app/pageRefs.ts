import { useRef, type RefObject } from 'react';

// Elementos del DOM que el motor 3D mide (posición del título, hueco del fragmento, columna de 02…).
// Las secciones los enlazan; App los entrega al motor una sola vez, al montarlo.
export interface PageRefs {
  hero: RefObject<HTMLElement | null>;
  heroChrome: RefObject<HTMLDivElement | null>;
  heroTitle: RefObject<HTMLHeadingElement | null>;
  park: RefObject<HTMLElement | null>;
  parkText: RefObject<HTMLDivElement | null>;
  parkFrame: RefObject<HTMLDivElement | null>;
  parkPeak: RefObject<HTMLDivElement | null>;
  territory: RefObject<HTMLElement | null>;
  territoryStage: RefObject<HTMLDivElement | null>;
  territoryColumn: RefObject<HTMLDivElement | null>;
}

export function usePageRefs(): PageRefs {
  return {
    hero: useRef<HTMLElement>(null),
    heroChrome: useRef<HTMLDivElement>(null),
    heroTitle: useRef<HTMLHeadingElement>(null),
    park: useRef<HTMLElement>(null),
    parkText: useRef<HTMLDivElement>(null),
    parkFrame: useRef<HTMLDivElement>(null),
    parkPeak: useRef<HTMLDivElement>(null),
    territory: useRef<HTMLElement>(null),
    territoryStage: useRef<HTMLDivElement>(null),
    territoryColumn: useRef<HTMLDivElement>(null),
  };
}

/** Lee todas las referencias; falla si alguna sección no se ha montado (error de programación). */
export function resolveRefs<T extends { [K in keyof T]: RefObject<unknown> }>(refs: T) {
  const out = {} as { [K in keyof T]: NonNullable<T[K]['current']> };
  for (const k in refs) {
    const el = refs[k].current;
    if (!el) throw new Error(`Falta el elemento "${k}" para la experiencia 3D`);
    out[k] = el as NonNullable<T[typeof k]['current']>;
  }
  return out;
}
