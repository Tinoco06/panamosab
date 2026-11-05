import { COMANEJO } from '../../content/comanejo';
import { Eyebrow } from '../Eyebrow';
import { Reveal } from '../Reveal';
import { delay, grid, label } from '../ui';

/**
 * Apertura de la página: el título a todo el ancho (cada frase sube desde su línea), el texto institucional
 * a media página y los datos del convenio como indicadores grandes sobre un filete.
 */
export function Intro() {
  const C = COMANEJO;
  return (
    <Reveal threshold={0.05}>
      <Eyebrow>{C.eyebrow}</Eyebrow>
      <h1 className="m-0 text-[length:clamp(46px,6.3vw,118px)] font-medium leading-[0.98] tracking-[-0.04em] max-md:text-[length:clamp(40px,11.2vw,58px)] max-md:leading-[1.02]">
        {C.title.map((line, i) => (
          // la máscara deja pasar los trazos descendentes (pb) sin mover la línea siguiente (-mb)
          <span key={line} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
            <span
              style={delay(0.1 + i * 0.14)}
              className={
                'block translate-y-[106%] transition-transform delay-(--delay) duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] in-[[data-inview]]:translate-y-0 motion-reduce:translate-y-0 motion-reduce:transition-none ' +
                (i ? 'text-moss' : 'text-forest')
              }
            >
              {line}
            </span>
          </span>
        ))}
      </h1>

      <div className={`${grid} mt-[clamp(44px,7vh,80px)] gap-y-6`}>
        <p style={delay(0.45)} className="reveal-fade col-span-6 m-0 text-[length:clamp(19px,1.45vw,22px)] leading-[1.55] text-ink max-nav:col-span-7 max-md:col-span-1">
          {C.lead}
        </p>
      </div>

      {/* datos del convenio */}
      <dl className="mt-[clamp(56px,9vh,104px)] mb-0 grid grid-cols-3 border-t border-forest/20 max-md:grid-cols-1">
        {C.facts.map((f, i) => (
          <div
            key={f.label}
            style={delay(0.65 + i * 0.1)}
            className="reveal-fade flex flex-col gap-4 pt-7 pr-6 [&+&]:border-l [&+&]:border-rule [&+&]:pl-[clamp(20px,2.6vw,44px)] max-md:gap-2 max-md:border-b max-md:border-rule max-md:py-5 max-md:pr-0 max-md:[&+&]:border-l-0 max-md:[&+&]:pl-0"
          >
            <dt className={`${label} text-ink-dim`}>{f.label}</dt>
            <dd className="order-first m-0 flex flex-wrap items-baseline gap-x-3 text-forest">
              <span className="font-display text-[length:clamp(64px,7.2vw,128px)] font-extrabold leading-[0.84] tracking-[-0.045em] tabular-nums max-md:text-[64px]">
                {f.value}
              </span>
              <span className="text-[length:clamp(17px,1.4vw,22px)] font-medium leading-tight tracking-[-0.01em]">{f.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
