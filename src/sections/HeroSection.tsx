import type { PageRefs } from '../app/pageRefs';
import { Header } from '../components/Header';
import { HeroTitle } from '../components/HeroTitle';
import { ScrollIndicator } from '../components/ScrollIndicator';

/** Portada: el paisaje lo dibuja el motor 3D en los canvas fijos; aquí solo va la interfaz. */
export function HeroSection({ refs }: { refs: PageRefs }) {
  return (
    <section
      ref={refs.hero}
      id="hero"
      aria-label="Portada"
      // móvil en horizontal (pantallas muy bajas): el hero ocupa exactamente la pantalla
      className="relative h-svh min-h-[560px] [@media(max-height:500px)]:min-h-0 in-[[data-status=error]]:bg-hero-mist"
    >
      {/* interfaz pequeña: se retira con el scroll; con el menú compacto abierto pasa por delante de todo */}
      <div ref={refs.heroChrome} className="absolute inset-0 z-3 max-nav:in-[.nav-open]:z-20">
        <Header home current="inicio" />
        <ScrollIndicator />
        <p
          data-intro="cue"
          className="absolute right-gutter bottom-[clamp(24px,5vh,48px)] m-0 text-[10px] tracking-[0.02em] text-hero-cream/60 max-md:bottom-[calc(12px+var(--spacing-safe-b))] max-md:left-gutter max-md:text-[10px] in-[[data-status=error]]:text-hero-deep/70"
        >
          Relieve: AWS Terrain Tiles · Imagen: Esri, Maxar, Earthstar Geographics
        </p>
      </div>

      <HeroTitle titleRef={refs.heroTitle} />
    </section>
  );
}
