#!/usr/bin/env python3
"""
Strip the dark navy/black backgrounds from the Gemini-generated logos
so they composite cleanly onto any page.

Strategy: flood-fill from the 4 corners. Any pixel whose RGB is "close
enough" to the corner color (Euclidean distance < threshold) gets alpha=0.
This preserves the emblem/wordmark interior while cleanly removing the
rectangular backdrop.

In-place rewrite of the three logo PNGs under public/assets/ui/.
"""
import sys
from pathlib import Path
from collections import deque
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
UI = ROOT / "frontend" / "public" / "assets" / "ui"

TARGETS = ["nuansa_logo_emblem.png", "nuansa_logo_wordmark.png", "nuansa_logo_app.png"]
THRESHOLD = 70  # Euclidean RGB distance below which we consider "same color"


def color_distance(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def flood_from_corners(img: Image.Image, thresh: int) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    # Sample the 4 corners; pick the most common corner color
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    # Use corner[0] as reference — all 4 are typically the same background
    ref = (corners[0][0], corners[0][1], corners[0][2])

    visited = [[False] * h for _ in range(w)]
    q = deque()
    for cx, cy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if not visited[cx][cy]:
            q.append((cx, cy))
            visited[cx][cy] = True

    changed = 0
    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        if color_distance((r, g, b), ref) > thresh:
            continue
        # Mark transparent
        px[x, y] = (r, g, b, 0)
        changed += 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                visited[nx][ny] = True
                q.append((nx, ny))
    return img, changed


def main():
    for name in TARGETS:
        p = UI / name
        if not p.exists():
            print(f"skip: {name} not found")
            continue
        img = Image.open(p)
        new_img, changed = flood_from_corners(img, THRESHOLD)
        new_img.save(p, optimize=True)
        print(f"{name}: {changed} pixels keyed transparent")


if __name__ == "__main__":
    main()
