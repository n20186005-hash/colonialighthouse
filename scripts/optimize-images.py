"""Optimize and rename the lighthouse gallery + hero images.

Renames gallery files to a clean pattern (colonia-lighthouse-guide-NN.jpg) and
re-encodes everything with Pillow to cut page weight. Run:
    python scripts/optimize-images.py
"""
import os
from PIL import Image

GALLERY = os.path.join(os.path.dirname(__file__), "..", "public", "gallery")
HERO = os.path.join(os.path.dirname(__file__), "..", "public", "images", "hero.jpg")


def optimize(src, dst, max_side, quality):
    with Image.open(src) as im:
        im = im.convert("RGB")
        if max(im.size) > max_side:
            im.thumbnail((max_side, max_side))
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)


def main():
    files = sorted(
        f for f in os.listdir(GALLERY) if f.lower().endswith(".jpg")
    )
    for i, name in enumerate(files, start=1):
        src = os.path.join(GALLERY, name)
        dst = os.path.join(GALLERY, f"colonia-lighthouse-guide-{i:02d}.jpg")
        optimize(src, dst, 1600, 82)
        if dst != src and os.path.exists(dst):
            os.remove(src)
        print("optimized", os.path.basename(dst))

    if os.path.exists(HERO):
        tmp = HERO + ".tmp.jpg"
        optimize(HERO, tmp, 2000, 80)
        os.replace(tmp, HERO)
        print("optimized hero.jpg")


if __name__ == "__main__":
    main()
