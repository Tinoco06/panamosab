import type { PageRefs } from '../app/pageRefs';
import { CountUp } from '../components/CountUp';
import { Eyebrow } from '../components/Eyebrow';
import { PARQUE } from '../content/parque';

/**
 * 02 El Territorio: la cámara se eleva sobre el macizo. La sección es alta para dar recorrido al scroll;
 * el escenario queda fijo mientras la cámara avanza. El texto vive en un claro de niebla (lo dibuja el
 * motor 3D) y cierra con la superficie del área protegida, en grande. En móvil el terreno ocupa la parte
 * alta y el texto, abajo, se reduce a un párrafo y la cifra.
 */
export function TerritorySection({ refs }: { refs: PageRefs }) {
  const A = PARQUE.area;
  return (
    <section ref={refs.territory} id="territorio" aria-labelledby="territorio-title" className="relative z-3 h-[260vh]">
      <div ref={refs.territoryStage} className="sticky top-0 flex h-svh items-center px-gutter max-md:items-end max-md:pb-[7vh]">
        <div ref={refs.territoryColumn} className="mt-[6vh] w-[min(31vw,450px)] max-md:mt-0 max-md:w-full">
          <Eyebrow num="02" className="max-md:mb-4">El Territorio</Eyebrow>
          <h2
            id="territorio-title"
            className="mb-7 max-w-[13ch] text-[length:clamp(36px,3.9vw,64px)] font-medium leading-[1.02] tracking-[-0.03em] text-forest max-md:mb-[18px] max-md:text-[length:clamp(28px,7.6vw,40px)]"
          >
            Una montaña que guarda mucho más de lo que vemos.
          </h2>
          <p className="mb-4 text-[18px] leading-[1.6] text-ink max-md:m-0 max-md:text-[16px]">
            La Montaña de Santa Bárbara es mucho más que un paisaje. Sus bosques, su relieve y sus ecosistemas forman parte de un territorio esencial para la vida de las comunidades que lo rodean.
          </p>

          {/* superficie del área protegida: la cifra protagonista de 02 */}
          <figure className="mt-[clamp(28px,5vh,52px)] mb-0 border-t border-forest/20 pt-[clamp(16px,2.6vh,26px)] max-md:mt-6 max-md:pt-4">
            <figcaption className="text-[11px] font-semibold uppercase tracking-[0.26em] text-moss">{A.label}</figcaption>
            <p className="mt-2 mb-0 flex items-baseline gap-3 whitespace-nowrap">
              <CountUp
                value={A.value}
                decimals={2}
                className="font-display text-[length:clamp(52px,5.4vw,96px)] font-extrabold leading-[0.9] tracking-[-0.035em] text-forest max-md:text-[length:clamp(40px,12vw,56px)]"
              />
              <span className="text-[13px] font-semibold uppercase tracking-[0.2em] text-moss">{A.unit}</span>
            </p>
          </figure>
        </div>

        <p className="absolute right-gutter bottom-[18px] m-0 text-[10px] text-warm/78 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)] max-md:top-3 max-md:bottom-auto max-md:text-[9px]">
          Imagen: Esri, Maxar, Earthstar Geographics · Relieve: AWS Terrain Tiles
        </p>
      </div>
    </section>
  );
}
