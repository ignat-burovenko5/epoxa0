"""Extract embedded JPEG from logo SVG and write transparent PNG + clean SVG."""
import argparse
import base64
import io
import re
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess

    subprocess.check_call(["pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def remove_background(img: Image.Image, white_threshold: int = 235) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r > white_threshold and g > white_threshold and b > white_threshold:
                pixels[x, y] = (r, g, b, 0)
            elif a > 0:
                # Soften light gray fringe around the artwork.
                brightness = (r + g + b) / 3
                if brightness > 220:
                    fade = max(0, min(255, int((255 - brightness) * 12)))
                    pixels[x, y] = (r, g, b, fade)

    return rgba


def process_svg(svg_path: Path, png_path: Path, out_svg_path: Path) -> None:
    svg = svg_path.read_text(encoding="utf-8")
    match = re.search(r'xlink:href="data:image/jpeg;base64,([^"]+)"', svg)
    if not match:
        raise SystemExit(f"JPEG not found in {svg_path}")

    jpg = Image.open(io.BytesIO(base64.b64decode(match.group(1))))
    transparent = remove_background(jpg)
    width, height = transparent.size

    png_path.parent.mkdir(parents=True, exist_ok=True)
    transparent.save(png_path, "PNG")

    viewbox_match = re.search(r'viewBox="([^"]+)"', svg)
    viewbox = viewbox_match.group(1) if viewbox_match else f"0 0 {width} {height}"
    display_w, display_h = width, height
    if viewbox_match:
        parts = [float(v) for v in viewbox_match.group(1).split()]
        if len(parts) == 4:
            display_w, display_h = int(parts[2]), int(parts[3])

    clean_svg = f"""<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="{viewbox}">
  <image width="{display_w}" height="{display_h}" xlink:href="/logo.png" preserveAspectRatio="xMidYMid meet" />
</svg>
"""
    out_svg_path.write_text(clean_svg, encoding="utf-8")
    print(f"Saved transparent PNG: {png_path} ({width}x{height})")
    print(f"Updated SVG: {out_svg_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=ROOT / "svg" / "user-logo-source.svg",
        help="Source SVG with embedded JPEG",
    )
    parser.add_argument("--png", type=Path, default=ROOT / "public" / "logo.png")
    parser.add_argument("--svg", type=Path, default=ROOT / "public" / "logo.svg")
    args = parser.parse_args()
    process_svg(args.input, args.png, args.svg)


if __name__ == "__main__":
    main()
