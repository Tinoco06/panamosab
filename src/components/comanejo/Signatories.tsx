import { COMANEJO, PROFILES, SIGNATORIES } from '../../content/comanejo';
import { onAnchorClick } from '../../lib/smoothScroll';
import { Reveal } from '../Reveal';
import { delay, label, section } from '../ui';

/**
 * Franja de las cinco instituciones firmantes: logotipo oficial, sigla y nombre completo, con el mismo
 * espacio para cada una. Solo las que tienen perfil publicado (PROFILES) enlazan a él en esta página; el
 * resto se identifica sin enlace.
 */
export function Signatories() {
  const profiled = new Set(PROFILES.map((p) => p.id));
  return (
    <Reveal as="section" aria-labelledby="firmantes-title" className={section}>
      <h2 id="firmantes-title" className={`${label} m-0 text-ink-dim`}>{COMANEJO.signatoriesTitle}</h2>
      <ul className="m-0 mt-[clamp(32px,5vh,56px)] grid list-none grid-cols-5 gap-x-[clamp(20px,2.6vw,44px)] p-0 max-nav:grid-cols-3 max-nav:gap-y-14 max-md:grid-cols-1 max-md:gap-y-0">
        {SIGNATORIES.map((s, i) => {
          const linked = s.profileId && profiled.has(s.profileId);
          const body = (
            <>
              {/* el logotipo se alinea por abajo: todas las siglas empiezan a la misma altura */}
              <span className="flex h-[clamp(72px,6.4vw,100px)] items-end max-md:h-[60px] max-md:w-[92px] max-md:shrink-0 max-md:items-center max-md:justify-center">
                <img
                  src={s.mark.src}
                  width={s.mark.width}
                  height={s.mark.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block h-auto max-h-full w-auto max-w-[min(100%,184px)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 motion-reduce:transition-none"
                />
              </span>
              <span className="mt-7 block border-t border-rule pt-4 max-md:mt-0 max-md:border-t-0 max-md:pt-0">
                <span className="block text-[18px] font-semibold leading-tight text-forest">{s.acronym}</span>
                <span className="mt-1.5 block text-[14px] leading-[1.5] text-ink-dim">{s.name}</span>
                {linked && (
                  <span className={`${label} mt-4 inline-flex items-center gap-2 text-forest`}>
                    <span className="border-b border-forest/40 pb-0.5 transition-colors duration-300 group-hover:border-forest">Ver perfil</span>
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                  </span>
                )}
              </span>
            </>
          );
          const row = 'flex flex-col max-md:flex-row max-md:items-center max-md:gap-5 max-md:border-b max-md:border-rule max-md:py-5';
          return (
            <li key={s.acronym} style={delay(0.08 * i)} className="reveal-fade">
              {linked ? (
                <a href={`#${s.profileId}`} onClick={onAnchorClick} className={`group focus-ring no-underline ${row}`} aria-label={`${s.acronym}, ${s.name}: ver perfil`}>
                  {body}
                </a>
              ) : (
                <div className={row}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
