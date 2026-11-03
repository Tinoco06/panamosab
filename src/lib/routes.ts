/* Mapa del sitio: una página HTML por entrada (ver vite.config.ts, que lee pages.json).
   `ready: false` = la página existe y el menú lleva a ella, pero su contenido aún no está validado:
   muestra un aviso de «en preparación», nunca texto inventado. */
import pages from '../../pages.json';

export type PageId = 'inicio' | 'comanejo' | 'biodiversidad' | 'conservacion' | 'investigacion' | 'visitanos' | 'contacto';

export interface PageInfo {
  id: PageId;
  label: string;          // texto del menú
  path: string;           // relativo a la raíz del sitio ('' = inicio)
  title: string;          // <title> de la página
  description: string;
  ready: boolean;
  contact?: boolean;      // se dibuja como botón en el menú
}

export const PAGES = pages as PageInfo[];
export const NAV = PAGES;   // el menú empieza por Inicio
export const page = (id: PageId) => PAGES.find((p) => p.id === id)!;

/** URL de una página respetando la base de despliegue de Vite (funciona también en una subcarpeta). */
export const url = (id: PageId, hash = '') => `${import.meta.env.BASE_URL}${page(id).path}${hash}`;
