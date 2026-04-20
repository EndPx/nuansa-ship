#!/usr/bin/env python3
"""
Strip non-ASCII characters from Move source files in contracts/sources/.
The Move compiler rejects any char outside ASCII (tabs, LF, CRLF, printable).

Replaces box-drawing and other Unicode decorations with ASCII equivalents
so comments stay readable.
"""
from __future__ import annotations
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "contracts" / "sources"

# Replacements: map common non-ASCII glyphs to ASCII equivalents
TABLE = {
    # Box drawing → hyphens / pipes
    "\u2500": "-",   # ─
    "\u2501": "-",   # ━
    "\u2502": "|",   # │
    "\u2503": "|",   # ┃
    "\u250C": "+",   # ┌
    "\u2510": "+",   # ┐
    "\u2514": "+",   # └
    "\u2518": "+",   # ┘
    "\u251C": "+",   # ├
    "\u2524": "+",   # ┤
    "\u252C": "+",   # ┬
    "\u2534": "+",   # ┴
    "\u253C": "+",   # ┼
    # Dashes → hyphen
    "\u2013": "-",   # – en dash
    "\u2014": "-",   # — em dash
    # Quotes
    "\u2018": "'",   # ‘
    "\u2019": "'",   # ’
    "\u201C": '"',   # “
    "\u201D": '"',   # ”
    # Middle dot
    "\u00B7": ".",
    "\u2022": "*",   # •
    "\u2026": "...", # …
    "\u00D7": "x",   # ×
    "\u2192": "->",  # →
    "\u2190": "<-",  # ←
    # Misc decorations
    "\u2726": "*",   # ✦
    "\u2727": "*",   # ✧
    "\u25C6": "*",   # ◆
    "\u25C7": "*",   # ◇
    "\u25CB": "o",   # ○
    "\u25CF": "*",   # ●
    "\u2694\uFE0F": "[swords]",  # ⚔️
    "\u2693": "[anchor]",         # ⚓
    "\u26F5": "[ship]",           # ⛵
    "\u2B50": "*",                 # ⭐
}

def sanitize(text: str) -> str:
    # Apply explicit table first
    for k, v in TABLE.items():
        text = text.replace(k, v)
    # Strip any remaining non-ASCII (keep tab, LF, CR)
    out = []
    for ch in text:
        if ch in ("\t", "\n", "\r") or 32 <= ord(ch) <= 126:
            out.append(ch)
        # else: drop
    return "".join(out)

def main():
    changed = []
    for path in ROOT.glob("*.move"):
        original = path.read_text(encoding="utf-8")
        cleaned = sanitize(original)
        if cleaned != original:
            path.write_text(cleaned, encoding="utf-8")
            changed.append(path.name)
    if changed:
        print("Sanitized:", ", ".join(changed))
    else:
        print("No changes needed.")

if __name__ == "__main__":
    main()
