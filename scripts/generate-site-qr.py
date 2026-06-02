"""Generate a scannable QR code for the public site URL with the logo centered."""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE_TS = ROOT / "src" / "lib" / "site.ts"
DEFAULT_LOGO = ROOT / "public" / "logo-mark.png"
DEFAULT_OUT = ROOT / "public" / "qr-site.png"


def ensure_deps() -> None:
    try:
        import qrcode  # noqa: F401
        from PIL import Image  # noqa: F401
    except ImportError:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "pillow", "qrcode", "-q"]
        )


def site_url() -> str:
    text = SITE_TS.read_text(encoding="utf-8")
    match = re.search(r'url:\s*"([^"]+)"', text)
    if not match:
        raise SystemExit(f"Could not read url from {SITE_TS}")
    return match.group(1)


def logo_on_light_badge(logo: "Image.Image", fill: tuple[int, int, int] = (26, 26, 26)) -> "Image.Image":
    """White-on-dark marks become dark-on-transparent for a white QR center."""
    from PIL import Image

    src = logo.convert("RGBA")
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    src_px = src.load()
    out_px = out.load()
    fr, fg, fb = fill

    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = src_px[x, y]
            if a < 24:
                continue
            lum = (r + g + b) / 3
            if lum > 96:
                out_px[x, y] = (fr, fg, fb, min(255, a))

    return out


def generate(
    url: str,
    logo_path: Path,
    out_path: Path,
    *,
    size_px: int = 1200,
    logo_ratio: float = 0.22,
) -> None:
    from PIL import Image
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H

    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    matrix = qr.get_matrix()
    modules = len(matrix)
    border = 4
    total_modules = modules + border * 2
    box_size = max(1, size_px // total_modules)
    rendered_size = total_modules * box_size

    img = qr.make_image(
        fill_color="#1a1a1a",
        back_color="#ffffff",
    ).convert("RGBA")
    img = img.resize((rendered_size, rendered_size), Image.Resampling.NEAREST)

    logo = logo_on_light_badge(Image.open(logo_path))
    logo_max = int(rendered_size * logo_ratio)
    logo.thumbnail((logo_max, logo_max), Image.Resampling.LANCZOS)

    pad = max(8, logo_max // 8)
    badge_w = logo.width + pad * 2
    badge_h = logo.height + pad * 2
    badge = Image.new("RGBA", (badge_w, badge_h), (255, 255, 255, 255))
    badge.paste(logo, (pad, pad), logo)

    x = (rendered_size - badge_w) // 2
    y = (rendered_size - badge_h) // 2
    img.paste(badge, (x, y), badge)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path.relative_to(ROOT)} -> {url}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", help="Override site URL (default: from site.ts)")
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--size", type=int, default=1200, help="Output width/height in px")
    args = parser.parse_args()

    ensure_deps()
    url = args.url or site_url()
    if not args.logo.is_file():
        raise SystemExit(f"Logo not found: {args.logo}")
    generate(url, args.logo, args.out, size_px=args.size)


if __name__ == "__main__":
    main()
