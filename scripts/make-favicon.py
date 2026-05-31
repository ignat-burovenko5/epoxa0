from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
logo = Image.open(ROOT / "public" / "logo.png").convert("RGBA")
size = 512
logo.thumbnail((size, size), Image.Resampling.LANCZOS)

canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
ox = (size - logo.width) // 2
oy = (size - logo.height) // 2
canvas.paste(logo, (ox, oy), logo)

black = Image.new("RGBA", canvas.size, (0, 0, 0, 255))
black.putalpha(canvas.split()[3])
black.save(ROOT / "public" / "favicon.png", "PNG")
print("Wrote public/favicon.png")
