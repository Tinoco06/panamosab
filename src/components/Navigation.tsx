import { useEffect, useRef, useState } from 'react';
import { NAV, url, type PageId } from '../lib/routes';

// en pantallas táctiles cada enlace ocupa al menos 44 px de alto (el texto no cambia de tamaño)
const item =
  'relative inline-block whitespace-nowrap text-[12px] font-medium uppercase leading-none tracking-[0.08em] text-hero-deep no-underline ' +
  'pointer-coarse:py-4 max-nav:py-[14px] max-nav:text-[15px] max-nav:tracking-[0.2em]';
// subrayado fino al pasar o enfocar; fijo en la página actual
const underline =
  "after:absolute after:left-0 after:right-[0.16em] after:-bottom-[6px] pointer-coarse:after:bottom-[10px] max-nav:after:bottom-[8px] after:h-px after:origin-left after:scale-x-0 after:bg-current after:content-[''] " +
  'after:transition-transform after:duration-[400ms] after:ease-[ease] hover:after:scale-x-100 focus-visible:after:scale-x-100 aria-[current=page]:after:scale-x-100';
const pill =
  'rounded-full border border-hero-deep/50 px-[18px] py-[10px] transition-colors duration-300 hover:bg-hero-deep hover:text-hero-cream ' +
  'aria-[current=page]:bg-hero-deep aria-[current=page]:text-hero-cream';

/**
 * Menú principal: una página por sección. En ≤ 1100 px, botón Menú/Cerrar que abre la lista a pantalla
 * completa (Esc cierra y devuelve el foco al botón). `intro` (solo portada): entra con la animación del hero.
 */
export function Navigation({ current, intro = false }: { current?: PageId; intro?: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // abierto: la página no se desplaza y el encabezado pasa por delante del contenido (ver .nav-open)
    document.documentElement.classList.toggle('nav-open', open);
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('nav-open');
    };
  }, [open]);

  return (
    <nav aria-label="Principal" data-intro={intro ? 'nav' : undefined}>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="site-nav-list"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring hidden min-h-11 cursor-pointer items-center rounded-full border border-hero-deep/50 bg-transparent px-[18px] text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-hero-deep max-nav:relative max-nav:z-21 max-nav:inline-flex"
      >
        {open ? 'Cerrar' : 'Menú'}
      </button>
      <ul
        id="site-nav-list"
        className={
          'm-0 flex list-none items-center gap-[clamp(16px,1.9vw,32px)] p-0 ' +
          // menú compacto: a pantalla completa; centrado con márgenes automáticos (si no cabe, como en un móvil en
          // horizontal, se desplaza dentro de sí mismo sin cortar el primer enlace ni arrastrar la página de fondo)
          'max-nav:fixed max-nav:inset-0 max-nav:z-20 max-nav:flex-col max-nav:items-start max-nav:gap-1.5 max-nav:overflow-y-auto max-nav:overscroll-contain max-nav:bg-hero-cream max-nav:px-gutter ' +
          'max-nav:pt-[calc(96px+var(--spacing-safe-t))] max-nav:pb-[calc(32px+var(--spacing-safe-b))] max-nav:*:first:mt-auto max-nav:*:last:mb-auto ' +
          // móvil en horizontal (pantallas muy bajas): márgenes justos para que los cinco enlaces quepan sin desplazar
          'max-nav:[@media(max-height:500px)]:pt-[calc(70px+var(--spacing-safe-t))] max-nav:[@media(max-height:500px)]:pb-[calc(10px+var(--spacing-safe-b))] ' +
          (open
            ? 'max-nav:visible max-nav:opacity-100 max-nav:[transition:opacity_0.35s_ease]'
            : 'max-nav:invisible max-nav:opacity-0 max-nav:[transition:opacity_0.35s_ease,visibility_0s_linear_0.35s]')
        }
      >
        {NAV.map((p, i) => (
          // separador fino antes de Contacto (solo en la barra horizontal)
          <li key={p.id} className={p.contact ? 'nav:border-l nav:border-hero-deep/22 nav:pl-[clamp(16px,1.9vw,32px)]' : undefined}>
            <a
              ref={i === 0 ? firstLink : undefined}
              href={url(p.id)}
              aria-current={p.id === current ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={`focus-ring ${item} ${p.contact ? `${pill} max-nav:mt-2` : underline}`}
            >
              {p.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
