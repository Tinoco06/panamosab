/* Shaders del terreno, el cielo, la niebla y el antialiasing de bordes. El GLSL es idéntico al de la
   versión anterior (legacy/src/shaders.js). Unidades: km. */

const NOISE = /* glsl */ `
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    // fBm precalculado en una textura repetible (ver makeNoiseTexture en main.js)
    uniform sampler2D uNoise;
    float fbm(vec2 p) { return texture2D(uNoise, p * 0.125).r; }
    float fbmB(vec2 p) { return texture2D(uNoise, p * 0.125).g; }
  `;

// Color del cielo en una dirección. Lo comparten el cielo y la perspectiva aérea del terreno,
// así el horizonte y la bruma lejana siempre coinciden.
const SKY = /* glsl */ `
    uniform vec3 uSun;
    uniform vec3 uZenith;
    uniform vec3 uHorizon;
    uniform vec3 uSunGlow;
    uniform float uLight;
    uniform float uGlowWide;       // resplandor amplio del lado del sol, pegado al horizonte (hero: amanecer)
    vec3 skyColor(vec3 d) {
      float h = clamp(d.y, 0.0, 1.0);
      vec3 col = mix(uHorizon, uZenith, pow(smoothstep(-0.02, 0.42, h), 0.62));
      float s = max(dot(d, uSun), 0.0);
      col += uSunGlow * (0.22 * pow(s, 4.0) + 0.45 * pow(s, 40.0)) * (1.0 - 0.5 * h);
      // envolvente: el cielo se dora hacia el lado del sol (aunque esté fuera de cuadro) y queda azul limpio
      // en el opuesto. Mezcla hacia el tono del sol en vez de sumar luz, así no se lava a blanco.
      vec2 hs = normalize(uSun.xz), hd = normalize(d.xz + 1e-5);
      float wide = clamp(uGlowWide * 0.5 * pow(dot(hd, hs) * 0.5 + 0.5, 1.5) * pow(1.0 - h, 1.5), 0.0, 0.8);
      col = mix(col, uSunGlow * 0.6 + vec3(0.55, 0.6, 0.5), wide);   // crema dorado, no rosado
      return col;
    }
    // Marfil de la página (sRGB, el mismo valor que el CSS) y cuánto lo toma el fondo
    uniform vec4 uPaper;
    vec3 toScreen(vec3 c) { return pow(max(c * uLight, 0.0), vec3(1.0 / 2.2)); }
    // Lo que se ve detrás del terreno: el cielo, que se vuelve papel durante la transición
    vec3 backdrop(vec3 d) { return mix(toScreen(skyColor(d)), uPaper.rgb, uPaper.w); }
  `;

export const QUAD_VS = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

// El cielo va en el plano lejano: se dibuja después del terreno y solo donde no hay terreno
export const SKY_VS = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 1.0, 1.0);
    }
  `;

export const SKY_FS = /* glsl */ `
    uniform mat4 uInvProj;
    uniform mat4 uCamWorld;
    uniform float uTime;
    uniform float uCloudH;
    uniform vec3 uCloudLit;
    uniform vec3 uCloudShade;
    varying vec2 vUv;
    ${NOISE}
    ${SKY}
    void main() {
      vec4 v = uInvProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
      vec3 dir = normalize((uCamWorld * vec4(v.xyz / v.w, 0.0)).xyz);
      vec3 col = skyColor(dir);
      // las nubes toman la luz del sol: más cálidas hacia el lado del sol, sin volverse amarillas
      vec3 sunLit = uSunGlow * (0.25 + 0.9 * pow(max(dot(dir, uSun), 0.0), 3.0));

      // Nubes altas (altocúmulos/cirros) sobre un plano a uCloudH km
      if (dir.y > 0.0) {
        float t = (uCloudH - cameraPosition.y) / max(dir.y, 0.02);
        vec2 q = (cameraPosition.xz + dir.xz * t) * 0.04 + vec2(uTime * 0.003, 0.0);
        float n = fbm(q * vec2(1.0, 2.4)) * 0.7 + fbmB(q * 3.3) * 0.3;
        float c = smoothstep(0.53, 0.8, n) * smoothstep(0.0, 0.12, dir.y) * exp(-t * 0.003);
        vec3 cc = mix(uCloudShade, uCloudLit, smoothstep(0.5, 0.85, n)) + sunLit * smoothstep(0.5, 0.8, n);
        col = mix(col, cc, c * 0.65);
      }

      // Banco de cúmulos lejanos apoyado en el horizonte
      vec2 ring = normalize(dir.xz + 1e-5);   // dirección horizontal, sin costura (no usar atan)
      float top = 0.012 + 0.045 * smoothstep(0.35, 0.75, fbm(ring * 2.6 + 0.37));
      float puff = fbm(ring * 16.0 + vec2(dir.y * 55.0, uTime * 0.002));
      float bank = smoothstep(0.0, 0.012, top - dir.y + (puff - 0.5) * 0.02) * smoothstep(-0.03, 0.0, dir.y);
      vec3 bc = mix(uCloudShade, uCloudLit, smoothstep(-0.005, top, dir.y) * 0.6 + puff * 0.4) + sunLit * puff;
      col = mix(col, bc, bank * 0.35);

      col = mix(toScreen(col), uPaper.rgb, uPaper.w);
      col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

// Las nubes bajas se calculan por vértice (no por píxel): son formas grandes y suaves, y así cuestan
// ~5 veces menos. El ruido se lee en un mip algo desenfocado para que no parpadee entre vértices (más
// desenfocado en la capa lejana, de malla más abierta). Por píxel solo queda mezclar el color.
export const TERRAIN_VS = /* glsl */ `
    uniform sampler2D uNoise;
    uniform vec4 uClouds;          // ver TERRAIN_FS
    uniform vec4 uCloudLook;
    uniform float uCloudSun;
    uniform vec3 uSun;
    uniform vec2 uMassif;
    uniform float uHazeDensity;
    uniform float uHazeFalloff;
    uniform float uHazeStart;
    uniform float uTime;
    uniform sampler2D uNormalMap;  // altura suavizada en el alfa (ver TERRAIN_FS)
    uniform vec3 uHeightRange;
    uniform vec3 uIslandShape;
    varying vec2 vUv;
    varying vec3 vWorld;
    varying vec3 vNormal;
    varying vec3 vCloud;           // cobertura, tono (0 sombra → 1 luz), bruma por distancia
    varying float vCloudShadow;    // sombra de las nubes sobre el terreno (solo en 02): 1 = sin sombra
    varying float vIslandShape;    // alcance extra del fragmento flotante en este punto (km, sin acotar)
  #if __VERSION__ >= 300
    #define TEX_LOD(s, uv, l) textureLod(s, uv, l)
  #else
    #define TEX_LOD(s, uv, l) texture2DLod(s, uv, l)
  #endif
    #define NOISE_LOD(p, l) TEX_LOD(uNoise, (p) * 0.125, l)
  #ifdef FAR
    const vec2 CLOUD_LOD = vec2(2.5, 3.5);
    const vec2 ISLAND_LOD = vec2(2.5, 4.5);
  #else
    const vec2 CLOUD_LOD = vec2(1.0, 2.0);
    const vec2 ISLAND_LOD = vec2(0.5, 2.0);
  #endif
    void main() {
      vUv = uv;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vWorld = w.xyz;
      vNormal = normal;
      // Silueta del fragmento flotante: el relieve (las crestas llegan más lejos que los valles) y dos
      // escalas de ruido. Solo depende del punto del terreno, así que se calcula aquí y no por píxel.
      vIslandShape = 0.0;
    #ifdef ISLAND
      float e = uIslandShape.x;
    #ifdef FAR
      float hs = w.y;
    #else
      float hs = uHeightRange.x + TEX_LOD(uNormalMap, uv, uHeightRange.z).a * uHeightRange.y;
    #endif
      vIslandShape = (hs - uIslandShape.y) * uIslandShape.z
                   + (NOISE_LOD(w.xz * 0.35 + 5.3, ISLAND_LOD.x).r - 0.5) * e * 3.0
                   + (NOISE_LOD(w.xz * 1.3 + 1.7, ISLAND_LOD.y).g - 0.5) * e * 1.2;
    #endif
      vCloud = vec3(0.0);
      vCloudShadow = 1.0;
      // sombra de las nubes, proyectada según el sol: solo depende del punto del terreno, no de la cámara
      if (uClouds.x > 0.001 && uCloudSun <= 0.0) {
        vec2 sp = w.xz + uSun.xz / uSun.y * (uClouds.y - w.y);
        float sn = NOISE_LOD(sp * 0.2 + vec2(uTime * 0.006, 0.0), CLOUD_LOD.x).r * 0.7 + NOISE_LOD(sp * 0.62, CLOUD_LOD.y).g * 0.3;
        vCloudShadow = 1.0 - 0.18 * smoothstep(uCloudLook.x, uCloudLook.y, sn) * smoothstep(uClouds.z, uClouds.w, length(sp - uMassif)) * min(uClouds.x, 1.0);
      }
      // nubes entre la cámara y el terreno: solo si la cámara está por encima y el punto por debajo
      if (uClouds.x > 0.001 && cameraPosition.y > uClouds.y) {
        vec3 dir = normalize(w.xyz - cameraPosition);
        float tc = (uClouds.y - cameraPosition.y) / min(dir.y, -1e-3);
        vec2 cp = cameraPosition.xz + dir.xz * tc;
        float cn = NOISE_LOD(cp * 0.2 + vec2(uTime * 0.006, 0.0), CLOUD_LOD.x).r * 0.7
                 + NOISE_LOD(cp * 0.62, CLOUD_LOD.y).g * 0.3;
        float keep = step(w.y, uClouds.y) * smoothstep(uClouds.z, uClouds.w, length(cp - uMassif)) * uClouds.x;
        if (uCloudLook.w > 0.0) {
          keep *= smoothstep(0.0, uCloudLook.w, uClouds.y - w.y);   // se adelgazan donde sube el relieve
          keep *= smoothstep(9.0, 15.0, tc);                         // no tapan el primer plano (ni el texto de abajo)
        }
        float haze = 1.0 - exp(-max(tc - uHazeStart, 0.0) * uHazeDensity * exp(-uClouds.y * uHazeFalloff));
        vCloud = vec3(min(smoothstep(uCloudLook.x, uCloudLook.y, cn) * keep, 1.0), smoothstep(uCloudLook.x, 0.92, cn), haze);
      }
      gl_Position = projectionMatrix * viewMatrix * w;
    }
  `;

// FAR: cordilleras lejanas (normales de la geometría, sin capa de detalle).
export const TERRAIN_FS = /* glsl */ `
    uniform sampler2D uSat;
    uniform sampler2D uNormalMap;
    uniform sampler2D uDetail;
    uniform sampler2D uFarSat;
    uniform vec4 uDetailRect;      // oeste, norte, lado (km), activo
    uniform vec4 uFarRect;         // oeste, norte, lado (km)
    uniform vec3 uTint;
    uniform vec3 uSunColor;
    uniform vec3 uAmbient;
    uniform vec3 uMistLit;
    uniform vec3 uMistShade;
    uniform float uExposure;
    uniform float uSaturation;
    uniform float uRelief;
    uniform float uLocalContrast;
    uniform float uHazeDensity;
    uniform float uHazeFalloff;
    uniform float uHazeStart;      // km sin bruma delante de la cámara
    uniform vec3 uFog;             // densidad base (1/km), caída con la altura (1/km), altitud base (km)
    uniform float uMistAmt;
    uniform float uAtmos;
    uniform vec4 uClouds;          // nubes bajas: cantidad, altitud (km), radio libre alrededor del macizo (km): desde, hasta
    uniform vec4 uCloudLook;       // cobertura (umbral bajo, alto), opacidad máxima, fundido con el relieve (km; 0 = sin fundido)
    uniform float uCloudSun;       // cuánto toman las nubes bajas la luz cálida del sol
    uniform vec4 uContour;         // curvas de nivel: cantidad, barrido (km), intervalo (km)
    uniform vec2 uMassif;
    uniform vec2 uMistRange;
    uniform vec2 uCenter;
    uniform vec2 uFade;            // radio (km) donde el terreno lejano se funde con el cielo
    uniform vec4 uIsland;          // fragmento flotante: centro (km), radio (km), activo
    uniform vec3 uIslandShape;     // ancho del borde (km), altura de referencia (km), alcance extra por km de altura
    uniform vec3 uHeightRange;     // altura en el alfa de uNormalMap: mínimo (km), rango (km), mip suavizado
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorld;
    varying vec3 vNormal;
    varying vec3 vCloud;           // nubes bajas, calculadas por vértice (TERRAIN_VS): cobertura, tono, bruma
    varying float vCloudShadow;    // y su sombra sobre el terreno
    varying float vIslandShape;    // silueta del fragmento flotante, calculada por vértice
    ${NOISE}
    ${SKY}

    // Contraste local: realza el detalle de la ortofoto restando una versión desenfocada (mip superior)
    vec3 sharp(sampler2D s, vec2 uv) {
      vec3 a = texture2D(s, uv).rgb;
      vec3 b = texture2D(s, uv, 2.5).rgb;
      return a + (a - b) * uLocalContrast;
    }
    vec2 rectUv(vec4 r, vec2 xz) { vec2 t = (xz - r.xy) / r.z; return vec2(t.x, 1.0 - t.y); }
    float rectFade(vec2 uv, float w) { vec2 e = min(uv, 1.0 - uv); return smoothstep(0.0, w, min(e.x, e.y)); }

    void main() {
      // Fragmento flotante: fuera de él no se dibuja terreno (se ve el fondo). El límite sigue al relieve
      // suavizado y a dos escalas de ruido (vIslandShape, calculado por vértice en TERRAIN_VS).
      float rim = 0.0;               // 0 dentro del fragmento → 1 en el borde exterior
    #ifdef ISLAND
      {
        float e = uIslandShape.x;
        // acotado: nada lejano queda suelto alrededor del fragmento
        float reach = uIsland.z + clamp(vIslandShape, -2.5 * e, 1.0 * e);
        rim = smoothstep(-e, e * 0.4, length(vWorld.xz - uIsland.xy) - reach);
        if (rim > 0.996) discard;
      }
    #endif

      vec3 c = sharp(uSat, vUv);
    #ifdef FAR
      vec3 N = normalize(vNormal);
    #else
      if (uDetailRect.w > 0.5) {
        vec2 du = rectUv(uDetailRect, vWorld.xz);
        float m = rectFade(du, 0.08);
        if (m > 0.0) c = mix(c, sharp(uDetail, du), m);
      }
      // En el borde, la ortofoto cercana se funde con la lejana para que no se note el cambio de fuente
      float edge = rectFade(vUv, 0.1);
      if (edge < 1.0) c = mix(texture2D(uFarSat, rectUv(uFarRect, vWorld.xz)).rgb, c, edge);
      vec3 N = normalize(texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0);
    #endif
      // hacia el borde del fragmento el terreno se desenfoca y el relieve se aplana, como visto a través del aire
      if (rim > 0.0) {
        c = mix(c, texture2D(uSat, vUv, 4.0).rgb, smoothstep(0.0, 0.7, rim));
        N = normalize(mix(N, vec3(0.0, 1.0, 0.0), rim * 0.6));
      }

      vec3 alb = pow(max(c, 0.0), vec3(2.2));
      float l = dot(alb, vec3(0.2126, 0.7152, 0.0722));
      alb = mix(vec3(l), alb, uSaturation) * uTint;

      float diff = clamp(dot(N, uSun) * 0.9 + 0.1, 0.0, 1.0);
      vec3 light = uSunColor * diff + uAmbient * (0.6 + 0.4 * N.y);
      vec3 col = alb * mix(vec3(1.0), light, uRelief) * uExposure;

      // Sombra de las nubes bajas (solo en 02; calculada por vértice en TERRAIN_VS)
      col *= vCloudShadow;

    #ifndef FAR
      // Curvas de nivel: aparecen subiendo por la montaña y se desvanecen. Finas, cálidas, discretas.
      if (uContour.x > 0.001) {
        float f = vWorld.y / uContour.z;
        float line = 1.0 - min(abs(fract(f - 0.5) - 0.5) / max(fwidth(f), 1e-4), 1.0);
        float f5 = f / 5.0;
        float major = 1.0 - min(abs(fract(f5 - 0.5) - 0.5) / max(fwidth(f5) * 1.3, 1e-4), 1.0);
        // una banda que sube por la ladera: más visible en el frente del barrido, tenue detrás
        float front = smoothstep(uContour.y - 0.9, uContour.y - 0.25, vWorld.y) * (1.0 - smoothstep(uContour.y - 0.12, uContour.y, vWorld.y));
        float reveal = max(front, 0.35 * (1.0 - smoothstep(uContour.y - 0.12, uContour.y, vWorld.y)));
        float region = 1.0 - smoothstep(4.5, 8.5, length(vWorld.xz - uMassif));
        float a = max(line * 0.3, major * 0.48) * reveal * region * uContour.x;
        col = mix(col, vec3(1.0, 0.97, 0.9) * uExposure, a);
      }
    #endif

      vec3 V = vWorld - cameraPosition;
      float d = length(V);
      vec3 dir = V / d;

      // Niebla: parches en los valles + niebla de altura integrada a lo largo de la mirada
      float n = fbm(vWorld.xz * 0.5 + vec2(uTime * 0.008, uTime * 0.003));
      float phase = pow(max(dot(dir, uSun), 0.0), 3.0);
      vec3 mist = mix(uMistShade, uMistLit, 0.5 + 0.5 * smoothstep(0.3, 0.8, n)) + uSunGlow * phase * 0.25;

      float valley = 1.0 - smoothstep(uMistRange.x, uMistRange.y, vWorld.y + (n - 0.5) * 0.35);
      col = mix(col, mist, valley * smoothstep(0.32, 0.72, n) * uMistAmt * uAtmos);

      float k = uFog.y;
      float dy = dir.y;
      float ec = exp(-k * (cameraPosition.y - uFog.z));
      float od = abs(dy) < 1e-3 ? uFog.x * ec * d : uFog.x * (ec - exp(-k * (vWorld.y - uFog.z))) / (k * dy);
      od *= mix(0.5, 1.5, n) * uAtmos;
      col = mix(col, mist, 1.0 - exp(-od));

      // Perspectiva aérea: lo lejano pierde contraste y toma el color del cielo
      float avgY = max(0.0, 0.5 * (cameraPosition.y + vWorld.y));
      float hz = 1.0 - exp(-max(d - uHazeStart, 0.0) * uHazeDensity * exp(-avgY * uHazeFalloff));
      vec3 hcol = skyColor(normalize(vec3(dir.x, max(dir.y, 0.0) * 0.3 + 0.01, dir.z)));
      col = mix(col, hcol, hz);
      col = mix(col, hcol, smoothstep(uFade.x, uFade.y, length(vWorld.xz - uCenter)));

      // Nubes bajas entre la cámara y el terreno: en el hero, mar de nubes en los valles; en 02, algunas
      // nubes lejos del macizo. Se adelgazan donde el relieve se acerca a su altitud (sin bordes duros),
      // toman la luz del sol por el lado iluminado y se pierden en la bruma con la distancia.
      // Cobertura, tono y bruma vienen de los vértices (vCloud); aquí solo se mezcla el color.
      if (vCloud.x > 0.002) {
        vec3 cc = uMistLit * mix(0.96, 1.08, vCloud.y);
        if (uCloudSun > 0.0) {
          cc = uMistLit * mix(0.86, 1.06, vCloud.y) + uSunGlow * uCloudSun * (0.3 + 0.7 * phase);
          cc = mix(cc, hcol, vCloud.z);
        }
        col = mix(col, cc, vCloud.x * uCloudLook.z);
      }

      // Borde del fragmento: una niebla ligera y luminosa que deriva despacio, y luego el fondo
      if (rim > 0.0) {
        float wisp = fbm(vWorld.xz * 0.9 + vec2(uTime * 0.01, -uTime * 0.004));
        col = mix(col, uMistLit * 1.05, smoothstep(0.0, 0.6, rim) * mix(0.5, 0.95, wisp));
      }

      col = toScreen(col);
      if (rim > 0.0) col = mix(col, backdrop(dir), smoothstep(0.3, 1.0, rim));
      col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

// Borde atmosférico (sección 02): el papel marfil ocupa el lado del texto y el territorio aparece
// desde el aire. La silueta combina un perfil suave (arriba / centro / abajo), lóbulos grandes que
// derivan muy despacio y jirones finos solo en la franja de transición: nunca una línea, un
// rectángulo, una diagonal ni un óvalo.
export const VEIL_FS = /* glsl */ `
    uniform vec3 uColor;
    uniform vec2 uRes;             // tamaño del canvas (px)
    uniform vec4 uProfile;         // límite: arriba, centro, abajo (fracción del ancho), ancho de la transición
    uniform float uGuard;          // hasta aquí siempre papel (px en el eje transversal): protege el texto
    uniform float uAxis;           // 1: terreno a la derecha (escritorio) · 0: terreno arriba (móvil)
    uniform float uAmount;
    uniform vec4 uWin;             // ventana de 01 mientras se abre: x0, y0, x1, y1 (px del canvas)
    uniform vec2 uWinEdge;         // ancho del borde difuso (px), intensidad
    uniform float uAir;            // tono del aire sobre el territorio (0 mientras aún es un fragmento sobre papel)
    uniform float uLobe;           // amplitud de los entrantes del límite (fracción del eje transversal)
    uniform float uTime;
    varying vec2 vUv;
    ${NOISE}

    // Fuera de la ventana: papel. El borde pasa de recto (01) a niebla irregular a medida que se abre.
    float window() {
      vec2 p = gl_FragCoord.xy;
      float d = max(max(uWin.x - p.x, p.x - uWin.z), max(uWin.y - p.y, p.y - uWin.w)); // > 0 fuera
      float w = max(uWinEdge.x, 1.0);
      float n = fbm(p / max(w * 4.0, 60.0) + vec2(uTime * 0.008, 0.0)) - 0.5;
      return smoothstep(-w * 0.25, w, d + n * w * 1.1);
    }

    void main() {
      vec2 p = gl_FragCoord.xy;
      bool side = uAxis > 0.5;
      float span = side ? uRes.x : uRes.y;
      float across = side ? p.x : p.y;                       // del papel hacia el terreno
      float along = side ? p.y / uRes.y : p.x / uRes.x;      // a lo largo del límite

      // perfil: parábola por los tres puntos (abajo, centro, arriba) + lóbulos lentos
      float t = along * 2.0 - 1.0;
      float base = uProfile.y + (uProfile.x - uProfile.z) * 0.5 * t
                 + ((uProfile.x + uProfile.z) * 0.5 - uProfile.y) * t * t;
      // 2–3 entrantes y salientes a lo largo del alto (la textura de ruido repite cada 8 unidades)
      float lobes = (fbm(vec2(along * 6.0 + 3.7, 0.4 + uTime * 0.02)) - 0.5) * uLobe;
      float bw = uProfile.w;
      float d = across / span - (base + lobes);              // > 0: territorio

      // niebla: manchas 2D medias y grandes, blandas (ni rayas, ni dientes, ni papel rasgado)
      float fine = fbm(p / (span * 0.065) + vec2(uTime * 0.01, 0.0)) - 0.5;
      float wisp = fbmB(p / (span * 0.13) + vec2(0.0, -uTime * 0.006)) - 0.5;
      float dd = d + fine * bw * 0.35 + wisp * bw * 1.0;

      float paper = 1.0 - smoothstep(-bw * 0.25, bw, dd);
      // aire: el territorio se aclara y pierde contraste antes de desaparecer (perspectiva atmosférica)
      float air = 0.24 * (1.0 - smoothstep(0.0, bw * 2.2, dd));
      // el texto siempre sobre papel limpio (borde también irregular, por si el límite se acerca)
      float guard = 1.0 - smoothstep(uGuard, uGuard + span * 0.05, across + fine * span * 0.04);
      float a = max(max(paper, air), guard) * uAmount;

      float win = uWinEdge.y > 0.001 ? window() * uWinEdge.y : 0.0;
      // el aire es apenas más fresco y luminoso que el papel
      vec3 col = mix(uColor, vec3(0.972, 0.979, 0.976), (1.0 - paper) * (1.0 - win) * 0.7 * uAir);
      a = max(a, win);
      gl_FragColor = vec4(col + (hash(gl_FragCoord.xy) - 0.5) / 255.0, a);
    }
  `;

// Niebla de pantalla: estratos estirados en horizontal, con deformación de dominio.
// uOpen abre un claro desde el centro; uRest deja jirones suaves a los lados y a lo largo de la cresta.
export const FOG_FS = /* glsl */ `
    uniform float uTime;
    uniform float uAspect;
    uniform float uOpen;
    uniform float uCover;
    uniform float uWisp;
    uniform float uRest;
    uniform vec3 uBand;            // franjas de jirones (base de cada línea del título):
    uniform vec3 uBand2;           //   altura (uv, desde abajo), semialto, intensidad
    uniform vec2 uBandX;           // las franjas se apagan pasado este rango horizontal (uv): fin, ancho del fundido
    uniform float uScale;
    uniform float uSpeed;
    uniform vec2 uShift;
    uniform vec3 uColA;
    uniform vec3 uColB;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
      vec2 q = p * uScale * vec2(1.0, 2.4) + uShift;
      float t = uTime * uSpeed;
      vec2 w = vec2(fbm(q * 0.55 + vec2(t * 0.7, 0.0)),
                    fbmB(q * 0.55 + vec2(4.7, 1.9 - t * 0.5)));
      float n = fbm(q + w * 1.6 + vec2(t, 0.0));

      float d = length(p * vec2(0.8, 1.35));
      float intro = smoothstep(uOpen - 0.32, uOpen + 0.18, d + (n - 0.5) * 0.55);
      intro *= uCover * mix(1.0, clamp(n * 1.5, 0.0, 1.0), uWisp);

      // En reposo: jirones a la derecha, a la altura de las laderas
      float side = smoothstep(0.22, 0.5, p.x / uAspect) * (1.0 - smoothstep(0.08, 0.4, abs(vUv.y - 0.5)));
      float rest = side * smoothstep(0.34, 0.8, n);

      // Nubes que cruzan la base de cada línea del nombre, como cúmulos: donde el ruido sube, la nube
      // asciende y entra en la letra; donde baja, queda un hueco y la letra se ve entera. Por debajo de la
      // base se deshacen. Ruido propio, menos estirado que el de los estratos.
      if (uBand.z + uBand2.z > 0.0) {
        float nb = fbm(p * vec2(3.4, 4.2) + vec2(t * 0.6 + 3.1, 1.7)) * 0.6
                 + fbmB(p * vec2(7.5, 9.5) + vec2(t * 0.9, 4.2)) * 0.4;
        float cover = smoothstep(0.47, 0.66, nb);
        vec3 B = uBand;
        float top = B.x + B.y * (nb - 0.42) * 2.8;
        float b1 = B.z * (1.0 - smoothstep(-B.y * 0.3, B.y * 0.3, vUv.y - top))
                 * smoothstep(B.x - B.y * 2.4, B.x - B.y * 1.0, vUv.y);
        B = uBand2;
        top = B.x + B.y * (nb - 0.42) * 2.8;
        float b2 = B.z * (1.0 - smoothstep(-B.y * 0.3, B.y * 0.3, vUv.y - top))
                 * smoothstep(B.x - B.y * 1.8, B.x - B.y * 0.7, vUv.y);
        float band = max(b1, b2) * (1.0 - smoothstep(uBandX.x - uBandX.y, uBandX.x, vUv.x));
        rest = max(rest, band * cover);
      }
      rest *= uRest;

      float a = clamp(max(intro, rest), 0.0, 1.0);
      float lit = smoothstep(0.2, 0.9, n) * (0.7 + 0.3 * vUv.y);
      vec3 col = mix(uColA, uColB, lit);
      gl_FragColor = vec4(col * a, a);
    }
  `;

// Antialiasing de bordes geométricos (sustituye al MSAA 4×, que en GPUs integradas costaba ~5 ms en
// el hero y ~11 ms en la transición). Solo actúa donde la profundidad salta —perfil de las crestas
// contra el cielo, una cresta delante de otra—, así la textura del terreno no se suaviza. En esos
// píxeles aplica FXAA (versión compacta) sobre el color premultiplicado, alfa incluida: el perfil
// queda suave también contra el cielo, que vive en otro canvas.
export const EDGE_AA_FS = /* glsl */ `
    uniform sampler2D tColor;
    uniform sampler2D tDepth;
    uniform vec2 uInv;             // 1 / tamaño del búfer (px)
    uniform vec2 uScale;           // parte del búfer que se usa (el búfer se reserva a la densidad máxima)
    uniform vec2 uNF;              // planos cercano y lejano de la cámara
    varying vec2 vUv;
    float lin(vec2 uv) {
      float z = texture2D(tDepth, uv).r * 2.0 - 1.0;
      return 2.0 * uNF.x * uNF.y / (uNF.y + uNF.x - z * (uNF.y - uNF.x));
    }
    float luma(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)) + 0.5 * c.a; }
    void main() {
      vec2 uv = vUv * uScale;
      vec4 c = texture2D(tColor, uv);
      // segunda diferencia de la profundidad lineal: ~0 en una pendiente continua, grande en un salto
      float dc = lin(uv);
      float ex = abs(lin(uv - vec2(uInv.x, 0.0)) + lin(uv + vec2(uInv.x, 0.0)) - 2.0 * dc);
      float ey = abs(lin(uv - vec2(0.0, uInv.y)) + lin(uv + vec2(0.0, uInv.y)) - 2.0 * dc);
      if (max(ex, ey) < 0.03 * dc) { gl_FragColor = c; return; }

      vec4 nw = texture2D(tColor, uv + vec2(-1.0, -1.0) * uInv);
      vec4 ne = texture2D(tColor, uv + vec2( 1.0, -1.0) * uInv);
      vec4 sw = texture2D(tColor, uv + vec2(-1.0,  1.0) * uInv);
      vec4 se = texture2D(tColor, uv + vec2( 1.0,  1.0) * uInv);
      float lNW = luma(nw), lNE = luma(ne), lSW = luma(sw), lSE = luma(se), lM = luma(c);
      float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
      float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
      vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
      float reduce = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
      dir = clamp(dir / (min(abs(dir.x), abs(dir.y)) + reduce), -8.0, 8.0) * uInv;
      vec4 a = 0.5 * (texture2D(tColor, uv - dir / 6.0) + texture2D(tColor, uv + dir / 6.0));
      vec4 b = 0.5 * a + 0.25 * (texture2D(tColor, uv - dir * 0.5) + texture2D(tColor, uv + dir * 0.5));
      float lB = luma(b);
      gl_FragColor = (lB < lMin || lB > lMax) ? a : b;
    }
  `;
