import { Aim } from '../components/comanejo/Aim';
import { Intro } from '../components/comanejo/Intro';
import { OrgProfile } from '../components/comanejo/OrgProfile';
import { Signatories } from '../components/comanejo/Signatories';
import { Sources } from '../components/editorial';
import { COMANEJO, PROFILES } from '../content/comanejo';

/**
 * Página de comanejo. El título anuncia el recorrido: «Cinco instituciones» (la franja de firmantes) y
 * «un compromiso con la montaña» (el objetivo de manejo que comparten); después, el perfil de cada
 * organización con información respaldada. Ritmo de fondos: marfil · verde bosque · marfil (ASIDE) ·
 * salvia (CASM) · marfil (Árbol de Misericordia).
 */
export function ComanejoPage() {
  return (
    <>
      <Intro />
      <Signatories />
      <Aim />
      {PROFILES.map((org, i) => (
        <OrgProfile
          key={org.id}
          org={org}
          index={String(i + 1).padStart(2, '0')}
          // los perfiles con fotografías alternan de lado: el segundo, el cuarto… se invierten
          flip={!!org.photos && PROFILES.slice(0, i).filter((p) => p.photos).length % 2 === 1}
        />
      ))}
      <Sources>{COMANEJO.sources}</Sources>
    </>
  );
}
