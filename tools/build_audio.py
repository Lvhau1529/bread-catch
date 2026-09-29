"""
Chuyển audio gốc trong `_source/` thành file dùng trong game (`public/assets/`).

Chạy:  python tools/build_audio.py

- SFX: mono, 44.1 kHz, trim im lặng đầu/cuối, normalize peak, xuất .ogg + .mp3
- BGM: stereo, normalize theo RMS để các track to đều nhau, xuất .ogg + .mp3
  (.ogg cho Chrome/Android/Firefox, .mp3 fallback cho iOS Safari)

Muốn đổi nhạc: sửa MUSIC bên dưới rồi chạy lại.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SRC_SFX = ROOT / "_source" / "sfx"
SRC_MUSIC = ROOT / "_source" / "music"
OUT = ROOT / "public" / "assets"

SAMPLE_RATE = 44100

# key trong game -> (file gốc, pitch). pitch != 1 tạo biến thể từ cùng 1 nguồn.
SFX = {
    "ui_click": ("mixkit-select-click-1109.wav", 1.0),
    "ui_confirm": ("mixkit-quick-positive-video-game-notification-interface-265.wav", 1.0),
    "ui_cancel": ("mixkit-select-click-1109.wav", 0.8),
    "bread_catch": ("freesound_community-item-pickup-37089.mp3", 1.0),
    "coin_collect": ("freesound_community-coin-pickup-98269.mp3", 1.0),
    "star_collect": ("universfield-magic-twinkle-244951.mp3", 1.0),
    "heart_collect": ("universfield-magic-twinkle-244951.mp3", 1.25),
    "bad_item": ("mixkit-funny-fail-low-tone-2876.wav", 1.0),
    "level_up": ("mixkit-game-experience-level-increased-2062.wav", 1.0),
    "game_over": ("mixkit-player-losing-or-failing-2042.wav", 1.0),
}

MUSIC = {
    "bgm_menu": "track 7.wav",
    "bgm_stage_01": "track 1.wav",
    "bgm_stage_02": "track 4.wav",
    "bgm_stage_03": "track 6.wav",
}

SILENCE_DB = -45
SFX_PEAK = 0.89
MUSIC_RMS = 0.08


def resample(data: np.ndarray, src_rate: int, dst_rate: int) -> np.ndarray:
    """Resample tuyến tính — đủ tốt cho SFX ngắn và BGM nền."""
    if src_rate == dst_rate:
        return data
    n_out = int(round(len(data) * dst_rate / src_rate))
    src_t = np.linspace(0, 1, len(data), endpoint=False)
    dst_t = np.linspace(0, 1, n_out, endpoint=False)
    return np.stack([np.interp(dst_t, src_t, data[:, c]) for c in range(data.shape[1])], axis=1)


def trim_silence(data: np.ndarray, rate: int) -> np.ndarray:
    threshold = 10 ** (SILENCE_DB / 20)
    loud = np.nonzero(np.abs(data).max(axis=1) > threshold)[0]
    if len(loud) == 0:
        return data
    tail = int(rate * 0.03)  # giữ chút đuôi để không cụt tiếng
    return data[loud[0]: min(len(data), loud[-1] + tail)]


def fade_out(data: np.ndarray, rate: int, seconds: float = 0.02) -> np.ndarray:
    n = min(len(data), int(rate * seconds))
    data[-n:] *= np.linspace(1, 0, n)[:, None]
    return data


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


def build_sfx() -> None:
    for key, (filename, pitch) in SFX.items():
        data, rate = sf.read(SRC_SFX / filename, always_2d=True)
        mono = data.mean(axis=1, keepdims=True)
        # Đổi pitch = coi như sample rate khác rồi resample về chuẩn
        mono = resample(mono, int(rate * pitch), SAMPLE_RATE)
        mono = trim_silence(mono, SAMPLE_RATE)
        mono = mono * (SFX_PEAK / max(1e-6, np.abs(mono).max()))
        write_both(fade_out(mono, SAMPLE_RATE), SAMPLE_RATE, f"audio/sfx/{key}")
        print(f"sfx   {key:14s} {len(mono) / SAMPLE_RATE:5.2f}s")


def build_music() -> None:
    for key, filename in MUSIC.items():
        data, rate = sf.read(SRC_MUSIC / filename, always_2d=True)
        data = resample(data, rate, SAMPLE_RATE)
        rms = np.sqrt((data ** 2).mean())
        gain = min(MUSIC_RMS / max(rms, 1e-6), 0.98 / np.abs(data).max())
        write_both(data * gain, SAMPLE_RATE, f"music/{key}")
        print(f"music {key:14s} {len(data) / SAMPLE_RATE:5.1f}s  <- {filename}")


if __name__ == "__main__":
    build_sfx()
    build_music()
