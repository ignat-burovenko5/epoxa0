"""Extract navbar mark from logo-nav.svg — opaque white on fully transparent PNG."""

from __future__ import annotations

import base64
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SVG_PATH = ROOT / "public" / "logo-nav.svg"
OUT_PATH = ROOT / "public" / "logo-mark.png"

BG_MIN_CHANNEL = 200
GREY_MIN = 175
GREY_CHANNEL_SPREAD = 28
# Below this ink level → transparent (drops matte + halos that read grey when scaled).
INK_CUTOFF = 48


def is_background(r: int, g: int, b: int) -> bool:
    if min(r, g, b) >= BG_MIN_CHANNEL:
        return True
    spread = max(r, g, b) - min(r, g, b)
    return spread <= GREY_CHANNEL_SPREAD and min(r, g, b) >= GREY_MIN


def main() -> None:
    svg = SVG_PATH.read_text(encoding="utf-8")
    match = re.search(
        r'xlink:href="data:image/(?:png|jpeg);base64,([^"]+)"', svg
    )
    if not match:
        raise SystemExit(f"No embedded raster image found in {SVG_PATH.name}")

    raw = base64.b64decode(match.group(1))
    img = Image.open(__import__("io").BytesIO(raw)).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            if is_background(r, g, b):
                pixels[x, y] = (0, 0, 0, 0)
                continue
            ink = 255 - min(r, g, b)
            if ink < INK_CUTOFF:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Opaque white only — semi-transparent white composites as grey on dark UI.
                pixels[x, y] = (255, 255, 255, 255)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    max_side = 512
    if max(img.size) > max_side:
        img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        # Re-apply opaque white after resample (LANCZOS reintroduces partial alpha).
        pixels = img.load()
        rw, rh = img.size
        for y in range(rh):
            for x in range(rw):
                r, g, b, a = pixels[x, y]
                if a < 128:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    pixels[x, y] = (255, 255, 255, 255)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_PATH, "PNG", optimize=True)
    print(f"Wrote {OUT_PATH} ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
