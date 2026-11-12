import { useEffect, useRef, useState } from 'react';
import { BackToTop } from '../components/BackToTop';
import { Footer } from '../components/Footer';
import { Loader } from '../components/Loader';
import { ComanejoSection } from '../sections/ComanejoSection';
import { HeroSection } from '../sections/HeroSection';
import { ParkSection } from '../sections/ParkSection';
import { TerritorySection } from '../sections/TerritorySection';
import { WaterSection } from '../sections/WaterSection';
import { ZonesSection } from '../sections/ZonesSection';
import { createExperience, type Experience } from '../three/engine';
import { resolveRefs, usePageRefs } from './pageRefs';

export type Status = 'loading' | 'ready' | 'error';

// Capas fijas a pantalla completa. De atrás hacia delante: cielo (0) · terreno (2) · contenido (3) ·
// niebla delantera (4, por encima del texto y sin capturar eventos) · menú compacto abierto (20)
// `webgl-layer` (index.css): alto de la pantalla grande (lvh), no `inset-0`, para que las barras de Safari al
// aparecer y desaparecer no cambien el tamaño de los canvas durante el scroll
const layer = 'webgl-layer';
const LAYERS = { sky: `${layer} z-0`, scene: `${layer} z-2`, mist: `${layer} z-4` };

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const layerHost = useRef<HTMLDivElement>(null);
  const refs = usePageRefs();
  const [status, setStatus] = useState<Status>('loading');

  // El motor 3D se crea una vez y vive fuera del ciclo de render de React (crea sus propios canvas en
  // layerHost). Con StrictMode (desarrollo) el efecto se monta, desmonta y vuelve a montar: dispose() lo
  // deja todo limpio —canvas, contextos WebGL, listeners y animaciones— antes del segundo montaje.
  useEffect(() => {
    let experience: Experience | null = null;
    try {
      experience = createExperience(
        { root: root.current!, layerHost: layerHost.current!, ...resolveRefs(refs) },
        LAYERS,
        { onReady: () => setStatus('ready'), onError: () => setStatus('error') },
      );
    } catch (err) {
      // sin WebGL: la página sigue siendo legible, sin el relieve
      console.error(err);
      setStatus('error');
    }
    return () => experience?.dispose();
    // sin dependencias a propósito: las referencias son estables y el motor se crea una vez por montaje
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-loading', status === 'loading');
  }, [status]);

  return (
    <div ref={root} data-status={status}>
      {/* las capas WebGL (cielo · terreno · niebla) las crea y retira el motor */}
      <div ref={layerHost} />

      <main className="relative">
        <HeroSection refs={refs} />
        <ParkSection refs={refs} />
        <TerritorySection refs={refs} />
        {/* el relato sigue sobre fondos opacos: el motor deja de dibujar al pasar El Territorio */}
        <ZonesSection />
        <WaterSection />
        <ComanejoSection />
      </main>
      <Footer current="inicio" />
      <BackToTop />

      <Loader status={status} />
    </div>
  );
}
