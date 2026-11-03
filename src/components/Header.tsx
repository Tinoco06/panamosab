import { scrollToSection } from '../lib/scrollToSection';
import { url, type PageId } from '../lib/routes';
import { Navigation } from './Navigation';

const brand = 'focus-ring text-[13px] font-semibold leading-none tracking-[0.32em] text-hero-deep no-underline max-nav:in-[.nav-open]:relative max-nav:in-[.nav-open]:z-21';

/**
 * Marca a la izquierda, menú a la derecha; sin barra ni fondo.
 * - portada (`home`): flota sobre el paisaje y entra con la intro; la marca vuelve al principio del hero.
 * - páginas interiores: en el flujo de la página, sobre el papel; la marca lleva a la portada.
 */
export function Header({ home = false, current }: { home?: boolean; current?: PageId }) {
  return (
    <header
      className={
        'flex items-center justify-between gap-8 px-gutter pt-[clamp(20px,4vh,40px)] ' +
        (home ? 'absolute inset-x-0 top-0' : 'relative z-20 pb-4')
      }
    >
      {/* Pendiente: sustituir por el logotipo oficial de PANAMOSAB cuando esté en el proyecto */}
      {home ? (
        <a href="#hero" data-intro="nav" onClick={scrollToSection} className={brand}>PANAMOSAB</a>
      ) : (
        <a href={url('inicio')} className={brand}>PANAMOSAB<span className="sr-only"> — Inicio</span></a>
      )}
      <Navigation current={current} intro={home} />
    </header>
  );
}
