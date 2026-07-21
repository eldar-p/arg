#!/usr/bin/env python3
"""Download Mixkit SFX previews used by the archive (see assets/sfx/ATTRIBUTION.txt)."""

from __future__ import annotations

import re
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "sfx"

MAP = {
    "ambience": 2482,
    "drone": 2749,
    "room": 3081,
    "knock": 197,
    "door": 190,
    "phone": 1357,
    "heart": 494,
    "static": 1457,
    "static_short": 1456,
    "radio": 2566,
    "radio_creepy": 2558,
    "glitch": 2597,
    "sting": 773,
    "impact": 565,
    "choir": 660,
    "choir_dark": 664,
    "angel": 663,
    "whisper": 1026,
    "breath": 2240,
    "presence": 2234,
    "scratch": 3097,
    "tape": 1090,
    "vhs": 2556,
    "emergency": 1007,
    "laugh": 409,
    "cry": 465,
    "voices": 279,
    "gibber": 2555,
    "wind": 1157,
    "swell": 2630,
    "riser": 561,
    "creak": 336,
    "alarm": 990,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ua = {"User-Agent": "Mozilla/5.0"}
    lines = [
        "Sound effects from Mixkit (https://mixkit.co/license/#sfxFree)",
        "Free under the Mixkit License. Not from The Mandela Catalogue series.",
        "",
    ]
    for name, sid in MAP.items():
        url = f"https://assets.mixkit.co/active_storage/sfx/{sid}/{sid}-preview.mp3"
        dest = OUT / f"{name}.mp3"
        print("GET", name, sid)
        req = urllib.request.Request(url, headers=ua)
        with urllib.request.urlopen(req, timeout=60) as r:
            dest.write_bytes(r.read())
        orig = str(sid)
        try:
            req2 = urllib.request.Request(
                f"https://assets.mixkit.co/active_storage/sfx/{sid}/{sid}.wav",
                method="HEAD",
                headers=ua,
            )
            with urllib.request.urlopen(req2, timeout=30) as r2:
                cd = r2.headers.get("content-disposition", "")
                m = re.search(r'filename="([^"]+)"', cd)
                if m:
                    orig = m.group(1)
        except Exception:
            pass
        lines.append(f"{name}.mp3 <= {orig} (id {sid})")
    (OUT / "ATTRIBUTION.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("done ->", OUT)


if __name__ == "__main__":
    main()
