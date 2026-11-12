import { ArrowDownIcon } from '@phosphor-icons/react';
import { scrollToSection } from '../lib/scrollToSection';

/** "Descubrir el Parque": flecha fina (Phosphor, trazo «thin») y, a su derecha, el texto alineado con la punta; recorre la transición hasta 01. */
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
      {/* la punta queda a la altura de la última línea del texto */}
      <ArrowDownIcon
        aria-hidden="true"
        weight="thin"
        className="-mb-[6px] size-[52px] shrink-0 transition-transform duration-[400ms] ease-[ease] group-hover:translate-y-[3px] group-focus-visible:translate-y-[3px] max-md:size-[44px]"
      />
      <span className="-mb-[3px]">Descubrir <br />el Parque</span>
    </a>
  );
}
