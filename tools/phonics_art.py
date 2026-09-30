"""
Pixel-art cho phần lớp học của Phonics Bread Catcher (vẽ bằng code, không cần file gốc):
mascot 4 đội, xúc xắc 6 mặt, hộp quà đóng / mở, vương miện.

Không có chữ nào được "nướng" vào hình — tên đội, chữ cái, điểm... đều vẽ live trong game.
Được gọi từ tools/build_sprites.py — không cần chạy riêng.
"""

from __future__ import annotations

from PIL import Image, ImageDraw

from brainrot_art import OUTLINE, WHITE, BLACK, _outline

SCALE = 3

# Bảng màu
FUR_LION = (255, 196, 72, 255)
MANE = (214, 112, 38, 255)
MANE_DARK = (170, 78, 24, 255)
FUR_TIGER = (255, 150, 46, 255)
STRIPE = (60, 34, 20, 255)
MUZZLE = (255, 246, 228, 255)
PANDA_WHITE = (250, 250, 250, 255)
PANDA_BLACK = (40, 40, 48, 255)
BUNNY = (255, 255, 255, 255)
PINK = (255, 150, 180, 255)
BLUSH = (255, 170, 170, 255)
NOSE = (92, 44, 30, 255)
HAT = (255, 255, 255, 255)
HAT_SHADE = (222, 222, 232, 255)
EYE_SHINE = (255, 255, 255, 255)

DICE_FACE = (255, 252, 244, 255)
DICE_SHADE = (226, 214, 196, 255)
PIP = (226, 58, 72, 255)

GOLD = (255, 204, 56, 255)
GOLD_DARK = (214, 150, 30, 255)
GEM_RED = (232, 60, 80, 255)
GEM_BLUE = (70, 150, 240, 255)

GIFT_COLORS = [
    ((236, 72, 96, 255), (190, 40, 66, 255)),  # đỏ
    ((72, 150, 236, 255), (40, 104, 190, 255)),  # xanh dương
    ((96, 196, 96, 255), (58, 146, 62, 255)),  # xanh lá
]
RIBBON = GOLD
RIBBON_DARK = GOLD_DARK
SPARKLE = (255, 244, 160, 255)


def _finish(img: Image.Image, scale: int = SCALE) -> Image.Image:
    img = _outline(img)
    return img.resize((img.width * scale, img.height * scale), Image.NEAREST)


# --------------------------------------------------------------------------- #
# Mascot — đầu thú đội mũ đầu bếp (canvas 24x27)
# --------------------------------------------------------------------------- #
def _chef_hat(d: ImageDraw.ImageDraw) -> None:
    d.ellipse([5, 2, 11, 8], fill=HAT)
    d.ellipse([13, 2, 19, 8], fill=HAT)
    d.ellipse([8, 0, 16, 7], fill=HAT)
    d.rectangle([7, 7, 17, 9], fill=HAT_SHADE)
    d.point([(10, 3), (14, 4)], fill=HAT_SHADE)


def _eyes(d: ImageDraw.ImageDraw, y: int = 16) -> None:
    for x in (8, 14):
        d.rectangle([x, y, x + 2, y + 2], fill=BLACK)
        d.point((x + 1, y), fill=EYE_SHINE)


def _smile(d: ImageDraw.ImageDraw, y: int = 21) -> None:
    d.rectangle([11, y - 2, 13, y - 1], fill=NOSE)
    d.point([(10, y), (14, y)], fill=NOSE)
    d.point([(11, y + 1), (13, y + 1)], fill=NOSE)


def _lion() -> Image.Image:
    img = Image.new("RGBA", (24, 27), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Bờm răng cưa
    d.ellipse([1, 6, 23, 27], fill=MANE)
    for x, y in [(2, 10), (19, 10), (0, 16), (21, 16), (2, 22), (19, 22), (6, 24), (15, 24)]:
        d.rectangle([x, y, x + 2, y + 2], fill=MANE)
    d.arc([2, 7, 22, 26], 200, 340, fill=MANE_DARK)
    # Tai + mặt
    d.ellipse([4, 8, 8, 12], fill=FUR_LION)
    d.ellipse([16, 8, 20, 12], fill=FUR_LION)
    d.ellipse([5, 10, 19, 25], fill=FUR_LION)
    d.ellipse([8, 18, 16, 24], fill=MUZZLE)
    _eyes(d)
    _smile(d)
    d.point([(6, 20), (18, 20)], fill=BLUSH)
    _chef_hat(d)
    return _finish(img)


def _tiger() -> Image.Image:
    img = Image.new("RGBA", (24, 27), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Tai
    d.ellipse([2, 7, 8, 13], fill=FUR_TIGER)
    d.ellipse([16, 7, 22, 13], fill=FUR_TIGER)
    d.rectangle([4, 9, 5, 10], fill=PINK)
    d.rectangle([18, 9, 19, 10], fill=PINK)
    # Mặt + vằn
    d.ellipse([2, 9, 22, 26], fill=FUR_TIGER)
    d.line([(12, 10), (12, 13)], fill=STRIPE)
    d.line([(9, 11), (10, 13)], fill=STRIPE)
    d.line([(15, 11), (14, 13)], fill=STRIPE)
    for y in (16, 19):
        d.line([(2, y), (5, y + 1)], fill=STRIPE)
        d.line([(22, y), (19, y + 1)], fill=STRIPE)
    d.ellipse([7, 18, 17, 25], fill=MUZZLE)
    _eyes(d)
    _smile(d)
    d.point([(6, 21), (18, 21)], fill=BLUSH)
    _chef_hat(d)
    return _finish(img)


def _panda() -> Image.Image:
    img = Image.new("RGBA", (24, 27), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Tai đen
    d.ellipse([1, 6, 8, 13], fill=PANDA_BLACK)
    d.ellipse([16, 6, 23, 13], fill=PANDA_BLACK)
    # Mặt trắng + quầng mắt
    d.ellipse([2, 9, 22, 26], fill=PANDA_WHITE)
    d.ellipse([6, 14, 11, 20], fill=PANDA_BLACK)
    d.ellipse([13, 14, 18, 20], fill=PANDA_BLACK)
    for x in (8, 14):
        d.rectangle([x, 16, x + 1, 17], fill=WHITE)
        d.point((x, 16), fill=BLACK)
    d.rectangle([11, 20, 13, 21], fill=PANDA_BLACK)
    d.point([(10, 22), (14, 22), (11, 23), (13, 23)], fill=PANDA_BLACK)
    d.point([(5, 21), (19, 21)], fill=BLUSH)
    _chef_hat(d)
    return _finish(img)


def _bunny() -> Image.Image:
    img = Image.new("RGBA", (24, 27), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Tai dài (không đội mũ)
    d.ellipse([5, 0, 10, 14], fill=BUNNY)
    d.ellipse([14, 0, 19, 14], fill=BUNNY)
    d.ellipse([7, 2, 8, 12], fill=PINK)
    d.ellipse([16, 2, 17, 12], fill=PINK)
    d.ellipse([3, 10, 21, 26], fill=BUNNY)
    _eyes(d, 16)
    d.rectangle([11, 19, 13, 20], fill=PINK)
    d.point([(10, 21), (14, 21)], fill=NOSE)
    d.rectangle([11, 22, 13, 23], fill=WHITE)
    d.line([(12, 22), (12, 23)], fill=HAT_SHADE)
    d.point([(6, 20), (18, 20)], fill=BLUSH)
    return _finish(img)


# --------------------------------------------------------------------------- #
# Xúc xắc (16x16, scale 4)
# --------------------------------------------------------------------------- #
PIP_POS = {"l": 2, "c": 6, "r": 10}
PIPS = {
    1: [("c", "c")],
    2: [("l", "l"), ("r", "r")],
    3: [("l", "l"), ("c", "c"), ("r", "r")],
    4: [("l", "l"), ("r", "l"), ("l", "r"), ("r", "r")],
    5: [("l", "l"), ("r", "l"), ("c", "c"), ("l", "r"), ("r", "r")],
    6: [("l", "l"), ("r", "l"), ("l", "c"), ("r", "c"), ("l", "r"), ("r", "r")],
}


def _dice(value: int) -> Image.Image:
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, 15, 15], radius=3, fill=DICE_SHADE)
    d.rounded_rectangle([0, 0, 14, 14], radius=3, fill=DICE_FACE)
    for px, py in PIPS[value]:
        x, y = PIP_POS[px], PIP_POS[py]
        d.rectangle([x, y, x + 2, y + 2], fill=PIP)
    return _finish(img, 4)


# --------------------------------------------------------------------------- #
# Hộp quà (20x20, scale 4) + vương miện
# --------------------------------------------------------------------------- #
def _gift_body(d: ImageDraw.ImageDraw, color, shade) -> None:
    d.rectangle([2, 9, 17, 19], fill=color)
    d.rectangle([2, 17, 17, 19], fill=shade)
    d.rectangle([9, 9, 10, 19], fill=RIBBON)


def _gift_closed(index: int) -> Image.Image:
    color, shade = GIFT_COLORS[index]
    img = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    _gift_body(d, color, shade)
    # Nắp + nơ
    d.rectangle([1, 6, 18, 9], fill=color)
    d.rectangle([1, 9, 18, 9], fill=shade)
    d.rectangle([9, 6, 10, 9], fill=RIBBON)
    d.ellipse([4, 1, 9, 6], fill=RIBBON)
    d.ellipse([10, 1, 15, 6], fill=RIBBON)
    d.point([(6, 3), (13, 3)], fill=RIBBON_DARK)
    d.rectangle([9, 4, 10, 6], fill=RIBBON_DARK)
    return _finish(img, 4)


def _gift_open(index: int) -> Image.Image:
    color, shade = GIFT_COLORS[index]
    img = Image.new("RGBA", (22, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Ánh sáng bung ra từ miệng hộp
    d.polygon([(4, 14), (0, 7), (8, 13)], fill=SPARKLE)
    d.polygon([(17, 14), (21, 7), (13, 13)], fill=SPARKLE)
    d.polygon([(8, 14), (10, 7), (11, 7), (13, 14)], fill=SPARKLE)
    # Thân hộp
    d.rectangle([3, 14, 18, 23], fill=color)
    d.rectangle([3, 21, 18, 23], fill=shade)
    d.rectangle([3, 14, 18, 14], fill=shade)
    d.rectangle([10, 14, 11, 23], fill=RIBBON)
    # Nắp bật lên cao
    d.rectangle([2, 3, 19, 6], fill=color)
    d.rectangle([2, 6, 19, 6], fill=shade)
    d.rectangle([10, 3, 11, 6], fill=RIBBON)
    d.ellipse([6, 0, 10, 3], fill=RIBBON)
    d.ellipse([11, 0, 15, 3], fill=RIBBON)
    return _finish(img, 4)


def _crown() -> Image.Image:
    img = Image.new("RGBA", (18, 12), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(1, 11), (1, 3), (5, 7), (9, 1), (13, 7), (17, 3), (17, 11)], fill=GOLD)
    d.rectangle([1, 9, 17, 11], fill=GOLD_DARK)
    d.rectangle([8, 5, 9, 6], fill=GEM_RED)
    d.point([(4, 10), (13, 10)], fill=GEM_BLUE)
    d.point([(1, 3), (9, 1), (17, 3)], fill=WHITE)
    return _finish(img)


def build_phonics_sprites() -> dict[str, Image.Image]:
    sprites: dict[str, Image.Image] = {
        "phonics/mascot_lion": _lion(),
        "phonics/mascot_tiger": _tiger(),
        "phonics/mascot_panda": _panda(),
        "phonics/mascot_bunny": _bunny(),
        "phonics/crown": _crown(),
    }
    for value in range(1, 7):
        sprites[f"phonics/dice_{value}"] = _dice(value)
    for index in range(3):
        sprites[f"phonics/gift_closed_{index + 1:02d}"] = _gift_closed(index)
        sprites[f"phonics/gift_open_{index + 1:02d}"] = _gift_open(index)
    return sprites
