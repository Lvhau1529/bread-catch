"""
Giao diện chung của Phonics Arcade: cắt resource pack trong `_source/platform/art/` thành ảnh dùng chung
cho mọi game ở `public/assets/shared/ui/` (icon, kim cương, linh vật Pip, ảnh bìa COMING SOON, nền màn chọn game).

Chạy:  pnpm assets:ui   (= python tools/arcade_ui/build_ui.py)

Sheet 01–04: lưới 4×4 ô 256px, sheet 05: lưới 3×3, nền magenta #FF00FF đặc (không khử răng cưa) —
thứ tự ô theo `_source/platform/asset_manifest.json`. Chỉ xuất những ảnh app đang dùng (bảng EXPORTS);
muốn dùng thêm ảnh nào thì thêm tên của nó vào bảng.
Ảnh lớn (bìa, nền) xuất WebP cho nhẹ.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.imaging import resize_rgba, save_png, tight_bbox  # noqa: E402
from common.paths import SHARED_ASSETS, SOURCE  # noqa: E402

PACK = SOURCE / "platform"
OUT = SHARED_ASSETS / "ui"
MAGENTA = np.array([255, 0, 255])
# Pixel cách magenta không quá ngần này (theo từng kênh) thì coi là nền
KEY_TOLERANCE = 24

ICON = 96  # hiển thị ~32–48px CSS, gấp đôi cho màn hình retina
MASCOT = 320

# tên trong asset_manifest -> (tên file xuất, cạnh dài nhất)
EXPORTS: dict[str, tuple[str, int]] = {
    # 01 — điều hướng
    "back": ("icons/back", ICON),
    "close": ("icons/close", ICON),
    "play": ("icons/play", ICON),
    "next": ("icons/next", ICON),
    "previous": ("icons/previous", ICON),
    "refresh_update_sparkle": ("icons/update", ICON),
    # 02 — âm thanh
    "speaker_on": ("icons/sound_on", ICON),
    "speaker_muted": ("icons/sound_off", ICON),
    "music_on": ("icons/music_on", ICON),
    "music_off": ("icons/music_off", ICON),
    "voice_on": ("icons/voice_on", ICON),
    "voice_off": ("icons/voice_off", ICON),
    # 03 — kim cương / mở khoá
    "gem_big": ("gems/gem", 128),
    "gem_small": ("gems/gem_small", 64),
    "gem_burst": ("gems/gem_burst", 160),
    "padlock_closed": ("gems/padlock", ICON),
    "unlock_burst": ("gems/unlock_burst", 160),
    # 05 — linh vật Pip
    "encouraging_not_enough_gems": ("pip/encourage", MASCOT),
    "celebrate_unlock": ("pip/celebrate", MASCOT),
    "coming_soon_builder": ("pip/coming_soon", MASCOT),
    "rotate_device": ("pip/rotate", MASCOT),
    "loading_run": ("pip/loading", MASCOT),
    "error_unplugged": ("pip/error", MASCOT),
    "wave_hello": ("pip/hello", MASCOT),
}

# Ảnh nguyên tấm: (file nguồn, tên xuất, kích thước tối đa (rộng, cao))
FULL_IMAGES = [
    ("06_coming_soon_cover.png", "coming_soon_cover", (800, 450)),
    ("08_hub_background_landscape.png", "hub_bg_landscape", (1600, 900)),
    ("09_hub_background_portrait.png", "hub_bg_portrait", (900, 1575)),
]
WEBP_QUALITY = 84


def key_magenta(cell: np.ndarray) -> np.ndarray:
    """RGB -> RGBA, nền magenta thành trong suốt."""
    background = np.abs(cell[..., :3].astype(int) - MAGENTA).max(axis=2) <= KEY_TOLERANCE
    rgba = np.dstack([cell[..., :3], np.where(background, 0, 255)]).astype(np.uint8)
    rgba[background] = 0
    return rgba


def cut_cells(sheet: np.ndarray, columns: int, rows: int) -> list[np.ndarray]:
    height, width = sheet.shape[:2]
    cells = []
    for row in range(rows):
        for col in range(columns):
            y0, y1 = round(row * height / rows), round((row + 1) * height / rows)
            x0, x1 = round(col * width / columns), round((col + 1) * width / columns)
            cells.append(sheet[y0:y1, x0:x1])
    return cells


def export_cell(cell: np.ndarray, name: str, max_side: int) -> None:
    rgba = key_magenta(cell)
    x0, y0, x1, y1 = tight_bbox(rgba)
    crop = rgba[y0:y1, x0:x1]
    # Đệm thành ô vuông để các icon cùng cỡ thẳng hàng nhau khi hiển thị
    side = max(crop.shape[:2])
    square = np.zeros((side, side, 4), np.uint8)
    oy, ox = (side - crop.shape[0]) // 2, (side - crop.shape[1]) // 2
    square[oy : oy + crop.shape[0], ox : ox + crop.shape[1]] = crop
    size = min(max_side, side)
    save_png(resize_rgba(Image.fromarray(square), (size, size)), OUT / f"{name}.png")


def export_full(source: str, name: str, max_size: tuple[int, int]) -> None:
    img = Image.open(PACK / "art" / source).convert("RGB")
    img.thumbnail(max_size, Image.LANCZOS)
    path = OUT / f"{name}.webp"
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=WEBP_QUALITY, method=6)


def main() -> None:
    manifest = json.loads((PACK / "asset_manifest.json").read_text(encoding="utf-8"))
    exported: set[str] = set()
    for sheet_info in manifest["image_assets"]:
        order = sheet_info.get("order")
        if not order:
            continue
        columns, rows = (int(n) for n in sheet_info["grid"].split("x"))
        sheet = np.array(Image.open(PACK / sheet_info["file"].replace("images/", "art/")).convert("RGB"))
        for item, cell in zip(order, cut_cells(sheet, columns, rows)):
            if item in EXPORTS:
                name, max_side = EXPORTS[item]
                export_cell(cell, name, max_side)
                exported.add(item)
                print(f"  {item:30s} -> ui/{name}.png")

    missing = set(EXPORTS) - exported
    if missing:
        raise SystemExit(f"Không tìm thấy trong asset_manifest.json: {sorted(missing)}")

    for source, name, max_size in FULL_IMAGES:
        export_full(source, name, max_size)
        print(f"  {source:30s} -> ui/{name}.webp")


if __name__ == "__main__":
    main()
