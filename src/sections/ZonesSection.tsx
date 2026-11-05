import { useEffect, useRef, useState, type CSSProperties } from 'react';
import contoursUrl from '../assets/park/contours.svg';
import zones from '../assets/park/zones.json';
import { CountUp } from '../components/CountUp';
import { grid12 } from '../components/editorial';
import { Eyebrow } from '../components/Eyebrow';
import { PARQUE } from '../content/parque';

type ZoneId = 'core' | 'buffer';
const ZONE_IDS: ZoneId[] = ['core', 'buffer'];
// colores de cada zona: verde bosque (núcleo) y dorado (amortiguamiento; texto en ocre por contraste)
const TONE = {
  core: { text: 'text-forest', dot: 'bg-forest', bar: 'bg-forest' },
  buffer: { text: 'text-ochre', dot: 'bg-gold', bar: 'bg-gold' },
} as const;
const delay = (s: number) => ({ '--delay': `${s}s` }) as CSSProperties;
const label = 'text-[11px] font-semibold uppercase tracking-[0.2em]';

/**
 * 03 Cómo se protege: las dos zonas de manejo sobre las curvas de nivel reales del macizo
 * (tools/build_contours.py). Al entrar en pantalla, el mapa se dibuja (franja de amortiguamiento, después la
 * zona núcleo y la cumbre) y las cifras se cuentan; señalar una zona en el mapa o en la leyenda atenúa la otra.
 * Fondo opaco: cubre las capas WebGL fijas (el motor deja de dibujarlas).
 */
export function ZonesSection() {
  const Z = PARQUE.zones;
  const share = (n: number) => (n / Z.total) * 100;
  const scaleKm = 5;
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [focus, setFocus] = useState<ZoneId | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hover = (id: ZoneId) => ({
    onMouseEnter: () => setFocus(id), onMouseLeave: () => setFocus(null),
    onFocus: () => setFocus(id), onBlur: () => setFocus(null),
  });

  return (
    <section
      ref={ref}
      id="zonas"
      aria-labelledby="zonas-title"
      data-inview={inView ? '' : undefined}
      data-focus={focus ?? undefined}
      className="relative z-3 overflow-hidden bg-sage px-gutter py-[clamp(96px,16vh,180px)]"
    >
      <div className={`${grid12} items-center gap-y-14`}>
        <div className="col-span-5 max-md:col-span-1">
          <Eyebrow num="03">{Z.eyebrow}</Eyebrow>
          <h2 id="zonas-title" className="mt-0 mb-7 max-w-[12ch] text-[length:clamp(36px,3.9vw,64px)] font-medium leading-[1.02] tracking-[-0.03em] text-forest max-md:text-[length:clamp(32px,8.4vw,44px)]">
            {Z.title}
          </h2>

          {/* proporción de cada zona (las cifras también van en el texto) */}
          <div aria-hidden="true" className="mt-12 flex h-[10px] gap-[3px]">
            {Z.items.map((z, i) => (
              <span key={z.name} data-zone={ZONE_IDS[i]} style={{ width: `${share(z.ha)}%` }} className="block h-full">
                <span style={delay(0.3 + i * 0.5)} className={`zone-bar block h-full rounded-full ${TONE[ZONE_IDS[i]].bar}`} />
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-10">
            {Z.items.map((z, i) => {
              const id = ZONE_IDS[i], t = TONE[id];
              return (
                <div key={z.name} data-zone={id} tabIndex={0} {...hover(id)} className="focus-ring cursor-default border-t border-forest/15 pt-5 outline-offset-8">
                  <h3 className={`m-0 flex items-center gap-3 text-ink-dim ${label}`}>
                    <span aria-hidden="true" className={`size-[10px] rounded-full ${t.dot}`} />
                    {z.name}
                    <span className="ml-auto font-sans text-[13px] tracking-normal text-ink-dim normal-case">{Math.round(share(z.ha))} % del área</span>
                  </h3>
                  <p className="mt-3 mb-0 flex items-baseline gap-3 whitespace-nowrap">
                    <CountUp
                      value={z.ha}
                      decimals={2}
                      className={`font-display text-[length:clamp(48px,5vw,88px)] font-extrabold leading-[0.9] tracking-[-0.035em] max-md:text-[length:clamp(40px,11.5vw,56px)] ${t.text}`}
                    />
                    <span className={`text-[13px] font-semibold uppercase tracking-[0.2em] ${t.text}`}>ha</span>
                  </p>
                  <p className="mt-4 mb-0 text-[15px] leading-[1.55] text-ink">{z.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* mapa de zonas */}
        <figure className="col-span-7 col-start-6 m-0 max-md:col-span-1 max-md:-mx-gutter">
          <div className="relative aspect-square">
            <img
              src={contoursUrl}
              alt=""
              width={600}
              height={600}
              loading="lazy"
              decoding="async"
              style={delay(0)}
              className="reveal-fill block size-full [mask-image:radial-gradient(closest-side,#000_66%,transparent)]"
            />
            <svg viewBox={`0 0 ${zones.viewBox} ${zones.viewBox}`} role="img" aria-label={PARQUE.map.alt} className="absolute inset-0 size-full overflow-visible">
              <defs>
                <pattern id="zone-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                  <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-gold)" strokeWidth="1.6" strokeOpacity="0.55" />
                </pattern>
                <radialGradient id="zone-core-fill" cx={`${zones.peak[0]}%`} cy={`${zones.peak[1]}%`} r="34%" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="var(--color-forest)" stopOpacity="0.62" />
                  <stop offset="1" stopColor="var(--color-moss)" stopOpacity="0.32" />
                </radialGradient>
              </defs>

              {/* zona de amortiguamiento: franja de 2 km (rayado dorado) */}
              <g data-zone="buffer" {...hover('buffer')} className="cursor-pointer">
                <path d={zones.buffer} fill="var(--color-gold)" fillOpacity="0.16" style={delay(1.1)} className="reveal-fill" />
                <path d={zones.buffer} fill="url(#zone-hatch)" style={delay(1.3)} className="reveal-fill" />
                <path d={zones.buffer} pathLength={1} fill="none" stroke="var(--color-ochre)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" style={delay(0.2)} className="reveal-line" />
                <path d={zones.buffer} fill="none" stroke="var(--color-ochre)" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" style={delay(2.4)} className="reveal-fill zone-patrol" />
              </g>
              {/* zona núcleo: por encima de 1,800 msnm */}
              <g data-zone="core" {...hover('core')} className="cursor-pointer">
                <path d={zones.core} fill="url(#zone-core-fill)" style={delay(1.9)} className="reveal-fill" />
                <path d={zones.core} pathLength={1} fill="none" stroke="var(--color-forest)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" style={delay(1.0)} className="reveal-line" />
              </g>
            </svg>

            {/* etiquetas */}
            <p aria-hidden="true" data-zone="core" style={{ left: `${zones.coreLabel[0]}%`, top: `${zones.coreLabel[1] + 9}%`, ...delay(2.4) }}
              className="reveal-fade pointer-events-none absolute m-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-hero-cream">
              Zona núcleo
            </p>
            <p aria-hidden="true" data-zone="buffer" style={{ left: `${zones.bufferLabel[0]}%`, top: `${zones.bufferLabel[1] + 9}%`, ...delay(2.6) }}
              className="reveal-fade pointer-events-none absolute m-0 -translate-x-1/2 -rotate-90 whitespace-nowrap rounded-full bg-sage/90 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ochre">
              Amortiguamiento · 2 km
            </p>
            {/* cumbre */}
            <div className="pointer-events-none absolute" style={{ left: `${zones.peak[0]}%`, top: `${zones.peak[1]}%` }}>
              <span aria-hidden="true" className="absolute -top-[18px] -left-[18px] size-[36px] rounded-full border border-hero-cream/80 motion-safe:animate-[peak-halo_3.2s_ease-out_infinite]" />
              <span aria-hidden="true" style={delay(2.2)} className="reveal-fade absolute -top-[6px] -left-[6px] size-[12px] rounded-full border-2 border-hero-cream bg-forest" />
              <p style={delay(2.5)} className="reveal-fade absolute -top-[12px] left-4 m-0 whitespace-nowrap rounded-full bg-hero-cream/90 px-2.5 py-0.5 text-[12px] font-semibold tracking-[0.02em] text-forest">
                Cumbre · 2,744 msnm
              </p>
            </div>
            {/* norte y escala */}
            <div aria-hidden="true" className="absolute top-[8%] right-[8%] flex flex-col items-center text-forest max-md:right-[10%]">
              <svg viewBox="0 0 12 18" className="h-5 w-3 fill-current"><path d="M6 0 12 18 6 13 0 18Z" /></svg>
              <span className="mt-1 text-[11px] font-semibold tracking-[0.1em]">N</span>
            </div>
            {/* barra de escala: su ancho es la fracción del lado del mapa que representan 5 km */}
            <div className="absolute bottom-[8%] left-[8%] max-md:left-[10%]" style={{ width: `${(scaleKm / zones.sideKm) * 100}%` }}>
              <span aria-hidden="true" className="block h-[6px] w-full border-x border-b border-forest" />
              <span className="mt-1.5 block text-[11px] font-semibold tracking-[0.08em] text-forest">{scaleKm} km</span>
            </div>
          </div>

          <figcaption className="mt-6 grid gap-3 max-md:px-gutter">
            <span className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] leading-[1.45] text-forest">
              <span className="flex items-center gap-2.5"><span aria-hidden="true" className="h-[10px] w-6 rounded-[3px] border-2 border-forest bg-moss/40" />Zona núcleo</span>
              <span className="flex items-center gap-2.5 text-ochre"><span aria-hidden="true" className="h-[10px] w-6 rounded-[3px] border-[1.5px] border-ochre bg-gold/30" />Zona de amortiguamiento</span>
              <span className="flex items-center gap-2.5 text-ink-dim"><span aria-hidden="true" className="h-px w-6 bg-moss" />{PARQUE.map.legendLines}</span>
            </span>
            <span className="mt-1 text-[12px] leading-[1.55] text-ink-dim">{PARQUE.map.caption}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
