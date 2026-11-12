import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Photo } from '../../content/media';

/** Imagen que llena su marco (object-cover), con el encuadre propio de cada fotografía. */
export function Img({ photo, sizes, className = '', eager = false }: { photo: Photo; sizes: string; className?: string; eager?: boolean }) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
      className={`block size-full bg-rule object-cover ${className}`}
    />
  );
}

/** Dirección de arte: `wide` (horizontal) en pantallas anchas y `tall` (vertical) en móvil, llenando el marco. */
export function ArtImg({ wide, tall, className = '' }: { wide: Photo; tall: Photo; className?: string }) {
  return (
    <picture className="block size-full">
      <source media="(max-width: 820px)" srcSet={tall.srcSet} sizes="100vw" width={tall.width} height={tall.height} />
      <Img photo={wide} sizes="100vw" className={className} />
    </picture>
  );
}

/** Marco que se abre desde un recorte al entrar en pantalla (dentro de un <Reveal>), con la imagen asentándose despacio. */
export function Frame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden transition-[clip-path] duration-[1400ms] ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(6%_4%_6%_4%)] in-[[data-inview]]:[clip-path:inset(0)] motion-reduce:transition-none ${className}`}>
      <div className="size-full transition-[scale] duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] [scale:1.06] in-[[data-inview]]:[scale:1] motion-reduce:transition-none">
        {children}
      </div>
    </div>
  );
}

/**
 * Video de fondo que llena su marco: en bucle, sin audio y sin controles del sistema. Con movimiento reducido no
 * arranca (queda la imagen fija). `rate` reduce la velocidad de reproducción (1 = normal). Un botón discreto lo pausa o lo reanuda, porque el movimiento dura más de 5 s.
 */
export function BgVideo({ video, className = '' }: { video: { src: string; poster: string; width: number; height: number; label: string; rate?: number }; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.defaultPlaybackRate = v.playbackRate = video.rate ?? 1;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.play().then(() => setPlaying(true), () => setPlaying(false));
  }, [video.rate]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true), () => {});
    else { v.pause(); setPlaying(false); }
  };

  return (
    <>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={video.label}
        className={`block size-full bg-rule object-cover ${className}`}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pausar el video' : 'Reproducir el video'}
        className="focus-ring absolute cursor-pointer right-gutter bottom-[clamp(36px,8vh,80px)] z-1 inline-flex size-11 items-center justify-center rounded-full border border-hero-cream/40 bg-[rgb(12_30_27/0.3)] text-hero-cream backdrop-blur-sm transition-colors hover:bg-[rgb(12_30_27/0.5)]"
      >
        {playing ? <PauseIcon aria-hidden="true" size={16} weight="fill" /> : <PlayIcon aria-hidden="true" size={16} weight="fill" />}
      </button>
    </>
  );
}
