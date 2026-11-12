import { Aim } from '../components/comanejo/Aim';
import { Intro } from '../components/comanejo/Intro';
import { OrgProfile, type Tone } from '../components/comanejo/OrgProfile';
import { Signatories } from '../components/comanejo/Signatories';
import { Frame, Img } from '../components/media/Photo';
import { Reveal } from '../components/Reveal';
import { COMANEJO, PROFILES } from '../content/comanejo';

/*
 * Ritmo de fondos de los perfiles (después de la banda verde bosque del objetivo de manejo): ICF marfil; ASIDE
 * marfil; CASM salvia; CODEMUSSBA marfil; Árbol de Misericordia salvia. Sin entrada aquí, un perfil nuevo toma
 * marfil (con fotografías) o salvia (sin ellas).
 */
const TONES: Record<string, Tone> = { icf: 'ivory', aside: 'ivory', casm: 'sage', codemussba: 'ivory', arbol: 'sage' };

/**
 * Página de comanejo. El título anuncia el recorrido: «Cinco instituciones» (la franja de firmantes) y
 * «un compromiso con la montaña» (la vista aérea a todo el ancho y el objetivo de manejo que comparten);
 * después, el perfil de cada organización con información respaldada, en el orden de la franja.
 */
export function ComanejoPage() {
  return (
    <>
      <Intro />
      {/* la montaña que el convenio protege, a todo el ancho */}
      <Reveal as="figure" threshold={0.15} className="-mx-gutter mt-[clamp(72px,12vh,136px)] mb-0">
        <Frame className="h-[clamp(360px,68vh,760px)] max-md:h-[62svh]">
          <Img photo={COMANEJO.landscape} sizes="100vw" className="object-[50%_45%]" />
        </Frame>
      </Reveal>
      <Signatories />
      <Aim />
      {PROFILES.map((org, i) => {
        // entre los perfiles con fotografías, la segunda foto alterna de lado: el segundo, el cuarto…
        const before = PROFILES.slice(0, i).filter((p) => !!p.photos).length;
        return (
          <OrgProfile
            key={org.id}
            org={org}
            index={String(i + 1).padStart(2, '0')}
            flip={before % 2 === 1}
            tone={TONES[org.id]}
          />
        );
      })}
    </>
  );
}
