"""
Xử lý ảnh dùng chung khi cắt sprite từ sheet / art board:
làm sạch alpha, bỏ mảnh vụn, cắt sát, resize giữ viền sạch, viền "sticker".
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ALPHA_CUT = 48  # alpha nhỏ hơn -> nền nhiễu, xoá
ALPHA_SOLID = 200  # alpha lớn hơn -> coi như đặc


def load_rgba(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"))


def clean_alpha(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    alpha = out[..., 3]
    alpha[alpha < ALPHA_CUT] = 0
    alpha[alpha >= ALPHA_SOLID] = 255
    out[alpha == 0] = 0
    return out


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


def add_outline(img: Image.Image, width: int, color: tuple[int, int, int]) -> Image.Image:
    arr = np.array(img)
    padded = np.zeros((arr.shape[0] + width * 2, arr.shape[1] + width * 2, 4), dtype=np.uint8)
    padded[width:-width, width:-width] = arr
    solid = padded[..., 3] > 96
    ring = ndimage.binary_dilation(solid, structure=np.ones((3, 3)), iterations=width)
    base = np.zeros_like(padded)
    base[ring] = (*color, 255)
    out = Image.fromarray(base)
    out.alpha_composite(Image.fromarray(padded))
    return out


def target_size(w: int, h: int, spec: dict) -> tuple[int, int]:
    """Kích thước đích theo `width` / `height` / `max_side` trong spec (giữ tỉ lệ)."""
    if "width" in spec:
        scale = spec["width"] / w
    elif "height" in spec:
        scale = spec["height"] / h
    else:
        scale = spec["max_side"] / max(w, h)
    return max(1, round(w * scale)), max(1, round(h * scale))


def save_png(img: Image.Image, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)
    return path
