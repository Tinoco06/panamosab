/* Sistema visual de las páginas interiores (comanejo, biodiversidad, turismo, contacto): retícula, etiquetas y
   escalas compartidas por todos sus bloques. */
import type { CSSProperties } from 'react';

export const grid = 'grid grid-cols-12 gap-x-[clamp(24px,3.4vw,56px)] max-md:grid-cols-1';
// en móvil cada bloque ocupa la única columna y vuelve al orden del documento
export const mobile = 'max-md:col-span-1 max-md:col-start-auto max-md:row-start-auto';
// etiqueta: solo para metadatos (fuentes, títulos de listas)
export const label = 'text-[12px] font-semibold uppercase leading-[1.45] tracking-[0.2em]';
// título de bloque dentro de la página (h3 de los perfiles)
export const blockTitle = 'text-[length:clamp(28px,2.6vw,42px)] font-medium leading-[1.08] tracking-[-0.025em]';
// separación vertical entre los grandes bloques de la página
export const section = 'mt-[clamp(104px,17vh,192px)]';
export const delay = (s: number) => ({ '--delay': `${s}s` }) as CSSProperties;
// título de sección dentro de una página (h2)
export const sectionTitle = 'text-[length:clamp(36px,4.2vw,68px)] font-medium leading-[1.02] tracking-[-0.03em] max-md:text-[length:clamp(32px,8.6vw,44px)]';
// cifras grandes (Manrope)
export const display = 'font-display font-extrabold tabular-nums';
