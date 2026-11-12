import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { isWideMark, markOf, type OrgProfile as Profile } from '../../content/comanejo';
import { Frame, Img } from '../media/Photo';
import { Eyebrow } from '../Eyebrow';
import { Reveal } from '../Reveal';
import { blockTitle, delay, grid, label, section } from '../ui';

/*
 * Perfil de una organización comanejadora. Todos los perfiles siguen el mismo sistema, para poder recorrerlos y
 * compararlos sin reaprender la página:
 *   encabezado (logotipo sobre la sigla, a la izquierda · presentación a la derecha) → material propio →
 *   listas (con la cifra bajo la más corta) → su papel en PANAMOSAB (un párrafo de síntesis).
 * Lo único que cambia es el material disponible:
 *   - con fotografías (`photos`): la fotografía a todo el ancho y una segunda junto a las listas; `flip` pasa esa
 *     segunda fotografía al otro lado para que dos perfiles con fotografías seguidos no se repitan;
 *   - sin fotografías: las declaraciones institucionales (misión, enfoque) sostienen el perfil. No se usan
 *     imágenes de relleno.
 * El fondo (`tone`: marfil o salvia) lo decide la página para alternar el ritmo entre perfiles.
 */

function Website({ site }: { site: Profile['website'] }) {
  return (
    <a
      href={site.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${label} group focus-ring mt-9 inline-flex min-h-11 items-center gap-2.5 text-forest no-underline`}
    >
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:bg-[length:0%_1px] group-hover:bg-right-bottom">
        {site.label}
      </span>
      <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      <span className="sr-only">(sitio oficial, se abre en una pestaña nueva)</span>
    </a>
  );
}

/**
 * Logotipo, sigla, nombre oficial y datos breves. El logotipo va siempre encima de la sigla y alineado a su borde
 * izquierdo, apoyado en una franja de la misma altura en todos los perfiles: así cada perfil empieza igual y el
 * logotipo se lee como parte del nombre. Es el mismo logotipo de la franja de firmantes. Los apaisados (ICF) se
 * limitan por ancho en lugar de por alto; los verticales (CASM), con poco ancho, ganan altura para tener el mismo
 * peso visual que los demás.
 */
function Identity({ org, index }: { org: Profile; index: string }) {
  const logo = markOf(org.id);
  const tall = logo.height > logo.width;
  // sin sigla (un nombre de varias palabras): dos líneas y en minúscula
  const long = org.acronym.includes(' ');
  // siglas largas (CODEMUSSBA): una escala menor, para que quepan en su columna y en móvil
  const wide = !long && org.acronym.length > 6;
  return (
    <div>
      <Eyebrow num={index} className="reveal-fade">Perfil institucional</Eyebrow>
      <div style={delay(0.05)} className={`reveal-fade flex items-end ${tall ? 'h-[clamp(116px,11vw,184px)] max-md:h-[104px]' : 'h-[clamp(88px,8.4vw,140px)] max-md:h-[80px]'}`}>
        <img
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt={`Logotipo de ${org.acronym}`}
          loading="lazy"
          decoding="async"
          className={isWideMark(logo) ? 'block h-auto max-h-full w-[min(100%,440px)]' : 'block h-full w-auto max-w-full object-contain object-left-bottom'}
        />
      </div>
      {/* la sigla (o el nombre corto) es la firma visual del perfil; el nombre oficial es el encabezado */}
      <p
        aria-hidden="true"
        style={delay(0.1)}
        className={
          'reveal-fade m-0 mt-[clamp(20px,2.2vw,32px)] font-display font-extrabold text-forest ' +
          (long
            ? 'max-w-[9ch] text-[length:clamp(52px,6.2vw,108px)] leading-[0.9] tracking-[-0.04em] max-md:text-[length:clamp(44px,12.4vw,60px)]'
            : wide
              ? 'text-[length:clamp(52px,6.4vw,112px)] uppercase leading-[0.84] tracking-[-0.035em] max-md:text-[length:clamp(38px,11.6vw,56px)]'
              : 'text-[length:clamp(76px,10.5vw,184px)] uppercase leading-[0.8] tracking-[-0.035em] max-md:text-[length:clamp(64px,21vw,96px)]')
        }
      >
        {org.acronym}
      </p>
      {/* con un nombre largo, el logotipo y el nombre en grande ya lo dicen: el encabezado queda solo para lectores de pantalla */}
      <h2 id={`${org.id}-name`} style={delay(0.2)} className={long ? 'sr-only' : 'reveal-fade mt-7 mb-0 max-w-[34ch] text-[length:clamp(17px,1.45vw,22px)] font-semibold uppercase leading-[1.35] tracking-[0.03em] text-forest'}>
        {org.name}
      </h2>
      <p style={delay(0.25)} className={`reveal-fade mb-0 text-[15px] leading-[1.5] text-ink-dim ${long ? 'mt-6' : 'mt-3'}`}>{org.meta.join(' · ')}</p>
    </div>
  );
}

/** Encabezado común: identidad a la izquierda y presentación a la derecha, apoyadas en la misma línea de base. */
function Header({ org, index }: { org: Profile; index: string }) {
  return (
    <Reveal className={`${grid} items-end gap-y-10`}>
      <div className="col-span-7 max-nav:col-span-12 max-md:col-span-1">
        <Identity org={org} index={index} />
      </div>
      <div className="col-span-4 col-start-9 max-nav:col-span-8 max-nav:col-start-1 max-md:col-span-1">
        <p style={delay(0.3)} className="reveal-fade m-0 text-[length:clamp(18px,1.3vw,20px)] leading-[1.6] text-ink">{org.summary}</p>
        <div style={delay(0.4)} className="reveal-fade">
          <Website site={org.website} />
        </div>
      </div>
    </Reveal>
  );
}

/** Cifra destacada, solo si consta en las fuentes de la organización. */
function Figure({ org }: { org: Profile }) {
  if (!org.figure) return null;
  return (
    <p style={delay(0.45)} className="reveal-fade mt-12 mb-0 flex flex-wrap items-start gap-x-5 gap-y-3 border-t border-rule pt-6">
      <span className="font-display text-[length:clamp(56px,5vw,84px)] font-extrabold leading-[0.82] tracking-[-0.04em] text-moss tabular-nums">{org.figure.value}</span>
      <span className="max-w-[30ch] text-[15px] leading-[1.5] text-ink">{org.figure.label}</span>
    </p>
  );
}

/** Líneas de trabajo: lista numerada en tipografía grande. */
function Areas({ org }: { org: Profile }) {
  return (
    <div>
      <h3 className={`${label} mt-0 mb-6 text-ink-dim`}>{org.areas.title}</h3>
      <ol className="m-0 grid list-none gap-4 p-0">
        {org.areas.items.map((a, i) => (
          <li key={a} style={delay(0.1 + i * 0.07)} className="reveal-fade grid grid-cols-[2.2em_1fr] items-baseline text-[length:clamp(19px,1.5vw,23px)] font-medium leading-[1.3] tracking-[-0.012em] text-forest">
            <span aria-hidden="true" className="text-[13px] font-semibold tracking-[0.06em] text-moss tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            {a}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ítems cortos (departamentos, ejes): en línea, en lugar de uno por fila
const isInline = (items: string[]) => items.every((a) => a.length <= 16);

/**
 * La cifra va bajo la lista más corta, para que las dos columnas terminen a una altura parecida (con la cifra
 * siempre bajo las líneas de trabajo, la otra columna quedaba vacía). Estimación por líneas de texto.
 */
function figureUnderExtra(org: Profile) {
  const lines = (items: string[], perLine: number) => items.reduce((n, a) => n + Math.ceil(a.length / perLine), 0);
  const extra = isInline(org.extra.items) ? Math.ceil(org.extra.items.length / 2) : lines(org.extra.items, 40);
  return extra < lines(org.areas.items, 34);
}

/** Lista secundaria (áreas protegidas, departamentos): el ítem de PANAMOSAB se distingue en verde. */
function Extra({ org }: { org: Profile }) {
  const { title, items, highlight, note } = org.extra;
  const marked = new Set(Array.isArray(highlight) ? highlight : highlight ? [highlight] : []);
  const inline = isInline(items);
  return (
    <div>
      <h3 className={`${label} mt-0 mb-6 text-ink-dim`}>{title}</h3>
      <ul className={`m-0 list-none p-0 ${inline ? 'flex flex-wrap gap-x-7 gap-y-3' : 'grid gap-2.5'}`}>
        {items.map((a) => {
          const here = marked.has(a);
          return (
            <li
              key={a}
              className={
                'flex items-baseline gap-3 ' +
                (inline ? 'text-[length:clamp(20px,1.7vw,26px)] leading-[1.25] tracking-[-0.015em] ' : 'text-[17px] leading-[1.45] ') +
                (here ? 'font-semibold text-forest' : 'text-ink')
              }
            >
              <span aria-hidden="true" className={`inline-block size-[8px] shrink-0 -translate-y-[0.1em] rounded-full ${here ? 'bg-moss' : 'border border-ink-dim/50'}`} />
              <span>
                {a}
                {here && <span className={`${label} ml-2.5 inline-block align-[0.15em] text-[10px] text-moss`}>PANAMOSAB</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {note && <p className="mt-5 mb-0 max-w-[52ch] text-[14px] leading-[1.55] text-ink-dim">{note}</p>}
    </div>
  );
}

/** Misión, visión, enfoque…: la primera declaración en grande, las demás a su lado. */
function Statements({ org }: { org: Profile }) {
  const [mission, ...rest] = org.statements ?? [];
  if (!mission) return null;
  const q = (s: { text: string; quoted?: boolean }) => (s.quoted ? `«${s.text}»` : s.text);
  return (
    <Reveal className={`${grid} mt-[clamp(64px,10vh,112px)] gap-y-12 border-t border-forest/20 pt-[clamp(32px,5vh,52px)]`}>
      <div className="col-span-7 max-nav:col-span-12 max-md:col-span-1">
        <h3 style={delay(0)} className={`${label} reveal-fade mt-0 mb-6 text-ink-dim`}>{mission.label}</h3>
        <p style={delay(0.1)} className="reveal-fade m-0 max-w-[34ch] text-[length:clamp(24px,2.3vw,38px)] font-medium leading-[1.25] tracking-[-0.02em] text-forest">
          {q(mission)}
        </p>
      </div>
      <dl className="col-span-4 col-start-9 m-0 grid gap-9 max-nav:col-span-12 max-nav:grid-cols-2 max-md:col-span-1 max-md:grid-cols-1">
        {rest.map((s, i) => (
          <div key={s.label} style={delay(0.2 + i * 0.1)} className="reveal-fade">
            <dt className={`${label} mb-3 text-ink-dim`}>{s.label}</dt>
            <dd className="m-0 text-[17px] leading-[1.6] text-ink">{q(s)}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/** Responsabilidades que el convenio asigna a la organización, en un párrafo: mismo bloque en todos los perfiles. */
function Role({ org }: { org: Profile }) {
  return (
    <Reveal className={`${grid} mt-[clamp(72px,12vh,128px)] gap-y-6 border-t border-forest/20 pt-[clamp(32px,5vh,52px)]`}>
      <h3 style={delay(0)} className={`${blockTitle} reveal-fade col-span-4 m-0 max-w-[12ch] text-forest max-md:col-span-1`}>{org.role.title}</h3>
      <div className="col-span-7 col-start-6 max-nav:col-span-8 max-nav:col-start-5 max-md:col-span-1 max-md:col-start-auto">
        <p style={delay(0.1)} className="reveal-fade m-0 max-w-[60ch] text-[length:clamp(19px,1.5vw,23px)] leading-[1.6] tracking-[-0.005em] text-ink">{org.role.text}</p>
        <p style={delay(0.2)} className="reveal-fade mt-5 mb-0 text-[14px] leading-[1.55] text-ink-dim">{org.role.source}</p>
      </div>
    </Reveal>
  );
}

/** Perfil con fotografías: encabezado, la fotografía a todo el ancho y, debajo, las listas junto a la segunda. */
function PhotoProfile({ org, index, flip }: { org: Profile; index: string; flip: boolean }) {
  const photos = org.photos!;
  const below = figureUnderExtra(org);
  // con `flip`, en escritorio la fotografía secundaria pasa a la primera columna (las listas conservan su orden);
  // en tablet y móvil se vuelve al orden del documento
  const reset = 'max-nav:col-start-auto max-nav:row-start-auto';
  return (
    <>
      <Header org={org} index={index} />

      <Reveal as="figure" threshold={0.25} className="m-0 mt-[clamp(48px,8vh,88px)] max-md:-mx-gutter">
        <Frame className="aspect-[2/1] max-nav:aspect-[16/9] max-md:aspect-[4/3]">
          <Img photo={photos.main} sizes="(max-width: 820px) 100vw, 92vw" className="object-[50%_42%]" />
        </Frame>
      </Reveal>

      <Statements org={org} />

      <Reveal className={`${grid} mt-[clamp(64px,10vh,112px)] gap-y-14`}>
        <div className={`col-span-4 max-nav:col-span-6 max-md:col-span-1 ${flip ? `col-start-5 row-start-1 ${reset}` : ''}`}>
          <Areas org={org} />
          {!below && <Figure org={org} />}
        </div>
        <div className={`col-span-4 max-nav:col-span-6 max-md:col-span-1 ${flip ? `col-start-9 row-start-1 ${reset}` : ''}`}>
          <Extra org={org} />
          {below && <Figure org={org} />}
        </div>
        {/* en tablet, la segunda fotografía pasa a una franja horizontal bajo las dos listas */}
        <figure className={`col-span-4 m-0 max-nav:col-span-12 max-md:col-span-1 ${flip ? `col-start-1 row-start-1 ${reset}` : ''}`}>
          <Frame className="aspect-[4/5] max-nav:aspect-[5/2] max-md:aspect-[4/3]">
            <Img photo={photos.detail} sizes="(max-width: 1100px) 100vw, 30vw" />
          </Frame>
        </figure>
      </Reveal>

      <Role org={org} />
    </>
  );
}

/** Perfil sin fotografías: encabezado, declaraciones institucionales y listas. */
function StatementProfile({ org, index }: { org: Profile; index: string }) {
  const below = figureUnderExtra(org);
  return (
    <>
      <Header org={org} index={index} />

      <Statements org={org} />

      <Reveal className={`${grid} mt-[clamp(64px,10vh,112px)] gap-y-14`}>
        <div className="col-span-5 max-nav:col-span-6 max-md:col-span-1">
          <Areas org={org} />
          {!below && <Figure org={org} />}
        </div>
        <div className="col-span-6 col-start-7 max-nav:col-span-6 max-md:col-span-1 max-md:col-start-auto">
          <Extra org={org} />
          {below && <Figure org={org} />}
        </div>
      </Reveal>

      <Role org={org} />
    </>
  );
}

export type Tone = 'ivory' | 'sage';

export function OrgProfile({ org, index, flip = false, tone }: { org: Profile; index: string; flip?: boolean; tone?: Tone }) {
  const withPhotos = !!org.photos;
  const bg = tone ?? (withPhotos ? 'ivory' : 'sage');
  return (
    <article
      id={org.id}
      aria-labelledby={`${org.id}-name`}
      className={`${section} scroll-mt-8 outline-none ${bg === 'sage' ? '-mx-gutter bg-sage px-gutter py-[clamp(88px,14vh,160px)]' : ''}`}
    >
      {withPhotos ? <PhotoProfile org={org} index={index} flip={flip} /> : <StatementProfile org={org} index={index} />}
    </article>
  );
}
