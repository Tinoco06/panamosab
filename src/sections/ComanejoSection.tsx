import type { CSSProperties } from 'react';
import { CtaLink, grid12 } from '../components/editorial';
import { Eyebrow } from '../components/Eyebrow';
import { Reveal } from '../components/Reveal';
import { COMANEJO, SIGNATORIES } from '../content/comanejo';
import { url } from '../lib/routes';

const delay = (s: number) => ({ '--delay': `${s}s` }) as CSSProperties;

/*
 * Tamaño óptico de los logotipos: todos ocupan la misma superficie aproximada, no el mismo alto ni el mismo
 * ancho. Con `--logo` como lado de referencia, un logotipo de proporción a (ancho / alto) mide
 * --logo / √a de alto (y --logo · √a de ancho): el CASM, más alto que ancho, no domina por su altura, ni el
 * CODEMUSSBA, muy apaisado, por su anchura. Los logotipos no se recortan ni se deforman (object-contain).
 */
const logoHeight = (w: number, h: number) => `calc(var(--logo) * ${(1 / Math.sqrt(w / h)).toFixed(3)})`;

/**
 * 05 Comanejo en la portada: el titular, con «una misma montaña» destacada, junto a la entradilla y la llamada
 * a la página de comanejo; debajo, las cinco instituciones firmantes en una sola franja, separadas por filetes,
 * como las firmas de un convenio. Todo aparece en orden al entrar en pantalla. Fondo marfil opaco: cubre las
 * capas WebGL.
 */
export function ComanejoSection() {
  return (
    <section id="comanejo" aria-labelledby="comanejo-title" className="relative z-3 bg-ivory px-gutter pt-[clamp(96px,16vh,180px)] pb-[clamp(88px,14vh,160px)]">
      <Reveal threshold={0.2} className={`${grid12} items-end gap-y-10`}>
        <div className="col-span-7 max-md:col-span-1">
          <div style={delay(0)} className="reveal-fade">
            <Eyebrow num="05">{COMANEJO.eyebrow}</Eyebrow>
          </div>
          <h2 id="comanejo-title" className="m-0 text-[length:clamp(42px,5vw,88px)] font-medium leading-[1.02] tracking-[-0.035em] max-md:text-[length:clamp(36px,10vw,50px)]">
            {COMANEJO.homeTitle.map((line, i) => (
              // cada frase sube desde su línea; la máscara deja pasar los trazos descendentes
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
          </h2>
        </div>

        {/* la entradilla cierra a la altura del titular: los dos bloques se leen como una sola apertura */}
        <div className="col-span-5 col-start-8 max-nav:col-span-5 max-nav:col-start-8 max-md:col-span-1 max-md:col-start-auto">
          <p style={delay(0.35)} className="reveal-fade m-0 max-w-[44ch] text-[length:clamp(18px,1.4vw,21px)] leading-[1.55] text-ink">{COMANEJO.lead}</p>
          <p style={delay(0.45)} className="reveal-fade mt-5 mb-0 max-w-[44ch] text-[17px] leading-[1.6] text-ink-dim">{COMANEJO.teaser}</p>
          <div style={delay(0.55)} className="reveal-fade mt-8">
            <CtaLink href={url('comanejo')}>Conocer el comanejo</CtaLink>
          </div>
        </div>
      </Reveal>

      {/* las cinco instituciones firmantes */}
      <Reveal threshold={0.25} className="mt-[clamp(72px,12vh,128px)]">
        <h3 style={delay(0)} className="reveal-fade m-0 mb-5 text-[12px] font-semibold uppercase leading-[1.45] tracking-[0.2em] text-ink-dim">
          Instituciones firmantes del convenio
        </h3>
        <ul className="m-0 grid list-none grid-cols-5 border-forest/20 p-0 [--logo:clamp(76px,6.6vw,100px)] nav:border-t max-nav:grid-cols-6 max-md:grid-cols-2 max-md:[--logo:clamp(60px,17vw,72px)]">
          {SIGNATORIES.map((s, i) => (
            <li
              key={s.acronym}
              style={delay(0.12 + i * 0.1)}
              className={
                'reveal-fade flex flex-col items-center border-rule px-[clamp(12px,1.6vw,28px)] pt-[clamp(28px,4vh,44px)] pb-2 text-center ' +
                // escritorio: una fila con filetes verticales entre firmantes
                'nav:[&+&]:border-l ' +
                // tablet: tres arriba y dos abajo; móvil: dos por fila y la última centrada. Filete sobre cada fila
                'max-nav:col-span-2 max-nav:border-t max-nav:pb-8 max-nav:nth-4:col-span-3 max-nav:nth-5:col-span-3 max-md:col-span-1 max-md:nth-4:col-span-1 max-md:nth-5:col-span-2'
              }
            >
              <span className="flex h-[calc(var(--logo)*1.15)] w-full items-center justify-center">
                <img
                  src={s.mark.src}
                  width={s.mark.width}
                  height={s.mark.height}
                  alt={`Logotipo de ${s.name}`}
                  loading="lazy"
                  decoding="async"
                  style={{ height: logoHeight(s.mark.width, s.mark.height) }}
                  className="block w-auto max-w-full object-contain"
                />
              </span>
              <span className="mt-6 block text-[17px] font-semibold leading-tight text-forest">{s.acronym}</span>
              <span className="mt-1.5 block max-w-[26ch] text-[14px] leading-[1.5] text-ink-dim">{s.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
