#!/usr/bin/env python3
"""Download Mixkit Music beds used as the archive soundtrack."""

from __future__ import annotations

import re
import subprocess
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "music"

MAP = {
    "bed_dark": 64,
    "bed_piano": 671,
    "bed_echoes": 188,
    "bed_delirium": 605,
    "bed_dreams": 588,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ua = {"User-Agent": "Mozilla/5.0"}
    lines = [
        "Music beds from Mixkit (https://mixkit.co/license/#musicFree).",
        "Free under the Mixkit License. NOT audio from The Mandela Catalogue.",
        "",
    ]
    for name, sid in MAP.items():
        url = f"https://assets.mixkit.co/music/{sid}/{sid}.mp3"
        raw = OUT / f"{name}_raw.mp3"
        final = OUT / f"{name}.mp3"
        print("GET", name, sid)
        req = urllib.request.Request(url, headers=ua)
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read()
            cd = r.headers.get("content-disposition", "")
        raw.write_bytes(data)
        m = re.search(r'filename="([^"]+)"', cd)
        orig = m.group(1) if m else str(sid)
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(raw),
                "-t",
                "90",
                "-ac",
                "2",
                "-ar",
                "44100",
                "-b:a",
                "96k",
                str(final),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        raw.unlink(missing_ok=True)
        lines.append(f"{name}.mp3 <= {orig} (id {sid}), ~90s excerpt")
    (OUT / "ATTRIBUTION.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("done ->", OUT)


if __name__ == "__main__":
    main()
