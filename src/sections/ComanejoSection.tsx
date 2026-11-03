import { Body, CtaLink, EditorialHeader, Lead } from '../components/editorial';
import CircularCarousel from '../components/react-bits/CircularCarousel';
import { COMANEJO, SIGNATORIES } from '../content/comanejo';
import { url } from '../lib/routes';

const LOGOS = SIGNATORIES.map((s) => ({ src: s.logo, alt: `Logotipo de ${s.name}`, title: s.acronym, subtitle: s.name }));

/**
 * 05 Comanejo en la portada: presentación breve y los logotipos de las cinco instituciones firmantes en un
 * carrusel circular; el desglose está en la página de comanejo. Fondo marfil opaco: cubre las capas WebGL.
 */
export function ComanejoSection() {
  return (
    <section id="comanejo" aria-labelledby="comanejo-title" className="relative z-3 bg-ivory px-gutter pt-[clamp(96px,16vh,180px)] pb-[clamp(72px,12vh,140px)]">
      <EditorialHeader num="05" eyebrow={COMANEJO.eyebrow} title={COMANEJO.homeTitle} titleId="comanejo-title">
        <Lead>{COMANEJO.lead}</Lead>
        <Body>{COMANEJO.teaser}</Body>
        <div className="mt-10">
          <CtaLink href={url('comanejo')}>Conocer el comanejo</CtaLink>
        </div>
      </EditorialHeader>

      <div className="logo-orbit -mx-gutter mt-[clamp(48px,8vh,96px)] h-[clamp(380px,56vh,560px)] text-forest max-md:h-[400px]">
        <CircularCarousel
          items={LOGOS}
          preset="orbit"
          intro="rise"
          cardWidth={220}
          gap={96}
          autoplay="drift"
          speed={9}
          depthFade={0.65}
          fadeColor="#f1f0e8"
          cornerRadius={0}
          parallax={0.15}
          stretch={0.25}
          captions
          ariaLabel="Logotipos de las instituciones firmantes del convenio de comanejo"
          ofText="de"
        />
      </div>
    </section>
  );
}
