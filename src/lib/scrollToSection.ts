import type { MouseEvent } from 'react';

// Los enlaces internos recorren la transición (scroll nativo suave) en lugar de saltar a la sección.
export function scrollToSection(e: MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.getAttribute('href');
  const target = id?.startsWith('#') ? document.querySelector<HTMLElement>(id) : null;
  if (!target) return;
  e.preventDefault();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: target.offsetTop, behavior: reduce ? 'auto' : 'smooth' });
}
