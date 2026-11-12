/* Piezas editoriales compartidas por la portada y las páginas interiores. */
import { ArrowRightIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';

export const grid12 = 'grid grid-cols-12 gap-x-[clamp(24px,3.4vw,56px)] max-md:grid-cols-1';
const titleCls = 'm-0 max-w-[12ch] font-medium leading-[1.02] tracking-[-0.03em] text-forest';

/** Encabezado editorial: etiqueta y título a la izquierda, entradilla a la derecha. */
export function EditorialHeader({ eyebrow, num, title, titleId, as: H = 'h2', large = false, children }: {
  eyebrow: string; num?: string; title: string; titleId?: string; as?: 'h1' | 'h2'; large?: boolean; children?: ReactNode;
}) {
  return (
    <div className={`${grid12} gap-y-10`}>
      <div className="col-span-5 max-md:col-span-1">
        <Eyebrow num={num}>{eyebrow}</Eyebrow>
        <H
          id={titleId}
          className={`${titleCls} ${large ? 'text-[length:clamp(44px,5.4vw,88px)] max-md:text-[length:clamp(38px,10vw,52px)]' : 'text-[length:clamp(36px,3.9vw,64px)] max-md:text-[length:clamp(32px,8.4vw,44px)]'}`}
        >
          {title}
        </H>
      </div>
      {children && <div className="col-span-6 col-start-7 pt-[clamp(0px,4.6vh,52px)] max-md:col-span-1 max-md:pt-0">{children}</div>}
    </div>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-0 mb-5 text-[19px] leading-[1.55] text-ink max-md:text-[17px]">{children}</p>;
}

export function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`m-0 text-[16px] leading-[1.65] text-ink-dim ${className}`}>{children}</p>;
}

/** Cifras sobre un filete: la cifra arriba y la etiqueta debajo, alineadas por arriba. */
export function Facts({ items, cols = 3 }: { items: { value: string; unit?: string; label: string }[]; cols?: 3 | 4 }) {
  return (
    <dl className={`mt-10 mb-0 grid ${cols === 4 ? 'grid-cols-4 max-nav:grid-cols-2' : 'grid-cols-3'} border-t border-rule max-md:grid-cols-1`}>
      {items.map((f) => (
        <div key={f.label} className="flex flex-col gap-2 pt-5 pr-4 max-nav:pb-5 max-md:flex-row max-md:items-baseline max-md:gap-4 max-md:border-b max-md:border-rule max-md:py-3">
          <dt className="text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.16em] text-ink-dim">{f.label}</dt>
          <dd className="order-first m-0 shrink-0 text-[length:clamp(26px,2.3vw,36px)] leading-none tracking-[-0.03em] tabular-nums text-forest">
            {f.value}
            {f.unit && <span className="ml-1.5 text-[0.45em] font-semibold uppercase tracking-[0.12em] text-ink-dim">{f.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Enlace de llamada a la acción hacia otra página. */
export function CtaLink({ href, children, onDark = false }: { href: string; children: ReactNode; onDark?: boolean }) {
  return (
    <a
      href={href}
      className={
        'group focus-ring inline-flex min-h-12 items-center gap-3 rounded-full border px-6 py-[14px] text-[12px] font-semibold uppercase tracking-[0.18em] no-underline transition-colors duration-300 ' +
        (onDark
          ? 'border-hero-cream/50 text-hero-cream hover:bg-hero-cream hover:text-hero-deep'
          : 'border-forest/50 text-forest hover:bg-forest hover:text-ivory')
      }
    >
      {children}
      <ArrowRightIcon aria-hidden="true" size={16} weight="regular" className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}
