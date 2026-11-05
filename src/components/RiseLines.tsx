import type { CSSProperties, ElementType } from 'react';

/**
 * Titular por líneas: cada línea sube desde su propia máscara al entrar en pantalla (dentro de un <Reveal>), una
 * tras otra. La segunda línea y siguientes llevan `accent` (por defecto, verde musgo). Con movimiento reducido,
 * el titular aparece directamente.
 */
export function RiseLines({ lines, as: Tag = 'h1', id, className = '', tone = 'text-forest', accent = 'text-moss', start = 0.1 }: {
  lines: string[]; as?: ElementType; id?: string; className?: string; tone?: string; accent?: string; start?: number;
}) {
  return (
    <Tag id={id} className={`m-0 ${className}`}>
      {lines.map((line, i) => (
        // la máscara deja pasar los trazos descendentes (pb) sin mover la línea siguiente (-mb)
        <span key={line} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
          <span
            style={{ '--delay': `${start + i * 0.14}s` } as CSSProperties}
            className={
              'block translate-y-[106%] transition-transform delay-(--delay) duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] in-[[data-inview]]:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none ' +
              (i ? accent : tone)
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
