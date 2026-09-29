#!/usr/bin/env python3
"""
Rebuild the scroll-scrubbed background from a folder of video frames.

    python3 tools/build-frames.py [source-folder]

Three knobs decide quality vs weight. Frame count controls how smooth the
scrub feels; width controls how sharp it looks on a big desktop; quality is
the usual WebP dial. The page reads FRAME_COUNT from assets/frames/manifest.json,
so changing these numbers here is all you need to do.
"""
import os, re, sys, glob, json
from PIL import Image

SRC     = sys.argv[1] if len(sys.argv) > 1 else "/Users/vasanthmhs/Desktop/vasanth/My/TTS/jjjj"
OUT     = "public/frames"

FRAMES  = 145     # more = smoother scrub, bigger download (~17px of scroll per frame at 145)
WIDTH   = 560     # more = sharper on large screens, bigger download
QUALITY = 60      # 50-75 is the useful range

srcs = sorted(glob.glob(os.path.join(SRC, "*.webp")) +
              glob.glob(os.path.join(SRC, "*.png")) +
              glob.glob(os.path.join(SRC, "*.jpg")))
if not srcs:
    sys.exit(f"no frames found in {SRC}")

os.makedirs(OUT, exist_ok=True)
for f in glob.glob(f"{OUT}/*.webp"):
    os.remove(f)

total = h = 0
for i in range(FRAMES):
    j = round(i * (len(srcs) - 1) / (FRAMES - 1))
    im = Image.open(srcs[j]).convert("RGB")
    h = round(im.height * WIDTH / im.width / 2) * 2
    im.resize((WIDTH, h), Image.LANCZOS).save(
        f"{OUT}/f{i+1:03d}.webp", "WEBP", quality=QUALITY, method=6)
    total += os.path.getsize(f"{OUT}/f{i+1:03d}.webp")

json.dump({"count": FRAMES, "width": WIDTH, "height": h,
           "pattern": "/frames/f{n}.webp", "pad": 3},
          open(f"{OUT}/manifest.json", "w"), indent=2)

# keep script.js in step so the page always knows the real frame count
js = open("src/config.js").read()
js2 = re.sub(r"(\bcount:\s*)\d+", r"\g<1>%d" % FRAMES, js, count=1)
if js2 != js:
    open("src/config.js", "w").write(js2)
    print(f"src/config.js: frameCount -> {FRAMES}")

print(f"{FRAMES} frames  {WIDTH}x{h}  q{QUALITY}")
print(f"{total/1048576:.2f} MB total, {total/FRAMES/1024:.0f} KB per frame")
print(f"source: {len(srcs)} frames in {SRC}")
