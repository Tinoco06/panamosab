import { Reveal } from '../components/Reveal';
import { delay, display, label } from '../components/ui';
import { page, url, type PageId } from '../lib/routes';

// una línea por sección: lo que el visitante encontrará, sin datos nuevos
const LINKS: { id: PageId; text: string }[] = [
  { id: 'comanejo', text: 'Las cinco instituciones que comparten la gestión y la conservación del parque.' },
  { id: 'biodiversidad', text: 'Una montaña llena de vida: su flora, el quetzal y la salamandra narizona.' },
  { id: 'turismo', text: 'Lugares y actividades de turismo de naturaleza que menciona el Plan de Manejo.' },
  { id: 'contacto', text: 'Los sitios oficiales de las instituciones del comanejo.' },
];

/**
 * Cierre de la portada: un índice de las otras cuatro secciones, en filas con filete fino (sin tarjetas). Al
 * señalar una fila, el nombre cambia a verde musgo y la flecha avanza. Fondo marfil opaco: cubre las capas WebGL.
 */
export function ExploreSection() {
  return (
    <Reveal as="section" aria-labelledby="explorar-title" threshold={0.2} className="relative z-3 bg-ivory px-gutter pb-[clamp(88px,14vh,160px)]">
      <h2 id="explorar-title" style={delay(0)} className={`${label} reveal-fade m-0 border-t border-forest/20 pt-5 text-ink-dim`}>Sigue explorando</h2>
      <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-[clamp(24px,3.4vw,56px)] p-0 max-md:grid-cols-1">
        {LINKS.map((l, i) => (
          <li key={l.id} style={delay(0.1 + i * 0.08)} className="reveal-fade border-b border-rule">
            <a href={url(l.id)} className="group focus-ring grid grid-cols-[1fr_auto] items-end gap-x-6 py-[clamp(24px,4vh,40px)] no-underline">
              <span>
                <span className={`${display} block text-[length:clamp(36px,4vw,64px)] leading-[0.95] tracking-[-0.04em] text-forest transition-colors duration-300 group-hover:text-moss`}>
                  {page(l.id).label}
                </span>
                <span className="mt-3 block max-w-[44ch] text-[16px] leading-[1.5] text-ink-dim">{l.text}</span>
              </span>
              <span aria-hidden="true" className="pb-1 text-[28px] leading-none text-forest transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
