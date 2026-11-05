import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import photo800 from '../assets/water/sendero-bosque-800.webp';
import photo1280 from '../assets/water/sendero-bosque-1280.webp';
import photo2000 from '../assets/water/sendero-bosque-2000.webp';
import { Eyebrow } from '../components/Eyebrow';
import { PARQUE } from '../content/parque';

gsap.registerPlugin(ScrollTrigger);

/*
 * 04 Agua: el mensaje sobre fondo celeste y, debajo, una fotografía del bosque nublado (un sendero) a todo el
 * ancho, con bordes ondulados (como la superficie del agua) que funde el celeste de arriba con el marfil de
 * la sección siguiente. Sobre la fotografía, la frase narrativa y los cuatro municipios.
 * Movimiento: al entrar, la fotografía se abre desde un recorte redondeado y el texto aparece en orden; al
 * hacer scroll la imagen se desplaza muy poco (parallax, ligado al scroll sin retraso). Nada se anima en
 * bucle. Con movimiento reducido, todo aparece directamente. Fondo opaco: cubre las capas WebGL fijas.
 */

const delay = (s: number) => ({ '--delay': `${s}s` }) as CSSProperties;

// borde ondulado (ancho 1440 × alto 80): `top` para el borde superior, `bottom` para el inferior
const WAVE = {
  top: 'M0 0 H1440 V34 C 1290 70, 1130 12, 960 38 S 640 78, 470 44 S 150 10, 0 46 Z',
  bottom: 'M0 80 H1440 V40 C 1300 6, 1150 64, 980 40 S 660 4, 500 34 S 170 72, 0 30 Z',
};

export function WaterSection() {
  const W = PARQUE.water;
  const section = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = band.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.18 });
    io.observe(el);
    // parallax muy discreto: la foto (un 14 % más alta que su marco) se desplaza mientras el marco cruza la pantalla
    const ctx = gsap.context(() => {
      gsap.fromTo(img.current, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, el);
    return () => { io.disconnect(); ctx.revert(); };
  }, []);

  return (
    <section
      ref={section}
      id="agua"
      aria-labelledby="agua-title"
      data-inview={inView ? '' : undefined}
      className="relative z-3 bg-lake px-gutter pt-[clamp(96px,15vh,170px)]"
    >
      {/* --- el mensaje */}
      <div className="grid grid-cols-12 items-end gap-x-[clamp(24px,3.4vw,56px)] gap-y-8 max-md:grid-cols-1">
        <div className="col-span-7 max-md:col-span-1">
          <Eyebrow num="04">{W.eyebrow}</Eyebrow>
          <h2 id="agua-title" className="m-0 text-water">
            <span className="block font-display text-[length:clamp(96px,13vw,232px)] font-extrabold uppercase leading-[0.8] tracking-[-0.045em] max-md:text-[length:clamp(84px,27vw,124px)]">
              Agua
            </span>
            <span className="mt-5 block text-[length:clamp(30px,3.2vw,52px)] font-medium leading-[1.06] tracking-[-0.025em] max-md:text-[length:clamp(26px,7.4vw,34px)]">
              <span className="text-ink-dim">para </span>cuatro municipios.
            </span>
          </h2>
        </div>
        <div className="col-span-4 col-start-9 pb-2 max-md:col-span-1">
          <p className="m-0 text-[18px] leading-[1.6] text-ink max-md:text-[17px]">{W.body}</p>
          {/* la relación con las comunidades, con su fuente */}
          <p className="mt-8 mb-0 flex items-start gap-4 border-t border-water/25 pt-5">
            <span className="font-display text-[length:clamp(48px,4.4vw,72px)] font-extrabold leading-[0.82] tracking-[-0.04em] text-water tabular-nums">{W.communities.value}</span>
            <span className="text-[16px] leading-[1.5] text-ink">{W.communities.label}</span>
          </p>
          <p className="mt-3 mb-0 text-[12px] leading-[1.5] text-ink-dim">{W.communities.source}</p>
        </div>
      </div>

      {/* --- el agua: fotografía a todo el ancho */}
      <figure className="-mx-gutter mt-[clamp(56px,9vh,104px)] mb-0">
        <div
          ref={band}
          className="relative h-[clamp(520px,86vh,900px)] overflow-hidden transition-[clip-path] duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(10%_5%_6%_5%_round_48px)] in-[[data-inview]]:[clip-path:inset(0_0_0_0_round_0)] motion-reduce:transition-none max-md:h-[min(118svh,880px)]"
        >
          {/* fotografía vertical: en pantallas anchas se ve la franja central (helechos y luz entre los árboles) */}
          <img
            ref={img}
            src={photo2000}
            srcSet={`${photo800} 800w, ${photo1280} 1280w, ${photo2000} 2000w`}
            sizes="100vw"
            alt={W.photo.alt}
            width={2000}
            height={2666}
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 -top-[7%] block h-[114%] w-full object-cover object-[50%_45%] transition-transform duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)] [scale:1.08] in-[[data-inview]]:[scale:1] motion-reduce:transition-none"
          />

          {/* lectura del texto: un velo suave de agua profunda, abajo (municipios) y a la izquierda (frase) */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_52%_46%_at_14%_34%,rgb(14_40_36/0.62),transparent),linear-gradient(0deg,rgb(18_52_64/0.82)_0%,rgb(18_52_64/0.38)_34%,transparent_58%),linear-gradient(90deg,rgb(16_44_40/0.42)_0%,transparent_46%)] max-md:bg-[radial-gradient(ellipse_90%_40%_at_20%_36%,rgb(14_40_36/0.6),transparent),linear-gradient(0deg,rgb(18_52_64/0.85)_0%,rgb(18_52_64/0.4)_36%,transparent_60%)]" />

          {/* bordes ondulados: el celeste de arriba y el marfil de la sección siguiente */}
          <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[clamp(36px,5vw,72px)] w-full fill-lake">
            <path d={WAVE.top} />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[clamp(36px,5vw,72px)] w-full fill-ivory">
            <path d={WAVE.bottom} />
          </svg>

          {/* frase narrativa */}
          <p
            style={delay(1.0)}
            className="reveal-fade absolute top-[clamp(140px,26%,260px)] left-gutter m-0 max-w-[13ch] [text-shadow:0_1px_18px_rgb(10_30_28/0.35)] max-md:top-[28%] text-[length:clamp(30px,3.4vw,56px)] font-medium leading-[1.08] tracking-[-0.025em] text-hero-cream max-md:max-w-[12ch]"
          >
            {W.quote}
          </p>

          {/* municipios: una línea tipográfica sobre el agua */}
          <div className="absolute inset-x-gutter bottom-[clamp(72px,11vh,120px)] max-md:bottom-[64px]">
            <p style={delay(1.3)} className="reveal-fade m-0 mb-5 text-[11px] font-semibold uppercase tracking-[0.26em] text-hero-cream/80">{W.placesLabel}</p>
            <ol className="m-0 grid list-none grid-cols-4 border-t border-hero-cream/35 p-0 max-md:grid-cols-2 max-md:gap-y-5">
              {W.places.map((place, i) => (
                <li
                  key={place}
                  style={delay(1.5 + i * 0.18)}
                  // el mismo aire a ambos lados de cada filete; los nombres largos («Concepción del Sur») pasan a dos
                  // líneas equilibradas antes que acercarse a la línea del municipio siguiente
                  className="reveal-fade border-l border-hero-cream/25 px-[clamp(16px,2vw,32px)] pt-4 first:border-l-0 first:pl-0 last:pr-0 max-md:border-l-0 max-md:px-0 max-md:odd:pr-5"
                >
                  <span className="block text-[12px] font-semibold tracking-[0.14em] text-hero-cream/70 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-1.5 block text-balance text-[length:clamp(22px,2.4vw,40px)] font-medium leading-[1.05] tracking-[-0.02em] text-hero-cream max-md:text-[length:clamp(19px,5.6vw,24px)]">
                    {place}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </figure>
    </section>
  );
}
