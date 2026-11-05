# Auditoría visual y responsive multidispositivo — PANAMOSAB

Fecha: 3 de noviembre de 2026 · Rutas: Inicio, Comanejo, Biodiversidad, Turismo, Contacto.
Herramienta reproducible: `tools/audit/responsive_audit.py` (Playwright). Datos y evidencias: `docs/audit/`.

---

## 1. Viewports evaluados

| Grupo | Viewports |
|---|---|
| Móviles | 375×667 (iPhone SE) · 390×844 (iPhone 13/14) · 393×852 (iPhone 15 Pro) · 430×932 (Pro Max) · 360×800 · 412×915 |
| Móviles en horizontal | 844×390 · 800×360 |
| Tablets | 768×1024 (iPad Mini) · 820×1180 (iPad) · 1024×1366 (iPad Air/Pro) · 1180×820 (horizontal) |
| Escritorio | 1366×768 · 1440×900 · 1920×1080 |

Puntos de corte del diseño revisados expresamente: **821 px** (móvil → composición de tablet/escritorio) y
**1101 px** (menú compacto → barra de navegación). Las combinaciones 820/844 y 1024/1180 quedan a ambos lados de cada uno.

En cada ruta y viewport se midió:

- **Maquetación:** desbordamiento horizontal (y qué elemento lo causa) y texto recortado.
- **Interacción:** objetivos táctiles < 44 px y texto visible < 12 px.
- **Imágenes:** rotas, deformadas o con poca resolución.
- **Fuentes:** cuáles se cargaron y con qué pesos.
- **Carga:** CLS, errores de consola y peticiones fallidas.

Además se recorrió cada página para disparar las animaciones de aparición y las escenas ligadas al scroll.

## 2. Navegadores y dispositivos realmente probados

| Motor | Versión | Cobertura |
|---|---|---|
| **Chromium** (Chrome estable, GPU real vía ANGLE/D3D11) | Playwright 1.64 | 15 viewports × 5 rutas = 75 mediciones; capturas de escritorio y Android |
| **WebKit** (motor de Safari, build de Playwright 27.2 para Windows) | WebKit 27.2 | 9 viewports de Apple × 5 rutas = 45 mediciones, con toque (`has_touch`) y, en las pruebas de WebGL, `is_mobile` y DPR 2–3; capturas de iPhone e iPad |

**No se probó en Safari real, ni en iPhone ni en iPad físicos, ni en macOS.** No había ningún dispositivo Apple
disponible. Ninguna afirmación de este informe declara compatibilidad real con Safari para iOS: WebKit para
Windows comparte motor de renderizado con Safari, pero no su interfaz (barras dinámicas, áreas seguras, teclado
virtual, gestos del sistema) ni su GPU.

## 3. Limitaciones de las pruebas

1. **Áreas seguras (notch, Dynamic Island, indicador de inicio):** Playwright no emula `env(safe-area-inset-*)`; en las pruebas valen 0. La corrección se revisó en el código, pero **no se pudo verificar visualmente**.
2. **Barras dinámicas de Safari:** no se emulan los cambios de alto al ocultarse o aparecer las barras. Se verificó que el motor 3D ya no depende de `innerHeight`, pero no el comportamiento en un dispositivo.
3. **Gestos táctiles:** Playwright no simula arrastres táctiles en WebKit móvil (y no admite la rueda). El bloqueo del scroll de fondo con el menú abierto se verificó por CSS (`overflow: hidden` aplicado), no con un gesto real.
4. **GPU, temperatura y batería:** WebKit para Windows renderiza WebGL por software. Las cifras de fluidez no son representativas de un iPhone; tampoco se pudo medir el comportamiento térmico en sesiones largas.
5. **Capturas de WebKit:** se encontraron dos defectos de la herramienta, no de la web:
   - `page.screenshot()` en WebKit **omite la capa WebGL**: el hero sale sin terreno aunque se dibuja correctamente. Evidencia: `docs/audit/before-after/webkit-captura-vs-canvas.png` (izquierda la captura, derecha los píxeles reales del canvas).
   - La captura de **página completa** de WebKit no pinta las capas compuestas fuera de la pantalla (textos con transiciones, imágenes): la página sale en blanco por debajo del primer pantallazo. Se verificó por separado que las apariciones y la carga diferida funcionan igual que en Chromium (0 elementos ocultos en pantalla tras desplazarse). Por eso las capturas de WebKit son **secuencias de pantallas** a lo largo del scroll, no páginas completas.

## 4. Problemas encontrados

| # | Sev. | Problema | Dónde | Estado |
|---|---|---|---|---|
| 1 | **P0** | Búfer del canvas WebGL bloqueado en 300×150 px: el terreno se dibujaba en una imagen diminuta estirada (borroso o invisible) | Inicio, WebKit (intermitente, también 1440×900) | Corregido |
| 2 | **P1** | Contenido bajo el notch o la Dynamic Island en iPhone en horizontal: `viewport-fit=cover` sin `env(safe-area-inset-*)` | Todo el sitio | Corregido (sin verificar en dispositivo) |
| 3 | **P1** | El motor 3D recalculaba todo (búferes, cámara, título) cada vez que las barras de Safari aparecían o se ocultaban durante el scroll | Inicio, iOS | Corregido (sin verificar en dispositivo) |
| 4 | **P1** | Sin gestión de la pérdida del contexto WebGL (iOS la provoca en segundo plano o con poca memoria) | Inicio | Corregido y verificado |
| 5 | **P1** | «87-87» superpuesto a su etiqueta «Decreto de creación…» | Inicio 01, 1180–1920 px | Corregido y verificado |
| 6 | **P1** | Objetivos táctiles < 44 px en todos los móviles: botón «Menú» (33 px), marca (13 px), enlaces del pie (15 px), enlaces a sitios oficiales (21 px) | Todo el sitio | Corregido y verificado |
| 7 | **P2** | Menú compacto en móvil horizontal: el último enlace quedaba fuera de pantalla y no se garantizaba que el menú pudiera desplazarse | Todas, 800×360 | Corregido y verificado |
| 8 | **P2** | Barra de navegación de escritorio en tablet táctil horizontal (≥ 1101 px): enlaces de 12 px de alto | Todas, 1180×820 | Corregido y verificado |
| 9 | **P3** | Enlace del crédito fotográfico de «Agua» de 14 px de alto | Inicio 04 | Corregido (41 px) |
| 10 | **P3** | Crédito de las fuentes del hero en 9 px en móvil | Inicio | Corregido (10 px) |
| 11 | **P3** | Resaltado gris del sistema al tocar enlaces en iOS | Todo el sitio | Corregido (verde institucional discreto) |

Sin incidencias en ningún viewport ni motor:

- **Maquetación:** desbordamiento horizontal, texto recortado (salvo el n.º 5) e imágenes rotas o deformadas.
- **Consola y red:** errores de consola y peticiones fallidas.
- **Fuentes:** Instrument Sans 400/600 y Manrope 800 cargan también en WebKit.
- **Estabilidad:** CLS máximo de **0,011** (medición final: `docs/audit/final/chromium.json`).
- **Navegación:** el menú abre y cierra con toque y con Esc, y al elegir una sección navega y se cierra.
- **Nombres científicos:** ni desbordan ni se cortan en 360 px.

## 5. Capturas de evidencia

Se versionan en git:

- `docs/audit/before-after/`:
  - `decreto-1180-antes.png` y `decreto-1180-despues.png`: el problema n.º 5.
  - `menu-800x360.png`, `menu-844x390.png` y `menu-375x667.png`: el menú en WebKit con toque.
  - `webkit-captura-vs-canvas.png`: la limitación de la captura de WebKit.
- `docs/audit/final/chromium.json`: medición final tras la última compilación (75 combinaciones).
- `docs/audit/webkit.json`, `docs/audit/home-final/webkit.json` y `docs/audit/wk-strips/webkit.json`: las mediciones de WebKit.
- `docs/audit/chromium.json`: la medición intermedia, anterior a las correcciones n.º 1, 5, 7, 9 y 10.

Quedan fuera de git (unos 35 MB) y se regeneran con `--shots`:

- `docs/audit/home-final/shots/webkit/<viewport>/inicio.jpg`: la portada en iPhone, iPhone horizontal e iPad (WebKit).
- `docs/audit/home-final/shots/chromium/<viewport>/inicio.jpg`: la portada en los 15 viewports (Chromium, con el terreno visible).
- `docs/audit/wk-strips/shots/webkit/<viewport>/<ruta>.jpg`: Comanejo, Biodiversidad, Turismo y Contacto en iPhone SE, iPhone 13, iPhone horizontal, iPad y tablet horizontal (WebKit).
- `docs/audit/desk/shots/chromium/<viewport>/<ruta>.jpg`: escritorio (1366, 1440 y 1920 px) y Android (360, 412 y 800×360).

Objetivos táctiles por debajo de 44 px antes y después, en Chromium:

| Viewport | Inicio | Comanejo | Biodiversidad | Turismo | Contacto |
|---|---|---|---|---|---|
| 360×800 | 7 → 0 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 375×667 | 7 → 0 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 390×844 | 7 → 0 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 393×852 | 7 → 0 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 412×915 | 7 → 0 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 430×932 | 7 → 0 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 844×390 | 7 → 1 | 13 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| 768–1180 (tablets) | 1 | 0–1 | 0–1 | 0–1 | 0–1 |
| 1366–1920 (escritorio, ratón) | 1 | 5 | 5 | 5 | 5 |

El «antes» solo existe para los móviles, porque la medición de referencia se interrumpió tras los móviles en vertical y el iPhone en horizontal.

Qué queda en cada caso:

- **Inicio (1):** el enlace del crédito fotográfico, de 41 px de alto. Supera el mínimo de 24 px de WCAG 2.5.8 (AA).
- **Escritorio (5):** los enlaces de la barra de navegación (12 px de alto) con ratón. Cumplen WCAG 2.5.8 por la excepción de espaciado: hay 16–32 px entre ellos. Con puntero táctil crecen a 44 px (n.º 8).

## 6. Causa raíz de cada problema importante

**N.º 1 · Búfer WebGL de 300×150 (P0).** Lo introdujo una corrección de esta misma auditoría y lo detectó la propia
auditoría en WebKit; nunca llegó a una versión guardada en git. Para el n.º 3, el motor pasó a medir el tamaño del
propio canvas. Pero el motor se crea antes de que la hoja de estilos de la portada esté aplicada, y en ese momento un
canvas mide su tamaño intrínseco, 300×150. Como el redimensionado ya solo se recalcula si el tamaño cambia de verdad,
el búfer quedaba fijado en ese tamaño. Es intermitente porque depende del orden de carga, más lento en WebKit.
**Solución:** medir la pantalla con una sonda de estilo en línea (`height:100vh; height:100lvh`), que no depende
del CSS. Verificado: el búfer coincide con el tamaño en pantalla en dos ejecuciones por caso, con WebKit (390×844,
844×390, 820×1180 y 1440×900) y Chromium.

**N.º 2 · Áreas seguras (P1).** El HTML declara `viewport-fit=cover` (la web ocupa también la zona del notch), pero
ningún estilo usaba `env(safe-area-inset-*)`. En un iPhone en horizontal, el margen lateral (`clamp(16px, 4.2vw, 64px)`
≈ 35 px a 844 px) es menor que el inset del notch (unos 47–59 px), así que el texto quedaba bajo el notch.
**Solución, en el sistema y no por componente:**
- `--spacing-gutter` pasa a ser `max(clamp(…), env(safe-area-inset-left), env(safe-area-inset-right))`, de modo que todo `px-gutter`, `left-gutter` o `-mx-gutter` lo respeta.
- Nuevos tokens `--spacing-safe-t` y `--spacing-safe-b` para el encabezado, el menú a pantalla completa, el indicador «Descubrir el Parque», el crédito del hero y el pie.

**N.º 3 · Barras de Safari (P1).** Los canvas fijos usaban `inset-0` (su alto sigue a la pantalla visible) y el motor
recalculaba con `window.innerHeight` en cada `resize`. iOS dispara `resize` cada vez que las barras aparecen o se
ocultan al hacer scroll, lo que reasignaba los búferes WebGL y movía la cámara en mitad del gesto.
**Solución:**
- Los canvas tienen el alto de la pantalla grande (`.webgl-layer`, `100lvh` con respaldo `100vh`), que no cambia con las barras; con ellas visibles, el borde inferior queda detrás.
- El motor solo recalcula si el tamaño cambió de verdad, y vuelve a medir tras `orientationchange`.

En escritorio, `lvh` = `innerHeight`: el comportamiento no cambia.

**N.º 4 · Pérdida de contexto WebGL (P1).** No había gestión. Three.js r128 restaura sus propios recursos, pero el
cielo y la niebla solo se repintan cuando cambian, así que tras una restauración podían quedarse en blanco.
**Solución:**
- `webglcontextlost` (con `preventDefault`) pausa el dibujo y la resolución adaptativa.
- `webglcontextrestored` marca el cielo y la niebla para repintarse.

Verificado forzando `WEBGL_lose_context` en Chromium y WebKit: el hero vuelve a dibujarse igual. Tras girar el
dispositivo, los canvas adoptan el tamaño nuevo.

**N.º 5 · «87-87» (P1).** En la fila de datos, la cifra ocupaba la columna flexible (`minmax(0,1fr)`) y la etiqueta
larga la automática, que se quedaba con casi todo el ancho. Con `white-space: nowrap`, la cifra se desbordaba sobre
la etiqueta. **Solución:** invertir las columnas (`auto minmax(0,1fr)`): la cifra toma su ancho y la etiqueta se ajusta en dos líneas.

**N.º 6 · Objetivos táctiles (P1).** Los componentes compartidos tenían el alto de su texto. **Solución, en los
componentes y sin cambiar el tamaño del texto:**
- `min-h-11` (44 px) en la marca, el botón «Menú», los enlaces del pie y los enlaces a sitios oficiales.
- `min-h-12` en los botones de llamada a la acción.
- Relleno vertical en los enlaces del menú compacto.

## 7. Correcciones implementadas

| Archivo | Cambio |
|---|---|
| `src/styles/index.css` | `--spacing-gutter` con áreas seguras; tokens `--spacing-safe-t/b`; clase `.webgl-layer` (100lvh); resaltado táctil discreto |
| `src/app/App.tsx` | Capas WebGL con `.webgl-layer` |
| `src/three/engine.ts` | Sonda de viewport (lvh) en lugar de `innerHeight` o del tamaño del canvas; recálculo solo si cambia el tamaño; `orientationchange`; pérdida y restauración del contexto WebGL |
| `src/components/Header.tsx` | Margen superior con área segura; marca de 44 px |
| `src/components/Navigation.tsx` | Botón «Menú» de 44 px; enlaces del menú compacto de 47 px; menú desplazable (`overflow-y-auto`, `overscroll-contain`) centrado con márgenes automáticos (no corta el primer enlace); áreas seguras; márgenes justos en pantallas de menos de 500 px de alto; enlaces de 44 px con puntero táctil en la barra de escritorio |
| `src/components/Footer.tsx` | Marca y enlaces de 44 px; margen inferior con área segura |
| `src/components/ScrollIndicator.tsx`, `src/sections/HeroSection.tsx` | Posición inferior con área segura; crédito del hero en 10 px |
| `src/sections/ParkSection.tsx` | Columnas de la fila de datos invertidas («87-87») |
| `src/sections/WaterSection.tsx` | Área táctil del crédito fotográfico |
| `src/components/comanejo/OrgProfile.tsx`, `src/components/editorial.tsx` | Enlaces a sitios oficiales y botones de 44–48 px |
| `tools/audit/responsive_audit.py` | Herramienta de auditoría reutilizable |

No se cambió la identidad visual, el contenido, la arquitectura ni las dependencias. El hero 3D, sus animaciones y
la experiencia de scroll se mantienen.

Lo que ya estaba bien y no se tocó:

- **Alturas:** el hero usa `h-svh` (estable con las barras) y en horizontal se ajusta a la pantalla. Las escenas largas (`260vh`) usan `vh`, que en iOS equivale a la pantalla grande y no cambia con las barras.
- **Escalado de texto:** `-webkit-text-size-adjust: 100%`.
- **ScrollTrigger:** la versión 3.12 ignora por defecto los cambios de alto en móvil.
- **Rendimiento 3D:** la resolución está limitada en móvil (DPR ≤ 1,25 con ajuste adaptativo) y el motor deja de dibujar al pasar «El Territorio».
- **Movimiento reducido:** con él activado, todo es visible sin animaciones.

## 8. Problemas pendientes

| Sev. | Pendiente | Motivo |
|---|---|---|
| P2 | Verificar en un iPhone real las correcciones n.º 2 y n.º 3 | No emulables (ver §3) |
| P3 | WebKit registra `INVALID_OPERATION: delete: object does not belong to this context` al restaurar el contexto | Lo emite Three.js r128 al liberar objetos del contexto anterior; no afecta al dibujo |
| P3 | Etiquetas en mayúsculas de 11 px (`Eyebrow`, metadatos) | Decisión del sistema tipográfico (mayúsculas con espaciado de 0,2 em). Se recomienda revisarlas en un iPhone; si cuestan de leer, subir a 12 px en `components/ui.ts` |
| P3 | En tablet horizontal, el enlace «Inicio» de la barra mide 42 × 44 px (2 px de ancho por debajo) | Despreciable; se puede dar relleno horizontal con puntero táctil |
| P3 | Con un scroll muy rápido, los bloques aparecen con su fundido (1,2 s) poco después de entrar en pantalla | Comportamiento de diseño; respeta el movimiento reducido |

## 9. Recomendaciones para las pruebas físicas en iOS

Probar en Safari (no en Chrome para iOS, que también usa WebKit pero con otra interfaz). Como mínimo: un iPhone con
Dynamic Island (15/16 Pro), un iPhone SE o mini y un iPad. Conectar el dispositivo a un Mac con **Web Inspector**
(Ajustes → Safari → Avanzado → Inspector web) para ver la consola y la línea de tiempo.

1. **Hero y barras.** Abrir la portada, esperar la intro y desplazarse despacio arriba y abajo, de modo que las barras de Safari aparezcan y se oculten. El terreno y el título no deben saltar ni cambiar de escala; con las barras visibles, el borde inferior del paisaje queda detrás de ellas.
2. **Áreas seguras.** Girar a horizontal en un iPhone con notch o Dynamic Island. Ningún texto, logotipo ni botón debe quedar bajo la isla, a izquierda o derecha. En vertical, el pie no debe quedar tapado por el indicador de inicio.
3. **Orientación.** Girar varias veces durante la intro y durante «El Territorio»: el canvas debe adaptarse en menos de medio segundo, sin deformarse.
4. **Pérdida de contexto.** Con la portada abierta, ir a otra app durante un minuto (o abrir varias pestañas pesadas) y volver. El paisaje debe reaparecer; en Web Inspector, ninguna excepción.
5. **Menú.** Abrir y cerrar con un toque (un solo toque debe bastar). Con el menú abierto, intentar desplazar la página de fondo: no debe moverse. En horizontal, los cinco enlaces deben verse.
6. **Scroll largo.** Recorrer la portada completa 2–3 veces durante 5 minutos: comprobar la fluidez (sin congelamientos) y la temperatura del dispositivo. En Web Inspector → Timelines, revisar los fotogramas por encima de 16 ms.
7. **«Ver perfil» en Comanejo.** El desplazamiento animado debe llegar al perfil; tocar la pantalla durante el recorrido debe detenerlo.
8. **Tipografía.** Comprobar que Manrope 800 (cifras grandes) e Instrument Sans cargan, y revisar la legibilidad de las etiquetas de 11 px.
9. **Modo de bajo consumo y movimiento reducido** (Ajustes → Accesibilidad → Movimiento): todo el contenido visible, sin animaciones de aparición.

Para repetir la auditoría automática:

```
npm run build
python tools/audit/responsive_audit.py dist docs/audit --engine chromium
python tools/audit/responsive_audit.py dist docs/audit --engine webkit --shots --viewports 390x844,844x390,820x1180
```
