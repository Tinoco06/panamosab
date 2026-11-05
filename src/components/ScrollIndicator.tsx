import { scrollToSection } from '../lib/scrollToSection';

/** "Descubrir el Parque": flecha larga y fina y, a su derecha, el texto alineado con la punta; recorre la transición hasta 01. */
export function ScrollIndicator() {
  return (
    <a
      href="#parque"
      data-intro="cue"
      onClick={scrollToSection}
      className={
        'focus-ring group absolute bottom-[clamp(24px,5vh,48px)] left-gutter flex items-end gap-[16px] ' +
        'text-[11px] font-semibold uppercase leading-[1.7] tracking-[0.24em] text-hero-cream no-underline ' +
        'max-md:bottom-[calc(44px+var(--spacing-safe-b))] max-md:text-[10px] in-[[data-status=error]]:text-hero-deep'
      }
    >
      {/* el tallo, más tenue, ocupa el lugar de la antigua línea; la punta queda a la altura de la última línea */}
      <svg
        viewBox="0 0 12 64"
        aria-hidden="true"
        className="h-[60px] w-3 shrink-0 fill-none stroke-current stroke-[1.2] transition-transform duration-[400ms] ease-[ease] group-hover:translate-y-[3px] group-focus-visible:translate-y-[3px] max-md:h-[52px]"
      >
        <path d="M6 0v62" strokeOpacity="0.7" />
        <path d="M1 57l5 5 5-5" />
      </svg>
      <span className="-mb-[3px]">Descubrir <br />el Parque</span>
    </a>
  );
}
