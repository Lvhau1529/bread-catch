"""
Chuyển audio master (WAV) trong `_source/audio/` thành file dùng trong game (`public/assets/`).

Chạy:  python tools/build_audio.py

Audio gốc lấy từ Phonics Bread Catcher resource pack (03_AUDIO/master_wav) — đã được
mix sẵn nên chỉ encode lại, KHÔNG normalize. Volume từng key nằm ở src/game/config/assets.ts
(theo audio_manifest.json của pack).

- SFX -> public/assets/audio/sfx/<key>.ogg|.mp3
- BGM -> public/assets/music/<key>.ogg|.mp3
(.ogg cho Chrome/Android/Firefox, .mp3 fallback cho iOS Safari)
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_source" / "audio"
OUT = ROOT / "public" / "assets"

# Thư mục nguồn -> thư mục xuất. Tên file = key trong game.
GROUPS = {
    "sfx": "audio/sfx",
    "bgm": "music",
}


def write_both(data: np.ndarray, rate: int, name: str) -> None:
    base = OUT / name
    base.parent.mkdir(parents=True, exist_ok=True)
    data = np.clip(data, -1, 1).astype(np.float32)
    targets = ((".ogg", "OGG", "VORBIS"), (".mp3", "MP3", "MPEG_LAYER_III"))
    for suffix, fmt, subtype in targets:
        # Ghi theo block: libsndfile crash khi encode Vorbis một khối quá lớn
        with sf.SoundFile(base.with_suffix(suffix), "w", rate, data.shape[1], subtype, format=fmt) as f:
            for start in range(0, len(data), rate):
                f.write(data[start:start + rate])


def main() -> None:
    for folder, out_dir in GROUPS.items():
        for wav in sorted((SRC / folder).glob("*.wav")):
            data, rate = sf.read(wav, always_2d=True)
            write_both(data, rate, f"{out_dir}/{wav.stem}")
            print(f"{folder:4s} {wav.stem:22s} {len(data) / rate:5.2f}s  {data.shape[1]}ch {rate}Hz")


if __name__ == "__main__":
    main()
