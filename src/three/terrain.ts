/* Terreno real: capa cercana (DEM ~18 m + ortofoto + detalle) y capa lejana (horizonte). */
import * as THREE from 'three';
import { LOOK, type Config } from './config';
import { clamp, lerp, smooth } from './math';
import { TERRAIN_FS, TERRAIN_VS } from './shaders';
import type { TerrainData } from './terrainData';

const EARTH_R = 6371;
type Uniforms = Record<string, THREE.IUniform>;

// Alturas codificadas en R/G: h = (R*256 + G) / 4 - 100  (metros)
function decodeHeights(img: HTMLImageElement, S: number) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, S, S).data;
  const h = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) h[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 4 - 100;
  return h;
}

function heightSampler(h: Float32Array, S: number, E: number) {
  return (x: number, z: number) => {
    const fx = clamp((x / E + 0.5) * (S - 1), 0, S - 1);
    const fz = clamp((z / E + 0.5) * (S - 1), 0, S - 1);
    const x0 = Math.floor(fx), z0 = Math.floor(fz);
    const x1 = Math.min(x0 + 1, S - 1), z1 = Math.min(z0 + 1, S - 1);
    const tx = fx - x0, tz = fz - z0;
    return lerp(lerp(h[z0 * S + x0], h[z0 * S + x1], tx), lerp(h[z1 * S + x0], h[z1 * S + x1], tx), tz);
  };
}

// Rejilla N×N centrada en la cumbre; con warp < 1 los vértices se concentran en el centro.
// Norte = -z. La curvatura terrestre baja el terreno lejano (se nota en el horizonte).
function buildGrid(E: number, N: number, warp: number, heightKm: (x: number, z: number) => number) {
  const coords = new Float32Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * 2 - 1;
    coords[i] = (E / 2) * (warp * s + (1 - warp) * s * s * s);
  }
  const count = (N + 1) * (N + 1);
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  for (let j = 0, k = 0; j <= N; j++) {
    for (let i = 0; i <= N; i++, k++) {
      const x = coords[i], z = coords[j];
      pos[k * 3] = x;
      pos[k * 3 + 1] = heightKm(x, z) - (x * x + z * z) / (2 * EARTH_R);
      pos[k * 3 + 2] = z;
      uv[k * 2] = x / E + 0.5;
      uv[k * 2 + 1] = 0.5 - z / E;
    }
  }
  const index = new Uint32Array(N * N * 6);
  for (let j = 0, t = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
      index.set([a, c, b, b, c, d], t);
      t += 6;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(new THREE.BufferAttribute(index, 1));
  return geo;
}

// Mapa de normales a la resolución del DEM: el relieve se ilumina con más detalle que la malla.
// En alfa va la altura (lo..hi m): sus mips dan el relieve suavizado que dibuja la silueta del fragmento.
function normalMap(h: Float32Array, S: number, E: number, ex: number, lo: number, hi: number, anisotropy: number) {
  const cell = (E / (S - 1)) * 1000 / ex; // metros por píxel, compensando la exageración
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) {
    const ym = Math.max(y - 1, 0), yp = Math.min(y + 1, S - 1);
    const row = (S - 1 - y) * S; // la fila 0 del DEM es el norte (v = 1)
    for (let x = 0; x < S; x++) {
      const xm = Math.max(x - 1, 0), xp = Math.min(x + 1, S - 1);
      const dx = (h[y * S + xp] - h[y * S + xm]) / ((xp - xm) * cell);
      const dz = (h[yp * S + x] - h[ym * S + x]) / ((yp - ym) * cell);
      const inv = 1 / Math.sqrt(dx * dx + 1 + dz * dz);
      const o = (row + x) * 4;
      data[o] = (-dx * inv * 0.5 + 0.5) * 255;
      data[o + 1] = (inv * 0.5 + 0.5) * 255;
      data[o + 2] = (-dz * inv * 0.5 + 0.5) * 255;
      data[o + 3] = clamp((h[y * S + x] - lo) / (hi - lo)) * 255;
    }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

const vec3 = (a: readonly number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const linear = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();

function terrainMaterial(shared: Uniforms, blank: THREE.Texture, extra: Uniforms, defines: Record<string, string> = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: TERRAIN_VS, fragmentShader: TERRAIN_FS, defines,
    extensions: { derivatives: true } as THREE.ShaderMaterial['extensions'], // curvas de nivel antialias (fwidth)
    uniforms: {
      ...shared,
      uSat: { value: blank }, uNormalMap: { value: blank }, uDetail: { value: blank }, uFarSat: { value: blank },
      uDetailRect: { value: new THREE.Vector4(0, 0, 1, 0) },
      uFarRect: { value: new THREE.Vector4(0, 0, 1, 0) },
      uHeightRange: { value: new THREE.Vector3(0, 0, 0) },
      uTint: { value: vec3(LOOK.tint) },
      uSunColor: { value: vec3(LOOK.sunColor) },
      uAmbient: { value: vec3(LOOK.ambient) },
      uMistLit: { value: linear(LOOK.mistLit) },
      uMistShade: { value: linear(LOOK.mistShade) },
      uExposure: { value: LOOK.exposure },
      uSaturation: { value: LOOK.saturation },
      uRelief: { value: LOOK.relief },
      uLocalContrast: { value: LOOK.localContrast },
      uHazeDensity: { value: 0.016 },
      uHazeStart: { value: 11 },             // la montaña principal (~19 km) casi sin velo
      uHazeFalloff: { value: 0.25 },
      uFog: { value: new THREE.Vector3(0.06, 2.8, 0.7) },
      uMistAmt: { value: 0.2 },
      uMistRange: { value: new THREE.Vector2(0.7, 1.25) },
      uCenter: { value: new THREE.Vector2(0, 0) },
      uFade: { value: new THREE.Vector2(1e4, 2e4) },
      ...extra,
    },
  });
}

// Cada capa tiene dos variantes con los mismos uniforms: la normal y la del fragmento flotante (ISLAND).
// Solo la segunda usa discard, que en muchas GPU anula el descarte temprano por profundidad: así el hero
// y la vista cenital cuestan lo mismo que sin el fragmento.
export interface TerrainLayer { mesh: THREE.Mesh; base: THREE.ShaderMaterial; island: THREE.ShaderMaterial }

export interface Terrain {
  layers: TerrainLayer[];
  anchor: THREE.Vector3;
  peakY: number;
  heightKm: (x: number, z: number) => number;
  useIsland(on: boolean): void;
  dispose(): void;
}

interface BuildOptions {
  data: TerrainData;
  cfg: Config;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  shared: Uniforms;
  // espera un fotograma; rechaza si el motor se ha desmontado entretanto (la construcción se abandona)
  nextFrame: () => Promise<void>;
}

// La construcción se reparte en pasos cortos con un fotograma libre entre ellos: la niebla de la carga
// sigue animándose (antes era una sola tarea de ~0.4 s, más ~0.7 s de subida de texturas).
export async function buildTerrain({ data, cfg, renderer, scene, camera, shared, nextFrame }: BuildOptions): Promise<Terrain> {
  const owned: { dispose(): void }[] = []; // todo lo creado aquí se libera en dispose()
  const own = <T extends { dispose(): void }>(o: T) => (owned.push(o), o);
  const layers: TerrainLayer[] = [];
  const dispose = () => {
    for (const L of layers) scene.remove(L.mesh);
    owned.forEach((o) => o.dispose());
    owned.length = 0;
  };

  try {
    const ex = cfg.exaggeration;
    const D = data.meta.dem, F = data.meta.far, DT = data.meta.detail;
    const E = D.extent / 1000, EF = F.extent / 1000;
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const photoTexture = (img: HTMLImageElement) => {
      const tex = own(new THREE.Texture(img));
      tex.anisotropy = anisotropy;
      tex.needsUpdate = true;
      return tex;
    };
    const blank = own(new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1, THREE.RGBAFormat));
    blank.needsUpdate = true;
    const terrainMesh = (geo: THREE.BufferGeometry, extra: Uniforms, defines: Record<string, string> = {}) => {
      const base = own(terrainMaterial(shared, blank, extra, defines));
      const island = own(terrainMaterial(shared, blank, extra, { ...defines, ISLAND: '' }));
      const mesh = new THREE.Mesh(geo, base);
      layers.push({ mesh, base, island });
      return mesh;
    };

    // --- capa cercana
    const h = decodeHeights(data.dem, D.size);
    let maxI = 0, minI = 0;
    for (let i = 1; i < h.length; i++) {
      if (h[i] > h[maxI]) maxI = i;
      if (h[i] < h[minI]) minI = i;
    }
    const lo = h[minI], hi = h[maxI];
    const nearH = heightSampler(h, D.size, E);
    const heightKm = (x: number, z: number) => (nearH(x, z) / 1000) * ex;
    await nextFrame();
    const nearGeo = own(buildGrid(E, cfg.segments, cfg.warp, heightKm));
    await nextFrame();
    const normals = own(normalMap(h, D.size, E, ex, lo, hi, anisotropy));
    await nextFrame();
    const farTex = photoTexture(data.far);
    const satTex = photoTexture(data.sat);
    const detailTex = data.detail ? photoTexture(data.detail) : blank;
    // subida a la GPU (con sus mipmaps) de una textura por fotograma, en vez de todas en el primer render
    for (const t of [satTex, normals, detailTex, farTex]) {
      renderer.initTexture(t);
      await nextFrame();
    }
    const near = terrainMesh(nearGeo, {
      uSat: { value: satTex },
      uNormalMap: { value: normals },
      // altura suavizada en celdas de ~0.6 km: mínimo, rango (km) y nivel de mip
      uHeightRange: { value: new THREE.Vector3((lo / 1000) * ex, ((hi - lo) / 1000) * ex, Math.log2(D.size / 64)) },
      uDetail: { value: detailTex },
      uDetailRect: { value: DT ? new THREE.Vector4(-DT.extent / 2000, -DT.extent / 2000, DT.extent / 1000, 1) : new THREE.Vector4(0, 0, 1, 0) },
      uFarSat: { value: farTex },
      uFarRect: { value: new THREE.Vector4(-EF / 2, -EF / 2, EF, 0) },
    });
    near.frustumCulled = false;
    near.renderOrder = 0;
    scene.add(near);

    const S = D.size;
    const px = maxI % S, pz = Math.floor(maxI / S);
    const anchor = new THREE.Vector3((px / (S - 1) - 0.5) * E, cfg.anchorY, (pz / (S - 1) - 0.5) * E);
    const peakY = (h[maxI] / 1000) * ex;

    await nextFrame();
    // --- capa lejana: se hunde bajo la cercana para que no compitan donde se superponen
    const farH = heightSampler(decodeHeights(data.farDem, F.size), F.size, EF);
    const half = E / 2;
    const farGeo = own(buildGrid(EF, cfg.farSegments, 1, (x, z) => {
      const inside = half - Math.max(Math.abs(x), Math.abs(z)); // km dentro del área cercana
      return (farH(x, z) / 1000) * ex - 1.2 * smooth(0, 1.5, inside);
    }));
    farGeo.computeVertexNormals();
    const far = terrainMesh(farGeo, {
      uSat: { value: farTex },
      uFade: { value: new THREE.Vector2(EF * 0.36, EF * 0.48) },
    }, { FAR: '' });
    far.frustumCulled = false;
    far.renderOrder = 1; // después de la cercana: lo que queda debajo se descarta antes de sombrear
    scene.add(far);

    const useIsland = (on: boolean) => { for (const L of layers) L.mesh.material = on ? L.island : L.base; };
    await nextFrame();
    renderer.compile(scene, camera);      // shaders del hero
    await nextFrame();
    // y las variantes del fragmento flotante (01), también bajo la niebla de la carga: compilarlas más
    // tarde, con el hero ya a la vista, congelaba la intro en CPUs lentas (medido en móvil emulado)
    useIsland(true);
    renderer.compile(scene, camera);
    useIsland(false);

    return { layers, anchor, peakY, heightKm, useIsland, dispose };
  } catch (err) {
    dispose(); // cancelado (desmontaje) o fallo: no queda nada a medias en la escena ni en la GPU
    throw err;
  }
}
