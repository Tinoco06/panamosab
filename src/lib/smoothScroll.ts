import type { MouseEvent } from 'react';

// aceleración y frenado suaves (easeInOutCubic): arranca despacio, recorre y se posa sin golpe
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let cancel: (() => void) | null = null;

/**
 * Desplaza la página hasta `target` con una animación propia (el scroll nativo `smooth` es demasiado brusco en
 * trayectos largos y su duración no se controla). La duración crece con la distancia, entre 0.7 y 1.6 s. Respeta
 * el `scroll-margin-top` del destino. La rueda, un toque o una tecla del usuario detienen la animación. Con
 * movimiento reducido, salta directamente.
 */
export function smoothScrollTo(target: HTMLElement) {
  cancel?.();
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const start = window.scrollY;
  const end = Math.min(
    target.getBoundingClientRect().top + start - margin,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const distance = end - start;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(distance) < 2) {
    window.scrollTo(0, end);
    return;
  }

  const duration = Math.min(1600, Math.max(700, Math.abs(distance) * 0.28));
  const t0 = performance.now();
  let raf = 0;
  const stop = () => {
    cancelAnimationFrame(raf);
    for (const ev of ['wheel', 'touchstart', 'keydown'] as const) window.removeEventListener(ev, stop);
    cancel = null;
  };
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, start + distance * ease(t));
    if (t < 1) raf = requestAnimationFrame(tick);
    else stop();
  };
  for (const ev of ['wheel', 'touchstart', 'keydown'] as const) window.addEventListener(ev, stop, { passive: true });
  cancel = stop;
  raf = requestAnimationFrame(tick);
}

/** Manejador para enlaces con ancla en la misma página: anima el recorrido, actualiza la URL y mueve el foco. */
export function onAnchorClick(e: MouseEvent<HTMLAnchorElement>) {
  const hash = e.currentTarget.getAttribute('href');
  const target = hash?.startsWith('#') ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (!target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  history.pushState(null, '', hash);
  smoothScrollTo(target);
  // el foco va al perfil (lectores de pantalla y teclado) sin provocar otro salto
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}
