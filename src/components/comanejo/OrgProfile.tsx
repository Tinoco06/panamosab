import type { ReactNode } from 'react';
import { markOf, type OrgProfile as Profile, type Photo } from '../../content/comanejo';
import { Eyebrow } from '../Eyebrow';
import { Reveal } from '../Reveal';
import { blockTitle, delay, grid, label, mobile, section } from './ui';

/*
 * Perfil de una organización comanejadora. Todos los perfiles comparten piezas y jerarquía:
 *   identidad (sigla en grande, nombre oficial, datos) → presentación → material propio → listas → su papel
 *   en PANAMOSAB (siempre con el mismo tratamiento, para poder compararlos).
 * Cambia la distribución según el material disponible:
 *   - con fotografías (`photos`): fondo marfil, la fotografía a todo el ancho y una segunda junto a las listas;
 *     `flip` invierte los lados para que dos perfiles con fotografías seguidos no se repitan;
 *   - sin fotografías: banda salvia; el logotipo grande ocupa el lugar de la imagen y las declaraciones
 *     institucionales (misión, enfoque) el de la fotografía. No se usan imágenes de relleno.
 */

function Img({ photo, sizes, className = '' }: { photo: Photo; sizes: string; className?: string }) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
      className={`block size-full bg-rule object-cover ${className}`}
    />
  );
}

/** Marco que se abre desde un recorte al entrar en pantalla, con la imagen asentándose despacio. */
function Frame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(6%_4%_6%_4%)] in-[[data-inview]]:[clip-path:inset(0)] motion-reduce:transition-none ${className}`}>
      <div className="size-full transition-[scale] duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] [scale:1.06] in-[[data-inview]]:[scale:1] motion-reduce:transition-none">
        {children}
      </div>
    </div>
  );
}

function Website({ site }: { site: Profile['website'] }) {
  return (
    <a
      href={site.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${label} group focus-ring mt-9 inline-flex items-center gap-2.5 text-forest no-underline`}
    >
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:bg-[length:0%_1px] group-hover:bg-right-bottom">
        {site.label}
      </span>
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
      <span className="sr-only">(sitio oficial, se abre en una pestaña nueva)</span>
    </a>
  );
}

/** Sigla, nombre oficial y datos breves. */
function Identity({ org, index, withMark }: { org: Profile; index: string; withMark: boolean }) {
  const mark = markOf(org.id);
  // sin sigla (un nombre de varias palabras): dos líneas, en minúscula, y el logotipo encima en lugar de al lado
  const long = org.acronym.includes(' ');
  return (
    <div>
      <Eyebrow num={index} className="reveal-fade">Perfil institucional</Eyebrow>
      <div style={delay(0.1)} className={`reveal-fade flex gap-[clamp(16px,2vw,32px)] ${long ? 'flex-col items-start' : 'items-end'}`}>
        {withMark && (
          <img
            src={mark.src}
            width={mark.width}
            height={mark.height}
            alt={`Logotipo de ${org.acronym}`}
            className={`block w-auto shrink-0 ${long ? 'h-[clamp(64px,6vw,96px)]' : 'mb-[0.6%] h-[clamp(56px,6vw,104px)]'}`}
          />
        )}
        {/* la sigla (o el nombre corto) es la firma visual del perfil; el nombre oficial es el encabezado */}
        <p
          aria-hidden="true"
          className={
            'm-0 font-display font-extrabold text-forest ' +
            (long
              ? 'max-w-[9ch] text-[length:clamp(52px,6.2vw,108px)] leading-[0.9] tracking-[-0.04em] max-md:text-[length:clamp(44px,12.4vw,60px)]'
              : 'text-[length:clamp(76px,10.5vw,184px)] uppercase leading-[0.8] tracking-[-0.035em] max-md:text-[length:clamp(64px,21vw,96px)]')
          }
        >
          {org.acronym}
        </p>
      </div>
      {/* con un nombre largo, el logotipo y el nombre en grande ya lo dicen: el encabezado queda solo para lectores de pantalla */}
      <h2 id={`${org.id}-name`} style={delay(0.2)} className={long ? 'sr-only' : 'reveal-fade mt-7 mb-0 max-w-[34ch] text-[length:clamp(17px,1.45vw,22px)] font-semibold uppercase leading-[1.35] tracking-[0.03em] text-forest'}>
        {org.name}
      </h2>
      <p style={delay(0.25)} className={`reveal-fade mb-0 text-[15px] leading-[1.5] text-ink-dim ${long ? 'mt-6' : 'mt-3'}`}>{org.meta.join(' · ')}</p>
    </div>
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

/** Lista secundaria (áreas protegidas, departamentos): el ítem de PANAMOSAB se distingue en verde. */
function Extra({ org }: { org: Profile }) {
  const { title, items, highlight } = org.extra;
  const inline = items.every((a) => a.length <= 16);
  return (
    <div>
      <h3 className={`${label} mt-0 mb-6 text-ink-dim`}>{title}</h3>
      <ul className={`m-0 list-none p-0 ${inline ? 'flex flex-wrap gap-x-7 gap-y-3' : 'grid gap-2.5'}`}>
        {items.map((a) => {
          const here = a === highlight;
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

/** Responsabilidades que el convenio asigna a la organización: mismo bloque en todos los perfiles. */
function Role({ org }: { org: Profile }) {
  return (
    <Reveal className={`${grid} mt-[clamp(72px,12vh,128px)] gap-y-8 border-t border-forest/20 pt-[clamp(32px,5vh,52px)]`}>
      <div className="col-span-4 max-md:col-span-1">
        <h3 style={delay(0)} className={`${blockTitle} reveal-fade m-0 max-w-[12ch] text-forest`}>{org.role.title}</h3>
        <p style={delay(0.1)} className="reveal-fade mt-5 mb-0 max-w-[32ch] text-[14px] leading-[1.55] text-ink-dim">{org.role.source}</p>
      </div>
      <ol className="col-span-8 col-start-5 m-0 grid list-none grid-cols-2 gap-x-[clamp(24px,3vw,48px)] gap-y-9 p-0 max-nav:grid-cols-1 max-nav:gap-y-6 max-md:col-span-1 max-md:col-start-auto">
        {org.role.items.map((item, i) => (
          <li key={item} style={delay(0.15 + i * 0.08)} className="reveal-fade grid grid-cols-[2.4em_1fr] items-baseline text-[18px] leading-[1.5] text-ink max-md:text-[17px]">
            <span aria-hidden="true" className="font-display text-[15px] font-extrabold tracking-[-0.01em] text-gold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            {item}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

/** Perfil con fotografías: identidad y presentación, la fotografía a todo el ancho y, debajo, las listas. */
function PhotoProfile({ org, index, flip }: { org: Profile; index: string; flip: boolean }) {
  const photos = org.photos!;
  // con `flip`, en escritorio: identidad a la derecha y presentación a la izquierda; abajo, la fotografía
  // secundaria pasa a la primera columna. En tablet y móvil se vuelve al orden del documento.
  const reset = 'max-nav:col-start-auto max-nav:row-start-auto';
  return (
    <>
      <Reveal className={`${grid} items-end gap-y-10`}>
        <div className={`max-nav:col-span-12 max-md:col-span-1 ${flip ? `col-span-7 col-start-6 row-start-1 ${reset}` : 'col-span-7'}`}>
          <Identity org={org} index={index} withMark />
        </div>
        <div className={`max-nav:col-span-8 max-nav:col-start-1 max-md:col-span-1 ${flip ? 'col-span-4 col-start-1 row-start-1 max-nav:row-start-auto' : 'col-span-4 col-start-9'}`}>
          <p style={delay(0.3)} className="reveal-fade m-0 text-[length:clamp(18px,1.3vw,20px)] leading-[1.6] text-ink">{org.summary}</p>
          <div style={delay(0.4)} className="reveal-fade">
            <Website site={org.website} />
          </div>
        </div>
      </Reveal>

      <Reveal as="figure" threshold={0.25} className="m-0 mt-[clamp(48px,8vh,88px)] max-md:-mx-gutter">
        <Frame className="aspect-[2/1] max-nav:aspect-[16/9] max-md:aspect-[4/3]">
          <Img photo={photos.main} sizes="(max-width: 820px) 100vw, 92vw" className="object-[50%_42%]" />
        </Frame>
        <figcaption className={`mt-3 text-[13px] leading-[1.5] text-ink-dim max-md:px-gutter max-md:text-left ${flip ? 'text-left' : 'text-right'}`}>{photos.credit}</figcaption>
      </Reveal>

      <Statements org={org} />

      <Reveal className={`${grid} mt-[clamp(64px,10vh,112px)] gap-y-14`}>
        <div className={`col-span-4 max-nav:col-span-6 max-md:col-span-1 ${flip ? `col-start-5 row-start-1 ${reset}` : ''}`}>
          <Areas org={org} />
          {org.figure && (
            <p style={delay(0.45)} className="reveal-fade mt-12 mb-0 flex flex-wrap items-start gap-x-5 gap-y-3 border-t border-rule pt-6">
              <span className="font-display text-[length:clamp(56px,5vw,84px)] font-extrabold leading-[0.82] tracking-[-0.04em] text-moss tabular-nums">{org.figure.value}</span>
              <span className="max-w-[26ch] text-[15px] leading-[1.5] text-ink">{org.figure.label}</span>
            </p>
          )}
        </div>
        <div className={`col-span-4 max-nav:col-span-6 max-md:col-span-1 ${flip ? `col-start-9 row-start-1 ${reset}` : ''}`}>
          <Extra org={org} />
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

/** Perfil sin fotografías: el logotipo grande y las declaraciones institucionales sostienen la composición. */
function StatementProfile({ org, index }: { org: Profile; index: string }) {
  const mark = markOf(org.id);
  return (
    <>
      <Reveal className={`${grid} items-end gap-y-12`}>
        {/* el logotipo, a la izquierda, ocupa el lugar que en el otro perfil tiene la fotografía */}
        <div className={`col-span-4 row-start-1 ${mobile} max-md:order-1`}>
          <img
            src={mark.src}
            width={mark.width}
            height={mark.height}
            alt={`Logotipo de ${org.acronym}`}
            loading="lazy"
            decoding="async"
            style={delay(0.1)}
            className="reveal-fade block h-[clamp(200px,22vw,320px)] w-auto max-md:h-[150px]"
          />
        </div>
        <div className={`col-span-7 col-start-6 row-start-1 ${mobile} max-md:order-0`}>
          <Identity org={org} index={index} withMark={false} />
          <p style={delay(0.3)} className="reveal-fade mt-8 mb-0 max-w-[52ch] text-[length:clamp(18px,1.3vw,20px)] leading-[1.6] text-ink">{org.summary}</p>
          <div style={delay(0.4)} className="reveal-fade">
            <Website site={org.website} />
          </div>
        </div>
      </Reveal>

      <Statements org={org} />

      <Reveal className={`${grid} mt-[clamp(64px,10vh,112px)] gap-y-14`}>
        <div className="col-span-5 max-nav:col-span-6 max-md:col-span-1">
          <Areas org={org} />
        </div>
        <div className="col-span-6 col-start-7 max-nav:col-span-6 max-md:col-span-1 max-md:col-start-auto">
          <Extra org={org} />
        </div>
      </Reveal>

      <Role org={org} />
    </>
  );
}

export function OrgProfile({ org, index, flip = false }: { org: Profile; index: string; flip?: boolean }) {
  const withPhotos = !!org.photos;
  return (
    <article
      id={org.id}
      aria-labelledby={`${org.id}-name`}
      className={`${section} scroll-mt-8 ${withPhotos ? '' : '-mx-gutter bg-sage px-gutter py-[clamp(88px,14vh,160px)]'}`}
    >
      {withPhotos ? <PhotoProfile org={org} index={index} flip={flip} /> : <StatementProfile org={org} index={index} />}
    </article>
  );
}
