import { clamp, lerp, smooth } from '../three/math';

// Máscara de niebla del título: la parte baja de cada línea se deshace en jirones irregulares (sin línea
// recta), la alta queda sólida. Se genera una vez por línea con ruido, a partir de --fog-depth y --fog-min.
function fogMask(seed: number, depth: number, min: number) {
  const w = 256, h = 80;   // ruido suave que se estira al tamaño de la línea: no necesita más (antes ~0.3 s a 512×160)
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x: number, y: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(hash(x0, y0), hash(x0 + 1, y0), sx), lerp(hash(x0, y0 + 1), hash(x0 + 1, y0 + 1), sx), sy);
  };
  const fbm2 = (x: number, y: number) => 0.5 * noise(x, y) + 0.3 * noise(x * 2.1, y * 2.1) + 0.2 * noise(x * 4.3, y * 4.3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h;
      // parches de nube con borde blando pero definido (no un degradado continuo): el borde superior
      // sube y baja con el ruido, y dentro de la niebla quedan claros donde la letra se ve entera
      const edge = 1 - depth + (fbm2(u * 6, v * 1.5) - 0.5) * depth * 1.6;
      const into = smooth(edge - depth * 0.12, edge + depth * 0.22, v);
      const puff = smooth(0.38, 0.62, fbm2(u * 9 + 3.7, v * 3));
      const a = clamp(1 - into * (1 - min) * (0.35 + 0.65 * puff), min, 1);
      img.data[(y * w + x) * 4 + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return `url(${c.toDataURL()})`;
}

/** Aplica la máscara de niebla a cada línea del título ([data-title-line] > span). Idempotente. */
export function applyTitleFog(title: HTMLElement) {
  const cs = getComputedStyle(title);
  const depth = parseFloat(cs.getPropertyValue('--fog-depth')) || 0.5;
  const min = parseFloat(cs.getPropertyValue('--fog-min')) || 0.42;
  title.querySelectorAll<HTMLElement>('[data-title-line] > span').forEach((s, i) => {
    const m = fogMask(i + 1, depth, min);
    s.style.setProperty('-webkit-mask-image', m);
    s.style.maskImage = m;
  });
}
