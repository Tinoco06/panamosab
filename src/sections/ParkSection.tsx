import type { PageRefs } from '../app/pageRefs';
import { Eyebrow } from '../components/Eyebrow';
import { PARQUE } from '../content/parque';

/**
 * 01 El Parque. Texto a la izquierda; el fragmento de montaña flota a la derecha, sobre el mismo papel
 * (lo dibuja el motor 3D centrado en el hueco de la figura). Sobre el fragmento, la altitud de la cumbre:
 * el motor coloca la marca en la proyección real del punto más alto. En móvil el fragmento se intercala
 * entre el título y el texto.
 */
export function ParkSection({ refs }: { refs: PageRefs }) {
  return (
    <section
      ref={refs.park}
      id="parque"
      aria-labelledby="parque-title"
      className="relative z-3 min-h-screen pt-[12vh] pr-0 pb-[16vh] pl-gutter max-md:px-gutter max-md:pt-[10vh] max-md:pb-[14vh]"
    >
      <div className="grid grid-cols-[minmax(300px,0.72fr)_minmax(0,1fr)] items-start gap-x-[clamp(40px,5vw,96px)] max-md:flex max-md:flex-col max-md:items-stretch">
        <div ref={refs.parkText} className="max-w-[540px] pt-[2vh] max-md:contents">
          <Eyebrow num="01" data-reveal className="max-md:order-1">{PARQUE.eyebrow}</Eyebrow>
          <h2
            id="parque-title"
            data-reveal
            className="mb-7 max-w-[12ch] text-[length:clamp(36px,3.9vw,64px)] font-medium leading-[1.02] tracking-[-0.03em] text-forest max-md:order-2 max-md:mb-6"
          >
            {PARQUE.title}
          </h2>
          <p data-reveal className="mb-[18px] text-[18px] leading-[1.6] text-ink max-md:order-4 max-md:text-[17px]">{PARQUE.lead}</p>

          {/* Datos: tipografía grande sobre líneas finas, sin tarjetas */}
          <dl data-reveal className="mt-[48px] mb-0 grid gap-0 max-md:order-6 max-md:mt-9">
            {PARQUE.facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-6 border-t border-rule py-[18px] last:border-b max-md:grid-cols-1 max-md:gap-1.5">
                <dt className="text-right text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.18em] text-ink-dim max-md:text-left">{f.label}</dt>
                <dd className="m-0 order-first whitespace-nowrap text-[length:clamp(32px,2.9vw,46px)] font-normal leading-none tracking-[-0.035em] tabular-nums text-forest max-md:order-none">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="m-0 max-md:order-3 max-md:mb-8 max-md:ml-[8%] max-md:-mr-gutter">
          {/* Hueco invisible: el fragmento de montaña del canvas fijo flota centrado aquí, sin marco */}
          <div ref={refs.parkFrame} className="relative h-[clamp(500px,80vh,920px)] w-full max-md:aspect-[4/5] max-md:h-auto">
            {/* Altitud sobre la cumbre. El motor la mueve (transform) y la muestra (opacity) cuando el fragmento
                está formado; sin WebGL queda fija y visible. */}
            <div
              ref={refs.parkPeak}
              className={
                'pointer-events-none invisible absolute top-0 left-0 opacity-0 [--lh:clamp(84px,15vh,170px)] max-md:[--lh:44px] ' +
                'in-[[data-status=error]]:visible in-[[data-status=error]]:top-[62%] in-[[data-status=error]]:left-[34%] in-[[data-status=error]]:opacity-100'
              }
            >
              {/* punto en la cumbre, con un halo que respira despacio (solo mientras la marca se ve: data-shown) */}
              <span aria-hidden="true" className="peak-halo absolute -top-[22px] -left-[22px] size-[44px] rounded-full border border-moss/60" />
              <span aria-hidden="true" className="absolute -top-[6px] -left-[6px] size-[12px] rounded-full border-2 border-forest bg-ivory" />
              <span aria-hidden="true" className="absolute bottom-[6px] left-0 h-[var(--lh)] w-px bg-gradient-to-t from-forest/30 to-forest" />
              <div className="absolute bottom-[calc(var(--lh)+6px)] left-0 whitespace-nowrap pb-3 max-md:right-0 max-md:left-auto max-md:text-right">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.26em] text-moss">{PARQUE.summit.label}</p>
                <p className="m-0 mt-1 font-display text-[length:clamp(60px,6.8vw,124px)] font-extrabold leading-[0.86] tracking-[-0.03em] text-forest [text-shadow:0_0_28px_rgb(241_240_232/0.95)] max-md:text-[length:clamp(40px,12vw,52px)]">
                  {PARQUE.summit.value}<span className="ml-2 align-top font-sans text-[0.2em] font-semibold uppercase tracking-[0.18em] text-moss">{PARQUE.summit.unit}</span>
                </p>
                <p className="m-0 mt-2 text-[13px] text-ink-dim [text-shadow:0_0_14px_rgb(241_240_232)]">{PARQUE.summit.note}</p>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
