import { NAV, url, type PageId } from '../lib/routes';

/** Pie común a todas las páginas: marca, mapa del sitio y créditos de las fuentes geográficas. */
export function Footer({ current }: { current?: PageId }) {
  return (
    <footer className="relative z-3 bg-hero-deep px-gutter pt-[clamp(56px,9vh,96px)] pb-10 text-hero-cream">
      <div className="grid grid-cols-12 gap-x-[clamp(24px,3.4vw,56px)] gap-y-12 max-md:grid-cols-1">
        <div className="col-span-5 max-md:col-span-1">
          <a href={url('inicio')} className="focus-ring text-[13px] font-semibold tracking-[0.32em] text-hero-cream no-underline">
            PANAMOSAB<span className="sr-only"> — Inicio</span>
          </a>
          <p className="mt-5 mb-0 max-w-[32ch] text-[15px] leading-[1.6] text-hero-cream/75">
            Parque Nacional Montaña de Santa Bárbara · Santa Bárbara, Honduras
          </p>
        </div>
        <nav aria-label="Mapa del sitio" className="col-span-6 col-start-7 max-md:col-span-1">
          <ul className="m-0 grid list-none grid-cols-2 gap-x-8 gap-y-3 p-0">
            {NAV.map((p) => (
              <li key={p.id}>
                <a
                  href={url(p.id)}
                  aria-current={p.id === current ? 'page' : undefined}
                  className="focus-ring text-[13px] font-medium uppercase tracking-[0.14em] text-hero-cream/85 no-underline hover:text-hero-cream aria-[current=page]:text-gold"
                >
                  {p.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-[clamp(48px,8vh,80px)] mb-0 border-t border-hero-cream/15 pt-6 text-[11px] leading-[1.6] text-hero-cream/60">
        Relieve: AWS Terrain Tiles · Imagen aérea: Esri, Maxar, Earthstar Geographics
      </p>
    </footer>
  );
}
