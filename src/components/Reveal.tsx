import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Bloque que marca `data-inview` la primera vez que entra en pantalla; sus hijos con las clases reveal-*
 * (index.css) o con variantes `in-[[data-inview]]:` aparecen entonces. Con movimiento reducido, o sin
 * IntersectionObserver, el bloque se muestra desde el principio.
 */
export function Reveal({ as: Tag = 'div', threshold = 0.18, className = '', children, ...rest }: {
  as?: ElementType; threshold?: number; className?: string; children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} data-inview={inView ? '' : undefined} className={className} {...rest}>
      {children}
    </Tag>
  );
}
