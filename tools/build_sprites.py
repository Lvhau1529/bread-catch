"""
Cắt sprite sheet gốc trong `_source/art/` thành từng PNG riêng trong `public/assets/`.

Chạy:  python tools/build_sprites.py

Mọi toạ độ (box / erase / anchors) tính theo pixel của sprite sheet gốc.
Mỗi sprite được:
  1. crop theo `box`,
  2. làm sạch alpha (bỏ nhiễu nền bán trong suốt),
  3. loại mảnh vụn / phần lấn của sprite bên cạnh,
  4. cắt sát theo alpha,
  5. resize (Lanczos, premultiplied alpha) về kích thước hiển thị trong game.

Metadata (kích thước, anchors đã quy đổi) được ghi ra `public/assets/sprites.json`
để game đọc thay vì hard-code.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

from brainrot_art import build_brainrot_sprites

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_source" / "art"
OUT = ROOT / "public" / "assets"

GAME_SHEET = SRC / "pixel_bakery_game_sprite_sheet.png"
UI_SHEET = SRC / "bakery_pixel_ui_sprite_sheet.png"
BG_SHEET = SRC / "pixel_bakery_triptych_cozy_kitchens_and_shops.png"

ALPHA_CUT = 48  # alpha nhỏ hơn -> nền nhiễu, xoá
ALPHA_SOLID = 200  # alpha lớn hơn -> coi như đặc
PAD = 2
# Viền "sticker" quanh vật phẩm rơi để nổi trên background nhiều chi tiết
OUTLINE_WIDTH = 2
OUTLINE_COLOR = (255, 244, 220)

# Kích thước background xuất ra (game rộng 360, cao 640..800 tuỳ máy)
BG_SIZE = (360, 800)

# --------------------------------------------------------------------------- #
# Định nghĩa sprite
#   box:     (x0, y0, x1, y1) vùng crop trên sheet
#   width / height / max_side: kích thước đích (chọn 1)
#   erase:   vùng xoá chữ số in sẵn (tô bằng màu nền của vùng)
#   anchors: vùng cần quy đổi sang toạ độ ảnh output (ghi vào sprites.json)
#   largest: chỉ giữ mảng lớn nhất
#   outline: thêm viền kem "sticker" (vật phẩm rơi)
# --------------------------------------------------------------------------- #
GAME_SPRITES = {
    # Bread
    "bread/bread_01": dict(box=(40, 100, 304, 324), max_side=44, outline=True),
    "bread/bread_02": dict(box=(306, 40, 630, 328), max_side=60, largest=True, outline=True),
    "bread/bread_03": dict(box=(600, 56, 908, 328), max_side=50, largest=True, outline=True),
    "bread/bread_04": dict(box=(912, 44, 1224, 336), max_side=56, outline=True),
    # Basket
    "basket/basket_01": dict(box=(28, 348, 300, 624), width=84),
    "basket/basket_02": dict(box=(304, 336, 602, 624), width=92),
    "basket/basket_03": dict(box=(602, 344, 928, 624), width=100),
    "basket/basket_04": dict(box=(928, 340, 1240, 632), width=110),
    # Good items
    "items/butter": dict(box=(20, 656, 260, 836), max_side=40, outline=True),
    "items/jam": dict(box=(260, 632, 440, 844), max_side=40, outline=True),
    "items/cheese": dict(box=(436, 656, 640, 844), max_side=40, outline=True),
    "items/wheat": dict(box=(636, 628, 892, 868), max_side=42, outline=True),
    "items/coin": dict(box=(880, 664, 1044, 844), max_side=34, outline=True),
    "items/star": dict(box=(1048, 652, 1240, 844), max_side=38, outline=True),
    "items/heart": dict(box=(68, 884, 252, 1044), max_side=34, outline=True),
    # Bad items
    "items/bread_burnt": dict(box=(312, 840, 584, 1072), max_side=46, outline=True),
    "items/bread_moldy": dict(box=(620, 864, 828, 1060), max_side=42, outline=True),
    "items/egg_broken": dict(box=(896, 880, 1200, 1060), max_side=48, outline=True),
    # FX
    "fx/sparkle": dict(box=(72, 1064, 204, 1204), max_side=24, largest=True),
    "fx/catch_flash": dict(box=(500, 1056, 736, 1240), max_side=72),
}

UI_SPRITES = {
    "ui/btn_play": dict(box=(28, 18, 450, 214), width=200),
    "ui/btn_pause": dict(box=(448, 18, 814, 214), width=72),
    "ui/btn_resume": dict(box=(28, 18, 450, 214), width=170),
    "ui/btn_retry": dict(box=(814, 18, 1232, 258), width=140),
    "ui/btn_home": dict(box=(100, 212, 620, 408), width=140),
    "ui/icon_sound": dict(box=(28, 408, 196, 576), max_side=48),
    "ui/icon_sound_off": dict(box=(200, 408, 368, 576), max_side=48),
    "ui/panel_score": dict(
        box=(32, 572, 488, 788), width=150,
        erase=(118, 688, 428, 752), anchors={"value": (118, 684, 428, 756)},
    ),
    "ui/panel_best": dict(
        box=(500, 572, 904, 792), width=170,
        erase=(578, 692, 836, 756), anchors={"value": (578, 688, 836, 760)},
    ),
    "ui/panel_level": dict(
        box=(912, 572, 1228, 796), width=88,
        erase=(1000, 700, 1142, 766), anchors={"value": (996, 698, 1146, 770)},
    ),
    "ui/level_up": dict(box=(24, 784, 588, 980), width=290),
    "ui/progress_frame": dict(
        box=(620, 800, 1220, 900), width=220,
        anchors={"inner": (664, 834, 1178, 870)},
    ),
    "ui/panel_large": dict(box=(20, 972, 384, 1224), width=320),
    "ui/panel_small": dict(box=(384, 1000, 640, 1228), width=220),
    "ui/hud_heart": dict(box=(640, 1012, 756, 1116), max_side=26),
    "ui/hud_coin": dict(box=(756, 1012, 860, 1116), max_side=26),
    "ui/hud_star": dict(box=(858, 1012, 962, 1116), max_side=26),
}

# Thanh fill hồng: cắt phần sọc, stretch vừa `inner` của progress_frame
PROGRESS_FILL_BOX = (678, 931, 1074, 967)

# Hàng số 0-9 -> RetroFont (ô cố định), xuất nhiều cỡ: tên -> chiều cao px
DIGITS_BOX = (648, 1124, 1232, 1216)
DIGIT_FONTS = {"digits": 18, "digits_big": 28}

# Background: (tên file, tâm crop theo tỉ lệ ngang của panel 0..1)
BACKGROUNDS = [
    ("backgrounds/bg_bakery_01", 0.55),
    ("backgrounds/bg_bakery_02", 0.45),
    ("backgrounds/bg_bakery_03", 0.5),
]


# Icon PWA / favicon (ghi vào public/icons/)
APP_ICONS = {"icon-192.png": 192, "icon-512.png": 512, "apple-touch-icon.png": 180, "favicon.png": 64}
ICON_BACKGROUND = (255, 210, 120, 255)


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def load_rgba(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"))


def clean_alpha(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    alpha = out[..., 3]
    alpha[alpha < ALPHA_CUT] = 0
    alpha[alpha >= ALPHA_SOLID] = 255
    out[alpha == 0] = 0
    return out


def erase_region(sheet: np.ndarray, rect: tuple[int, int, int, int]) -> None:
    """Tô vùng chữ số in sẵn bằng màu nền (median của pixel sáng) — in-place."""
    x0, y0, x1, y1 = rect
    region = sheet[y0:y1, x0:x1, :3].astype(int)
    lum = region.mean(axis=2)
    bg = np.median(region[lum > np.percentile(lum, 60)], axis=0)
    diff = np.abs(region - bg).sum(axis=2)
    mask = diff > 36
    mask = ndimage.binary_dilation(mask, iterations=2)
    region[mask] = bg
    sheet[y0:y1, x0:x1, :3] = region.astype(np.uint8)


def drop_fragments(arr: np.ndarray, largest_only: bool) -> np.ndarray:
    """Bỏ mảnh nhỏ và các mảnh chạm mép box (phần lấn của sprite bên cạnh)."""
    mask = arr[..., 3] > 0
    labels, count = ndimage.label(mask, structure=np.ones((3, 3)))
    if count <= 1:
        return arr
    sizes = ndimage.sum(mask, labels, range(1, count + 1))
    biggest = sizes.max()
    edge_labels = set(np.unique(np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1],
    ]))) - {0}

    keep = np.zeros(count + 1, dtype=bool)
    for idx, size in enumerate(sizes, start=1):
        if largest_only:
            keep[idx] = size == biggest
        elif size < 24:
            keep[idx] = False
        elif idx in edge_labels and size < biggest * 0.3:
            keep[idx] = False
        else:
            keep[idx] = True

    out = arr.copy()
    out[~keep[labels]] = 0
    return out


def tight_bbox(arr: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(arr[..., 3])
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def resize_rgba(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    # Resize trên ảnh premultiplied alpha để không bị viền tối
    return img.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")


def add_outline(img: Image.Image) -> Image.Image:
    w = OUTLINE_WIDTH
    arr = np.array(img)
    padded = np.zeros((arr.shape[0] + w * 2, arr.shape[1] + w * 2, 4), dtype=np.uint8)
    padded[w:-w, w:-w] = arr
    solid = padded[..., 3] > 96
    ring = ndimage.binary_dilation(solid, structure=np.ones((3, 3)), iterations=w)
    base = np.zeros_like(padded)
    base[ring] = (*OUTLINE_COLOR, 255)
    out = Image.fromarray(base)
    out.alpha_composite(Image.fromarray(padded))
    return out


def target_size(w: int, h: int, spec: dict) -> tuple[int, int]:
    if "width" in spec:
        scale = spec["width"] / w
    elif "height" in spec:
        scale = spec["height"] / h
    else:
        scale = spec["max_side"] / max(w, h)
    return max(1, round(w * scale)), max(1, round(h * scale))


def save(img: Image.Image, name: str) -> Path:
    path = OUT / f"{name}.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)
    return path


# --------------------------------------------------------------------------- #
# Builders
# --------------------------------------------------------------------------- #
def build_sprite(sheet: np.ndarray, name: str, spec: dict) -> dict:
    x0, y0, x1, y1 = spec["box"]
    crop = clean_alpha(sheet[y0:y1, x0:x1])
    crop = drop_fragments(crop, spec.get("largest", False))
    bx0, by0, bx1, by1 = tight_bbox(crop)
    bx0, by0 = max(0, bx0 - PAD), max(0, by0 - PAD)
    bx1, by1 = min(crop.shape[1], bx1 + PAD), min(crop.shape[0], by1 + PAD)
    crop = crop[by0:by1, bx0:bx1]

    w, h = crop.shape[1], crop.shape[0]
    tw, th = target_size(w, h, spec)
    img = resize_rgba(Image.fromarray(crop), (tw, th))
    if spec.get("outline"):
        img = add_outline(img)
    save(img, name)

    # Quy đổi anchors từ toạ độ sheet sang toạ độ ảnh output
    sx, sy = tw / w, th / h
    origin_x, origin_y = x0 + bx0, y0 + by0
    anchors = {}
    for key, (ax0, ay0, ax1, ay1) in spec.get("anchors", {}).items():
        anchors[key] = {
            "x": round((ax0 - origin_x) * sx),
            "y": round((ay0 - origin_y) * sy),
            "w": round((ax1 - ax0) * sx),
            "h": round((ay1 - ay0) * sy),
        }
    meta = {"width": img.width, "height": img.height}
    if anchors:
        meta["anchors"] = anchors
    return meta


def build_progress_fill(sheet: np.ndarray, frame_meta: dict) -> dict:
    inner = frame_meta["anchors"]["inner"]
    x0, y0, x1, y1 = PROGRESS_FILL_BOX
    img = Image.fromarray(sheet[y0:y1, x0:x1].copy())
    img = resize_rgba(img, (inner["w"], inner["h"]))
    save(img, "ui/progress_fill")
    return {"width": inner["w"], "height": inner["h"]}


def build_digits(sheet: np.ndarray, name: str, height: int) -> dict:
    x0, y0, x1, y1 = DIGITS_BOX
    crop = clean_alpha(sheet[y0:y1, x0:x1])
    cols = crop[..., 3].sum(axis=0) > 0
    # Tách glyph theo các cột trống
    glyphs, start = [], None
    for x, filled in enumerate(list(cols) + [False]):
        if filled and start is None:
            start = x
        elif not filled and start is not None:
            if x - start > 8:
                glyphs.append((start, x))
            start = None
    if len(glyphs) != 10:
        raise RuntimeError(f"Expected 10 digit glyphs, found {len(glyphs)}")

    ys = np.nonzero(crop[..., 3].sum(axis=1))[0]
    top, bottom = ys.min(), ys.max() + 1
    scale = height / (bottom - top)
    images = []
    for gx0, gx1 in glyphs:
        g = Image.fromarray(crop[top:bottom, gx0:gx1])
        images.append(resize_rgba(g, (max(1, round((gx1 - gx0) * scale)), height)))

    cell_w = max(im.width for im in images) + 1
    sheet_img = Image.new("RGBA", (cell_w * 10, height), (0, 0, 0, 0))
    for i, im in enumerate(images):
        sheet_img.alpha_composite(im, (i * cell_w + (cell_w - im.width) // 2, 0))
    save(sheet_img, f"ui/{name}")
    return {"width": sheet_img.width, "height": height, "cellWidth": cell_w,
            "cellHeight": height, "chars": "0123456789"}


def build_backgrounds() -> dict:
    img = Image.open(BG_SHEET).convert("RGB")
    arr = np.array(img).astype(int)
    # Cột phân cách là các cột gần như đen hoàn toàn
    dark_cols = np.nonzero(arr.mean(axis=(0, 2)) < 20)[0]
    edges = []
    panel_start = 0
    for c in list(dark_cols) + [arr.shape[1]]:
        if c > panel_start + 50:
            edges.append((panel_start, c))
        panel_start = c + 1
    if len(edges) != len(BACKGROUNDS):
        raise RuntimeError(f"Expected {len(BACKGROUNDS)} background panels, found {edges}")

    meta = {}
    target_w, target_h = BG_SIZE
    for (name, focus), (px0, px1) in zip(BACKGROUNDS, edges):
        panel_h = img.height
        crop_w = round(panel_h * target_w / target_h)
        center = px0 + (px1 - px0) * focus
        cx0 = int(np.clip(center - crop_w / 2, px0, px1 - crop_w))
        panel = img.crop((cx0, 0, cx0 + crop_w, panel_h)).resize(BG_SIZE, Image.LANCZOS)
        save(panel, name)
        meta[name] = {"width": target_w, "height": target_h}
    return meta


def build_app_icons(game_sheet: np.ndarray) -> None:
    """Icon PWA / favicon: bánh mì trên nền vuông (an toàn cho cả 'maskable')."""
    x0, y0, x1, y1 = GAME_SPRITES["bread/bread_01"]["box"]
    crop = clean_alpha(game_sheet[y0:y1, x0:x1])
    bx0, by0, bx1, by1 = tight_bbox(crop)
    bread = Image.fromarray(crop[by0:by1, bx0:bx1])

    icons_dir = ROOT / "public" / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)
    for filename, size in APP_ICONS.items():
        icon = Image.new("RGBA", (size, size), ICON_BACKGROUND)
        inner = round(size * 0.6)  # vùng an toàn của maskable icon là 80%
        scale = inner / max(bread.size)
        sprite = resize_rgba(bread, (round(bread.width * scale), round(bread.height * scale)))
        icon.alpha_composite(sprite, ((size - sprite.width) // 2, (size - sprite.height) // 2))
        icon.save(icons_dir / filename, optimize=True)


def main() -> None:
    game = load_rgba(GAME_SHEET)
    ui = load_rgba(UI_SHEET)

    meta: dict[str, dict] = {}
    for name, spec in GAME_SPRITES.items():
        meta[name] = build_sprite(game, name, spec)

    for name, spec in UI_SPRITES.items():
        sheet = ui.copy() if "erase" in spec else ui
        if "erase" in spec:
            erase_region(sheet, spec["erase"])
        meta[name] = build_sprite(sheet, name, spec)

    meta["ui/progress_fill"] = build_progress_fill(ui, meta["ui/progress_frame"])
    for name, height in DIGIT_FONTS.items():
        meta[f"ui/{name}"] = build_digits(ui, name, height)
    meta.update(build_backgrounds())
    for name, img in build_brainrot_sprites().items():
        save(img, name)
        meta[name] = {"width": img.width, "height": img.height}
    build_app_icons(game)

    # Key trong game = tên file (vd "bread_01"), path = đường dẫn tương đối
    manifest = {
        Path(name).name: {"path": f"assets/{name}.png", **info}
        for name, info in meta.items()
    }
    (OUT / "sprites.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Built {len(manifest)} images -> {OUT}")


if __name__ == "__main__":
    main()
