/* Motor de la experiencia: niebla → montaña real → texto → transición por scroll.
   Funciona de forma imperativa, fuera del ciclo de render de React: un único requestAnimationFrame mueve la
   cámara, la atmósfera y las tres capas WebGL (cielo · terreno · niebla). React solo lo crea, le pasa los
   elementos del DOM que necesita medir y lo destruye; no recibe ninguna actualización por fotograma.

   Capas, de atrás hacia delante: cielo (canvas propio, media resolución) · terreno (canvas transparente)
   · contenido HTML · niebla delantera (canvas propio). */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createConfig, HERO_LOOK, LOOK, PAGE_CLOUDS, PAGE_COLOR, SCROLL_LAG, stackRadius, TERR_STACK } from './config';
import { clamp, easeInOut, lerp, smooth } from './math';
import { makeNoiseTexture } from './noise';
import * as SH from './shaders';
import { buildTerrain, type Terrain } from './terrain';
import { loadTerrainData } from './terrainData';

gsap.registerPlugin(ScrollTrigger);

export interface ExperienceElements {
  root: HTMLElement;              // ámbito de los selectores de GSAP ([data-intro], [data-reveal])
  layerHost: HTMLElement;         // aquí se añaden los tres canvas (y se quitan en dispose)
  hero: HTMLElement;
  heroChrome: HTMLElement;
  heroTitle: HTMLElement;
  park: HTMLElement;
  parkText: HTMLElement;
  parkFrame: HTMLElement;         // hueco invisible donde flota el fragmento de montaña
  parkPeak: HTMLElement;          // marca de la cumbre (altitud) sobre el fragmento: el motor la sigue
  territory: HTMLElement;
  territoryStage: HTMLElement;
  territoryMap: HTMLElement;      // hueco del mapa en la composición apilada (02)
  territoryColumn: HTMLElement;
}

export interface ExperienceCallbacks {
  onReady(): void;
  onError(err: unknown): void;
}

/** Clases de las tres capas (las define la interfaz; el motor solo crea los elementos). */
export interface LayerClasses { sky: string; scene: string; mist: string }

export interface Experience {
  /** Vuelve a medir el título (por ejemplo, cuando cambia la fuente). */
  relayout(): void;
  /** Detiene el bucle, quita listeners y animaciones y libera todos los recursos WebGL. */
  dispose(): void;
}

interface Pose { az: number; el: number; dist: number; logZoom: number; tx: number; ty: number; panX: number; panZ: number }
interface Rect { x: number; y: number; w: number; h: number }
type Uniforms = Record<string, THREE.IUniform>;

class Cancelled extends Error {}

const vec3 = (a: readonly number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const linear = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();
const rad = THREE.MathUtils.degToRad;

/**
 * Crea la experiencia sobre los canvas y elementos dados. Lanza una excepción si no hay WebGL; en ese caso
 * no deja nada creado (la página sigue siendo legible sin el relieve).
 */
export function createExperience(els: ExperienceElements, layers: LayerClasses, cb: ExperienceCallbacks): Experience {
  const qs = new URLSearchParams(location.search);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Perfil del dispositivo, una vez: datos del relieve, malla, lente y poses del hero y de 01 (no cambian al girar,
  // así no se recrea nada). La composición de 02 no sale de aquí sino del CSS (layout.stacked), que sí cambia al girar.
  const mobileProfile = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const skipIntro = reduceMotion || qs.has('skip');
  const perf = qs.has('perf');                 // expone contadores para las pruebas de rendimiento

  const CFG = createConfig(mobileProfile);
  const PAGE = new THREE.Color(PAGE_COLOR);
  const cleanups: (() => void)[] = [];
  let disposed = false;

  // ---------------------------------------------------------------------------
  // Capas y renderers. El motor crea sus propios canvas y los retira al terminar: un contexto WebGL
  // liberado no se puede reutilizar, así que cada montaje (también el segundo de StrictMode) parte de
  // canvas nuevos y no queda ningún contexto huérfano.
  // ---------------------------------------------------------------------------
  const canvas = (className: string) => {
    const c = document.createElement('canvas');
    c.className = className;
    c.setAttribute('aria-hidden', 'true');
    return c;
  };
  // de atrás hacia delante: cielo · terreno · niebla (el contenido HTML va entre terreno y niebla por z-index)
  const canvases = [canvas(layers.sky), canvas(layers.scene), canvas(layers.mist)];
  const [skyCanvas, sceneCanvas, mistCanvas] = canvases;
  els.layerHost.append(...canvases);

  const renderers: THREE.WebGLRenderer[] = [];

  // Pérdida del contexto WebGL (iOS la provoca al pasar la pestaña a segundo plano o con poca memoria). Three.js
  // la gestiona en cada renderer (deja de dibujar y, al restaurarse, vuelve a subir geometrías y texturas); aquí
  // solo se marca que las capas que no se redibujan en cada fotograma (cielo, niebla) deben volver a pintarse.
  let contextLost = 0;
  canvases.forEach((c) => {
    c.addEventListener('webglcontextlost', (e) => { e.preventDefault(); contextLost++; });
    c.addEventListener('webglcontextrestored', () => {
      contextLost = Math.max(0, contextLost - 1);
      skyStill = false;
      mistVisible = true;
    });
  });
  const makeRenderer = (p: THREE.WebGLRendererParameters) => {
    const r = new THREE.WebGLRenderer(p);
    renderers.push(r);
    return r;
  };
  const release = () => {
    renderers.forEach((r) => { r.dispose(); r.forceContextLoss(); });
    canvases.forEach((c) => c.remove());
  };

  let renderer: THREE.WebGLRenderer, skyRenderer: THREE.WebGLRenderer, mistRenderer: THREE.WebGLRenderer;
  try {
    // Terreno sobre fondo transparente (el cielo va en su propio canvas, detrás). Sin MSAA: era el mayor
    // coste de GPU; lo sustituye una pasada que suaviza solo los bordes geométricos (EDGE_AA_FS).
    renderer = makeRenderer({ canvas: sceneCanvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    // El cielo es un degradado suave: basta media resolución
    skyRenderer = makeRenderer({ canvas: skyCanvas, antialias: false });
    mistRenderer = makeRenderer({ canvas: mistCanvas, alpha: true, premultipliedAlpha: true, antialias: false });
  } catch (err) {
    release();
    throw err;
  }
  renderer.setPixelRatio(CFG.dpr);
  renderer.setClearColor(0x000000, 0);
  skyRenderer.setPixelRatio(0.5);
  mistRenderer.setPixelRatio(mobileProfile ? 0.35 : 0.5);
  mistRenderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CFG.fov, 1, 0.05, 600);
  const skyScene = new THREE.Scene();
  const mistScene = new THREE.Scene();
  const aaScene = new THREE.Scene();
  const quadCam = new THREE.Camera();
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const owned: { dispose(): void }[] = [quadGeo];
  const own = <T extends { dispose(): void }>(o: T) => (owned.push(o), o);
  const quad = (mat: THREE.Material, target: THREE.Scene, order = 0) => {
    const m = new THREE.Mesh(quadGeo, mat);
    m.frustumCulled = false;
    m.renderOrder = order;
    target.add(m);
    return m;
  };

  // El terreno se dibuja en un búfer intermedio (color + profundidad) y la pasada de bordes lo lleva al canvas.
  // Sin texturas de profundidad (muy raro) se dibuja directo, sin antialiasing.
  const edgeAA = renderer.capabilities.isWebGL2 || renderer.extensions.has('WEBGL_depth_texture');
  const aaTarget = edgeAA ? own(new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false,
    // 24 bits: con 16 (el valor por defecto) la precisión a 20 km es de ~120 m y las capas cercana y
    // lejana podrían parpadear donde se solapan
    depthBuffer: true, depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
  })) : null;
  if (aaTarget?.depthTexture) own(aaTarget.depthTexture);
  const aaMat = aaTarget ? own(new THREE.ShaderMaterial({
    vertexShader: SH.QUAD_VS, fragmentShader: SH.EDGE_AA_FS,
    uniforms: {
      tColor: { value: aaTarget.texture }, tDepth: { value: aaTarget.depthTexture },
      uInv: { value: new THREE.Vector2(1, 1) }, uScale: { value: new THREE.Vector2(1, 1) },
      uNF: { value: new THREE.Vector2(camera.near, camera.far) },
    },
    blending: THREE.NoBlending, depthTest: false, depthWrite: false,
  })) : null;
  if (aaMat) quad(aaMat, aaScene);

  const noiseTex = own(makeNoiseTexture());

  // Uniforms compartidos por cielo y terreno (misma luz, mismo horizonte)
  const SHARED: Uniforms = {
    uNoise: { value: noiseTex },
    uSun: { value: vec3(CFG.sun).normalize() },
    uZenith: { value: linear(HERO_LOOK.zenith) },  // se funde con LOOK durante la transición (updateLook)
    uHorizon: { value: linear(HERO_LOOK.horizon) },
    uSunGlow: { value: linear(LOOK.sunGlow).multiplyScalar(0.7) },
    uLight: { value: 0 },
    uGlowWide: { value: 0 },
    uTime: { value: 0 },
    uAtmos: { value: 1 },                      // intensidad de niebla en el terreno (baja al llegar a la sección)
    uClouds: { value: new THREE.Vector4(0, 3.9, 8, 14) }, // nubes bajas: cantidad, altitud (km), radio libre (km)
    uCloudLook: { value: new THREE.Vector4(0.64, 0.86, 0.55, 0) }, // cobertura, opacidad, fundido (ver TERRAIN_FS)
    uCloudSun: { value: 0 },
    uContour: { value: new THREE.Vector4(0, 0, 0.2 * CFG.exaggeration, 0) }, // cantidad, barrido (km), intervalo (200 m)
    uMassif: { value: new THREE.Vector2(0, 0) },  // centro del macizo (limita las curvas de nivel)
    uPaper: { value: new THREE.Vector4(PAGE.r, PAGE.g, PAGE.b, 0) }, // el fondo se vuelve el marfil de la página
    uIsland: { value: new THREE.Vector4(0, 0, 1e4, 0) },             // fragmento flotante (ver updateIsland)
    uIslandShape: { value: new THREE.Vector3(1, 0, 0) },
  };

  // Cielo
  quad(own(new THREE.ShaderMaterial({
    vertexShader: SH.SKY_VS, fragmentShader: SH.SKY_FS,
    uniforms: {
      ...SHARED,
      uInvProj: { value: camera.projectionMatrixInverse },
      uCamWorld: { value: camera.matrixWorld },
      uCloudH: { value: 8.5 },
      uCloudLit: { value: linear(LOOK.cloudLit) },
      uCloudShade: { value: linear(LOOK.cloudShade) },
    },
    depthWrite: false,
  })), skyScene);

  // Niebla de pantalla: trasera (en la escena, solo durante la apertura) y delantera (sobre el texto)
  const fogUniforms = (o: { cover: number; wisp: number; scale: number; speed: number; seed: number }): Uniforms => ({
    uNoise: { value: noiseTex },
    uTime: { value: 0 }, uAspect: { value: 1 }, uOpen: { value: 0 }, uCover: { value: o.cover },
    uWisp: { value: o.wisp }, uRest: { value: 0 }, uScale: { value: o.scale }, uSpeed: { value: o.speed },
    uBand: { value: new THREE.Vector3(0.5, 0.05, 0) },
    uBand2: { value: new THREE.Vector3(0.5, 0.05, 0) },
    uBandX: { value: new THREE.Vector2(1, 0.1) },
    uShift: { value: new THREE.Vector2(o.seed, o.seed * 0.37) },
    uColA: { value: new THREE.Color(LOOK.fogShade) }, uColB: { value: new THREE.Color(LOOK.fogLit) },
  });
  const fogMat = (o: Parameters<typeof fogUniforms>[0]) => own(new THREE.ShaderMaterial({
    vertexShader: SH.QUAD_VS, fragmentShader: SH.FOG_FS, uniforms: fogUniforms(o),
    transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
  }));
  const fogBackMat = fogMat({ cover: 1.0, wisp: 0.0, scale: 1.6, speed: 0.02, seed: 0 });
  const fogBack = quad(fogBackMat, scene, 10);
  const fogFrontMat = fogMat({ cover: 0.9, wisp: 0.8, scale: 1.05, speed: 0.03, seed: 7.3 });
  quad(fogFrontMat, mistScene);

  // Borde atmosférico (sección 02): papel marfil del lado del texto; el territorio aparece desde el aire
  const veilMat = own(new THREE.ShaderMaterial({
    vertexShader: SH.QUAD_VS, fragmentShader: SH.VEIL_FS,
    uniforms: {
      uColor: { value: PAGE },
      uRes: { value: new THREE.Vector2(1, 1) },
      uProfile: { value: new THREE.Vector4(0.46, 0.41, 0.53, 0.085) },
      uGuard: { value: 0 },
      uAxis: { value: 1 },             // lo fija la composición en cada fotograma (updateTerritory)
      uAmount: { value: 0 },
      uWin: { value: new THREE.Vector4(0, 0, 1, 1) },
      uWinEdge: { value: new THREE.Vector2(0, 0) },
      uAir: { value: 1 },
      uLobe: { value: 0.15 },
      uTime: SHARED.uTime,
      uNoise: SHARED.uNoise,
    },
    transparent: true, depthTest: false, depthWrite: false,
  }));
  const veil = quad(veilMat, scene, 20);
  veil.visible = false;

  // ---------------------------------------------------------------------------
  // Estado animado
  // ---------------------------------------------------------------------------
  let terrain: Terrain | null = null;
  let ready = false;
  const intro = { open: 0, frontOpen: 0, light: 0.8, dolly: 1, rest: 0 };
  // Una sola posición de scroll suavizada (y) de la que salen las tres fases: así quedan siempre
  // coordinadas y la transición es la misma al bajar y al subir, por rápido que sea el scroll.
  const scroll = { y: 0, p: 0, q1: 0, q2: 0 }; // p: hero → 01 · q1: 01 → 02 · q2: recorrido dentro de 02
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let phases: { p: ScrollTrigger; q1: ScrollTrigger; q2: ScrollTrigger } | null = null;
  let introDone = false;
  let mistVisible = true;
  let skyStill = false;

  const listen = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, opts);
    cleanups.push(() => window.removeEventListener(type, fn, opts));
  };
  if (canHover && !reduceMotion) {
    listen('pointermove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let W = 1, H = 1;
  const bufSize = new THREE.Vector2();
  // El búfer intermedio se reserva a la densidad máxima y solo cambia con el tamaño de la pantalla: al bajar o subir
  // la densidad (calidad adaptativa) se dibuja en una parte de él (viewport) y la pasada de bordes lee esa parte.
  function fitAA() {
    if (!aaTarget || !aaMat) return;
    renderer.getDrawingBufferSize(bufSize);
    const tw = Math.floor(W * CFG.dpr), th = Math.floor(H * CFG.dpr);
    aaTarget.setSize(tw, th);             // sin cambio de tamaño, three no reserva nada
    aaTarget.viewport.set(0, 0, bufSize.x, bufSize.y);
    aaMat.uniforms.uInv.value.set(1 / tw, 1 / th);
    aaMat.uniforms.uScale.value.set(bufSize.x / tw, bufSize.y / th);
  }
  function sizeScene() {
    renderer.setSize(W, H, false);
    fitAA();
  }
  // Alto de la pantalla «grande» (100lvh, el mismo que tienen los canvas: ver .webgl-layer). Se mide con una sonda
  // de estilo en línea, no con el canvas: al crear el motor la hoja de estilos puede no estar aplicada todavía y el
  // canvas mediría su tamaño por defecto (300 × 150). En iOS el `resize` se dispara cada vez que las barras de
  // Safari aparecen o se ocultan; con el alto grande el tamaño no cambia y no se recalcula nada. Solo se recalcula
  // si el tamaño cambió de verdad (ancho, giro del dispositivo, ventana de escritorio).
  const vpProbe = document.createElement('div');
  vpProbe.setAttribute('aria-hidden', 'true');
  vpProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.append(vpProbe);
  cleanups.push(() => vpProbe.remove());
  function resize(force = false) {
    const w = window.innerWidth;
    const h = Math.max(window.innerHeight, vpProbe.offsetHeight);
    if (!force && w === W && h === H) return;
    W = w;
    H = h;
    sizeScene();
    mistRenderer.setSize(W, H, false);
    skyRenderer.setSize(W, H, false);
    skyStill = false;
    camera.aspect = W / H;
    fogBackMat.uniforms.uAspect.value = W / H;
    fogFrontMat.uniforms.uAspect.value = W / H;
    measure();
    layoutTitle();
  }
  listen('resize', () => resize());
  // al girar el dispositivo, iOS informa del tamaño nuevo con retraso: se vuelve a medir tras el giro
  let turnTimer = 0;
  listen('orientationchange', () => { clearTimeout(turnTimer); turnTimer = window.setTimeout(() => resize(), 250); });
  cleanups.push(() => clearTimeout(turnTimer));

  // ---------------------------------------------------------------------------
  // Layout: dónde están los elementos que el motor sigue. Se mide al cambiar el tamaño de la pantalla o de la página
  // (ResizeObserver, refresco de ScrollTrigger), no en cada fotograma: leer el layout dentro del bucle obligaba al
  // navegador a recalcular estilos y posiciones de forma síncrona. En cada fotograma solo se resta scrollY.
  // Posiciones en coordenadas del documento; las del escenario fijo de 02, relativas a él.
  // ---------------------------------------------------------------------------
  const layout = {
    stacked: false,                           // 02 apilada (mapa arriba, texto abajo): la decide el CSS (--terr-stack)
    frame: { l: 0, t: 0, w: 1, h: 1 },        // hueco del fragmento de 01
    parkText: { right: 0, bottom: 0 },        // texto de 01
    terrTop: 0, terrH: 1, stageH: 1,          // sección 02 y su escenario fijo (sticky top: 0)
    map: { l: 0, t: 0, w: 1, h: 1 },          // hueco del mapa (apilada), relativo al escenario
    colTop: 0, colRight: 0,                   // columna de texto: arriba (relativo al escenario) y borde derecho
  };
  function measure() {
    const sy = window.scrollY;
    const f = els.parkFrame.getBoundingClientRect(), t1 = els.parkText.getBoundingClientRect();
    const sec = els.territory.getBoundingClientRect(), st = els.territoryStage.getBoundingClientRect();
    const map = els.territoryMap.getBoundingClientRect(), col = els.territoryColumn.getBoundingClientRect();
    layout.stacked = getComputedStyle(els.territoryStage).getPropertyValue('--terr-stack').trim() === '1';
    layout.frame = { l: f.left, t: f.top + sy, w: f.width, h: f.height };
    layout.parkText = { right: t1.right, bottom: t1.bottom + sy };
    layout.terrTop = sec.top + sy;
    layout.terrH = sec.height;
    layout.stageH = st.height;
    layout.map = { l: map.left, t: map.top - st.top, w: map.width, h: map.height };
    layout.colTop = col.top - st.top;
    layout.colRight = col.right;
  }
  // borde superior del escenario fijo de 02 en pantalla (antes de fijarse, al fijarse y al soltarse)
  const stageY = (sy: number) =>
    Math.min(Math.max(layout.terrTop - sy, 0), layout.terrTop + layout.terrH - layout.stageH - sy);

  // Ventana de la sección institucional. Durante la transición se usa su posición "de llegada";
  // después sigue al scroll real, como cualquier fotografía de la página.
  function frameTarget() {
    const sy = window.scrollY, F = layout.frame;
    const end = phases ? phases.p.end : H;
    return { l: F.l, t: F.t - Math.max(sy, end), w: F.w, h: F.h };
  }

  // Una "pose" describe cámara + encuadre en pantalla.
  // Las tres escenas se mezclan entre sí con el scroll, así la cámara nunca corta.
  const focalPx = () => (H / 2) / Math.tan(rad(CFG.fov) / 2);

  function heroPose(): Pose {
    const hp = CFG.hero;
    return { az: hp.az, el: hp.el, dist: hp.dist, logZoom: 0, tx: hp.x * W, ty: hp.y * H, panX: 0, panZ: 0 };
  }

  // El fragmento flotante se centra en el hueco de la figura; el canvas sigue ocupando toda la pantalla
  function parquePose(): Pose {
    const fp = CFG.final, f = frameTarget();
    const zoom = (f.w * CFG.fill * 0.5) / ((CFG.fitRadius / fp.dist) * focalPx());
    return {
      az: fp.az, el: fp.el, dist: fp.dist, logZoom: Math.log(Math.max(zoom, 1e-3)),
      tx: f.l + f.w / 2, ty: f.t + f.h * fp.y, panX: 0, panZ: 0,
    };
  }

  // Encuadre del macizo en 02: punto de mira en pantalla y radio en px. Lateral (escritorio): a la derecha del texto,
  // por fracciones de la pantalla (valores aprobados). Apilada: encajado en el hueco del mapa, que sigue al escenario
  // (entra desde abajo y, si el texto va debajo del escenario, sube con él al final).
  function terrFrame() {
    if (!layout.stacked) {
      const S = CFG.terr.side;
      return { x: S.x * W, y: S.y * H, r: Math.min(S.size * H, S.maxW * W) };
    }
    const M = layout.map, r = stackRadius(M.w, M.h);
    const top = stageY(window.scrollY) + M.t;
    const S = TERR_STACK;
    return { x: M.l + M.w / 2, y: top + S.top + (M.h - S.fade - S.top) / 2 - S.lift * r, r };
  }

  function terrPose(k: number): Pose {
    const T = CFG.terr, a = T.start, b = T.end, f = terrFrame();
    const dist = lerp(a.dist, b.dist, k);
    const zoom = (f.r * dist) / (T.radius * focalPx());
    return {
      az: lerp(a.az, b.az, k), el: lerp(a.el, b.el, k), dist, logZoom: Math.log(zoom),
      tx: f.x, ty: f.y, panX: b.pan[0] * k, panZ: b.pan[1] * k,
    };
  }

  function mixPose(a: Pose, b: Pose, t: number): Pose {
    if (t <= 0) return a;
    if (t >= 1) return b;
    const o = {} as Pose;
    for (const k in a) {
      const key = k as keyof Pose;
      o[key] = lerp(a[key], b[key], t);
    }
    return o;
  }

  const look = new THREE.Vector3();

  function applyPose(P: Pose, ambient = !reduceMotion) {
    if (!terrain) return;
    const mInf = 1 - smooth(0, 0.3, scroll.p);
    // deriva ambiental muy lenta (la cámara "respira"); con el relieve real, cada plano se desplaza según su distancia
    const D = CFG.drift, w = ambient ? (SHARED.uTime.value / D.period) * Math.PI * 2 : 0;
    const dAz = ambient ? Math.sin(w) * D.az : 0, dEl = ambient ? Math.sin(w * 0.71 + 1.3) * D.el : 0;
    const az = rad(P.az + (mouse.x * CFG.mouse.yaw + dAz) * mInf);
    const el = rad(P.el + (-mouse.y * CFG.mouse.pitch + dEl) * mInf);
    const dist = P.dist * (1 + intro.dolly * 0.08 + (ambient ? Math.sin(w * 0.53) * D.dist * mInf : 0));

    const anchor = terrain.anchor;
    look.set(anchor.x + P.panX, anchor.y, anchor.z + P.panZ);
    camera.position.set(
      look.x + dist * Math.cos(el) * Math.sin(az),
      look.y + dist * Math.sin(el),
      look.z + dist * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(look);
    camera.zoom = Math.exp(P.logZoom);
    camera.setViewOffset(W, H, W / 2 - P.tx, H / 2 - P.ty, W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(); // project() la usa antes del render (silueta del título, recuadro del fragmento)
  }

  // Marca de la cumbre en 01: sigue la proyección real del punto más alto sobre el fragmento flotante.
  // Aparece cuando el fragmento ya está formado y se retira al empezar el paso a 02. Mientras no se ve, su halo no
  // se anima (data-shown, ver .peak-halo en index.css).
  const peakPt = new THREE.Vector3();
  let peakShown = false;
  function updatePeak() {
    const el = els.parkPeak;
    const vis = smooth(0.84, 0.98, scroll.p) * (1 - smooth(0, 0.05, scroll.q1));
    if (vis <= 0.001) {
      if (peakShown) {
        el.style.opacity = '0'; el.style.visibility = 'hidden'; delete el.dataset.shown; peakShown = false;
      }
      return;
    }
    const { anchor, peakY } = terrain!;
    peakPt.set(anchor.x, peakY, anchor.z).project(camera);
    const F = layout.frame, top = F.t - window.scrollY;
    const x = (peakPt.x * 0.5 + 0.5) * W - F.l, y = (0.5 - peakPt.y * 0.5) * H - top;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.opacity = vis.toFixed(3);
    if (!peakShown) { el.style.visibility = 'visible'; el.dataset.shown = ''; peakShown = true; }
  }

  // El nombre del parque se apoya sobre la cresta: se busca el punto más alto de la silueta del macizo
  // (y de sus laderas, hasta 8 km) bajo todo el ancho del título en la vista del hero en reposo; el pie
  // del título queda por encima (CSS --clearance). Así la montaña nunca lo corta, en ninguna proporción.
  const probe = new THREE.Vector3();
  function layoutTitle() {
    if (!ready || !terrain) return;
    const { anchor, heightKm } = terrain;
    const keep = intro.dolly;
    intro.dolly = 0;
    applyPose(heroPose(), false);
    intro.dolly = keep;
    const title = els.heroTitle;
    const box = title.getBoundingClientRect();
    let ridge = H;
    for (let z = -8; z <= 8; z += 0.2) {
      for (let x = -8; x <= 8; x += 0.2) {
        if (x * x + z * z > 64) continue;
        const wx = anchor.x + x, wz = anchor.z + z;
        probe.set(wx, heightKm(wx, wz), wz).project(camera);
        const sx = (probe.x * 0.5 + 0.5) * W, sy = (0.5 - probe.y * 0.5) * H;
        if (probe.z < 1 && sx >= box.left && sx <= box.right) ridge = Math.min(ridge, sy);
      }
    }
    title.style.setProperty('--ridge', `${ridge.toFixed(1)}px`);
    // nubes de la niebla delantera cruzando la base de cada línea (donde la máscara vuelve translúcidas
    // las letras); se apagan pasado el título para no velar la montaña
    const main = title.querySelector('[data-title-line="main"]')!.getBoundingClientRect();
    const sub = title.querySelector('[data-title-line="sub"]')!.getBoundingClientRect();
    const F = fogFrontMat.uniforms;
    // base de la nube (uv) · altura de los cúmulos (uv) · intensidad (× uRest)
    F.uBand.value.set(1 - (main.bottom - main.height * 0.12) / H, (main.height * 0.2) / H, 2.7);
    F.uBand2.value.set(1 - (sub.bottom - sub.height * 0.06) / H, (sub.height * 0.36) / H, 3.4);
    F.uBandX.value.set((box.right + 0.02 * W) / W, 0.14);
  }

  function updateCamera() {
    const { p, q1, q2 } = scroll;
    // en el hero en reposo no hace falta la pose de 01
    let P = p > 0 ? mixPose(heroPose(), parquePose(), easeInOut(p)) : heroPose();
    if (q1 > 0) {
      // 01 → 02: el fragmento vuelve a extenderse en territorio (updateIsland) mientras la cámara se eleva
      const T0 = terrPose(0);
      P = mixPose(P, T0, easeInOut(q1));
      if (layout.stacked) {
        // apilada: la vista cenital entra pegada al hueco del mapa; su borde superior es niebla, no una línea
        P = { ...P, tx: T0.tx, ty: T0.ty };
      }
    }
    if (q2 > 0) P = mixPose(P, terrPose(easeInOut(q2)), 1);
    applyPose(P);
  }

  // Fragmento flotante: el paisaje se retira hacia el macizo hasta dejarlo solo sobre el papel.
  // Devuelve cuánto se ha recogido (0: paisaje completo · 1: fragmento).
  function ringMean(R: number) {
    const { anchor, heightKm } = terrain!;
    let s = 0;
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      s += heightKm(anchor.x + R * Math.cos(a), anchor.z + R * Math.sin(a));
    }
    return s / 48;
  }

  function updateIsland() {
    const { p, q1 } = scroll;
    const I = CFG.island, anchor = terrain!.anchor;
    const k = smooth(0.04, 0.7, p) * (1 - smooth(0.04, 0.8, q1));
    const R = Math.exp(lerp(Math.log(I.from), Math.log(I.radius), k)); // en escala logarítmica: ritmo constante
    SHARED.uIsland.value.set(anchor.x, anchor.z, R, k > 0.001 ? 1 : 0);
    terrain!.useIsland(k > 0.001);
    // el borde crece con el radio: lejos, el paisaje se disuelve como bruma; cerca, el contorno es preciso
    // la altura de referencia es la media del anillo: lo que está por encima (crestas) llega más lejos
    SHARED.uIslandShape.value.set(Math.max(I.edge, (R * I.edge) / I.radius), ringMean(Math.min(R, 19)), I.relief);
    SHARED.uPaper.value.w = smooth(0.05, 0.62, p);
    return k;
  }

  // Grading: el del hero se funde con el de la página durante la transición (01 y 02 no cambian)
  const LOOK_PAIRS = {
    sun: [vec3(HERO_LOOK.sun).normalize(), vec3(CFG.sun).normalize()],
    sunGlow: [linear(HERO_LOOK.sunGlow).multiplyScalar(HERO_LOOK.glow), linear(LOOK.sunGlow).multiplyScalar(0.7)],
    sunColor: [vec3(HERO_LOOK.sunColor), vec3(LOOK.sunColor)],
    zenith: [linear(HERO_LOOK.zenith), linear(LOOK.zenith)],
    horizon: [linear(HERO_LOOK.horizon), linear(LOOK.horizon)],
    ambient: [vec3(HERO_LOOK.ambient), vec3(LOOK.ambient)],
    tint: [vec3(HERO_LOOK.tint), vec3(LOOK.tint)],
    mistLit: [linear(HERO_LOOK.mistLit), linear(LOOK.mistLit)],
    mistShade: [linear(HERO_LOOK.mistShade), linear(LOOK.mistShade)],
    fogLit: [new THREE.Color(HERO_LOOK.fogLit), new THREE.Color(LOOK.fogLit)],
    fogShade: [new THREE.Color(HERO_LOOK.fogShade), new THREE.Color(LOOK.fogShade)],
  } as const;
  let lookMix = -1;
  function updateLook(p: number) {
    const g = smooth(0.05, 0.6, p);
    if (g === lookMix) return;
    lookMix = g;
    const P = LOOK_PAIRS;
    SHARED.uSun.value.copy(P.sun[0]).lerp(P.sun[1], g).normalize();
    SHARED.uSunGlow.value.copy(P.sunGlow[0]).lerp(P.sunGlow[1], g);
    SHARED.uGlowWide.value = HERO_LOOK.glowWide * (1 - g);
    SHARED.uZenith.value.copy(P.zenith[0]).lerp(P.zenith[1], g);
    SHARED.uHorizon.value.copy(P.horizon[0]).lerp(P.horizon[1], g);
    skyStill = false;
    for (const L of terrain?.layers ?? []) {
      for (const m of [L.base, L.island]) {
        const u = m.uniforms;
        u.uSunColor.value.copy(P.sunColor[0]).lerp(P.sunColor[1], g);
        u.uMistLit.value.copy(P.mistLit[0]).lerp(P.mistLit[1], g);
        u.uMistShade.value.copy(P.mistShade[0]).lerp(P.mistShade[1], g);
        u.uMistRange.value.set(lerp(HERO_LOOK.mistRange[0], 0.7, g), lerp(HERO_LOOK.mistRange[1], 1.25, g));
        u.uAmbient.value.copy(P.ambient[0]).lerp(P.ambient[1], g);
        u.uTint.value.copy(P.tint[0]).lerp(P.tint[1], g);
        u.uSaturation.value = lerp(HERO_LOOK.saturation, LOOK.saturation, g);
        u.uRelief.value = lerp(HERO_LOOK.relief, LOOK.relief, g);
        u.uLocalContrast.value = lerp(HERO_LOOK.localContrast, LOOK.localContrast, g);
        u.uHazeDensity.value = lerp(HERO_LOOK.haze, 0.016, g);
        u.uExposure.value = lerp(HERO_LOOK.exposure, LOOK.exposure, g);
        u.uMistAmt.value = lerp(HERO_LOOK.mist, 0.2, g);
      }
    }
  }

  // Sección 02: borde atmosférico del territorio, nubes bajas, curvas de nivel
  function updateTerritory(island: number) {
    const { q1 } = scroll, stacked = layout.stacked;
    const v = stacked ? smooth(0, 0.08, q1) : smooth(0, 0.1, q1); // el papel llega antes de que el territorio se extienda
    const vw = stacked && q1 > 0;
    veil.visible = v > 0.001 || vw;
    if (!veil.visible) return;
    const k = renderer.getPixelRatio(), U = veilMat.uniforms, sy = window.scrollY;
    U.uRes.value.set(W * k, H * k);
    U.uAmount.value = v;
    U.uAir.value = 1 - island;
    U.uAxis.value = stacked ? 0 : 1;

    const top = stageY(sy);
    if (stacked) {
      // papel abajo, desde el borde inferior del hueco del mapa (distancias desde el borde inferior de la pantalla);
      // transición corta y en px: la niebla no sube sobre el macizo (que se encaja por encima de TERR_STACK.fade)
      const edge = H - (top + layout.map.t + layout.map.h), bw = 32;
      U.uGuard.value = (H - (top + layout.colTop) + 8) * k;   // el texto, siempre sobre papel limpio
      U.uProfile.value.set((edge + 6) / H, edge / H, (edge + 10) / H, bw / H);
      U.uLobe.value = (0.5 * bw) / H;
    } else {
      // el texto de 01 (más ancho) también se protege mientras sigue en pantalla
      const vis1 = clamp((layout.parkText.bottom - sy) / (H * 0.35));
      const guard = lerp(layout.colRight, Math.max(layout.parkText.right, layout.colRight), vis1) + 28;
      const g = guard / W;
      U.uGuard.value = guard * k;
      // arriba arranca cerca del centro, al centro avanza un poco, abajo se retira
      U.uProfile.value.set(g + 0.15, g + 0.1, g + 0.25, 0.15);
      U.uLobe.value = 0.15;
    }

    if (vw) {
      // apilada: papel por encima del hueco del mapa mientras la sección entra (y si sube al final)
      U.uWin.value.set(0, 0, W * k, (H - Math.max(0, top + layout.map.t)) * k);
      U.uWinEdge.value.set(150 * k, 1);
    } else {
      U.uWinEdge.value.set(0, 0);
    }
  }

  function updateAtmosphere() {
    const { p, q1, q2 } = scroll;
    // Nubes bajas: en el hero, mar de nubes en los valles (se retira al alejarse la cámara);
    // en 02, apenas algunas nubes lejos del macizo. Nunca coinciden: entre ambas la cantidad es 0.
    const hc = HERO_LOOK.clouds, heroAmt = hc.amount * (1 - smooth(0.03, 0.28, p));
    const C = heroAmt > 0.001 ? hc : PAGE_CLOUDS;
    SHARED.uClouds.value.set(heroAmt > 0.001 ? heroAmt : 0.5 * smooth(0.4, 1, q1), C.alt, C.free[0], C.free[1]);
    SHARED.uCloudLook.value.set(C.cover[0], C.cover[1], C.opacity, C.thin);
    SHARED.uCloudSun.value = C.sun;
    // Las curvas de nivel suben por la montaña y luego se desvanecen (un instante, muy sutil)
    SHARED.uContour.value.x = smooth(0.3, 0.38, q2) * (1 - smooth(0.6, 0.7, q2));
    SHARED.uContour.value.y = lerp(0.6, terrain!.peakY + 0.9, smooth(0.32, 0.64, q2));
  }

  function updateFog(t: number, p: number) {
    const fogLight = intro.light, g = Math.max(lookMix, 0), P = LOOK_PAIRS;
    for (const m of [fogBackMat, fogFrontMat]) {
      m.uniforms.uTime.value = t;
      m.uniforms.uColA.value.copy(P.fogShade[0]).lerp(P.fogShade[1], g).multiplyScalar(fogLight);
      m.uniforms.uColB.value.copy(P.fogLit[0]).lerp(P.fogLit[1], g).multiplyScalar(fogLight);
    }
    fogBackMat.uniforms.uOpen.value = intro.open;
    fogBackMat.uniforms.uShift.value.set(mouse.x * 0.02, -mouse.y * 0.012);
    fogBack.visible = !introDone;

    const f = fogFrontMat.uniforms;
    f.uOpen.value = intro.frontOpen;
    f.uRest.value = 0.26 * intro.rest * (1 - smooth(0.0, 0.35, p));
    f.uShift.value.set(7.3 + mouse.x * 0.06, 2.7 - mouse.y * 0.03);
    const needMist = !introDone || f.uRest.value > 0.002;
    if (needMist) {
      mistRenderer.render(mistScene, quadCam);
    } else if (mistVisible) {
      mistRenderer.clear();
    }
    mistVisible = needMist;
  }

  // ---------------------------------------------------------------------------
  // Calidad gráfica adaptativa. La palanca es la densidad de píxeles del terreno: el 75–85 % del coste es sombrear
  // píxeles (auditoría, §5.1); geometría, materiales, luz y efectos no cambian. Hay dos grupos de fases, cada uno con
  // su densidad, porque el coste no es uniforme: «escena» (hero y 01) y «territorio» (01 → 02 y 02, ~1.5× más caro).
  // - Nivel de partida según el equipo (no según el ancho): alto · medio (el territorio un escalón más bajo) ·
  //   limitado (los dos grupos a 1 px por px CSS o menos y bordes suavizados solo al principio de la transición).
  // - Después, un regulador por ventanas de 16 fotogramas: si la mediana pasa de 25 ms (< 40 fps) en dos ventanas
  //   seguidas, baja un escalón el grupo en el que se está; si bajar no mejora (el cuello de botella no era la GPU), lo
  //   deshace y no lo vuelve a intentar. Solo sube con el scroll en reposo y tras 6 ventanas holgadas (≥ 55 fps o el
  //   ritmo de la pantalla); una subida que va lenta enseguida se deshace y no se repite. Así la densidad cambia pocas
  //   veces y nunca en vaivén.
  // En escritorio nunca baja de 1 px de canvas por px CSS: la nitidez del relieve manda.
  // ---------------------------------------------------------------------------
  type Group = 'scene' | 'terrain';
  type Tier = 'high' | 'medium' | 'limited';
  const DPR_FLOOR = mobileProfile ? 0.75 : Math.min(1, CFG.dpr);
  const LEVELS = [CFG.dpr, ...[1.25, 1, 0.85, 0.75].filter((v) => v < CFG.dpr - 0.01 && v > DPR_FLOOR - 0.01)];
  const levelOf = (v: number) => Math.max(0, LEVELS.findIndex((l) => l <= v + 0.01));
  function startTier(): Tier {
    const forced = perf ? qs.get('quality') : null;   // pruebas: ?perf&quality=medium
    if (forced === 'high' || forced === 'medium' || forced === 'limited') return forced;
    const gl = renderer.getContext(), dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
    const nav = navigator as Navigator & { deviceMemory?: number };
    const mem = nav.deviceMemory ?? 8, cores = nav.hardwareConcurrency || 8;
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu) || mem <= 2 || cores <= 2) return 'limited';
    // tablets: GPU de móvil para 2–4 veces los píxeles de un teléfono
    const px = window.innerWidth * window.innerHeight * CFG.dpr ** 2;
    if (mem <= 4 || (mobileProfile && px > 1.6e6)) return 'medium';
    return 'high';
  }
  const tier = startTier();
  const quality = {
    level: {
      scene: tier === 'limited' ? levelOf(1) : 0,
      terrain: tier === 'limited' ? levelOf(mobileProfile ? 0.85 : 1) : tier === 'medium' ? Math.min(1, LEVELS.length - 1) : 0,
    } as Record<Group, number>,
    noDown: { scene: false, terrain: false } as Record<Group, boolean>,
    noUp: { scene: false, terrain: false } as Record<Group, boolean>,
    raised: null as Group | null,             // grupo recién subido: si va lento enseguida, se vuelve y se bloquea
    trial: null as { group: Group; from: number; before: number } | null,
    group: 'scene' as Group,
    slow: 0,                                  // ventanas lentas seguidas
    calm: 0,                                  // ventanas holgadas seguidas (en reposo)
    vsync: 1000 / 60,                         // intervalo mínimo observado (pantallas de 60, 120, 144 Hz…)
    win: [] as number[],
  };
  let dpr = CFG.dpr, lastNow = 0, lastMove = 0, lastY = 0;
  const dprChanges: [number, number][] = [];
  function setDpr(v: number) {
    if (Math.abs(v - dpr) < 0.001) return;
    dpr = v;
    if (perf) dprChanges.push([Math.round(performance.now()), v]);
    renderer.setPixelRatio(dpr);            // cambia el canvas (three llama a setSize); el búfer intermedio, no
    fitAA();
  }
  const applyQuality = () => setDpr(LEVELS[quality.level[quality.group]]);
  const governed = !(perf && qs.has('fixed'));   // pruebas: ?perf&fixed mide cada nivel sin que el regulador lo mueva
  function adaptResolution(now: number) {
    const dt = now - lastNow;
    lastNow = now;
    const Q = quality;
    // grupo de fases, con histéresis para no alternar en el límite
    const g: Group = Q.group === 'scene' ? (scroll.q1 > 0.55 ? 'terrain' : 'scene') : (scroll.q1 < 0.45 ? 'scene' : 'terrain');
    if (g !== Q.group) {
      Object.assign(Q, { group: g, slow: 0, calm: 0, trial: null, raised: null });
      Q.win.length = 0;
      applyQuality();
    }
    if (!governed || dt <= 0 || dt > 250) return; // pestaña en segundo plano, etc.
    Q.win.push(dt);
    if (Q.win.length < 16) return;
    const s = Q.win.sort((a, b) => a - b), med = s[8], p90 = s[14];
    const mean = s.reduce((a, b) => a + b, 0) / s.length; // sin el escalonado de la mediana (múltiplos del refresco)
    Q.win.length = 0;
    Q.vsync = Math.min(Q.vsync, s[2]);
    const lv = Q.level[g];
    if (Q.trial) {
      // ¿bajar la densidad sirvió? Si el tiempo medio por fotograma no mejora al menos un 8 %, se deshace y el grupo
      // ya no baja
      if (mean > Q.trial.before * 0.92) { Q.level[g] = Q.trial.from; Q.noDown[g] = true; applyQuality(); }
      Q.trial = null;
      return;
    }
    if (med > 25) {
      Q.calm = 0;
      if (Q.raised === g) { Q.level[g] = lv + 1; Q.noUp[g] = true; Q.raised = null; applyQuality(); return; }
      if (++Q.slow < 2 || Q.noDown[g] || lv >= LEVELS.length - 1) return;
      Q.slow = 0;
      Q.trial = { group: g, from: lv, before: mean };
      Q.level[g] = lv + 1;
      // el territorio cuesta más que la escena: nunca queda con más densidad que ella
      if (g === 'scene') Q.level.terrain = Math.max(Q.level.terrain, Q.level.scene);
      applyQuality();
      return;
    }
    Q.raised = null;
    Q.slow = 0;
    const atRest = Math.abs(window.scrollY - scroll.y) < 0.5 && now - lastMove > 800;
    if (lv > 0 && !Q.noUp[g] && atRest && p90 <= Math.max(Q.vsync * 1.25 + 1, 18)) {
      if (++Q.calm >= 6) { Q.calm = 0; Q.level[g] = lv - 1; Q.raised = g; applyQuality(); }
    } else {
      Q.calm = 0;
    }
  }

  // Con el fragmento ya formado sobre el papel (antes de 02), fuera de él todo es marfil (el cielo ya es papel):
  // el terreno solo se dibuja en el recuadro del fragmento y el resto del canvas queda transparente.
  const corner = new THREE.Vector3();
  function islandRect(): Rect | null {
    if (scroll.q1 > 0 || SHARED.uPaper.value.w < 0.999 || SHARED.uIsland.value.w < 0.5) return null;
    const I = SHARED.uIsland.value, r = I.z + 1.5 * SHARED.uIslandShape.value.x; // radio + borde (ver TERRAIN_FS)
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [-0.3, terrain!.peakY + 0.3]) {
      corner.set(I.x + sx * r, y, I.y + sz * r).project(camera);
      x0 = Math.min(x0, corner.x); x1 = Math.max(x1, corner.x);
      y0 = Math.min(y0, corner.y); y1 = Math.max(y1, corner.y);
    }
    const m = 8; // px de margen
    const l = clamp((x0 * 0.5 + 0.5) * W - m, 0, W), rr = clamp((x1 * 0.5 + 0.5) * W + m, 0, W);
    const b = clamp((y0 * 0.5 + 0.5) * H - m, 0, H), t = clamp((y1 * 0.5 + 0.5) * H + m, 0, H);
    return { x: l, y: b, w: rr - l, h: t - b };
  }

  // El terreno va al búfer intermedio y la pasada de bordes lo copia al canvas (con el mismo recorte).
  // Solo hace falta mientras hay perfiles contra el cielo (hero y comienzo de la transición): en 01 el
  // fragmento tiene borde de niebla y en 02 la vista es cenital, así que se dibuja directo (−3 a −5 ms).
  // Los recortes del búfer se dan en píxeles del búfer; los del canvas, en px CSS (three los escala).
  function render() {
    const r = ready ? islandRect() : null;
    const drawScene = !r || (r.w > 1 && r.h > 1);
    // nivel limitado: bordes suavizados en el hero y al principio de la transición, no durante toda ella
    const needAA = !!aaTarget && scroll.q1 === 0 && SHARED.uPaper.value.w < 0.999 && (tier !== 'limited' || scroll.p < 0.3);
    if (!needAA || !aaTarget) {
      renderer.setScissorTest(false);
      if (r) renderer.clear();
      if (drawScene) {
        renderer.setScissorTest(!!r);
        if (r) renderer.setScissor(r.x, r.y, r.w, r.h);
        renderer.render(scene, camera);
      }
      return;
    }
    // (Probado y descartado: recortar también la franja del cielo sobre el horizonte. En GPUs integradas
    // los borrados parciales anulan el borrado rápido y el fotograma resultaba más caro: 15.6 → 18.1 ms.)
    const k = renderer.getPixelRatio();
    renderer.setRenderTarget(aaTarget);
    aaTarget.scissorTest = false;
    renderer.clear();                     // todo el búfer: la pasada de bordes lee también fuera del recorte
    if (drawScene) {
      aaTarget.scissorTest = !!r;
      if (r) aaTarget.scissor.set(r.x * k, r.y * k, r.w * k, r.h * k);
      renderer.setRenderTarget(aaTarget); // vuelve a aplicar el recorte
      renderer.render(scene, camera);
    }
    renderer.setRenderTarget(null);
    renderer.setScissorTest(false);
    if (r) renderer.clear();
    if (drawScene) {
      renderer.setScissorTest(!!r);
      if (r) renderer.setScissor(r.x, r.y, r.w, r.h);
      renderer.render(aaScene, quadCam);
    }
  }

  // Cielo: cuando ya es papel liso no cambia, así que no se vuelve a pintar
  function renderSky() {
    const still = SHARED.uPaper.value.w >= 0.999;
    if (still && skyStill) return;
    skyStill = still;
    skyRenderer.render(skyScene, camera); // la cámara principal: el cielo usa su orientación y su posición
  }

  let lastFrame = 0;
  function updateScroll(now: number) {
    if (!phases) return;
    const dt = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000));
    if (Math.abs(window.scrollY - lastY) > 0.5) { lastY = window.scrollY; lastMove = now; }
    scroll.y += (window.scrollY - scroll.y) * (1 - Math.exp(-dt / SCROLL_LAG));
    if (Math.abs(window.scrollY - scroll.y) < 0.05) scroll.y = window.scrollY;
    const prog = (st: ScrollTrigger) => clamp((scroll.y - st.start) / Math.max(1, st.end - st.start));
    scroll.p = prog(phases.p);
    scroll.q1 = prog(phases.q1);
    scroll.q2 = prog(phases.q2);
  }

  // ---------------------------------------------------------------------------
  // Bucle: uno solo, cancelado en dispose()
  // ---------------------------------------------------------------------------
  const frameJs: number[] = [];
  let raf = 0;
  function frame(now: number) {
    const t0 = perf ? performance.now() : 0;
    const t = now / 1000;
    // Pasado «El Territorio», las secciones siguientes (fondo opaco) cubren toda la pantalla: no se dibuja
    // nada. El scroll sigue sincronizado, así al volver la cámara está donde debe.
    if (ready && layout.terrTop + layout.terrH - window.scrollY <= 0) {
      // la niebla delantera va por encima del contenido: se borra para que no quede un fotograma viejo
      if (mistVisible) { mistRenderer.clear(); mistVisible = false; }
      updateScroll(now);
      lastFrame = lastNow = now;
      raf = requestAnimationFrame(frame);
      return;
    }
    // sin contexto no se dibuja ni se mide (la resolución adaptativa interpretaría la pausa como lentitud)
    if (contextLost) {
      updateScroll(now);
      lastFrame = lastNow = now;
      raf = requestAnimationFrame(frame);
      return;
    }
    adaptResolution(now);
    updateScroll(now);
    lastFrame = now;
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;

    const p = scroll.p;
    const island = ready ? updateIsland() : 0;
    SHARED.uTime.value = t;
    // la vista cenital y el fragmento flotante, algo más luminosos (luz de mañana, relieve claro)
    SHARED.uLight.value = intro.light * (1 + 0.08 * scroll.q1) * (1 + 0.15 * island);
    SHARED.uAtmos.value = lerp(1, 0.5, smooth(0.2, 0.9, p)) * lerp(1, 0.25, scroll.q1);
    updateLook(p);

    if (ready) {
      updateCamera();
      updatePeak();
      updateTerritory(island);
      updateAtmosphere();
    }
    updateFog(t, p);
    renderSky();
    render();
    if (perf) frameJs.push(performance.now() - t0);
    raf = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------------------
  // Animaciones (GSAP): todas dentro de un contexto con ámbito en la raíz de la app, así los selectores
  // no salen de ella y dispose() las revierte de una vez (estilos en línea incluidos).
  // ---------------------------------------------------------------------------
  const ctx = gsap.context(() => {}, els.root);

  function setupScroll() {
    ctx.add(() => {
      // Tramos de scroll de cada fase (solo miden; el progreso se calcula en updateScroll)
      const range = (trigger: Element, start: string, end: string | (() => string)) => ScrollTrigger.create({ trigger, start, end });
      phases = {
        p: range(els.park, 'top bottom', 'top top'),               // hero → 01: hasta que "El Parque" llega arriba
        q1: range(els.territory, 'top bottom', 'top top'),         // 01 → 02: la cámara se eleva sobre el macizo
        // dentro de 02, mientras el escenario está fijo (si el texto va debajo del escenario, no cuenta su recorrido)
        q2: range(els.territory, 'top top', () => `+=${els.territory.offsetHeight - els.territoryStage.offsetHeight}`),
      };
      scroll.y = window.scrollY;

      // El nombre no se desvanece: sube con la página mientras la cámara se aleja y la montaña lo deja libre.
      // Solo la interfaz pequeña (marca, navegación, indicador) se retira, ligada al scroll y sin retraso.
      gsap.to(els.heroChrome, {
        autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: els.hero, start: 'top top', end: '25% top', scrub: true },
      });

      // el texto entra cuando el paisaje ya se ha recogido en el fragmento: nunca queda sobre la montaña
      gsap.from(els.park.querySelectorAll('[data-reveal]'), {
        autoAlpha: 0, y: 22, duration: 1.1, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: els.park, start: 'top 30%' },
      });
    });
  }

  function runIntro() {
    ctx.add(() => {
      if (skipIntro) {
        Object.assign(intro, { open: 2, frontOpen: 2, light: 1, dolly: 0, rest: 1 });
        gsap.set('[data-intro]', { opacity: 1 });
        introDone = true;
        return;
      }
      // 0.5 s la niebla se abre · ~3 s el paisaje está a la vista · "Parque Nacional" · "Montaña" sube dentro
      // de su máscara · enseguida "de Santa Bárbara" · al final, discretos, la navegación y el indicador
      const tl = gsap.timeline({ onComplete: () => { introDone = true; } });
      if (perf) (window as unknown as Record<string, unknown>).PANAMOSAB_INTRO = tl;
      tl.to(intro, { frontOpen: 2, duration: 3.8, ease: 'sine.inOut' }, 0.5)
        .to(intro, { open: 2, duration: 3.4, ease: 'sine.inOut' }, 0.7)
        .to(intro, { light: 1, duration: 3.0, ease: 'sine.inOut' }, 0.5)
        .to(intro, { dolly: 0, duration: 4.5, ease: 'power3.out' }, 0.4)
        .to(intro, { rest: 1, duration: 2.4, ease: 'sine.inOut' }, 2.4)
        .fromTo('[data-intro="eyebrow"]', { opacity: 0, letterSpacing: '0.44em' }, { opacity: 1, letterSpacing: '0.32em', duration: 2.0, ease: 'sine.out' }, 2.9)
        // desde 140 %: ni la virgulilla de la Ñ ni la tilde de la Á asoman antes que su letra
        .fromTo('[data-intro="main"]', { opacity: 1, yPercent: 140 }, { yPercent: 0, duration: 2.0, ease: 'power3.out' }, 3.3)
        .fromTo('[data-intro="sub"]', { opacity: 1, yPercent: 140 }, { yPercent: 0, duration: 1.8, ease: 'power3.out' }, 3.75)
        .fromTo('[data-intro="nav"]', { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'sine.out', stagger: 0.15 }, 4.6)
        .fromTo('[data-intro="cue"]', { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'sine.out' }, 5.0);
    });
  }

  // ---------------------------------------------------------------------------
  // Pruebas de rendimiento (?perf): los mismos contadores que usaba la versión anterior
  // ---------------------------------------------------------------------------
  const perfGlobals = perf ? {
    PANAMOSAB_SCROLL: scroll,
    __js: frameJs,
    __dpr: dprChanges,
    __quality: () => ({
      tier, governed, dpr, group: quality.group, levels: LEVELS,
      scene: LEVELS[quality.level.scene], terrain: LEVELS[quality.level.terrain], stacked: layout.stacked,
    }),
    __R: { renderer, skyRenderer, mistRenderer, scene, skyScene, mistScene, quadCam, camera },
    __renderFull: () => render(),
  } : null;
  if (perfGlobals) Object.assign(window, perfGlobals);

  // ---------------------------------------------------------------------------
  // Arranque: la niebla se anima mientras carga el relieve; la intro empieza cuando está listo.
  // ---------------------------------------------------------------------------
  const nextFrame = () => new Promise<void>((resolve, reject) => {
    requestAnimationFrame(() => (disposed ? reject(new Cancelled()) : resolve()));
  });

  // Cambios de tamaño de la página sin cambio de ventana (fuentes, la columna de 02 que sale del escenario o vuelve):
  // se vuelve a medir y ScrollTrigger recalcula sus tramos, que a su vez vuelven a pedir medidas.
  let pageH = -1;
  const ro = new ResizeObserver(() => {
    measure();
    const h = els.root.offsetHeight;
    if (h !== pageH) { pageH = h; if (phases) ScrollTrigger.refresh(); }
  });
  ro.observe(els.root);
  cleanups.push(() => ro.disconnect());
  ScrollTrigger.addEventListener('refresh', measure);
  cleanups.push(() => ScrollTrigger.removeEventListener('refresh', measure));

  applyQuality();
  resize(true);
  raf = requestAnimationFrame(frame);

  (async () => {
    try {
      const data = await loadTerrainData(mobileProfile);
      if (disposed) throw new Cancelled();
      terrain = await buildTerrain({ data, cfg: CFG, renderer, scene, camera, shared: SHARED, nextFrame });
      if (disposed) { terrain.dispose(); terrain = null; throw new Cancelled(); }
      SHARED.uMassif.value.set(terrain.anchor.x, terrain.anchor.z);
      lookMix = -1; // aplica el grading actual a los materiales recién creados
      ready = true;
      layoutTitle();
      document.fonts?.ready.then(() => { if (!disposed) layoutTitle(); }); // el ancho del título cambia con la fuente
      setupScroll();
      runIntro();
      cb.onReady();
    } catch (err) {
      if (err instanceof Cancelled || disposed) return;
      console.error(err);
      cb.onError(err);
    }
  })();

  return {
    relayout: layoutTitle,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      ctx.revert();                    // ScrollTriggers, timeline e intro (con sus estilos en línea)
      terrain?.dispose();
      terrain = null;
      owned.forEach((o) => o.dispose());
      release();
      if (perfGlobals) for (const k of Object.keys(perfGlobals)) delete (window as unknown as Record<string, unknown>)[k];
    },
  };
}
