import { Eyebrow } from '../components/Eyebrow';
import { Reveal } from '../components/Reveal';
import { RiseLines } from '../components/RiseLines';
import { delay, grid, label } from '../components/ui';
import { CONTACTO } from '../content/contacto';

/*
 * Contacto: el titular y una entradilla breve; debajo, los sitios oficiales de las cinco instituciones del
 * comanejo como un índice a todo el ancho. Cada fila es un único enlace (logotipo, sigla, nombre completo y
 * dirección); al pasar por encima, la sigla pasa a verde musgo y la flecha se rellena y apunta a la salida.
 */
export function ContactoPage() {
  const C = CONTACTO;
  return (
    <>
      <Reveal threshold={0.05} className={`${grid} items-end gap-y-8`}>
        <div className="col-span-7 max-md:col-span-1">
          <div style={delay(0)} className="reveal-fade"><Eyebrow>{C.eyebrow}</Eyebrow></div>
          <RiseLines lines={C.title} className="text-[length:clamp(52px,7.2vw,132px)] font-medium leading-[0.98] tracking-[-0.04em] max-md:text-[length:clamp(44px,12.4vw,64px)]" />
        </div>
        <p style={delay(0.4)} className="reveal-fade col-span-4 col-start-9 m-0 pb-[0.6em] text-[length:clamp(18px,1.4vw,21px)] leading-[1.55] text-ink max-nav:col-span-5 max-nav:col-start-8 max-md:col-span-1 max-md:col-start-auto max-md:pb-0">
          {C.lead}
        </p>
      </Reveal>

      <Reveal as="section" aria-labelledby="sitios-title" className="mt-[clamp(72px,12vh,136px)]">
        <div className="flex items-baseline justify-between gap-6">
          <h2 id="sitios-title" style={delay(0.1)} className={`${label} reveal-fade m-0 text-ink-dim`}>{C.orgsTitle}</h2>
          <p aria-hidden="true" style={delay(0.1)} className={`${label} reveal-fade m-0 text-ink-dim tabular-nums`}>{String(C.orgs.length).padStart(2, '0')}</p>
        </div>
        <ul className="m-0 mt-5 list-none p-0">
          {C.orgs.map((o, i) => (
            <li key={o.id} style={delay(0.18 + i * 0.07)} className="reveal-fade border-t border-rule last:border-b">
              <a
                href={o.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group focus-ring grid grid-cols-[clamp(96px,11vw,168px)_minmax(0,1fr)_auto] items-center gap-x-[clamp(24px,3.4vw,56px)] py-[clamp(22px,3.6vh,36px)] no-underline max-md:grid-cols-1 max-md:gap-y-4"
              >
                {/* logotipo en una caja fija: las siglas empiezan a la misma altura en todas las filas (en móvil, encima) */}
                <span className="flex h-[clamp(52px,5vw,76px)] items-center max-md:h-[48px]">
                  {o.mark && (
                    <img
                      src={o.mark.src}
                      width={o.mark.width}
                      height={o.mark.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="block h-auto max-h-full w-auto max-w-full"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[length:clamp(24px,2.4vw,40px)] font-medium leading-[1.1] tracking-[-0.025em] text-forest transition-colors duration-300 group-hover:text-moss">{o.acronym}</span>
                  <span className="mt-1.5 block max-w-[60ch] text-[15px] leading-[1.5] text-ink-dim">{o.name}</span>
                </span>
                <span className="inline-flex items-center gap-4 justify-self-end text-[16px] text-forest max-md:justify-self-start max-md:text-[15px]">
                  <span className="border-b border-forest/30 pb-0.5 transition-colors duration-300 group-hover:border-forest">{o.label}</span>
                  <span aria-hidden="true" className="inline-flex size-11 items-center justify-center rounded-full border border-forest/25 transition-[background-color,color,border-color] duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-hero-cream max-md:size-9">
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">↗</span>
                  </span>
                </span>
                <span className="sr-only">(sitio oficial, se abre en una pestaña nueva)</span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}
