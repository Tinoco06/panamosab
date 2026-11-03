import type { OrgProfile as Profile, Photo } from '../content/comanejo';

/* Perfil de una organización comanejadora. Dos composiciones según el material disponible:
   - con fotografías: la imagen principal manda y el detalle acompaña a las listas;
   - sin fotografías: una banda verde con la cita institucional (sin imágenes de relleno).
   `flip` alterna el lado de la columna de responsabilidades para que los perfiles no se repitan. */

const label = 'mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-dim';
const grid = 'grid grid-cols-12 gap-x-[clamp(24px,3.4vw,56px)] max-md:grid-cols-1';
// en móvil cada bloque ocupa la única columna y vuelve al orden del documento (sin columnas implícitas)
const mobile = 'max-md:col-span-1 max-md:col-start-auto max-md:row-start-auto';

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
      className={`block h-auto w-full bg-rule object-cover ${className}`}
    />
  );
}

function Website({ site, onDark = false }: { site: NonNullable<Profile['website']>; onDark?: boolean }) {
  return (
    <a
      href={site.href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        'focus-ring mt-8 inline-flex items-center gap-2 border-b pb-1 text-[12px] font-semibold uppercase tracking-[0.18em] no-underline transition-colors duration-300 ' +
        (onDark ? 'border-hero-cream/50 text-hero-cream hover:border-hero-cream' : 'border-forest/40 text-forest hover:border-forest')
      }
    >
      {site.label}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(sitio oficial, se abre en una pestaña nueva)</span>
    </a>
  );
}

function Identity({ org, onDark = false }: { org: Profile; onDark?: boolean }) {
  const ink = onDark ? 'text-hero-cream' : 'text-forest';
  return (
    <div>
      {org.logo && (
        <img src={org.logo.src} alt={org.logo.alt} width={org.logo.width} height={org.logo.height} className="mb-6 block h-14 w-auto" />
      )}
      {/* la sigla, en grande, es la firma visual del perfil; el nombre oficial es el encabezado */}
      <p aria-hidden="true" className={`m-0 font-display text-[length:clamp(56px,7.2vw,116px)] font-extrabold uppercase leading-[0.86] tracking-[-0.02em] ${ink}`}>
        {org.acronym}
      </p>
      <h2 id={`${org.id}-name`} className={`mt-5 mb-0 max-w-[36ch] text-[length:clamp(16px,1.35vw,20px)] font-semibold uppercase leading-[1.35] tracking-[0.04em] ${ink}`}>
        {org.name}
      </h2>
      <p className={`mt-3 mb-0 text-[11px] font-semibold uppercase tracking-[0.2em] ${onDark ? 'text-hero-cream/75' : 'text-ink-dim'}`}>
        {org.meta.join(' · ')}
      </p>
    </div>
  );
}

function Role({ org }: { org: Profile }) {
  return (
    <div>
      <h3 className="mb-6 text-[length:clamp(22px,1.9vw,30px)] font-medium leading-[1.1] tracking-[-0.02em] text-forest">{org.role.title}</h3>
      <ol className="m-0 list-none p-0">
        {org.role.items.map((item, i) => (
          <li key={item} className="grid grid-cols-[2.4em_1fr] items-baseline border-t border-rule py-[14px] text-[16px] leading-[1.55] text-ink last:border-b">
            <span aria-hidden="true" className="text-[12px] font-semibold tracking-[0.08em] text-ink-dim tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            {item}
          </li>
        ))}
      </ol>
      <p className="mt-4 mb-0 text-[12px] leading-[1.5] text-ink-dim">{org.role.source}</p>
    </div>
  );
}

function Lists({ org }: { org: Profile }) {
  return (
    <div className="grid gap-10">
      <div>
        <h3 className={label}>{org.areas.title}</h3>
        <ul className="m-0 list-none p-0">
          {org.areas.items.map((a) => (
            <li key={a} className="border-t border-rule py-[10px] text-[15px] leading-[1.45] text-ink first:border-t-0 first:pt-0">{a}</li>
          ))}
        </ul>
      </div>
      {org.extra && (
        <div>
          <h3 className={label}>{org.extra.title}</h3>
          <ul className="m-0 list-none p-0">
            {org.extra.items.map((a) => {
              const here = a === org.extra!.highlight;
              return (
                <li key={a} className={`flex items-baseline gap-3 py-[5px] text-[15px] leading-[1.45] ${here ? 'font-semibold text-forest' : 'text-ink'}`}>
                  <span aria-hidden="true" className={`inline-block size-[7px] shrink-0 -translate-y-px rounded-full ${here ? 'bg-forest' : 'border border-ink-dim/60'}`} />
                  {a}
                  {here && <span className="sr-only"> (PANAMOSAB)</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function OrgProfile({ org, flip = false }: { org: Profile; flip?: boolean }) {
  const photos = org.photos;

  if (photos) {
    return (
      <article id={org.id} aria-labelledby={`${org.id}-name`} className="scroll-mt-10">
        <div className={`${grid} items-end`}>
          <figure className={`${mobile} m-0 max-md:-mx-gutter max-md:mb-10 ${flip ? 'col-span-7 col-start-6 row-start-1' : 'col-span-7'}`}>
            <Img photo={photos.main} sizes="(max-width: 820px) 100vw, 58vw" className="aspect-[16/9] object-[60%_50%]" />
          </figure>
          <div className={`${mobile} ${flip ? 'col-span-4 col-start-1 row-start-1' : 'col-span-5'}`}>
            <Identity org={org} />
            <p className="mt-7 mb-0 max-w-[46ch] text-[17px] leading-[1.6] text-ink">{org.summary}</p>
            {org.website && <Website site={org.website} />}
          </div>
        </div>

        <div className={`${grid} mt-[clamp(56px,9vh,104px)] gap-y-14`}>
          <div className="col-span-5 max-nav:col-span-7 max-md:col-span-1">
            <Role org={org} />
          </div>
          <div className="col-span-4 max-nav:col-span-5 max-md:col-span-1">
            <Lists org={org} />
          </div>
          {photos.detail && (
            <figure className="col-span-3 m-0 max-nav:col-span-6 max-md:col-span-1">
              <Img photo={photos.detail} sizes="(max-width: 820px) 100vw, (max-width: 1100px) 50vw, 24vw" className="aspect-[4/5]" />
              <figcaption className="mt-3 text-[12px] leading-[1.5] text-ink-dim">{photos.credit}</figcaption>
            </figure>
          )}
        </div>
      </article>
    );
  }

  return (
    <article id={org.id} aria-labelledby={`${org.id}-name`} className="scroll-mt-10">
      {/* banda a todo el ancho: identidad y cita institucional */}
      <div className="-mx-gutter bg-hero-deep px-gutter py-[clamp(56px,10vh,112px)]">
        <div className={`${grid} items-end gap-y-12`}>
          <div className="col-span-5 max-md:col-span-1">
            <Identity org={org} onDark />
            {org.website && <Website site={org.website} onDark />}
          </div>
          {org.quote && (
            <figure className="col-span-6 col-start-7 m-0 max-md:col-span-1">
              <span aria-hidden="true" className="block font-display text-[64px] leading-[0.6] text-gold">“</span>
              <blockquote className="m-0 mt-4 text-[length:clamp(21px,1.9vw,30px)] font-medium leading-[1.35] tracking-[-0.01em] text-hero-cream">
                {org.quote.text}
              </blockquote>
              <figcaption className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{org.quote.attribution}</figcaption>
            </figure>
          )}
        </div>
      </div>

      <div className={`${grid} mt-[clamp(56px,9vh,104px)] gap-y-14`}>
        {/* en móvil, primero la presentación y después las responsabilidades */}
        <div className={`${mobile} max-md:order-2 ${flip ? 'col-span-5 col-start-8 row-start-1 max-nav:col-span-6 max-nav:col-start-7' : 'col-span-5'}`}>
          <Role org={org} />
        </div>
        <div className={`${mobile} max-md:order-1 ${flip ? 'col-span-6 col-start-1 row-start-1' : 'col-span-6 col-start-7'}`}>
          <p className="mt-0 mb-10 max-w-[52ch] text-[17px] leading-[1.6] text-ink">{org.summary}</p>
          <Lists org={org} />
        </div>
      </div>
    </article>
  );
}
