"""
Genera los recursos de terreno del prototipo a partir de datos reales:
  - Elevación: AWS Terrain Tiles (Terrarium, Mapzen/Tilezen, datos abiertos; SRTM ~30 m)
  - Imagen aérea: Esri World Imagery (solo para prototipo; revisar licencia antes de producción)

Tres capas, todas centradas en la cumbre:
  near    ~37.8 km  DEM 2048 px (~18 m; 1024 en móvil) + ortofoto 4096 px (~9 m; 2048 en móvil)
  detail  ~14.1 km  ortofoto 3072 px (~4.6 m), solo escritorio     -> laderas principales
  far     ~151 km   DEM 512 px (~295 m) + ortofoto 2048 px (~74 m) -> cordilleras del horizonte

Las nubes que trae la ortofoto se borran (remove_clouds).
Las alturas se guardan como PNG con 16 bits en R/G: v = round((h + 100) * 4)  (paso de 0.25 m).

Uso: python tools/build_terrain.py <carpeta-cache>
"""
import base64, io, json, math, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter

PEAK_LAT, PEAK_LON = 14.91244, -88.11361   # cumbre según el DEM

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets")   # Vite sirve public/ tal cual
CACHE = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
os.makedirs(CACHE, exist_ok=True)

SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
DEM_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"


def world_px(lat, lon, z):
    n = 256 * 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def m_per_px(z):
    return 156543.03392 * math.cos(math.radians(PEAK_LAT)) / 2 ** z


def fetch(url, path):
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "panamosab-prototype"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(path, "wb") as f:
            f.write(data)
    return path


def mosaic(z, size, url_fmt, prefix):
    cx, cy = world_px(PEAK_LAT, PEAK_LON, z)
    x0, y0 = round(cx - size / 2), round(cy - size / 2)
    tx0, ty0 = x0 // 256, y0 // 256
    tx1, ty1 = (x0 + size - 1) // 256, (y0 + size - 1) // 256
    jobs = [(tx, ty) for ty in range(ty0, ty1 + 1) for tx in range(tx0, tx1 + 1)]

    def get(t):
        tx, ty = t
        p = os.path.join(CACHE, f"{prefix}_{z}_{tx}_{ty}")
        return t, fetch(url_fmt.format(z=z, x=tx, y=ty), p)

    canvas = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    with ThreadPoolExecutor(8) as ex:
        for (tx, ty), p in ex.map(get, jobs):
            canvas.paste(Image.open(p).convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
    ox, oy = x0 - tx0 * 256, y0 - ty0 * 256
    return canvas.crop((ox, oy, ox + size, oy + size))


def push_pull(img, w):
    """Relleno multiescala: promedia hacia abajo lo válido (w=1) y lo propaga hacia arriba en los huecos."""
    A, Wt = [img * w[..., None]], [w]
    while min(Wt[-1].shape) > 3 and Wt[-1].shape[0] % 2 == 0 and Wt[-1].shape[1] % 2 == 0:
        h2, w2 = Wt[-1].shape[0] // 2, Wt[-1].shape[1] // 2
        A.append(A[-1].reshape(h2, 2, w2, 2, 3).mean((1, 3)))
        Wt.append(Wt[-1].reshape(h2, 2, w2, 2).mean((1, 3)))
    est = A[-1] / np.maximum(Wt[-1][..., None], 1e-6)
    for a, ww in zip(reversed(A[:-1]), reversed(Wt[:-1])):
        up = np.repeat(np.repeat(est, 2, 0), 2, 1)
        est = a + (1 - ww[..., None]) * up
    return est


def remove_clouds(img, k=1.0):
    """Quita nubes horneadas en la ortofoto: manchas blancas y poco saturadas, más anchas que un camino.
    Se rellenan con el color del entorno (push_pull). k escala los filtros a la resolución (1 = ~4.6 m/px)."""
    odd = lambda v: max(3, int(round(v * k)) | 1)
    a = np.asarray(img).astype(np.float32)
    s = np.asarray(img.filter(ImageFilter.GaussianBlur(3 * k))).astype(np.float32)  # las nubes tienen textura
    lo, hi = s.min(axis=2), s.max(axis=2)
    mask = Image.fromarray(((lo > 120) & (hi - lo < 40)).astype(np.uint8) * 255)
    # apertura: solo manchas sólidas (caminos y techos aislados no pasan); luego margen para los bordes difusos
    mask = mask.filter(ImageFilter.MinFilter(odd(7))).filter(ImageFilter.MaxFilter(odd(35)))
    mask = mask.filter(ImageFilter.GaussianBlur(6 * k))
    m = np.asarray(mask).astype(np.float32)[..., None] / 255
    # el relleno se toma solo de píxeles claramente fuera de la nube (máscara más ancha y binaria)
    wide = np.asarray(mask.filter(ImageFilter.MaxFilter(odd(25)))).astype(np.float32)
    fill = push_pull(a, (wide < 8).astype(np.float32))
    fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6 * k))).astype(np.float32)
    out = a * (1 - m) + fill * m
    print(f"  nubes: {float((m > 0.5).mean()) * 100:.2f}% del área")
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def dem(z, size):
    a = np.asarray(mosaic(z, size, DEM_URL, "dem")).astype(np.float64)
    h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    return np.clip(h, 30, None)  # hay algún valor espurio negativo en el DEM


def dem_png(h):
    v = np.clip(np.round((h + 100) * 4), 0, 65535).astype(np.uint32)
    rgb = np.zeros(h.shape + (3,), np.uint8)
    rgb[..., 0] = v >> 8
    rgb[..., 1] = v & 255
    return Image.fromarray(rgb)


def data_uri(img, fmt, **kw):
    buf = io.BytesIO()
    img.save(buf, fmt, **kw)
    mime = "image/png" if fmt == "PNG" else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(buf.getvalue()).decode()


def write_js(name, var, payload):
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"window.{var}=" + json.dumps(payload, separators=(",", ":")) + ";\n")
    print(f"  {name}: {os.path.getsize(path) / 1e6:.2f} MB")


jpg = lambda img, q: data_uri(img, "JPEG", quality=q, optimize=True, progressive=True)

# --- near ---------------------------------------------------------------------
print("near…")
near_extent = m_per_px(14) * 4096
near_h = dem(13, 2048)
near_sat = remove_clouds(mosaic(14, 4096, SAT_URL, "sat"), 0.5)
write_js("terrain-dem.js", "PANAMOSAB_DEM", {
    "size": 2048, "extent": near_extent,
    "minElev": float(near_h.min()), "maxElev": float(near_h.max()),
    "png": data_uri(dem_png(near_h), "PNG", optimize=True),
})
write_js("terrain-dem-m.js", "PANAMOSAB_DEM", {  # móvil: 1024 px (~37 m)
    "size": 1024, "extent": near_extent,
    "minElev": float(near_h.min()), "maxElev": float(near_h.max()),
    "png": data_uri(dem_png(near_h.reshape(1024, 2, 1024, 2).mean(axis=(1, 3))), "PNG", optimize=True),
})
write_js("terrain-sat-4k.js", "PANAMOSAB_SAT", {"png": jpg(near_sat, 80)})
write_js("terrain-sat-2k.js", "PANAMOSAB_SAT", {"png": jpg(near_sat.resize((2048, 2048), Image.LANCZOS), 82)})

# --- detail (solo escritorio) -------------------------------------------------
print("detail…")
detail_sat = remove_clouds(mosaic(15, 3072, SAT_URL, "sat"))
write_js("terrain-detail.js", "PANAMOSAB_DETAIL", {"extent": m_per_px(15) * 3072, "png": jpg(detail_sat, 80)})

# --- far ----------------------------------------------------------------------
print("far…")
far_h = dem(9, 512)
far_sat = remove_clouds(mosaic(11, 2048, SAT_URL, "sat"), 0.25)
far_payload = {"size": 512, "extent": m_per_px(11) * 2048, "dem": data_uri(dem_png(far_h), "PNG", optimize=True)}
write_js("terrain-far.js", "PANAMOSAB_FAR", {**far_payload, "png": jpg(far_sat, 76)})
write_js("terrain-far-m.js", "PANAMOSAB_FAR", {**far_payload, "png": jpg(far_sat.resize((1024, 1024), Image.LANCZOS), 78)})

print(f"near {near_extent/1000:.2f} km, elev {near_h.min():.0f}–{near_h.max():.0f} m")

# Vistas previas para revisar (no se usan en la web)
prev = os.path.join(CACHE, "preview")
os.makedirs(prev, exist_ok=True)
detail_sat.resize((1024, 1024), Image.LANCZOS).save(os.path.join(prev, "detail.jpg"), quality=85)
far_sat.resize((1024, 1024), Image.LANCZOS).save(os.path.join(prev, "far.jpg"), quality=85)
