"""
Auditoría responsive de PANAMOSAB (Playwright): recorre cada ruta en cada viewport y mide problemas objetivos.

  python tools/audit/responsive_audit.py <dist> <salida> [--engine chromium|webkit] [--shots] [--only ruta,ruta]

- Sirve <dist> con un servidor estático local.
- Por ruta y viewport: desbordamiento horizontal (y qué elementos lo causan), texto recortado, objetivos táctiles
  < 44 px, texto < 12 px, imágenes rotas o deformadas, fuentes cargadas, CLS (solo Chromium), errores de consola
  y peticiones fallidas.
- Con --shots guarda capturas: página completa en las interiores; en la portada, una tira de pantallas a lo largo
  del scroll (la captura de página completa alteraría el hero 3D y las escenas fijas). En WebKit todas las rutas
  usan la tira de pantallas: su captura de página completa no pinta las capas compuestas que quedan fuera de la
  pantalla (textos con opacidad o transformaciones, imágenes) y saldría en blanco aunque la página esté bien.
Resultado: <salida>/<engine>.json y, con --shots, <salida>/shots/<engine>/<vw>x<vh>/<ruta>.jpg
"""
import argparse, json, os, subprocess, sys, time, urllib.request

from playwright.sync_api import sync_playwright

VIEWPORTS = [
    ('iPhone SE', 375, 667, 'phone'), ('iPhone 13/14', 390, 844, 'phone'), ('iPhone 15 Pro', 393, 852, 'phone'),
    ('iPhone Pro Max', 430, 932, 'phone'), ('Android compacto', 360, 800, 'phone'), ('Android estándar', 412, 915, 'phone'),
    ('iPhone horizontal', 844, 390, 'phone'), ('Móvil horizontal compacto', 800, 360, 'phone'),
    ('iPad Mini', 768, 1024, 'tablet'), ('iPad', 820, 1180, 'tablet'), ('iPad Air/Pro', 1024, 1366, 'tablet'),
    ('Tablet horizontal', 1180, 820, 'tablet'),
    ('Laptop', 1366, 768, 'desktop'), ('Desktop', 1440, 900, 'desktop'), ('Desktop grande', 1920, 1080, 'desktop'),
]
ROUTES = ['index.html', 'comanejo/', 'biodiversidad/', 'turismo/', 'contacto/']

CHECKS = r"""
() => {
  const vw = document.documentElement.clientWidth, out = {};
  out.scrollWidth = document.documentElement.scrollWidth; out.vw = vw;
  const visible = (el) => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const clipped = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(s.overflowX) || s.clipPath !== 'none') return true; } return false; };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 3).join('.') : '');
  // elementos que salen por la derecha o la izquierda sin un antecesor que los recorte
  out.overflow = [...document.querySelectorAll('body *')].filter(el => { if (!visible(el)) return false; const r = el.getBoundingClientRect();
      return (r.right > vw + 1 || r.left < -1) && !clipped(el); }).slice(0, 8).map(el => { const r = el.getBoundingClientRect(); return [name(el).slice(0, 90), Math.round(r.left), Math.round(r.right)]; });
  // texto recortado: bloques de texto cuyo contenido es más ancho que su caja
  out.textClip = [...document.querySelectorAll('h1,h2,h3,p,a,span,li,dd,dt')].filter(el => visible(el) && el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).display !== 'inline' && !el.closest('.sr-only'))
    .slice(0, 8).map(el => [name(el).slice(0, 70), el.textContent.trim().slice(0, 40), el.scrollWidth, el.clientWidth]);
  // objetivos táctiles: enlaces y botones visibles fuera de un párrafo (los enlaces dentro de texto corrido están exentos, WCAG 2.5.8)
  out.smallTargets = [...document.querySelectorAll('a[href],button')].filter(el => visible(el) && !el.closest('p') && !el.closest('.sr-only'))
    .map(el => { const r = el.getBoundingClientRect(); return [el.textContent.trim().replace(/\s+/g, ' ').slice(0, 30) || el.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height)]; })
    .filter(([, w, h]) => w < 44 || h < 44);
  // texto visible por debajo de 12 px
  const tiny = new Map();
  for (const el of document.querySelectorAll('body *')) { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!visible(el) || el.closest('.sr-only')) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) tiny.set(fs, (tiny.get(fs) || 0) + 1); }
  out.tinyText = Object.fromEntries([...tiny].sort());
  // imágenes: rotas, sin cargar o deformadas (object-fit fill con proporción distinta)
  out.images = [...document.images].filter(i => visible(i)).map(i => { const r = i.getBoundingClientRect(), s = getComputedStyle(i);
      const broken = i.complete && i.naturalWidth === 0; const ratio = i.naturalWidth ? (i.naturalWidth / i.naturalHeight) / (r.width / r.height) : 1;
      return { src: i.currentSrc.split('/').pop(), broken, distorted: s.objectFit === 'fill' && Math.abs(ratio - 1) > 0.03, w: Math.round(r.width), nat: i.naturalWidth, dpr: devicePixelRatio }; })
    .filter(x => x.broken || x.distorted || (x.nat && x.nat < x.w * Math.min(x.dpr, 2) * 0.66));
  out.fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight);
  out.cls = window.__cls ?? null;
  out.docHeight = document.documentElement.scrollHeight;
  return out;
}
"""


def serve(root, port):
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=root,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(40):
        try:
            urllib.request.urlopen(f'http://127.0.0.1:{port}/index.html', timeout=1); break
        except Exception:
            time.sleep(0.25)
    return srv


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dist'); ap.add_argument('out'); ap.add_argument('--engine', default='chromium')
    ap.add_argument('--shots', action='store_true'); ap.add_argument('--only', default='')
    ap.add_argument('--viewports', default='', help='lista de anchos x altos, p. ej. 390x844,820x1180')
    ap.add_argument('--port', type=int, default=8890)
    a = ap.parse_args()
    routes = [r for r in ROUTES if not a.only or r.rstrip('/').replace('.html', '') in a.only.split(',')]
    vps = [v for v in VIEWPORTS if not a.viewports or f'{v[1]}x{v[2]}' in a.viewports.split(',')]
    os.makedirs(a.out, exist_ok=True)
    srv = serve(a.dist, a.port); base = f'http://127.0.0.1:{a.port}/'
    results = []
    try:
        with sync_playwright() as p:
            if a.engine == 'webkit':
                browser = p.webkit.launch()
            else:
                browser = p.chromium.launch(channel='chrome', args=['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'])
            for label, w, h, kind in vps:
                touch = kind != 'desktop'
                opts = dict(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=touch)
                if a.engine == 'chromium': opts['is_mobile'] = kind == 'phone'
                ctx = browser.new_context(**opts)
                if a.engine == 'webkit':
                    # WebKit no conserva el búfer WebGL al capturar: sin esto, las capturas del hero salen sin terreno
                    ctx.add_init_script("HTMLCanvasElement.prototype.getContext=(function(o){return function(t,x){return o.call(this,t,Object.assign({},x,{preserveDrawingBuffer:true}))}})(HTMLCanvasElement.prototype.getContext);")
                ctx.add_init_script("window.__cls=0; try{ new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true}) }catch(e){ window.__cls=null }")
                for route in routes:
                    pg = ctx.new_page(); errs, failed = [], []
                    pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
                    pg.on('console', lambda m: errs.append(m.text[:160]) if m.type == 'error' else None)
                    pg.on('requestfailed', lambda r: failed.append(r.url.split('/')[-1]))
                    pg.on('response', lambda r: failed.append(f'{r.status} {r.url.split("/")[-1]}') if r.status >= 400 else None)
                    t0 = time.time()
                    pg.goto(base + route, wait_until='load')
                    home = route == 'index.html'
                    strip = home or a.engine == 'webkit'
                    if home:
                        try: pg.wait_for_function('!document.body.classList.contains("is-loading")', timeout=90000)
                        except Exception: errs.append('loader no terminó')
                        time.sleep(6.5)  # intro del hero
                    else:
                        # las páginas interiores las pinta React después de `load` (en WebKit, a veces bastante después)
                        pg.wait_for_selector('#contenido > *', timeout=30000); time.sleep(0.5)
                    load_s = round(time.time() - t0, 1)
                    frames = []
                    shotdir = os.path.join(a.out, 'shots', a.engine, f'{w}x{h}')
                    if a.shots: os.makedirs(shotdir, exist_ok=True)
                    if strip and a.shots:
                        time.sleep(1.4)
                        frames.append(pg.screenshot(type='jpeg', quality=70))
                    # recorre la página (dispara las apariciones y, en la portada, las escenas del scroll)
                    step = max(200, h // 2)
                    i, y = 0, 0
                    # el alto se vuelve a leer en cada paso: puede crecer al cargar imágenes y fuentes
                    while y < pg.evaluate('document.documentElement.scrollHeight'):
                        pg.evaluate(f'window.scrollTo(0,{y})'); time.sleep(0.35 if home else 0.12)
                        if strip and a.shots and i % 2 == 1:
                            time.sleep(1.4)  # las apariciones (reveal-*) duran 1.2 s: la captura muestra el estado final
                            frames.append(pg.screenshot(type='jpeg', quality=70))
                        i += 1; y += step
                    time.sleep(1.2)
                    res = pg.evaluate(CHECKS)
                    pg.evaluate('window.scrollTo(0,0)'); time.sleep(0.4)
                    if a.shots:
                        path = os.path.join(shotdir, route.rstrip('/').replace('.html', '').replace('index', 'inicio') + '.jpg')
                        if strip:
                            from PIL import Image
                            import io
                            ims = [Image.open(io.BytesIO(b)) for b in frames]
                            cols = 4 if w < h else 2
                            rows = (len(ims) + cols - 1) // cols
                            sheet = Image.new('RGB', (cols * w + (cols - 1) * 8, rows * h + (rows - 1) * 8), (90, 90, 90))
                            for k, im in enumerate(ims): sheet.paste(im, ((k % cols) * (w + 8), (k // cols) * (h + 8)))
                            sheet.thumbnail((2400, 6000)); sheet.save(path, quality=72)
                        else:
                            pg.screenshot(path=path, full_page=True, type='jpeg', quality=68)
                    res.update(route=route, label=label, w=w, h=h, engine=a.engine, errors=errs, failed=sorted(set(failed)), load_s=load_s)
                    results.append(res)
                    flag = ' DESBORDA' if res['scrollWidth'] > res['vw'] else ''
                    print(f"{a.engine:8} {w}x{h:<5} {route:15} sw={res['scrollWidth']}{flag} clip={len(res['textClip'])} small={len(res['smallTargets'])} img={len(res['images'])} err={len(errs)} cls={res['cls'] if res['cls'] is None else round(res['cls'],3)}", flush=True)
                    pg.close()
                ctx.close()
            browser.close()
    finally:
        srv.terminate()
    json.dump(results, open(os.path.join(a.out, f'{a.engine}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
