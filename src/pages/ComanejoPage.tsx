import { Body, EditorialHeader, Facts, Lead, Sources } from '../components/editorial';
import { OrgProfile } from '../components/OrgProfile';
import { SignatoryList } from '../components/SignatoryList';
import { COMANEJO, PROFILES } from '../content/comanejo';

/** Página de comanejo: la alianza completa y el perfil de cada organización con información respaldada. */
export function ComanejoPage() {
  return (
    <>
      <EditorialHeader as="h1" large eyebrow={COMANEJO.eyebrow} title={COMANEJO.title}>
        <Lead>{COMANEJO.lead}</Lead>
        <Body>{COMANEJO.body}</Body>
        <Facts items={COMANEJO.facts} />
      </EditorialHeader>

      {/* objetivo de manejo (cita textual del convenio) */}
      <figure className="mx-auto mt-[clamp(72px,13vh,140px)] mb-0 max-w-[60rem] text-center">
        <blockquote className="m-0 text-[length:clamp(22px,2.2vw,34px)] font-medium leading-[1.35] tracking-[-0.015em] text-forest">
          “{COMANEJO.aim.text}”
        </blockquote>
        <figcaption className="mx-auto mt-6 max-w-[44ch] text-[11px] font-semibold uppercase leading-[1.6] tracking-[0.2em] text-ink-dim">
          {COMANEJO.aim.attribution}
        </figcaption>
      </figure>

      <div className="mt-[clamp(72px,13vh,140px)]">
        <SignatoryList profileHref={(id) => `#${id}`} />
      </div>

      <div className="mt-[clamp(96px,16vh,180px)] grid gap-[clamp(112px,18vh,200px)]">
        {PROFILES.map((org, i) => (
          <OrgProfile key={org.id} org={org} flip={i % 2 === 1} />
        ))}
      </div>

      <Sources>{COMANEJO.sources}</Sources>
    </>
  );
}
