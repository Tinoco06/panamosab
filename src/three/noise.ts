import * as THREE from 'three';
import { lerp } from './math';

// fBm repetible de 256 px (8 celdas de base, 5 octavas). R y G son dos campos independientes.
export function makeNoiseTexture() {
  const S = 256, CELLS = 8;
  const field = (seed: number) => {
    const out = new Float32Array(S * S);
    for (let o = 0, amp = 0.5, cells = CELLS; o < 5; o++, amp *= 0.5, cells *= 2) {
      const g = new Float32Array(cells * cells);
      for (let i = 0; i < g.length; i++) {
        const x = Math.sin((i + 1) * 12.9898 + seed * 78.233 + o * 37.719) * 43758.5453;
        g[i] = x - Math.floor(x);
      }
      const step = S / cells;
      for (let y = 0; y < S; y++) {
        const gy = y / step, y0 = Math.floor(gy), ty = gy - y0, sy = ty * ty * (3 - 2 * ty);
        const r0 = (y0 % cells) * cells, r1 = ((y0 + 1) % cells) * cells;
        for (let x = 0; x < S; x++) {
          const gx = x / step, x0 = Math.floor(gx), tx = gx - x0, sx = tx * tx * (3 - 2 * tx);
          const c0 = x0 % cells, c1 = (x0 + 1) % cells;
          const v = lerp(lerp(g[r0 + c0], g[r0 + c1], sx), lerp(g[r1 + c0], g[r1 + c1], sx), sy);
          out[y * S + x] += amp * v;
        }
      }
    }
    return out;
  };
  const a = field(1), b = field(2);
  const data = new Uint8Array(S * S * 4);
  for (let i = 0; i < S * S; i++) {
    data[i * 4] = a[i] * 255;
    data[i * 4 + 1] = b[i] * 255;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}
