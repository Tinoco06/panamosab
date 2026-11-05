/* Entrada de las páginas interiores (todas salvo la portada). Cada HTML generado indica su página en
   <div id="root" data-page="…">. No carga el motor 3D ni los datos del relieve. */
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { page, type PageId } from './lib/routes';
import { BiodiversidadPage } from './pages/BiodiversidadPage';
import { ComanejoPage } from './pages/ComanejoPage';
import { ContactoPage } from './pages/ContactoPage';
import { PendingPage } from './pages/PendingPage';
import { TurismoPage } from './pages/TurismoPage';
import './styles/index.css';

function Content({ id }: { id: PageId }) {
  switch (id) {
    case 'comanejo': return <ComanejoPage />;
    case 'biodiversidad': return <BiodiversidadPage />;
    case 'turismo': return <TurismoPage />;
    case 'contacto': return <ContactoPage />;
    // una sección nueva sin contenido validado (`ready: false` en pages.json) muestra el aviso «en preparación»
    default: return <PendingPage info={page(id)} />;
  }
}

function InnerApp({ id }: { id: PageId }) {
  // enlaces con ancla desde otra página (p. ej. /comanejo/#casm): el contenido se dibuja después de que el
  // navegador intenta el salto, así que se repite al montar
  useEffect(() => {
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }, []);

  return (
    <>
      <a href="#contenido" className="focus-ring sr-only z-30 bg-ivory px-4 py-3 text-forest focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Saltar al contenido
      </a>
      <Header current={id} />
      <main id="contenido" className="relative px-gutter pt-[clamp(56px,12vh,128px)] pb-[clamp(96px,16vh,180px)]">
        <Content id={id} />
      </main>
      <Footer current={id} />
    </>
  );
}

const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <InnerApp id={root.dataset.page as PageId} />
  </StrictMode>,
);
