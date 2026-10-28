import subprocess, os, sys

here = os.path.dirname(os.path.abspath(__file__))
comp = os.path.abspath(os.path.join(here, "../../../../video/node_modules/@remotion/compositor-darwin-arm64"))
env = dict(os.environ, DYLD_LIBRARY_PATH=comp)
video = os.path.abspath(os.path.join(here, "../../hostvia_tiktok1.mp4"))
W, H = 108, 192
raw = subprocess.run(
    [os.path.join(comp, "ffmpeg"), "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-c:v", "rawvideo", "-f", "image2pipe", "-"],
    capture_output=True, env=env, check=True,
).stdout
n = len(raw) // (W * H)
frames = [raw[i * W * H:(i + 1) * W * H] for i in range(n)]
print("frames", n)
means = [sum(f) / len(f) for f in frames]
dark = [(i, round(m, 1)) for i, m in enumerate(means) if m < 12]
print("darkest frames (mean<12):", dark[:20])
print("min mean", round(min(means), 1), "at", means.index(min(means)))

# Identical consecutive frames (frozen picture). Product screens hold still on purpose, so report runs.
runs, start = [], None
for i in range(1, n):
    d = sum(abs(a - b) for a, b in zip(frames[i], frames[i - 1])) / (W * H)
    if d < 0.02:
        start = i - 1 if start is None else start
    else:
        if start is not None and i - start >= 3:
            runs.append((start, i - 1, round(start / 30, 2), round((i - 1) / 30, 2)))
        start = None
if start is not None and n - start >= 3:
    runs.append((start, n - 1, round(start / 30, 2), round((n - 1) / 30, 2)))
print("static runs (>=3 identical frames):", runs)

# Footage section: count exact repeats (duplicated source frames) before 15 s.
reps = [i for i in range(1, 450) if sum(abs(a - b) for a, b in zip(frames[i], frames[i - 1])) / (W * H) < 0.05]
print("footage frames identical to previous:", len(reps), reps[:40])
