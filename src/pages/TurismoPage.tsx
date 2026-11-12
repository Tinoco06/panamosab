import { CtaLink } from '../components/editorial';
import { ArtImg, BgVideo, Frame, Img } from '../components/media/Photo';
import { Reveal } from '../components/Reveal';
import { RiseLines } from '../components/RiseLines';
import { delay, display, grid, label, section, sectionTitle } from '../components/ui';
import { TURISMO } from '../content/turismo';
import { url } from '../lib/routes';

/*
 * Turismo: una página corta y visual.
 *   1. portada: el video del bosque nublado a todo el ancho, con el titular encima; debajo, la entradilla;
 *   2. puntos de interés: una lista editorial numerada (nombre en grande y el de sus cabañas), sin mapa
 *      ni rutas inventadas;
 *   2b. una franja con la cascada a todo el ancho (fotografía propia, sin pie ni ubicación);
 *   3. actividades: las tres que nombra el documento; el aviturismo, con el quetzal y su temporada;
 *   4. antes de visitar: un bloque discreto que remite a Contacto.
 */
export function TurismoPage() {
  const T = TURISMO;
  return (
    <>
      {/* 1 · portada */}
      <Reveal as="header" threshold={0.05} className="relative -mx-gutter">
        <Frame className="relative h-[clamp(460px,74vh,780px)] max-md:h-[72svh]">
          <BgVideo video={T.heroVideo} />
          {/* velo para leer el titular sobre la neblina */}
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgb(12_30_27/0.78)_0%,rgb(12_30_27/0.35)_38%,transparent_64%)]" />
        </Frame>
        {/* el titular ocupa todo el ancho sobre el video: no debe capturar los clics del botón de pausa */}
        <div className="pointer-events-none absolute inset-x-gutter bottom-[clamp(36px,8vh,80px)]">
          <p style={delay(0)} className={`${label} reveal-fade m-0 mb-5 text-hero-cream/85`}>{T.eyebrow}</p>
          <RiseLines
            lines={T.title}
            tone="text-hero-cream"
            accent="text-gold"
            className="text-[length:clamp(56px,8vw,148px)] font-medium leading-[0.95] tracking-[-0.04em] max-md:text-[length:clamp(46px,13.4vw,68px)]"
          />
        </div>
      </Reveal>

      <Reveal className={`${grid} mt-[clamp(48px,8vh,88px)] gap-y-6`}>
        <p style={delay(0.1)} className="reveal-fade col-span-6 m-0 text-[length:clamp(19px,1.5vw,23px)] leading-[1.55] text-ink max-md:col-span-1">{T.lead}</p>
      </Reveal>

      {/* 2 · puntos de interés */}
      <Reveal as="section" aria-labelledby="lugares-title" className={section}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <h2 id="lugares-title" style={delay(0)} className={`${sectionTitle} reveal-fade m-0 text-forest`}>{T.placesTitle}</h2>
          <p style={delay(0.08)} className={`${label} reveal-fade m-0 text-ink-dim`}>{T.placesLabel}</p>
        </div>
        <ol className="m-0 mt-[clamp(32px,5vh,56px)] list-none p-0">
          {T.places.map((p, i) => (
            <li key={p.name} style={delay(0.15 + i * 0.1)} className={`reveal-fade ${grid} items-baseline gap-y-3 border-t border-rule py-[clamp(24px,4vh,40px)] last:border-b`}>
              <span aria-hidden="true" className={`${display} col-span-1 text-[15px] text-gold max-md:hidden`}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={`${display} col-span-5 m-0 text-[length:clamp(40px,4.8vw,84px)] leading-[0.95] tracking-[-0.04em] text-forest max-md:col-span-1`}>{p.name}</h3>
              <div className="col-span-6 max-md:col-span-1">
                {p.where && <p className="m-0 mb-3 text-[15px] leading-[1.5] text-ink-dim">{p.where}</p>}
                <p className="m-0 text-[length:clamp(19px,1.6vw,24px)] font-medium leading-[1.3] text-forest">{p.lodging}</p>
                {p.note && <p className="mt-4 mb-0 max-w-[52ch] text-[16px] leading-[1.6] text-ink">{p.note}</p>}
              </div>
            </li>
          ))}
        </ol>
        <p style={delay(0.5)} className="reveal-fade mt-6 mb-0 max-w-[80ch] text-[15px] leading-[1.6] text-ink-dim">{T.placesNote}</p>
      </Reveal>

      {/* 2b · el bosque: la cascada a todo el ancho (horizontal en pantallas anchas, vertical en móvil) */}
      <Reveal as="figure" threshold={0.15} className={`${section} -mx-gutter mb-0`}>
        <Frame className="h-[clamp(420px,72vh,820px)] max-md:h-[min(125vw,680px)]">
          <ArtImg wide={T.walk.wide} tall={T.walk.tall} />
        </Frame>
      </Reveal>

      {/* 3 · actividades */}
      <Reveal as="section" aria-labelledby="actividades-title" className={`${section} ${grid} items-start gap-y-14`}>
        <div className="col-span-5 max-md:col-span-1">
          <h2 id="actividades-title" style={delay(0)} className={`${sectionTitle} reveal-fade m-0 text-forest`}>{T.activitiesTitle}</h2>
          <ol className="m-0 mt-8 list-none p-0">
            {T.activities.map((a, i) => (
              <li key={a} style={delay(0.1 + i * 0.08)} className="reveal-fade grid grid-cols-[2.6em_1fr] items-baseline border-t border-rule py-5 last:border-b">
                <span aria-hidden="true" className={`${display} text-[15px] text-gold`}>{String(i + 1).padStart(2, '0')}</span>
                <span className={`text-[length:clamp(24px,2.2vw,34px)] font-medium leading-[1.15] tracking-[-0.02em] ${a === T.birding.title ? 'text-moss' : 'text-forest'}`}>{a}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* aviturismo: el quetzal y la temporada que menciona el documento */}
        <article id="aviturismo" aria-labelledby="aviturismo-title" className="col-span-6 col-start-7 scroll-mt-8 max-md:col-span-1 max-md:col-start-auto">
          <figure style={delay(0.2)} className="reveal-fade m-0">
            <div className="aspect-[435/332] w-full max-w-[435px] overflow-hidden"><Img photo={T.birding.photo} sizes="435px" /></div>
          </figure>
          <h3 id="aviturismo-title" style={delay(0.28)} className={`${label} reveal-fade mt-10 mb-0 text-moss`}>{T.birding.title}</h3>
          <p style={delay(0.32)} className="reveal-fade mt-4 mb-0 max-w-[46ch] text-[length:clamp(19px,1.5vw,22px)] leading-[1.5] text-ink">{T.birding.text}</p>
          <div style={delay(0.4)} className="reveal-fade mt-8 border-t border-rule pt-6">
            <p className={`${label} m-0 text-ink-dim`}>{T.birding.season.label}</p>
            <p className={`${display} mt-3 mb-0 text-[length:clamp(40px,4.6vw,76px)] leading-[0.95] tracking-[-0.04em] text-forest`}>
              {T.birding.season.months.join(' · ')}
            </p>
            <p className="mt-4 mb-0 text-[15px] leading-[1.55] text-ink-dim">{T.birding.caveat}</p>
          </div>
          <div style={delay(0.5)} className="reveal-fade mt-8">
            <CtaLink href={url('biodiversidad', '#quetzal')}>Conocer al quetzal</CtaLink>
          </div>
        </article>
      </Reveal>

      {/* 4 · antes de visitar */}
      <Reveal as="section" aria-labelledby="visita-title" className={`${section} -mx-gutter bg-sage px-gutter py-[clamp(56px,9vh,96px)]`}>
        <div className={`${grid} items-center gap-y-8`}>
          <h2 id="visita-title" style={delay(0)} className={`${sectionTitle} reveal-fade col-span-4 m-0 text-forest max-md:col-span-1`}>{T.visit.title}</h2>
          <p style={delay(0.1)} className="reveal-fade col-span-5 m-0 text-[18px] leading-[1.6] text-ink max-md:col-span-1">{T.visit.text}</p>
          <div style={delay(0.2)} className="reveal-fade col-span-3 justify-self-end max-nav:col-span-12 max-nav:justify-self-start max-md:col-span-1">
            <CtaLink href={url('contacto')}>Contacto</CtaLink>
          </div>
        </div>
      </Reveal>

    </>
  );
}
