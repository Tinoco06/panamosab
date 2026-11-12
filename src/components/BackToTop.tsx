import { ArrowUpIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { smoothScrollTo } from '../lib/smoothScroll';

/**
 * Volver arriba: botón circular fijo abajo a la derecha. Aparece (fundido y un leve ascenso) después de recorrer
 * algo más de una pantalla y se retira cerca del principio; mientras está oculto queda fuera del orden del teclado
 * (`inert`). Usa el mismo desplazamiento animado del sitio, que con movimiento reducido salta directamente, y
 * devuelve el foco al principio de la página. Sobre el pie (verde bosque) invierte sus colores para no perderse.
 * Queda por debajo del menú a pantalla completa.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);
  const [onFooter, setOnFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const update = () => {
      setShown(window.scrollY > window.innerHeight * 1.2);
      // el botón ocupa los últimos ~90 px de la ventana: cuando el pie llega ahí, el botón está sobre él
      setOnFooter(!!footer && footer.getBoundingClientRect().top < window.innerHeight - 64);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const toTop = () => {
    smoothScrollTo(document.body);
    document.querySelector<HTMLElement>('header a')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      inert={!shown}
      aria-label="Volver arriba"
      className={
        'group focus-ring fixed right-gutter bottom-[calc(clamp(20px,3.2vh,36px)+var(--spacing-safe-b))] z-15 inline-flex size-12 cursor-pointer items-center justify-center rounded-full border shadow-[0_10px_30px_rgb(12_30_27/0.18)] backdrop-blur-sm ' +
        'transition-[opacity,translate,background-color,color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ' +
        (onFooter ? 'border-hero-deep/10 bg-hero-cream text-hero-deep hover:bg-ivory ' : 'border-hero-cream/20 bg-forest/90 text-hero-cream hover:bg-forest ') +
        (shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0')
      }
    >
      <ArrowUpIcon aria-hidden="true" size={20} weight="light" className="transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
    </button>
  );
}
