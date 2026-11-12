import { useLayoutEffect, useRef } from 'react';
import type { PageRefs } from '../app/pageRefs';
import { CountUp } from '../components/CountUp';
import { Eyebrow } from '../components/Eyebrow';
import { PARQUE } from '../content/parque';
import { stackRadius, TERR_STACK } from '../three/config';

/**
 * 02 El Territorio: la cámara se eleva sobre el macizo. La sección da recorrido al scroll (260vh) con el escenario
 * fijo mientras la cámara avanza. El texto vive sobre papel (lo dibuja el motor 3D) y cierra con la superficie del
 * área protegida, en grande.
 * - Escritorio y tablets en horizontal: texto a la izquierda, en un claro de niebla; el territorio a la derecha.
 * - Móvil (≤ 820 px): el mapa arriba, en su hueco (el motor encaja ahí el macizo), y el texto completo debajo.
 * - Si el texto no cabe en el escenario junto al mapa (pantallas bajas, móvil en horizontal), el escenario muestra
 *   solo el mapa y el texto lo sigue debajo, con scroll normal (data-fit="flow").
 * El CSS decide la composición y se la comunica al motor con --terr-stack; el motor no la deduce por su cuenta.
 */
export function TerritorySection({ refs }: { refs: PageRefs }) {
  const A = PARQUE.area;
  const probe = useRef<HTMLDivElement>(null);

  // ¿Cabe la columna en el escenario? Se decide al montar, al cambiar el tamaño de la pantalla (o girarla) y al
  // cargar las fuentes, siempre midiendo en la composición con la columna dentro (por eso primero se vuelve a ella:
  // ambas escrituras ocurren antes de pintar). La altura de referencia es 100svh, que no cambia con las barras del
  // navegador al hacer scroll.
  useLayoutEffect(() => {
    const section = refs.territory.current!, stage = refs.territoryStage.current!;
    const map = refs.territoryMap.current!, col = refs.territoryColumn.current!, svh = probe.current!;
    let key = '';
    const decide = (force = false) => {
      const w = window.innerWidth, h = svh.offsetHeight, k = `${w}x${h}`;
      if (!force && k === key) return;
      key = k;
      section.dataset.fit = 'stage';
      let flow: boolean;
      if (getComputedStyle(stage).getPropertyValue('--terr-stack').trim() === '1') {
        // mapa arriba: el macizo, encajado en lo que deja el texto, debe conservar su presencia
        const d = 2 * stackRadius(map.clientWidth, map.clientHeight) * TERR_STACK.extent;
        flow = d < Math.min(TERR_STACK.minWidth * map.clientWidth, TERR_STACK.minPx);
      } else {
        // texto a la izquierda: la columna (con su margen superior) debe caber en el escenario
        flow = col.offsetHeight + parseFloat(getComputedStyle(col).marginTop) + 32 > stage.clientHeight;
      }
      section.dataset.fit = flow ? 'flow' : 'stage';
    };
    decide(true);
    const onResize = () => decide();
    window.addEventListener('resize', onResize);
    let live = true;
    document.fonts?.ready.then(() => { if (live) decide(true); });
    return () => { live = false; window.removeEventListener('resize', onResize); };
    // las referencias (useRef) son estables: se mide una vez por montaje y después en cada cambio de tamaño
  }, [refs.territory, refs.territoryStage, refs.territoryMap, refs.territoryColumn]);

  return (
    <section ref={refs.territory} id="territorio" aria-labelledby="territorio-title" data-fit="stage" className="group/terr relative z-3">
      {/* alto de referencia (100svh) para decidir la composición */}
      <div ref={probe} aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0 h-svh w-px" />
      <div
        ref={refs.territoryStage}
        className={
          'sticky top-0 flex h-svh items-center px-gutter [--terr-stack:0] ' +
          'max-md:flex-col max-md:items-stretch max-md:[--terr-stack:1] ' +
          // texto fuera del escenario (data-fit="flow" en la sección): también apilada
          'group-data-[fit=flow]/terr:h-auto group-data-[fit=flow]/terr:flex-col group-data-[fit=flow]/terr:items-stretch group-data-[fit=flow]/terr:[--terr-stack:1]'
        }
      >
        {/* Hueco invisible del mapa (composición apilada): el motor encaja el macizo aquí; el papel empieza debajo */}
        <div
          ref={refs.territoryMap}
          aria-hidden="true"
          className="-mx-gutter hidden max-md:block max-md:min-h-0 max-md:flex-1 group-data-[fit=flow]/terr:block group-data-[fit=flow]/terr:h-svh group-data-[fit=flow]/terr:flex-none"
        />
        <div
          ref={refs.territoryColumn}
          data-terr="column"
          className={
            'mt-[6vh] w-[min(31vw,450px)] max-md:mt-0 max-md:w-full max-md:pt-3 ' +
            // con el texto en el escenario, abajo queda libre el sitio del botón «Volver arriba» (fijo, 48 px)
            'max-md:group-data-[fit=stage]/terr:pb-[calc(clamp(20px,3.2vh,36px)+56px+var(--spacing-safe-b))] ' +
            'group-data-[fit=flow]/terr:mt-0 group-data-[fit=flow]/terr:w-full group-data-[fit=flow]/terr:max-w-[640px] group-data-[fit=flow]/terr:pt-3 group-data-[fit=flow]/terr:pb-[clamp(72px,12vh,128px)]'
          }
        >
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

        <p
          data-terr="credit"
          className="absolute right-gutter bottom-[18px] m-0 text-[10px] text-warm/78 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)] max-md:top-3 max-md:bottom-auto max-md:text-[9px] group-data-[fit=flow]/terr:top-3 group-data-[fit=flow]/terr:bottom-auto"
        >
          Imagen: Esri, Maxar, Earthstar Geographics · Relieve: AWS Terrain Tiles
        </p>
      </div>
      {/* recorrido del scroll con el escenario fijo: 260vh en total con un escenario de 100svh */}
      <div aria-hidden="true" className="h-[calc(260vh-100svh)]" />
    </section>
  );
}
