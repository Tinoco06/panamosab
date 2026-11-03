import type { Status } from '../app/App';

/**
 * Mientras carga, la niebla animada hace de pantalla de carga: el aviso solo lo leen los lectores de
 * pantalla. Si el relieve no puede mostrarse, el mensaje sí se ve.
 */
export function Loader({ status }: { status: Status }) {
  const error = status === 'error';
  return (
    <div
      aria-live="polite"
      className={
        'pointer-events-none fixed bottom-[18vh] left-1/2 z-5 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-forest/60 transition-opacity duration-[800ms] ease-[ease] ' +
        (error ? '' : 'sr-only ') +
        (status === 'ready' ? 'opacity-0' : '')
      }
    >
      <span>{error ? 'No se pudo cargar el relieve' : 'Cargando'}</span>
    </div>
  );
}
