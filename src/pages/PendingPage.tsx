import { CtaLink } from '../components/editorial';
import { Eyebrow } from '../components/Eyebrow';
import { url, type PageInfo } from '../lib/routes';

/**
 * Página de una sección cuyo contenido aún no está validado. Solo dice eso: no se publica ningún texto
 * inventado. Al recibir el contenido, se crea su componente y se marca `ready: true` en pages.json.
 */
export function PendingPage({ info }: { info: PageInfo }) {
  return (
    <div className="flex min-h-[60svh] flex-col justify-center">
      <Eyebrow>PANAMOSAB</Eyebrow>
      <h1 className="m-0 text-[length:clamp(48px,7vw,120px)] font-medium leading-[0.98] tracking-[-0.035em] text-forest">{info.label}</h1>
      <p className="mt-8 mb-0 max-w-[48ch] text-[19px] leading-[1.55] text-ink max-md:text-[17px]">
        Estamos preparando esta sección. La publicaremos cuando su contenido haya sido validado por el equipo de PANAMOSAB.
      </p>
      <div className="mt-12 flex flex-wrap gap-4">
        <CtaLink href={url('inicio', '#parque')}>Conocer el parque</CtaLink>
        <CtaLink href={url('inicio')}>Volver al inicio</CtaLink>
      </div>
    </div>
  );
}
