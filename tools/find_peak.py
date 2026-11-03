# Localiza la cumbre de la Montaña de Santa Bárbara en el DEM abierto (AWS Terrain Tiles, Terrarium).
import math, io, sys, os, urllib.request
import numpy as np
from PIL import Image

CACHE = sys.argv[1]
os.makedirs(CACHE, exist_ok=True)

def tile_xy(lat, lon, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def fetch(url, path):
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={"User-Agent": "panamosab-prototype"})
        with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as f:
            f.write(r.read())
    return path

z = 12
cx, cy = tile_xy(14.92, -88.12, z)
best = None
for ty in range(int(cy) - 1, int(cy) + 2):
    for tx in range(int(cx) - 1, int(cx) + 2):
        p = fetch(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{tx}/{ty}.png",
                  os.path.join(CACHE, f"dem_{z}_{tx}_{ty}.png"))
        a = np.asarray(Image.open(p).convert("RGB")).astype(np.float64)
        h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
        i = np.unravel_index(np.argmax(h), h.shape)
        if best is None or h[i] > best[0]:
            n = 2 ** z
            px = (tx + (i[1] + .5) / 256) / n
            py = (ty + (i[0] + .5) / 256) / n
            lon = px * 360 - 180
            lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * py))))
            best = (h[i], lat, lon)
print("max elev %.0f m at lat %.5f lon %.5f" % best)
