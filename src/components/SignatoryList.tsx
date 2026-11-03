import { PROFILES, SIGNATORIES } from '../content/comanejo';

/**
 * Las cinco instituciones firmantes del convenio. Solo enlazan las que tienen perfil publicado;
 * `profileHref` decide adónde (ancla en la misma página o la página de comanejo).
 */
export function SignatoryList({ profileHref, linkLabel = 'Ver perfil', arrow = '↓', headingAs: H = 'h2' }: {
  profileHref: (id: string) => string; linkLabel?: string; arrow?: string; headingAs?: 'h2' | 'h3';
}) {
  const profiled = new Set(PROFILES.map((p) => p.id));
  return (
    <div>
      <H className="mb-0 pb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-dim">Instituciones firmantes del convenio</H>
      <ul className="m-0 grid list-none grid-cols-5 border-y border-rule p-0 max-nav:grid-cols-1 max-nav:border-b-0">
        {SIGNATORIES.map((s) => {
          const linked = s.profileId && profiled.has(s.profileId);
          return (
            <li
              key={s.acronym}
              className="flex flex-col gap-2 border-l border-rule px-5 py-6 first:border-l-0 first:pl-0 max-nav:grid max-nav:grid-cols-[minmax(0,11rem)_1fr_auto] max-nav:items-baseline max-nav:gap-4 max-nav:border-b max-nav:border-l-0 max-nav:px-0 max-nav:py-4 max-md:grid-cols-1 max-md:gap-1"
            >
              <span className="text-[17px] font-semibold leading-tight tracking-[0.01em] text-forest">{s.acronym}</span>
              <span className="text-[13px] leading-[1.45] text-ink-dim">{s.name}</span>
              {linked && (
                <a
                  href={profileHref(s.profileId!)}
                  className="focus-ring mt-auto self-start justify-self-start border-b border-forest/40 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest no-underline hover:border-forest max-nav:pt-0"
                >
                  {linkLabel}<span className="sr-only"> de {s.acronym}</span> <span aria-hidden="true">{arrow}</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
