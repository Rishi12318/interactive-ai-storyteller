"""Generate a photorealistic torn paper mask PNG.

Creates a high-resolution transparent PNG with organic torn edges
resembling hand-torn premium cotton paper.
"""
import math
import random
import struct
import zlib
from PIL import Image

W, H = 1600, 1200
MARGIN_X = int(W * 0.13)
MARGIN_Y_TOP = int(H * 0.14)
MARGIN_Y_BOT = int(H * 0.13)
PAPER_W = W - 2 * MARGIN_X
PAPER_H = H - MARGIN_Y_TOP - MARGIN_Y_BOT

random.seed(42)

def smooth_noise(x, freq=1.0, octaves=4):
    """Value noise with multiple octaves for organic edge variation."""
    value = 0.0
    amp = 1.0
    total_amp = 0.0
    for _ in range(octaves):
        nx = x * freq / W
        base = nx * 12.9898 + 78.233
        noise_val = abs(math.sin(base) * 43758.5453) % 1.0
        value += noise_val * amp
        total_amp += amp
        amp *= 0.5
        freq *= 2.0
    return value / total_amp

def edge_displacement(pos, edge_len, amplitude, frequency):
    """Generate organic displacement at a position along an edge."""
    n = 0.0
    # Large flowing tears (low frequency)
    n += math.sin(pos * 2.0 * math.pi / edge_len * 2.5 + 1.3) * amplitude * 0.6
    n += math.sin(pos * 2.0 * math.pi / edge_len * 5.0 + 4.7) * amplitude * 0.3
    # Medium tears
    n += math.sin(pos * 2.0 * math.pi / edge_len * 12.0 + 2.1) * amplitude * 0.15
    n += math.sin(pos * 2.0 * math.pi / edge_len * 20.0 + 6.4) * amplitude * 0.08
    # Random jitter for fiber detail
    for _ in range(3):
        seed = hash((int(pos * 100), _)) % 10000
        jitter = ((seed * 0.0001 + pos * 0.001) * 12.9898) % 1.0
        n += (jitter - 0.5) * amplitude * 0.04
    return n

print(f"Creating torn paper mask: {W}x{H}")
print(f"Paper area: {PAPER_W}x{PAPER_H} at ({MARGIN_X}, {MARGIN_Y_TOP})")

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
pixels = img.load()

AMP_TOP = 28
AMP_RIGHT = 32
AMP_BOT = 40
AMP_LEFT = 32

print("Generating pixels...")
for py in range(H):
    if py % 200 == 0:
        print(f"  Row {py}/{H}")
    for px in range(W):
        left_dist = px - MARGIN_X
        right_dist = (MARGIN_X + PAPER_W) - px
        top_dist = py - MARGIN_Y_TOP
        bottom_dist = (MARGIN_Y_TOP + PAPER_H) - py

        if (left_dist > 60 and right_dist > 60 and
            top_dist > 60 and bottom_dist > 60):
            pixels[px, py] = (255, 255, 255, 255)
            continue

        if (left_dist < -20 or right_dist < -20 or
            top_dist < -20 or bottom_dist < -20):
            continue

        d_top = edge_displacement(px, W, AMP_TOP, 1.0)
        d_right = edge_displacement(py, H, AMP_RIGHT, 1.0)
        d_bot = edge_displacement(px, W, AMP_BOT, 1.0)
        d_left = edge_displacement(py, H, AMP_LEFT, 1.0)

        inside = True
        if top_dist < 0:
            inside = top_dist >= -d_top if d_top > 0 else top_dist >= d_top
        elif bottom_dist < 0:
            inside = bottom_dist >= -d_bot if d_bot > 0 else bottom_dist >= d_bot
        elif left_dist < 0:
            inside = left_dist >= -d_left if d_left > 0 else left_dist >= d_left
        elif right_dist < 0:
            inside = right_dist >= -d_right if d_right > 0 else right_dist >= d_right

        if inside:
            alpha = 255
            edge_dist = min(
                abs(top_dist) if top_dist < 60 else 999,
                abs(bottom_dist) if bottom_dist < 60 else 999,
                abs(left_dist) if left_dist < 60 else 999,
                abs(right_dist) if right_dist < 60 else 999,
            )
            if edge_dist < 8:
                alpha = int((edge_dist / 8) * 255)
            pixels[px, py] = (255, 255, 255, alpha)

print("Applying fiber details...")
for _ in range(3000):
    edge = random.choice(["top", "right", "bottom", "left"])
    if edge == "top":
        px = random.randint(MARGIN_X - 10, MARGIN_X + PAPER_W + 10)
        py = MARGIN_Y_TOP + random.randint(-15, 5)
        d = edge_displacement(px, W, AMP_TOP, 1.0)
        edge_y = MARGIN_Y_TOP - d
        if abs(py - edge_y) < 3 and random.random() < 0.3:
            for fy in range(py, py - random.randint(2, 5), -1):
                if 0 <= fy < H and 0 <= px < W:
                    a = pixels[px, fy][3]
                    if a < 200:
                        pixels[px, fy] = (255, 255, 255, min(255, a + 60))
    elif edge == "bottom":
        px = random.randint(MARGIN_X - 10, MARGIN_X + PAPER_W + 10)
        py = MARGIN_Y_TOP + PAPER_H + random.randint(-5, 15)
        d = edge_displacement(px, W, AMP_BOT, 1.0)
        edge_y = MARGIN_Y_TOP + PAPER_H + d
        if abs(py - edge_y) < 3 and random.random() < 0.3:
            for fy in range(py, py + random.randint(2, 5)):
                if 0 <= fy < H and 0 <= px < W:
                    a = pixels[px, fy][3]
                    if a < 200:
                        pixels[px, fy] = (255, 255, 255, min(255, a + 60))
    elif edge == "left":
        py = random.randint(MARGIN_Y_TOP - 10, MARGIN_Y_TOP + PAPER_H + 10)
        px = MARGIN_X + random.randint(-15, 5)
        d = edge_displacement(py, H, AMP_LEFT, 1.0)
        edge_x = MARGIN_X - d
        if abs(px - edge_x) < 3 and random.random() < 0.3:
            for fx in range(px, px - random.randint(2, 5), -1):
                if 0 <= py < H and 0 <= fx < W:
                    a = pixels[fx, py][3]
                    if a < 200:
                        pixels[fx, py] = (255, 255, 255, min(255, a + 60))
    else:  # right
        py = random.randint(MARGIN_Y_TOP - 10, MARGIN_Y_TOP + PAPER_H + 10)
        px = MARGIN_X + PAPER_W + random.randint(-5, 15)
        d = edge_displacement(py, H, AMP_RIGHT, 1.0)
        edge_x = MARGIN_X + PAPER_W + d
        if abs(px - edge_x) < 3 and random.random() < 0.3:
            for fx in range(px, px + random.randint(2, 5)):
                if 0 <= py < H and 0 <= fx < W:
                    a = pixels[fx, py][3]
                    if a < 200:
                        pixels[fx, py] = (255, 255, 255, min(255, a + 60))

out_path = r"C:\Users\rishi\interactive-story-ai\frontend\public\torn-paper-mask.png"
img.save(out_path)
print(f"Saved: {out_path}")
print(f"Size: {W}x{H}")
