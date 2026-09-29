"""
Pixel-art cho các nhân vật "brainrot" của TROLL MODE (vẽ bằng code, không cần file gốc).

Mỗi nhân vật vẽ ở độ phân giải thấp rồi phóng to kiểu nearest-neighbor để giữ
chất pixel. Mỗi nhân vật có 2 frame (đi bộ / ra đòn) để làm animation.

Được gọi từ tools/build_sprites.py — không cần chạy riêng.
"""

from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

SCALE = 3  # phóng to pixel art

# Bảng màu
OUTLINE = (59, 26, 11, 255)
WOOD = (200, 138, 74, 255)
WOOD_DARK = (156, 98, 48, 255)
WOOD_LIGHT = (226, 178, 122, 255)
BAT = (217, 160, 102, 255)
BAT_DARK = (168, 112, 58, 255)
WHITE = (255, 255, 255, 255)
BLACK = (20, 12, 8, 255)
MOUTH = (107, 26, 26, 255)
CACTUS = (76, 175, 80, 255)
CACTUS_DARK = (46, 125, 50, 255)
SPIKE = (255, 241, 180, 255)
ELEPHANT = (158, 158, 170, 255)
ELEPHANT_DARK = (117, 117, 130, 255)
ELEPHANT_LIGHT = (196, 196, 206, 255)
SANDAL = (222, 132, 52, 255)
CLOCK_FACE = (255, 248, 225, 255)
CLOCK_RIM = (255, 196, 60, 255)
SHARK = (92, 140, 190, 255)
SHARK_DARK = (62, 102, 150, 255)
BELLY = (236, 242, 248, 255)
SNEAKER = (40, 110, 230, 255)
CROC = (86, 160, 64, 255)
CROC_DARK = (56, 118, 44, 255)
PLANE = (122, 138, 70, 255)
PLANE_DARK = (88, 102, 48, 255)
BOMB = (44, 44, 54, 255)
FUSE = (168, 112, 58, 255)
SPARK = (255, 200, 40, 255)
STICKER = (255, 244, 220, 255)


def _outline(img: Image.Image) -> Image.Image:
    """Viền tối 1px quanh nhân vật (vẽ ở độ phân giải thấp)."""
    arr = np.array(img)
    solid = arr[..., 3] > 0
    ring = ndimage.binary_dilation(solid, structure=np.ones((3, 3))) & ~solid
    arr[ring] = OUTLINE
    return Image.fromarray(arr)


def _finish(img: Image.Image) -> Image.Image:
    img = _outline(img)
    return img.resize((img.width * SCALE, img.height * SCALE), Image.NEAREST)


def _sticker(img: Image.Image, width: int = 2) -> Image.Image:
    """Viền kem "sticker" giống các vật phẩm rơi khác (áp sau khi phóng to)."""
    arr = np.array(img)
    padded = np.zeros((arr.shape[0] + width * 2, arr.shape[1] + width * 2, 4), dtype=np.uint8)
    padded[width:-width, width:-width] = arr
    ring = ndimage.binary_dilation(padded[..., 3] > 0, structure=np.ones((3, 3)), iterations=width)
    base = np.zeros_like(padded)
    base[ring] = STICKER
    out = Image.fromarray(base)
    out.alpha_composite(Image.fromarray(padded))
    return out


# --------------------------------------------------------------------------- #
# Tung Tung Tung Sahur — khúc gỗ cầm gậy bóng chày
# --------------------------------------------------------------------------- #
def _tung(frame: int) -> Image.Image:
    img = Image.new("RGBA", (28, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Chân (đổi tư thế theo frame)
    legs = [((10, 24), (9, 30)), ((15, 24), (16, 30))] if frame == 0 else [((10, 24), (11, 30)), ((15, 24), (14, 30))]
    for top, bottom in legs:
        d.line([top, bottom], fill=WOOD_DARK, width=2)
        d.rectangle([bottom[0] - 1, bottom[1], bottom[0] + 1, bottom[1] + 1], fill=OUTLINE)

    # Thân khúc gỗ + vân gỗ
    d.rectangle([7, 5, 18, 24], fill=WOOD)
    d.line([(9, 7), (9, 23)], fill=WOOD_LIGHT)
    d.line([(16, 8), (16, 22)], fill=WOOD_DARK)
    d.line([(13, 18), (13, 23)], fill=WOOD_DARK)
    # Mặt cắt khúc gỗ trên đỉnh (vòng tuổi)
    d.ellipse([7, 2, 18, 8], fill=WOOD_LIGHT)
    d.ellipse([10, 4, 15, 6], outline=WOOD_DARK)

    # Mắt to + miệng
    for x in (9, 14):
        d.rectangle([x, 10, x + 2, 13], fill=WHITE)
        d.rectangle([x + 1, 11, x + 1, 12], fill=BLACK)
    d.rectangle([10, 16, 15, 17], fill=MOUTH)
    d.point([(11, 16), (14, 16)], fill=WHITE)

    # Tay trái
    d.line([(7, 14), (4, 19)], fill=WOOD_DARK, width=2)
    # Tay phải + gậy: frame 0 giơ gậy, frame 1 vung gậy
    if frame == 0:
        d.line([(18, 14), (21, 11)], fill=WOOD_DARK, width=2)
        d.line([(21, 12), (24, 1)], fill=BAT, width=3)
        d.line([(21, 12), (22, 8)], fill=BAT_DARK, width=2)
    else:
        d.line([(18, 14), (22, 16)], fill=WOOD_DARK, width=2)
        d.line([(21, 16), (27, 22)], fill=BAT, width=3)
        d.line([(21, 16), (23, 18)], fill=BAT_DARK, width=2)
    return _finish(img)


# --------------------------------------------------------------------------- #
# Lirili Larila — đầu voi, thân xương rồng, đi dép
# --------------------------------------------------------------------------- #
def _lirili(frame: int) -> Image.Image:
    img = Image.new("RGBA", (30, 34), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Dép (nhấc chân so le theo frame)
    left_y, right_y = (30, 31) if frame == 0 else (31, 30)
    d.rectangle([10, left_y, 13, left_y + 1], fill=SANDAL)
    d.rectangle([16, right_y, 19, right_y + 1], fill=SANDAL)

    # Tay xương rồng
    d.rounded_rectangle([3, 16, 7, 24], radius=2, fill=CACTUS)
    d.rectangle([5, 22, 9, 24], fill=CACTUS)
    d.rounded_rectangle([22, 14, 26, 22], radius=2, fill=CACTUS)
    d.rectangle([20, 20, 24, 22], fill=CACTUS)

    # Thân xương rồng + gân + gai
    d.rounded_rectangle([8, 13, 21, 31], radius=5, fill=CACTUS)
    for x in (11, 14, 17):
        d.line([(x, 15), (x, 29)], fill=CACTUS_DARK)
    d.point([(9, 17), (20, 19), (9, 24), (20, 26), (12, 21), (16, 27), (4, 18), (25, 16)], fill=SPIKE)

    # Tai voi
    d.ellipse([1, 2, 10, 13], fill=ELEPHANT_DARK)
    d.ellipse([19, 2, 28, 13], fill=ELEPHANT_DARK)
    # Đầu voi
    d.ellipse([8, 1, 21, 14], fill=ELEPHANT)
    d.ellipse([10, 2, 15, 6], fill=ELEPHANT_LIGHT)
    # Vòi cong
    d.line([(14, 10), (14, 16)], fill=ELEPHANT, width=3)
    d.line([(14, 16), (17, 18)], fill=ELEPHANT, width=2)
    # Mắt
    for x in (11, 17):
        d.rectangle([x, 6, x + 1, 8], fill=WHITE)
        d.point((x + (1 if frame == 0 else 0), 7), fill=BLACK)
    return _finish(img)


def _clock() -> Image.Image:
    img = Image.new("RGBA", (15, 15), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, 14, 14], fill=CLOCK_RIM)
    d.ellipse([2, 2, 12, 12], fill=CLOCK_FACE)
    d.line([(7, 7), (7, 3)], fill=BLACK)
    d.line([(7, 7), (10, 8)], fill=BLACK)
    return _finish(img)


# --------------------------------------------------------------------------- #
# Tralalero Tralala — cá mập 3 chân đi giày thể thao
# --------------------------------------------------------------------------- #
def _tralalero(frame: int) -> Image.Image:
    img = Image.new("RGBA", (38, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 3 chân + giày (so le theo frame)
    for i, x in enumerate((13, 19, 25)):
        shift = (2 if i % 2 == 0 else -2) * (1 if frame == 0 else -1)
        d.line([(x, 16), (x + shift, 25)], fill=SHARK, width=2)
        d.rectangle([x + shift - 1, 26, x + shift + 3, 27], fill=SNEAKER)
        d.line([(x + shift - 1, 28), (x + shift + 3, 28)], fill=WHITE)

    # Đuôi + vây lưng
    d.polygon([(6, 11), (1, 3), (3, 11), (1, 19)], fill=SHARK_DARK)
    d.polygon([(16, 6), (20, 0), (23, 6)], fill=SHARK_DARK)
    # Thân + bụng trắng
    d.ellipse([5, 5, 34, 18], fill=SHARK)
    d.ellipse([11, 11, 32, 18], fill=BELLY)
    d.polygon([(19, 12), (15, 16), (21, 14)], fill=SHARK_DARK)  # vây ngực
    # Mắt + miệng đầy răng
    d.rectangle([27, 8, 28, 9], fill=WHITE)
    d.point((28, 9), fill=BLACK)
    d.line([(25, 14), (33, 13)], fill=MOUTH, width=2)
    d.point([(27, 13), (29, 13), (31, 12)], fill=WHITE)
    return _finish(img)


# --------------------------------------------------------------------------- #
# Bombardiro Crocodilo — máy bay ném bom đầu cá sấu
# --------------------------------------------------------------------------- #
def _bombardiro(frame: int) -> Image.Image:
    img = Image.new("RGBA", (46, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Cánh + đuôi
    d.polygon([(15, 10), (21, 1), (26, 1), (24, 10)], fill=PLANE_DARK)
    d.polygon([(15, 17), (21, 26), (26, 26), (24, 17)], fill=PLANE_DARK)
    d.polygon([(9, 11), (3, 3), (7, 11)], fill=PLANE_DARK)
    d.polygon([(8, 14), (2, 17), (8, 16)], fill=PLANE_DARK)
    # Cánh quạt trên cánh (xoay theo frame)
    if frame == 0:
        d.line([(23, 0), (23, 4)], fill=BLACK)
    else:
        d.line([(21, 2), (25, 2)], fill=BLACK)
    # Thân máy bay
    d.rounded_rectangle([7, 10, 35, 17], radius=3, fill=PLANE)
    d.line([(10, 12), (30, 12)], fill=PLANE_DARK)
    # Đầu cá sấu: mõm dài, răng, mắt lồi
    d.rectangle([31, 10, 45, 15], fill=CROC)
    d.line([(31, 13), (45, 13)], fill=CROC_DARK)
    for x in range(33, 45, 3):
        d.point([(x, 14), (x + 1, 12)], fill=WHITE)
    d.point((44, 10), fill=BLACK)
    d.ellipse([31, 6, 36, 11], fill=CROC)
    d.rectangle([33, 7, 34, 8], fill=WHITE)
    d.point((34, 8), fill=BLACK)
    return _finish(img)


def _bomb() -> Image.Image:
    img = Image.new("RGBA", (14, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([1, 4, 13, 15], fill=BOMB)
    d.rectangle([5, 2, 8, 4], fill=BOMB)
    d.point([(4, 7), (5, 7), (4, 8)], fill=WHITE)
    d.line([(7, 2), (9, 0)], fill=FUSE)
    d.point([(10, 0), (11, 1), (9, 1)], fill=SPARK)
    return _sticker(_finish(img))


def build_brainrot_sprites() -> dict[str, Image.Image]:
    """Tên sprite (không đuôi) -> ảnh."""
    return {
        "brainrot/tung_0": _tung(0),
        "brainrot/tung_1": _tung(1),
        "brainrot/lirili_0": _lirili(0),
        "brainrot/lirili_1": _lirili(1),
        "brainrot/clock": _clock(),
        "brainrot/tralalero_0": _tralalero(0),
        "brainrot/tralalero_1": _tralalero(1),
        "brainrot/bombardiro_0": _bombardiro(0),
        "brainrot/bombardiro_1": _bombardiro(1),
        "brainrot/bomb": _bomb(),
    }
