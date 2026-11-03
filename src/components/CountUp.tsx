import { useEffect, useRef, useState } from 'react';

const format = (n: number, decimals: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Cifra que se cuenta hasta su valor la primera vez que entra en pantalla (1.8 s, desaceleración suave).
 * Con movimiento reducido aparece directamente. Los lectores de pantalla leen siempre el valor final.
 */
export function CountUp({ value, decimals = 0, className = '' }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), duration = 1800;
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        setShown(value * (1 - Math.pow(1 - t, 4)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);

  const final = format(value, decimals);
  return (
    // el valor final, invisible, reserva el ancho: la cifra no empuja nada mientras cuenta
    <span ref={ref} className={`relative inline-block ${className}`}>
      <span aria-hidden="true" className="invisible tabular-nums">{final}</span>
      <span aria-hidden="true" className="absolute top-0 left-0 tabular-nums">{format(shown, decimals)}</span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
