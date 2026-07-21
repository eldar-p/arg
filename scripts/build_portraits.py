#!/usr/bin/env python3
"""Download Unsplash portraits and bake light archival / Alternate grades."""

from __future__ import annotations

import io
import math
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

OUT = Path(__file__).resolve().parents[1] / "assets" / "portraits"
OUT.mkdir(parents=True, exist_ok=True)

# Free Unsplash photos (license: https://unsplash.com/license). Not Mandela cast.
SOURCES = {
    # young man, casual — Mark
    "mark": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    # young man, short hair — Cesar stand-in
    "cesar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    # older professional — Thatcher
    "thatcher": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    # young man serious — Adam
    "adam": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    # young man street — Jonah
    "jonah": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
    # young woman, calm — Sarah
    "sarah": "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    # East Asian man — Dave Lee
    "dave": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
    # professional woman — Ruth
    "ruth": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    # pale / ethereal face base — Gabriel
    "gabriel": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    # generic male for Type Two card
    "alternate": "https://images.unsplash.com/photo-1521119989659-a83eee488004",
}

W, H = 480, 640


def fetch(url: str) -> Image.Image:
    req = urllib.request.Request(
        f"{url}?auto=format&fit=crop&w=900&h=1200&q=85&crop=faces",
        headers={"User-Agent": "mandela-archive-portrait-builder/1.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    return ImageOps.fit(img, (W, H), method=Image.Resampling.LANCZOS, centering=(0.5, 0.38))


def grain(img: Image.Image, amount: float = 12.0) -> Image.Image:
    import numpy as np

    arr = np.asarray(img).astype(np.float32)
    rng = np.random.default_rng(42)
    noise = rng.integers(0, 256, size=arr.shape[:2], dtype=np.uint8)
    noise_rgb = np.stack([noise, noise, noise], axis=-1).astype(np.float32)
    mixed = arr * (1.0 - amount / 255.0) + noise_rgb * (amount / 255.0)
    return Image.fromarray(np.clip(mixed, 0, 255).astype(np.uint8), "RGB")


def soft_scanlines(img: Image.Image, alpha: int = 28) -> Image.Image:
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(0, img.height, 3):
        d.line([(0, y), (img.width, y)], fill=(0, 0, 0, alpha))
    base = img.convert("RGBA")
    return Image.alpha_composite(base, overlay).convert("RGB")


def vignette(img: Image.Image, strength: float = 0.45) -> Image.Image:
    import numpy as np

    w, h = img.size
    ys, xs = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h * 0.42
    max_r = math.hypot(w * 0.55, h * 0.65)
    r = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2) / max_r
    v = np.clip((r ** 1.6) * 255 * strength, 0, 255).astype(np.uint8)
    mask = Image.fromarray(v, "L")
    dark = Image.new("RGB", img.size, (0, 0, 0))
    return Image.composite(dark, img, mask)


def archival_human(img: Image.Image, *, gabriel: bool = False) -> Image.Image:
    g = ImageOps.grayscale(img).convert("RGB")
    if gabriel:
        # Pale false-angel look — still a photo, not a drawing
        g = ImageEnhance.Brightness(g).enhance(1.55)
        g = ImageEnhance.Contrast(g).enhance(0.72)
        tint = Image.new("RGB", g.size, (225, 230, 235))
        g = Image.blend(g, tint, 0.42)
        g = g.filter(ImageFilter.GaussianBlur(radius=0.6))
        g = soft_scanlines(g, 22)
        g = vignette(g, 0.4)
        g = grain(g, 10.0)
    else:
        # Keep readable as a real photograph; only a hint of archive
        g = ImageEnhance.Contrast(g).enhance(1.08)
        g = ImageEnhance.Brightness(g).enhance(1.03)
        tint = Image.new("RGB", g.size, (35, 70, 45))
        g = Image.blend(g, tint, 0.06)
        g = soft_scanlines(g, 10)
        g = vignette(g, 0.22)
        g = grain(g, 5.0)
    return g


def hollow_eyes(img: Image.Image) -> Image.Image:
    """Darken eye region like Mandela void-eyes — not censorship bars."""
    out = img.copy()
    d = ImageDraw.Draw(out, "RGBA")
    w, h = out.size
    # approximate eye band for face-centered crop
    y0, y1 = int(h * 0.34), int(h * 0.46)
    x0, x1 = int(w * 0.18), int(w * 0.82)
    # soft black ellipses for eye sockets
    eye_w, eye_h = int(w * 0.16), int(h * 0.055)
    left_cx, right_cx = int(w * 0.35), int(w * 0.65)
    cy = int((y0 + y1) / 2)
    for cx in (left_cx, right_cx):
        box = [cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h]
        d.ellipse(box, fill=(0, 0, 0, 210))
        # tiny wrong highlight
        d.ellipse(
            [cx - 3, cy - 2, cx + 2, cy + 3],
            fill=(180, 40, 40, 160),
        )
    # slight mouth wrongness shadow
    my = int(h * 0.68)
    d.ellipse([int(w * 0.35), my - 6, int(w * 0.65), my + 10], fill=(20, 0, 0, 70))
    return out.convert("RGB")


def stretch_face(img: Image.Image, amount: float = 0.06) -> Image.Image:
    """Mild vertical face stretch — uncanny, still photographic."""
    w, h = img.size
    # scale vertically a bit more in mid band via affine-ish resize trick
    mid = img.crop((0, int(h * 0.25), w, int(h * 0.75)))
    mid = mid.resize((w, int(mid.height * (1 + amount))), Image.Resampling.BICUBIC)
    canvas = Image.new("RGB", (w, h), (8, 4, 4))
    top = img.crop((0, 0, w, int(h * 0.25)))
    bot = img.crop((0, int(h * 0.75), w, h))
    canvas.paste(top, (0, 0))
    canvas.paste(mid, (0, int(h * 0.25 - mid.height * amount * 0.35)))
    canvas.paste(bot.resize((w, h - int(h * 0.75)), Image.Resampling.BICUBIC), (0, int(h * 0.75)))
    # re-fit cleanly
    return ImageOps.fit(canvas, (w, h), centering=(0.5, 0.45))


def archival_alt(img: Image.Image, *, gabriel: bool = False) -> Image.Image:
    g = ImageOps.grayscale(img).convert("RGB")
    g = ImageEnhance.Contrast(g).enhance(1.35)
    g = ImageEnhance.Brightness(g).enhance(0.82 if not gabriel else 1.15)
    if gabriel:
        tint = Image.new("RGB", g.size, (200, 200, 210))
        g = Image.blend(g, tint, 0.35)
        g = ImageEnhance.Brightness(g).enhance(1.25)
        g = g.filter(ImageFilter.GaussianBlur(radius=0.8))
    else:
        tint = Image.new("RGB", g.size, (90, 18, 18))
        g = Image.blend(g, tint, 0.22)
        g = stretch_face(g, 0.08)
    g = hollow_eyes(g)
    g = soft_scanlines(g, 34)
    g = vignette(g, 0.55)
    g = grain(g, 16.0)
    # thin red frame hint
    d = ImageDraw.Draw(g)
    d.rectangle([2, 2, g.width - 3, g.height - 3], outline=(140, 40, 40), width=2)
    return g


def main() -> None:
    attribution = [
        "Portrait photos sourced from Unsplash (https://unsplash.com/license).",
        "Free to use. Not likenesses of Mandela Catalogue actors / cast.",
        "Light archival CRT grade + Alternate void-eye grade applied locally.",
        "",
        "Sources:",
    ]
    for key, url in SOURCES.items():
        print(f"fetch {key}…")
        src = fetch(url)
        human = archival_human(src, gabriel=(key == "gabriel"))
        alt = archival_alt(src, gabriel=(key in ("gabriel", "alternate")))
        human_path = OUT / f"{key}_crt.jpg"
        alt_path = OUT / f"{key}_alt.jpg"
        human.save(human_path, "JPEG", quality=88, optimize=True)
        alt.save(alt_path, "JPEG", quality=88, optimize=True)
        attribution.append(f"  {key}: {url}")
        print(f"  wrote {human_path.name} / {alt_path.name}")

    (OUT / "ATTRIBUTION.txt").write_text("\n".join(attribution) + "\n", encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
