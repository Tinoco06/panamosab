"""
Genera el mapa de curvas de nivel del macizo (src/assets/park/contours.svg) a partir del mismo modelo de
elevación que usa el relieve 3D (public/assets/terrain-dem.js: AWS Terrain Tiles, ~18 m/px).

- contours.svg: curvas cada 100 m (cada 500 m, más marcadas), solo trazo, de fondo.
- zones.json: las dos zonas de manejo según su definición en el Plan de Manejo (p. 8): zona núcleo «desde la
  punta más alta hasta la cota 1800 msnm como mínimo» y zona de amortiguamiento, «una franja que no será
  menor a 2 km partiendo del límite de la zona núcleo». Aproximación sobre el relieve, no el límite oficial.
- Norte arriba. zones.json incluye también la cumbre, la escala y la posición de las etiquetas.

Uso: python tools/build_contours.py
"""
import base64, io, json, os, re
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'assets', 'park')
HALF_KM = 10.5          # mitad del lado del recorte, centrado en la cumbre
GRID = 560              # resolución de trabajo (≈ 37 m por celda)
STEP, MAJOR, CORE = 100, 500, 1800
VB = 600                # lado del viewBox del SVG
COLORS = {'minor': '#7d9468', 'major': '#4f6f49'}
BUFFER_KM = 2.0


def load_dem():
    s = open(os.path.join(ROOT, 'public', 'assets', 'terrain-dem.js'), encoding='utf-8').read()
    meta = json.loads(s[s.index('{'):s.rindex('}') + 1])
    png = base64.b64decode(meta['png'].split(',', 1)[1])
    a = np.asarray(Image.open(io.BytesIO(png)).convert('RGB')).astype(np.float64)
    return (a[..., 0] * 256 + a[..., 1]) / 4 - 100, meta['extent'] / 1000  # metros, km


def marching_squares(Z, level):
    """Polilíneas de la curva Z = level (coordenadas en celdas: x = columna, y = fila)."""
    n, m = Z.shape
    B = (Z >= level).astype(np.uint8)
    case = B[:-1, :-1] * 8 + B[:-1, 1:] * 4 + B[1:, 1:] * 2 + B[1:, :-1]
    ii, jj = np.nonzero((case > 0) & (case < 15))

    def pt(edge, i, j):  # punto interpolado sobre una arista; la clave identifica la arista
        if edge == 'T': a, b, p, q = Z[i, j], Z[i, j + 1], (j, i), (j + 1, i)
        elif edge == 'R': a, b, p, q = Z[i, j + 1], Z[i + 1, j + 1], (j + 1, i), (j + 1, i + 1)
        elif edge == 'B': a, b, p, q = Z[i + 1, j], Z[i + 1, j + 1], (j, i + 1), (j + 1, i + 1)
        else: a, b, p, q = Z[i, j], Z[i + 1, j], (j, i), (j, i + 1)
        t = (level - a) / (b - a) if b != a else 0.5
        key = ('h', i, j) if edge == 'T' else ('h', i + 1, j) if edge == 'B' else ('v', i, j) if edge == 'L' else ('v', i, j + 1)
        return key, (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)

    table = {1: [('L', 'B')], 2: [('B', 'R')], 3: [('L', 'R')], 4: [('T', 'R')], 6: [('T', 'B')], 7: [('L', 'T')],
             8: [('L', 'T')], 9: [('T', 'B')], 11: [('T', 'R')], 12: [('L', 'R')], 13: [('B', 'R')], 14: [('L', 'B')]}
    segs = []
    for i, j in zip(ii, jj):
        c = case[i, j]
        if c in (5, 10):  # silla: se resuelve con el promedio del centro
            center = (Z[i, j] + Z[i, j + 1] + Z[i + 1, j] + Z[i + 1, j + 1]) / 4 >= level
            pairs = ([('L', 'T'), ('B', 'R')] if center else [('L', 'B'), ('T', 'R')]) if c == 5 else \
                    ([('L', 'B'), ('T', 'R')] if center else [('L', 'T'), ('B', 'R')])
        else:
            pairs = table[c]
        for e1, e2 in pairs:
            segs.append((pt(e1, i, j), pt(e2, i, j)))

    # unir segmentos por aristas compartidas
    adj = {}
    for k, ((ka, pa), (kb, pb)) in enumerate(segs):
        adj.setdefault(ka, []).append((k, kb))
        adj.setdefault(kb, []).append((k, ka))
    pos = {}
    for (ka, pa), (kb, pb) in segs:
        pos[ka], pos[kb] = pa, pb
    used = np.zeros(len(segs), bool)
    lines = []
    for k in range(len(segs)):
        if used[k]: continue
        used[k] = True
        (ka, _), (kb, _) = segs[k]
        chain = [ka, kb]
        for forward in (True, False):
            while True:
                end = chain[-1] if forward else chain[0]
                nxt = next(((s, other) for s, other in adj[end] if not used[s]), None)
                if not nxt: break
                used[nxt[0]] = True
                chain.append(nxt[1]) if forward else chain.insert(0, nxt[1])
        closed = chain[0] == chain[-1]
        lines.append((np.array([pos[c] for c in chain]), closed))
    return lines


def rdp(p, eps):
    if len(p) < 3: return p
    a, b = p[0], p[-1]
    ab = b - a
    nrm = np.hypot(*ab)
    v = p - a
    d = np.abs(ab[0] * v[:, 1] - ab[1] * v[:, 0]) / nrm if nrm > 0 else np.hypot(v[:, 0], v[:, 1])
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(p[:i + 1], eps)[:-1], rdp(p[i:], eps)])
    return np.array([a, b])


def path(p, closed):
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in p)
    return s + ('Z' if closed else '')


def main():
    h, E = load_dem()
    S = h.shape[0]
    pi = np.unravel_index(np.argmax(h), h.shape)       # cumbre (fila, columna)
    peak_m = float(h[pi])
    px_km = (S - 1) / E
    r = int(round(HALF_KM * px_km))
    crop = h[pi[0] - r: pi[0] + r + 1, pi[1] - r: pi[1] + r + 1]
    zoom = GRID / crop.shape[0]
    Z = ndimage.zoom(ndimage.gaussian_filter(crop, sigma=1.2 / zoom), zoom, order=1)
    k = VB / (Z.shape[0] - 1)

    minor, major, core_fill, core_line = [], [], [], []
    for level in range(int(np.ceil(Z.min() / STEP) * STEP), int(Z.max()) + 1, STEP):
        for line, closed in marching_squares(Z, level):
            if len(line) < 6 and not closed: continue
            p = rdp(line * k, 0.55)
            if len(p) < 3: continue
            d = path(p, closed)
            if level % MAJOR == 0: major.append(d)
            else: minor.append(d)

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB} {VB}" fill="none" stroke-linejoin="round" stroke-linecap="round">'
           f'<path d="{" ".join(minor)}" stroke="{COLORS["minor"]}" stroke-width="0.6" stroke-opacity="0.6"/>'
           f'<path d="{" ".join(major)}" stroke="{COLORS["major"]}" stroke-width="1" stroke-opacity="0.7"/>'
           '</svg>')
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'contours.svg'), 'w', encoding='utf-8').write(svg)
    cy, cx = (Z.shape[0] - 1) / 2, (Z.shape[1] - 1) / 2
    side_km = 2 * r / px_km
    pct = lambda v: round(v * k / VB * 100, 2)

    # --- zonas: núcleo = componente por encima de 1,800 m que contiene la cumbre (sin huecos);
    #     amortiguamiento = todo lo que está a menos de 2 km de ella
    core = Z >= CORE
    lab, _ = ndimage.label(core)
    core = ndimage.binary_fill_holes(lab == lab[int(cy), int(cx)])
    cell_km = side_km / (Z.shape[0] - 1)
    buffer = ndimage.distance_transform_edt(~core) * cell_km <= BUFFER_KM

    def outline(mask):
        m = ndimage.gaussian_filter(mask.astype(np.float64), 1.2)
        lines = [l for l, closed in marching_squares(m, 0.5) if closed]
        return path(rdp(max(lines, key=len) * k, 0.6), True)

    # superficies del modelo, a resolución nativa del DEM (para comparar con las oficiales)
    cn = crop >= CORE
    ln, _ = ndimage.label(cn)
    cn = ndimage.binary_fill_holes(ln == ln[r, r])
    cell_m = 1000 / px_km
    bn = ndimage.distance_transform_edt(~cn) * cell_m <= BUFFER_KM * 1000
    core_ha = cn.sum() * cell_m ** 2 / 1e4
    buf_ha = (bn & ~cn).sum() * cell_m ** 2 / 1e4

    # etiquetas: núcleo en su centroide; amortiguamiento a 1 km del borde del núcleo, hacia el oeste
    ccy, ccx = ndimage.center_of_mass(core)
    row = core[int(round(ccy))]
    west = np.argmax(row)
    bx = west - BUFFER_KM / 2 / cell_km
    zones = {
        'viewBox': VB, 'core': outline(core), 'buffer': outline(buffer),
        'coreLabel': [pct(ccx), pct(ccy)], 'bufferLabel': [pct(bx), pct(ccy)],
        'peak': [pct(cx), pct(cy)], 'peakDemM': round(peak_m), 'sideKm': round(side_km, 2),
        'modelHa': {'core': round(core_ha), 'buffer': round(buf_ha)},
    }
    json.dump(zones, open(os.path.join(OUT, 'zones.json'), 'w'))
    old = os.path.join(OUT, 'contours.json')
    if os.path.exists(old): os.remove(old)
    print(f'contours.svg {os.path.getsize(os.path.join(OUT, "contours.svg")) / 1e3:.0f} kB · {len(minor)} menores, '
          f'{len(major)} mayores · zones.json {os.path.getsize(os.path.join(OUT, "zones.json")) / 1e3:.0f} kB · '
          f'superficie del modelo: núcleo {core_ha:,.0f} ha, amortiguamiento {buf_ha:,.0f} ha')


if __name__ == '__main__':
    main()
