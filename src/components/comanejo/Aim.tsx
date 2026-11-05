import { COMANEJO } from '../../content/comanejo';
import { Reveal } from '../Reveal';
import { delay, grid, label, section } from '../ui';

/**
 * El objetivo de manejo, tal como lo cita el convenio, en una banda verde bosque a todo el ancho: la
 * identificación y la fuente a la izquierda, la cita en grande a la derecha. El fragmento de los recursos
 * (bosque, agua, suelo y fauna) se destaca con color; el texto no cambia.
 */
export function Aim() {
  const A = COMANEJO.aim;
  const [before, after] = A.text.split(A.emphasis);
  return (
    <Reveal as="section" aria-labelledby="objetivo-title" threshold={0.25} className={`${section} -mx-gutter bg-forest px-gutter py-[clamp(88px,15vh,168px)]`}>
      <figure className={`${grid} m-0 gap-y-10`}>
        <figcaption className="col-span-3 row-start-1 max-md:col-span-1 max-md:row-start-auto">
          <h2 id="objetivo-title" style={delay(0)} className={`${label} reveal-fade m-0 text-gold`}>{A.label}</h2>
          <p style={delay(0.35)} className="reveal-fade mt-5 mb-0 max-w-[28ch] border-t border-hero-cream/20 pt-5 text-[15px] leading-[1.6] text-hero-cream/80">
            {A.attribution}.
          </p>
          <p style={delay(0.45)} className={`${label} reveal-fade mt-4 mb-0 text-hero-cream/60`}>{A.source}</p>
        </figcaption>
        <blockquote style={delay(0.15)} className="reveal-fade relative col-span-9 col-start-4 row-start-1 m-0 max-md:col-span-1 max-md:col-start-auto max-md:row-start-auto">
          <span aria-hidden="true" className="absolute top-[0.04em] -left-[0.6em] font-display text-[length:clamp(30px,3.3vw,56px)] leading-none font-extrabold text-gold max-md:static max-md:mb-3 max-md:block">“</span>
          <p className="m-0 max-w-[30ch] text-[length:clamp(28px,3.3vw,56px)] font-medium leading-[1.16] tracking-[-0.022em] text-hero-cream max-md:text-[length:clamp(25px,6.8vw,32px)]">
            {before}
            <span className="text-gold">{A.emphasis}</span>
            {after}
            <span aria-hidden="true">”</span>
          </p>
        </blockquote>
      </figure>
    </Reveal>
  );
}
