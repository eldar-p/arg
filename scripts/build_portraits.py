#!/usr/bin/env python3
"""Download real Unsplash portrait photos (minimal grade). Not Mandela cast."""

from __future__ import annotations

import io
import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

OUT = Path(__file__).resolve().parents[1] / "assets" / "portraits"
OUT.mkdir(parents=True, exist_ok=True)

# Real photographic portraits from Unsplash (https://unsplash.com/license).
SOURCES = {
    "mark": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    "cesar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    "thatcher": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    "adam": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    "jonah": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
    "sarah": "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    "dave": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
    "ruth": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    "gabriel": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "alternate": "https://images.unsplash.com/photo-1521119989659-a83eee488004",
}

W, H = 540, 720


def fetch(url: str) -> Image.Image:
    req = urllib.request.Request(
        f"{url}?auto=format&fit=crop&w=1080&h=1440&q=90&crop=faces",
        headers={"User-Agent": "mandela-archive-portrait-builder/2.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    return ImageOps.fit(img, (W, H), method=Image.Resampling.LANCZOS, centering=(0.5, 0.36))


def soft_grain(img: Image.Image, amount: float = 4.0) -> Image.Image:
    arr = np.asarray(img).astype(np.float32)
    rng = np.random.default_rng(7)
    noise = rng.integers(0, 256, size=arr.shape[:2], dtype=np.uint8)
    noise_rgb = np.stack([noise, noise, noise], axis=-1).astype(np.float32)
    mixed = arr * (1.0 - amount / 255.0) + noise_rgb * (amount / 255.0)
    return Image.fromarray(np.clip(mixed, 0, 255).astype(np.uint8), "RGB")


def human_photo(img: Image.Image, *, gabriel: bool = False) -> Image.Image:
    """Keep it looking like a real photograph — no heavy CRT cook."""
    g = img.copy()
    if gabriel:
        # Pale wash, still photographic
        g = ImageEnhance.Brightness(g).enhance(1.25)
        g = ImageEnhance.Color(g).enhance(0.35)
        g = ImageEnhance.Contrast(g).enhance(0.9)
    else:
        # Slight archival cool cast, keep color/face detail
        g = ImageEnhance.Color(g).enhance(0.75)
        g = ImageEnhance.Contrast(g).enhance(1.05)
        cool = Image.new("RGB", g.size, (210, 220, 230))
        g = Image.blend(g, cool, 0.08)
    g = soft_grain(g, 3.5)
    return g


def hollow_eyes(img: Image.Image) -> Image.Image:
    out = img.copy()
    d = ImageDraw.Draw(out, "RGBA")
    w, h = out.size
    eye_w, eye_h = int(w * 0.14), int(h * 0.045)
    left_cx, right_cx = int(w * 0.36), int(w * 0.64)
    cy = int(h * 0.40)
    for cx in (left_cx, right_cx):
        box = [cx - eye_w, cy - eye_h, cx + eye_w, cy + eye_h]
        d.ellipse(box, fill=(0, 0, 0, 200))
        d.ellipse([cx - 2, cy - 1, cx + 2, cy + 2], fill=(160, 30, 30, 150))
    return out.convert("RGB")


def alt_photo(img: Image.Image, *, gabriel: bool = False) -> Image.Image:
    g = ImageOps.grayscale(img).convert("RGB")
    g = ImageEnhance.Contrast(g).enhance(1.25)
    g = ImageEnhance.Brightness(g).enhance(0.88 if not gabriel else 1.2)
    if gabriel:
        tint = Image.new("RGB", g.size, (220, 220, 225))
        g = Image.blend(g, tint, 0.35)
        g = g.filter(ImageFilter.GaussianBlur(radius=0.5))
    else:
        tint = Image.new("RGB", g.size, (80, 16, 16))
        g = Image.blend(g, tint, 0.18)
    g = hollow_eyes(g)
    g = soft_grain(g, 10.0)
    return g


def main() -> None:
    lines = [
        "REAL photographic portraits from Unsplash (https://unsplash.com/license).",
        "Free to use. NOT likenesses / screenshots / cast of The Mandela Catalogue.",
        "Human files keep natural photo look; Alternate adds void-eye grade only.",
        "",
        "Sources:",
    ]
    for key, url in SOURCES.items():
        print(f"fetch {key}…")
        src = fetch(url)
        human = human_photo(src, gabriel=(key == "gabriel"))
        alt = alt_photo(src, gabriel=(key in ("gabriel", "alternate")))
        # primary human path used by game
        human.save(OUT / f"{key}_crt.jpg", "JPEG", quality=90, optimize=True)
        human.save(OUT / f"{key}_photo.jpg", "JPEG", quality=90, optimize=True)
        alt.save(OUT / f"{key}_alt.jpg", "JPEG", quality=90, optimize=True)
        lines.append(f"  {key}: {url}")
        print(f"  wrote {key}_photo / {key}_crt / {key}_alt")
    (OUT / "ATTRIBUTION.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("done")


if __name__ == "__main__":
    main()
