import { scrollToSection } from '../lib/scrollToSection';

/** "Descubrir el Parque": línea fina a la izquierda y flecha debajo; recorre la transición hasta 01. */
export function ScrollIndicator() {
  return (
    <a
      href="#parque"
      data-intro="cue"
      onClick={scrollToSection}
      className={
        'focus-ring group absolute bottom-[clamp(24px,5vh,48px)] left-gutter grid justify-items-start gap-y-[22px] ' +
        'text-[11px] font-semibold uppercase leading-[1.7] tracking-[0.24em] text-hero-cream no-underline ' +
        'max-md:bottom-[44px] max-md:text-[10px] in-[[data-status=error]]:text-hero-deep'
      }
    >
      <span className="border-l border-current/70 pl-[18px]">Descubrir <br />el Parque</span>
      {/* el eje de la flecha cae bajo la línea */}
      <svg
        viewBox="0 0 12 20"
        aria-hidden="true"
        className="-ml-[5px] h-[18px] w-3 fill-none stroke-current stroke-[1.2] transition-transform duration-[400ms] ease-[ease] group-hover:translate-y-[3px] group-focus-visible:translate-y-[3px]"
      >
        <path d="M6 1v17M1 13l5 5 5-5" />
      </svg>
    </a>
  );
}
