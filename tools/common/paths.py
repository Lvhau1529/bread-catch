"""Đường dẫn gốc của repo và thư mục asset xuất ra (public/assets/)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "_source"
PUBLIC_ASSETS = ROOT / "public" / "assets"
SHARED_ASSETS = PUBLIC_ASSETS / "shared"
