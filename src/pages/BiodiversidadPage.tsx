import { CountUp } from '../components/CountUp';
import { CtaLink, Sources } from '../components/editorial';
import { Eyebrow } from '../components/Eyebrow';
import { Frame, Img } from '../components/media/Photo';
import { Reveal } from '../components/Reveal';
import { RiseLines } from '../components/RiseLines';
import { delay, display, grid, label, section, sectionTitle } from '../components/ui';
import { BIO, type Species } from '../content/biodiversidad';
import { url } from '../lib/routes';

/*
 * Biodiversidad, en cinco tiempos y con un ritmo distinto en cada uno:
 *   1. apertura: titular y entradilla; debajo, el dosel del bosque nublado a todo el ancho;
 *   2. cifras: dos grandes (plantas y orquídeas) y una complementaria (aves), con la nota de inventario preliminar;
 *   3. especies protagonistas: el quetzal (fotografía y texto) y la salamandra narizona en una banda verde bosque;
 *   4. flora: la fotografía vertical del bosque con epífitas junto al texto, la orquídea y las seis endémicas;
 *   5. cierre en salvia: bosque nublado y sistema hídrico como contexto, con las salidas a Turismo y Comanejo.
 * Fuente única: Plan de Manejo 2026–2038 (borrador); las cifras se presentan como el documento las presenta.
 */


function Status({ items, onDark = false }: { items: Species['status']; onDark?: boolean }) {
  return (
    <dl className="m-0 mt-8 grid gap-4">
      {items.map((s) => (
        <div key={s.code} className={`grid grid-cols-[minmax(5.5em,auto)_1fr] items-baseline gap-4 border-t pt-4 ${onDark ? 'border-hero-cream/20' : 'border-rule'}`}>
          <dt className={`${display} text-[22px] leading-none tracking-[-0.01em] ${onDark ? 'text-gold' : 'text-moss'}`}>{s.code}</dt>
          <dd className={`m-0 text-[15px] leading-[1.5] ${onDark ? 'text-hero-cream/85' : 'text-ink'}`}>{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function Quetzal({ s }: { s: Species }) {
  return (
    <Reveal as="article" id={s.id} aria-labelledby={`${s.id}-name`} className={`${grid} scroll-mt-8 items-center gap-y-10`}>
      {s.photo && (
        // la fotografía es pequeña en origen (recorte de la portada): se muestra a su tamaño, sin ampliarla
        <figure className="col-span-5 m-0 max-md:col-span-1">
          <Frame className="aspect-[435/332] w-full max-w-[435px]">
            <Img photo={s.photo} sizes="435px" />
          </Frame>
          <figcaption className="mt-3 max-w-[435px] text-[13px] leading-[1.5] text-ink-dim">{s.photo.credit}</figcaption>
        </figure>
      )}
      <div className="col-span-6 col-start-7 max-md:col-span-1 max-md:col-start-auto">
        <p style={delay(0.1)} className={`${label} reveal-fade m-0 text-moss`}>{s.tag}</p>
        <h3 id={`${s.id}-name`} style={delay(0.15)} className={`${display} reveal-fade mt-4 mb-0 text-[length:clamp(56px,6.4vw,112px)] leading-[0.9] tracking-[-0.04em] text-forest`}>
          {s.name}
        </h3>
        <p style={delay(0.2)} className="reveal-fade mt-3 mb-0 text-[20px] italic leading-tight text-ink-dim">{s.scientific}</p>
        {s.text.map((t, i) => (
          <p key={i} style={delay(0.3 + i * 0.08)} className="reveal-fade mt-6 mb-0 max-w-[52ch] text-[18px] leading-[1.6] text-ink">{t}</p>
        ))}
        <div style={delay(0.45)} className="reveal-fade">
          <Status items={s.status} />
          <p className="mt-5 mb-0 text-[13px] leading-[1.5] text-ink-dim">{s.source}</p>
          <div className="mt-8">
            <CtaLink href={url('turismo', '#aviturismo')}>Aviturismo en el parque</CtaLink>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** La salamandra: banda verde bosque, la categoría CR en grande. Si se incorpora una fotografía, ocupa la columna derecha. */
function Salamandra({ s }: { s: Species }) {
  const cr = s.status[0];
  return (
    <Reveal as="article" id={s.id} aria-labelledby={`${s.id}-name`} threshold={0.25} className="mt-[clamp(80px,13vh,144px)] -mx-gutter scroll-mt-8 bg-forest px-gutter py-[clamp(80px,13vh,152px)]">
      <div className={`${grid} items-end gap-y-12`}>
        <div className="col-span-7 max-md:col-span-1">
          <p style={delay(0)} className={`${label} reveal-fade m-0 text-gold`}>{s.tag}</p>
          <h3 id={`${s.id}-name`} style={delay(0.1)} className={`${display} reveal-fade mt-5 mb-0 text-[length:clamp(52px,6.8vw,120px)] leading-[0.92] tracking-[-0.04em] text-hero-cream`}>
            {s.name}
          </h3>
          <p style={delay(0.18)} className="reveal-fade mt-4 mb-0 text-[length:clamp(20px,1.8vw,26px)] italic leading-tight text-hero-cream/80">{s.scientific}</p>
          {s.text.map((t, i) => (
            <p key={i} style={delay(0.3)} className="reveal-fade mt-8 mb-0 max-w-[46ch] text-[18px] leading-[1.6] text-hero-cream/90">{t}</p>
          ))}
          <p style={delay(0.4)} className="reveal-fade mt-6 mb-0 text-[13px] leading-[1.5] text-hero-cream/65">{s.source}</p>
        </div>
        <div className="col-span-4 col-start-9 max-md:col-span-1 max-md:col-start-auto">
          {s.photo ? (
            <figure className="m-0">
              <Frame className="aspect-[4/3]"><Img photo={s.photo} sizes="(max-width: 820px) 100vw, 32vw" /></Frame>
              <figcaption className="mt-3 text-[13px] leading-[1.5] text-hero-cream/65">{s.photo.credit}</figcaption>
            </figure>
          ) : null}
          {/* la categoría de amenaza, en grande: el dato que hace única a esta ficha */}
          <p style={delay(0.25)} className="reveal-fade m-0">
            <span className={`${display} block text-[length:clamp(120px,15vw,248px)] leading-[0.78] tracking-[-0.06em] text-gold`}>{cr.code}</span>
            <span className="mt-5 block max-w-[24ch] text-[17px] leading-[1.5] text-hero-cream">{cr.label}</span>
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export function BiodiversidadPage() {
  const B = BIO;
  const [quetzal, salamandra] = B.species;
  return (
    <>
      {/* 1 · apertura */}
      <Reveal threshold={0.05} className={`${grid} items-end gap-y-8`}>
        <div className="col-span-7 max-md:col-span-1">
          <div style={delay(0)} className="reveal-fade"><Eyebrow>{B.eyebrow}</Eyebrow></div>
          <RiseLines lines={B.title} className="text-[length:clamp(52px,7.2vw,132px)] font-medium leading-[0.98] tracking-[-0.04em] max-md:text-[length:clamp(44px,12.4vw,64px)]" />
        </div>
        <div className="col-span-4 col-start-9 max-nav:col-span-5 max-nav:col-start-8 max-md:col-span-1 max-md:col-start-auto">
          <p style={delay(0.4)} className="reveal-fade m-0 text-[length:clamp(18px,1.4vw,21px)] leading-[1.55] text-ink">{B.lead}</p>
          <p style={delay(0.5)} className="reveal-fade mt-5 mb-0 text-[17px] leading-[1.6] text-ink-dim">{B.body}</p>
        </div>
      </Reveal>
      <Reveal as="figure" threshold={0.1} className="-mx-gutter mt-[clamp(48px,8vh,88px)] mb-0">
        <Frame className="h-[clamp(320px,50vh,540px)] max-md:h-[300px]">
          <Img photo={B.hero} sizes="100vw" eager className="object-[50%_40%]" />
        </Frame>
        <figcaption className="mt-3 px-gutter text-right text-[13px] leading-[1.5] text-ink-dim max-md:text-left">{B.hero.credit}</figcaption>
      </Reveal>

      {/* 2 · cifras */}
      <Reveal as="section" aria-labelledby="cifras-title" className={section}>
        <h2 id="cifras-title" style={delay(0)} className={`${label} reveal-fade m-0 border-t border-forest/20 pt-5 text-ink-dim`}>La montaña en cifras</h2>
        <div className="mt-[clamp(32px,5vh,56px)] grid grid-cols-12 gap-x-[clamp(24px,3.4vw,56px)] gap-y-12 max-md:grid-cols-1">
          {B.figures.main.map((f, i) => (
            <div key={f.label} style={delay(0.1 + i * 0.12)} className="reveal-fade col-span-4 max-nav:col-span-6 max-md:col-span-1">
              <CountUp value={f.value} className={`${display} text-[length:clamp(84px,10vw,176px)] leading-[0.82] tracking-[-0.05em] ${i ? 'text-moss' : 'text-forest'}`} />
              <p className="mt-5 mb-0 text-[length:clamp(20px,1.7vw,26px)] font-medium leading-[1.2] tracking-[-0.015em] text-forest">{f.label}</p>
              <p className="mt-2 mb-0 text-[15px] leading-[1.5] text-ink-dim">{f.detail}</p>
            </div>
          ))}
          <div style={delay(0.34)} className="reveal-fade col-span-3 col-start-10 self-end border-l border-rule pl-[clamp(20px,2.4vw,40px)] max-nav:col-span-12 max-nav:col-start-1 max-nav:border-l-0 max-nav:border-t max-nav:pt-8 max-nav:pl-0 max-md:col-span-1">
            <p className="m-0 flex items-baseline gap-2 text-water">
              <span className="text-[length:clamp(28px,2.4vw,40px)] font-medium">{B.figures.complement.prefix}</span>
              <CountUp value={B.figures.complement.value} className={`${display} text-[length:clamp(56px,5.4vw,92px)] leading-[0.85] tracking-[-0.045em]`} />
            </p>
            <p className="mt-4 mb-0 text-[16px] leading-[1.5] text-ink">{B.figures.complement.label}</p>
          </div>
        </div>
        <p style={delay(0.45)} className="reveal-fade mt-[clamp(40px,6vh,64px)] mb-0 max-w-[88ch] border-l-2 border-gold pl-5 text-[15px] leading-[1.6] text-ink-dim">
          {B.figures.note}
        </p>
      </Reveal>

      {/* 3 · especies protagonistas */}
      <section aria-labelledby="especies-title" className={section}>
        <Reveal className="mb-[clamp(48px,8vh,88px)]">
          <p style={delay(0)} className={`${label} reveal-fade m-0 text-ink-dim`}>Especies protagonistas</p>
          <h2 id="especies-title" style={delay(0.08)} className={`${sectionTitle} reveal-fade mt-4 mb-0 max-w-[18ch] text-forest`}>
            Dos especies que cuentan la singularidad de la montaña.
          </h2>
        </Reveal>
        <Quetzal s={quetzal} />
        <Salamandra s={salamandra} />
      </section>

      {/* 4 · flora */}
      <Reveal as="section" aria-labelledby="flora-title" className={`${section} ${grid} items-start gap-y-12`}>
        <figure className="col-span-6 m-0 max-md:col-span-1 max-md:-mx-gutter">
          <Frame className="aspect-[4/5] max-md:aspect-[4/3]">
            <Img photo={B.flora.forest} sizes="(max-width: 820px) 100vw, 46vw" />
          </Frame>
          <figcaption className="mt-3 text-[13px] leading-[1.5] text-ink-dim max-md:px-gutter">{B.flora.forest.credit}</figcaption>
        </figure>
        <div className="col-span-5 col-start-8 max-md:col-span-1 max-md:col-start-auto nav:sticky nav:top-12">
          <p style={delay(0.05)} className={`${label} reveal-fade m-0 text-ink-dim`}>Flora</p>
          <h2 id="flora-title" style={delay(0.1)} className={`${sectionTitle} reveal-fade mt-4 mb-0 text-forest`}>{B.flora.title}</h2>
          <p style={delay(0.2)} className="reveal-fade mt-6 mb-0 text-[18px] leading-[1.6] text-ink">{B.flora.text}</p>

          <figure style={delay(0.3)} className="reveal-fade mt-10 mb-0 grid grid-cols-[minmax(0,200px)_1fr] items-end gap-5 max-md:grid-cols-[minmax(0,150px)_1fr]">
            <div className="aspect-[434/332] overflow-hidden"><Img photo={B.flora.orchid} sizes="200px" /></div>
            <figcaption>
              <span className="block text-[17px] font-medium leading-[1.4] text-forest">{B.flora.orchids}</span>
              <span className="mt-2 block text-[13px] leading-[1.5] text-ink-dim">{B.flora.orchid.credit}</span>
            </figcaption>
          </figure>

          <div style={delay(0.4)} className="reveal-fade mt-12">
            <h3 className={`${label} m-0 text-ink-dim`}>{B.flora.endemicTitle}</h3>
            <ul className="m-0 mt-4 list-none p-0">
              {B.flora.endemic.map((n) => (
                <li key={n} className="border-t border-rule py-2.5 text-[18px] italic leading-[1.4] text-forest last:border-b">{n}</li>
              ))}
            </ul>
            <p className="mt-4 mb-0 text-[15px] leading-[1.55] text-ink">{B.flora.endemicNote}</p>
            <p className="mt-3 mb-0 text-[13px] leading-[1.5] text-ink-dim">{B.flora.source}</p>
          </div>
        </div>
      </Reveal>

      {/* 5 · cierre */}
      <Reveal as="section" aria-labelledby="cierre-title" className={`${section} -mx-gutter bg-sage px-gutter py-[clamp(88px,14vh,160px)]`}>
        <RiseLines as="h2" id="cierre-title" lines={B.closing.title} className={sectionTitle} />
        <div className="mt-[clamp(48px,8vh,88px)] grid grid-cols-12 gap-x-[clamp(24px,3.4vw,56px)] gap-y-12 max-md:grid-cols-1">
          {B.closing.values.map((v, i) => (
            <div key={v.name} style={delay(0.3 + i * 0.12)} className="reveal-fade col-span-5 border-t border-forest/20 pt-6 max-nav:col-span-6 max-md:col-span-1 [&+&]:col-start-7 max-md:[&+&]:col-start-auto">
              <h3 className={`${label} m-0 text-ink-dim`}>{v.name}</h3>
              <p className="mt-5 mb-0 flex items-baseline gap-3 text-forest">
                <span className={`${display} text-[length:clamp(56px,5.6vw,96px)] leading-[0.85] tracking-[-0.045em]`}>{v.figure}</span>
                <span className="text-[13px] font-semibold uppercase tracking-[0.2em]">{v.unit}</span>
              </p>
              <p className="mt-5 mb-0 max-w-[44ch] text-[17px] leading-[1.6] text-ink">{v.text}</p>
            </div>
          ))}
        </div>
        <p style={delay(0.55)} className="reveal-fade mt-[clamp(40px,6vh,64px)] mb-0 max-w-[56ch] text-[length:clamp(18px,1.4vw,21px)] leading-[1.55] text-ink">{B.closing.text}</p>
        <div style={delay(0.65)} className="reveal-fade mt-10 flex flex-wrap gap-4">
          <CtaLink href={url('turismo')}>Descubrir la montaña</CtaLink>
          <CtaLink href={url('comanejo')}>Quiénes la cuidan</CtaLink>
        </div>
      </Reveal>

      <Sources>{B.sources}</Sources>
    </>
  );
}
