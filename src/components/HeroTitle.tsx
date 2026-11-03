import { useEffect, type RefObject } from 'react';
import { applyTitleFog } from '../lib/titleFog';

// Máscara vertical de cada línea: recorta abajo (por ahí entra el texto en la intro) y deja aire arriba
// para tildes. La caja interior crece hacia arriba (sin mover el texto) para que la máscara de niebla
// incluya la virgulilla de la Ñ y la tilde de la Á.
const line = 'block [clip-path:inset(-0.35em_-0.2em_0_-0.2em)]';
const lineInner = 'block -mt-[0.3em] pt-[0.3em] [mask-repeat:no-repeat] [mask-size:100%_100%]';

/**
 * "Parque Nacional" (etiqueta) · "Montaña" (dominante) · "de Santa Bárbara" (secundaria).
 * Queda en el cielo, sobre la cresta: el motor 3D calcula la cresta bajo el título (--ridge, px desde
 * arriba) y el pie del título se apoya un poco por encima (--clearance). Nunca lo corta la montaña.
 *
 * Niebla en la base de las letras (la máscara se genera con estos valores; ver lib/titleFog.ts):
 *   --fog-depth: fracción inferior de cada línea que atraviesa la niebla
 *   --fog-min:   opacidad mínima de las letras dentro de la niebla (nunca ilegible)
 */
export function HeroTitle({ titleRef }: { titleRef: RefObject<HTMLHeadingElement | null> }) {
  useEffect(() => {
    if (titleRef.current) applyTitleFog(titleRef.current);
  }, [titleRef]);

  return (
    <h1
      ref={titleRef}
      className={
        'absolute z-3 m-0 font-display font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-hero-deep ' +
        '[--clearance:0.1em] [--fog-depth:0.34] [--fog-min:0.76] ' +
        'bottom-[calc(100%_-_var(--ridge,56vh)_+_var(--clearance))] left-[calc(var(--spacing-gutter)_+_3.6vw)] ' +
        // en pantallas bajas manda la altura
        'text-[length:clamp(56px,min(9.7vw,17.5vh),188px)] ' +
        'max-md:left-gutter max-md:text-[length:clamp(40px,16vw,84px)]'
      }
    >
      <span
        data-intro="eyebrow"
        className="mb-[0.85em] ml-[0.04em] block font-sans text-[length:clamp(11px,0.105em,19px)] font-medium leading-none tracking-[0.38em] text-hero-forest max-md:text-[10px] max-md:tracking-[0.28em]"
      >
        Parque Nacional
      </span>
      <span data-title-line="main" className={line}>
        <span data-intro="main" className={lineInner}>Montaña</span>
      </span>
      {/* menor que "Montaña" pero con el mismo peso y casi el mismo ancho */}
      <span data-title-line="sub" className={`${line} mt-[0.02em] text-[length:0.505em] leading-none tracking-[-0.012em]`}>
        <span data-intro="sub" className={lineInner}>de Santa Bárbara</span>
      </span>
    </h1>
  );
}
