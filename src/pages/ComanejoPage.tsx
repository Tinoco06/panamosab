import { Aim } from '../components/comanejo/Aim';
import { Intro } from '../components/comanejo/Intro';
import { OrgProfile, type Tone } from '../components/comanejo/OrgProfile';
import { Signatories } from '../components/comanejo/Signatories';
import { Sources } from '../components/editorial';
import { COMANEJO, PROFILES } from '../content/comanejo';

/*
 * Ritmo de fondos de los perfiles (después de la banda verde bosque del objetivo de manejo): el ICF, en marfil,
 * lleva su propia placa verde con el logotipo oficial; ASIDE marfil; CASM salvia; CODEMUSSBA marfil; Árbol de
 * Misericordia salvia. Sin entrada aquí, un perfil nuevo toma marfil (con fotografías) o salvia (sin ellas).
 */
const TONES: Record<string, Tone> = { icf: 'ivory', aside: 'ivory', casm: 'sage', codemussba: 'ivory', arbol: 'sage' };

/**
 * Página de comanejo. El título anuncia el recorrido: «Cinco instituciones» (la franja de firmantes) y
 * «un compromiso con la montaña» (el objetivo de manejo que comparten); después, el perfil de cada
 * organización con información respaldada, en el orden de la franja.
 */
export function ComanejoPage() {
  return (
    <>
      <Intro />
      <Signatories />
      <Aim />
      {PROFILES.map((org, i) => {
        // cada tipo de perfil alterna su lado: con fotografías, el segundo, el cuarto…; sin ellas, el primero, el tercero…
        const before = PROFILES.slice(0, i).filter((p) => !!p.photos === !!org.photos).length;
        return (
          <OrgProfile
            key={org.id}
            org={org}
            index={String(i + 1).padStart(2, '0')}
            flip={org.photos ? before % 2 === 1 : before % 2 === 0}
            tone={TONES[org.id]}
          />
        );
      })}
      <Sources>{COMANEJO.sources}</Sources>
    </>
  );
}
