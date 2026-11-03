/** Etiqueta de sección: número dorado, filete y nombre ("01 | El Parque"); sin número en páginas interiores. */
export function Eyebrow({ num, children, className = '', ...rest }: { num?: string; children: string; className?: string } & Record<`data-${string}`, boolean | string>) {
  return (
    <p className={`mb-[26px] flex items-center gap-[14px] text-[12px] font-semibold uppercase tracking-[0.26em] text-forest ${className}`} {...rest}>
      {num && <span className="border-r border-rule pr-[14px] font-semibold tracking-[0.08em] text-gold">{num}</span>}
      {children}
    </p>
  );
}
