"""Generate PWA icons for the Colonia del Sacramento Lighthouse guide.

Draws a simple lighthouse glyph on a themed background so the site can be
installed as a Progressive Web App. Run with: python scripts/gen-pwa-icons.py
"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(OUT, exist_ok=True)

THEME = (35, 72, 48)       # #234830
DARK = (15, 32, 21)        # #0f2015
WHITE = (245, 240, 232)    # sand-100
ACCENT = (58, 122, 141)    # water-600
GOLD = (199, 107, 42)      # autumn-500


def draw_lighthouse(draw, cx, cy, scale, bg):
    # tower (trapezoid)
    w_top = 26 * scale
    w_bot = 40 * scale
    h = 150 * scale
    top = cy - h / 2
    bot = cy + h / 2
    draw.polygon(
        [(cx - w_top, top), (cx + w_top, top), (cx + w_bot, bot), (cx - w_bot, bot)],
        fill=WHITE,
    )
    # lantern room
    lr = 18 * scale
    draw.rectangle([cx - lr, top - lr - 6 * scale, cx + lr, top + 4 * scale], fill=GOLD)
    draw.ellipse([cx - 10 * scale, top - lr - 22 * scale, cx + 10 * scale, top - 2 * scale], fill=WHITE)
    # base / hill
    draw.ellipse([cx - 70 * scale, bot - 14 * scale, cx + 70 * scale, bot + 40 * scale], fill=bg)
    draw.rectangle([cx - 70 * scale, bot, cx + 70 * scale, bot + 30 * scale], fill=bg)
    # water accent
    draw.rectangle([cx - 90 * scale, bot + 24 * scale, cx + 90 * scale, bot + 30 * scale], fill=ACCENT)


def make(size, bg, pad):
    img = Image.new("RGBA", (size, size), bg + (255,) if len(bg) == 3 else bg)
    draw = ImageDraw.Draw(img)
    # subtle rounded vignette background
    cx, cy = size // 2, size // 2
    scale = (size - 2 * pad) / 360.0
    draw_lighthouse(draw, cx, cy, scale, bg)
    return img


sizes = {
    "icon-192.png": (192, THEME, 0),
    "icon-512.png": (512, THEME, 0),
    "icon-512-maskable.png": (512, DARK, 0),
}

for name, (size, bg, pad) in sizes.items():
    im = make(size, bg, pad)
    im.save(os.path.join(OUT, name))
    print("wrote", os.path.join(OUT, name), im.size)
