"""
Icon PWA / favicon của Phonics Arcade (ghi vào `public/icons/`).

Chạy:  pnpm assets:icons   (= python tools/build_app_icons.py)

Thiết kế theo màn chọn game: nền tím (gradient như `.hub`), chữ "Ab" font Baloo 2 ExtraBold
màu vàng / hồng, viền mực đậm + bóng khối bên dưới giống logo PHONICS, vài ngôi sao lấp lánh.
  - icon-192 / icon-512 / apple-touch-icon: nền tràn viền (hệ điều hành tự bo / cắt "maskable"),
    chữ nằm trong vùng an toàn 80%.
  - favicon: ô vuông bo góc, chữ to hơn để vẫn đọc được ở 16–32px trên tab trình duyệt.
Vẽ ở 1024px rồi thu nhỏ (Lanczos) cho viền mượt.
"""

from __future__ import annotations

import io
import math
import sys
from pathlib import Path

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common.paths import ROOT  # noqa: E402

ICONS_DIR = ROOT / "public" / "icons"
FONT_WOFF = ROOT / "node_modules" / "@fontsource" / "baloo-2" / "files" / "baloo-2-latin-800-normal.woff"

CANVAS = 1024
# Màu lấy từ src/platform/styles (base.css, hub.css)
INK = (36, 18, 63, 255)  # --ink của .hub
GOLD = (255, 210, 63, 255)  # --gold
PINK = (255, 111, 156, 255)  # --pink
ORANGE = (255, 166, 43, 255)  # --orange
BG_STOPS = [(0.0, (122, 59, 184)), (0.55, (61, 28, 110)), (1.0, (29, 13, 56))]

# (tên file, kích thước, bo góc?)
APP_ICONS = [
    ("icon-512.png", 512, False),
    ("icon-192.png", 192, False),
    ("apple-touch-icon.png", 180, False),
    ("favicon.png", 64, True),
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    """Pillow không đọc được .woff -> chuyển sang TrueType trong bộ nhớ."""
    font = TTFont(FONT_WOFF)
    font.flavor = None
    buffer = io.BytesIO()
    font.save(buffer)
    buffer.seek(0)
    return ImageFont.truetype(buffer, size)


def background(size: int) -> Image.Image:
    """Gradient tròn, tâm ở mép trên (radial-gradient(ellipse at 50% 0%) của .hub)."""
    ys, xs = np.mgrid[0:size, 0:size].astype(np.float32) + 0.5
    dist = np.hypot(xs - size / 2, ys - size * 0.05) / (size * 1.05)
    dist = np.clip(dist, 0, 1)
    rgb = np.zeros((size, size, 3), np.float32)
    for (t0, c0), (t1, c1) in zip(BG_STOPS, BG_STOPS[1:]):
        mask = (dist >= t0) & (dist <= t1)
        k = ((dist - t0) / (t1 - t0))[mask][:, None]
        rgb[mask] = np.array(c0) * (1 - k) + np.array(c1) * k
    alpha = np.full((size, size, 1), 255, np.float32)
    return Image.fromarray(np.concatenate([rgb, alpha], axis=2).astype(np.uint8), "RGBA")


def sparkle(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float, color: tuple) -> None:
    """Ngôi sao 4 cánh lấp lánh."""
    points = []
    for i in range(8):
        angle = math.pi / 4 * i - math.pi / 2
        radius = r if i % 2 == 0 else r * 0.32
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    draw.polygon(points, fill=color)


def draw_letter(
    img: Image.Image,
    text: str,
    font: ImageFont.FreeTypeFont,
    center: tuple[float, float],
    fill: tuple,
    angle: float = 0,
) -> None:
    """Chữ có viền mực + bóng khối bên dưới (giống --outline-thick của logo), xoay nhẹ cho vui."""
    stroke = round(font.size * 0.07)
    depth = round(font.size * 0.07)
    left, top, right, bottom = font.getbbox(text, stroke_width=stroke)
    w, h = right - left, bottom - top + depth
    pad = stroke * 2
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    origin = (pad - left, pad - top)
    draw.text((origin[0], origin[1] + depth), text, font=font, fill=INK, stroke_width=stroke, stroke_fill=INK)
    draw.text(origin, text, font=font, fill=fill, stroke_width=stroke, stroke_fill=INK)
    # Viền không lấp kín lòng chữ (vd lỗ nhỏ giữa chữ "b") -> tô mực cho đặc
    pixels = np.array(layer)
    solid = pixels[..., 3] == 255
    pixels[ndimage.binary_fill_holes(solid) & ~solid] = INK
    layer = Image.fromarray(pixels, "RGBA")
    # Vệt sáng nhẹ ở nửa trên chữ cho cảm giác "kẹo"
    glyph = Image.new("L", layer.size, 0)
    ImageDraw.Draw(glyph).text(origin, text, font=font, fill=255)
    shine = Image.new("L", layer.size, 0)
    ImageDraw.Draw(shine).rectangle((0, 0, layer.width, origin[1] + top + (bottom - top) * 0.42), fill=70)
    shine = Image.composite(shine, Image.new("L", layer.size, 0), glyph)
    layer.alpha_composite(Image.merge("RGBA", (*[Image.new("L", layer.size, 255)] * 3, shine)))

    if angle:
        layer = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
    img.alpha_composite(layer, (round(center[0] - layer.width / 2), round(center[1] - layer.height / 2)))


def render(rounded: bool) -> Image.Image:
    s = CANVAS
    img = background(s)
    draw = ImageDraw.Draw(img)

    if rounded:
        # Favicon: chữ chiếm gần hết ô để đọc được ở 16px
        draw_letter(img, "A", load_font(round(s * 0.74)), (s * 0.40, s * 0.47), GOLD, angle=6)
        draw_letter(img, "b", load_font(round(s * 0.60)), (s * 0.70, s * 0.56), PINK, angle=-8)
    else:
        for cx, cy, r, color in [
            (0.18, 0.2, 0.05, GOLD),
            (0.84, 0.17, 0.035, PINK),
            (0.86, 0.8, 0.045, ORANGE),
            (0.13, 0.78, 0.03, PINK),
        ]:
            sparkle(draw, s * cx, s * cy, s * r, color)
        # Vùng an toàn của icon maskable: hình tròn đường kính 80%
        draw_letter(img, "A", load_font(round(s * 0.56)), (s * 0.41, s * 0.48), GOLD, angle=6)
        draw_letter(img, "b", load_font(round(s * 0.46)), (s * 0.63, s * 0.55), PINK, angle=-8)

    if rounded:
        mask = Image.new("L", (s, s), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), radius=round(s * 0.22), fill=255)
        img.putalpha(mask)
    return img


def main() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    masters = {rounded: render(rounded) for rounded in (False, True)}
    for filename, size, rounded in APP_ICONS:
        icon = masters[rounded].resize((size, size), Image.LANCZOS)
        icon.save(ICONS_DIR / filename, optimize=True)
        print(f"  {filename} ({size}px)")


if __name__ == "__main__":
    main()
