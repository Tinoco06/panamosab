import { Body, grid12, Sources } from '../components/editorial';
import { Eyebrow } from '../components/Eyebrow';
import { PARQUE } from '../content/parque';

/**
 * 04 Agua: los cuatro municipios que abastece la montaña, sobre fondo azul lago. Las líneas del fondo son un
 * motivo decorativo (no un mapa). Fondo opaco: cubre las capas WebGL fijas.
 */
export function WaterSection() {
  const W = PARQUE.water;
  return (
    <section id="agua" aria-labelledby="agua-title" className="relative z-3 overflow-hidden bg-lake px-gutter py-[clamp(96px,16vh,180px)]">
      {/* corrientes: cuatro trazos suaves que cruzan la sección */}
      <svg aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full text-water/10">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M-20 ${150 + i * 90} C 260 ${90 + i * 95}, 420 ${260 + i * 80}, 700 ${190 + i * 88} S 1060 ${120 + i * 92}, 1220 ${210 + i * 86}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === 1 ? 2 : 1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className={`${grid12} relative gap-y-14`}>
        <div className="col-span-5 max-md:col-span-1">
          <Eyebrow num="04">{W.eyebrow}</Eyebrow>
          <h2 id="agua-title" className="mt-0 mb-7 max-w-[11ch] text-[length:clamp(36px,3.9vw,64px)] font-medium leading-[1.02] tracking-[-0.03em] text-water max-md:text-[length:clamp(32px,8.4vw,44px)]">
            {W.title}
          </h2>
          <Body className="max-w-[44ch] text-ink">{W.body}</Body>
        </div>
        <ol className="col-span-7 col-start-6 m-0 grid list-none grid-cols-2 gap-x-[clamp(24px,3vw,48px)] p-0 max-md:col-span-1 max-md:grid-cols-1">
          {W.places.map((p, i) => (
            <li key={p} className="border-t border-water/25 pt-5 pb-10 max-md:pb-6">
              <span aria-hidden="true" className="block text-[12px] font-semibold tracking-[0.12em] text-water/80 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="mt-3 block text-[length:clamp(30px,3.4vw,54px)] font-medium leading-[1.02] tracking-[-0.025em] text-water">{p}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative">
        <Sources>{PARQUE.sources}</Sources>
      </div>
    </section>
  );
}
