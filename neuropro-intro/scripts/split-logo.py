#!/usr/bin/env python3
"""Split the NeuroPro logo into icon + wordmark so the title card can animate them separately.

  python3 scripts/split-logo.py [assets/brand/neuropro-logo.png]

Finds the first fully transparent vertical gap after the icon, writes
assets/brand/neuropro-icon.png, neuropro-wordmark.png and logo-layout.json (pixel boxes in the original).
Re-run this whenever the logo file is replaced.
"""
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets', 'brand', 'neuropro-logo.png')
im = Image.open(src).convert('RGBA')
a = im.getchannel('A')
W, H = im.size
filled = [any(a.getpixel((x, y)) > 40 for y in range(H)) for x in range(W)]
x0 = filled.index(True)
gap = next(x for x in range(x0, W) if not filled[x])          # end of icon
word_start = next(x for x in range(gap, W) if filled[x])      # start of wordmark

def box(x_from, x_to):
    b = a.crop((x_from, 0, x_to, H)).getbbox()
    return [b[0] + x_from, b[1], b[2] + x_from, b[3]]

icon_box, word_box = box(0, gap), box(word_start, W)
out = os.path.join(ROOT, 'assets', 'brand')
im.crop(icon_box).save(os.path.join(out, 'neuropro-icon.png'))
im.crop(word_box).save(os.path.join(out, 'neuropro-wordmark.png'))
layout = {'source': os.path.relpath(src, ROOT), 'size': [W, H], 'icon': icon_box, 'wordmark': word_box}
json.dump(layout, open(os.path.join(out, 'logo-layout.json'), 'w'), indent=2)
print(layout)
