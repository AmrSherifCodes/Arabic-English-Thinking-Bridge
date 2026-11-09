"""Build a sparse, original 60-second sound design with no music bed."""

from pathlib import Path
import json
import math
import wave

import numpy as np

FPS = 30
RATE = 48_000
FRAMES = 1_800
SAMPLES_PER_FRAME = RATE // FPS
LENGTH = FRAMES * SAMPLES_PER_FRAME
TARGET_PEAK = 10 ** (-6 / 20)
ROOT = Path(__file__).resolve().parents[1]
CUES = json.loads((ROOT / 'src' / 'audio-cues.json').read_text(encoding='utf-8'))
mix = np.zeros(LENGTH, dtype=np.float64)


def add(start_frame: int, signal: np.ndarray) -> None:
    start = start_frame * SAMPLES_PER_FRAME
    end = min(start + len(signal), LENGTH)
    if start < LENGTH and end > start:
        mix[start:end] += signal[: end - start]


def bell(frequency: float, duration: float, amplitude: float, decay: float = 48.0) -> np.ndarray:
    t = np.arange(round(duration * RATE), dtype=np.float64) / RATE
    envelope = np.exp(-decay * t)
    return amplitude * envelope * (
        np.sin(2 * math.pi * frequency * t)
        + 0.32 * np.sin(2 * math.pi * frequency * 2.72 * t)
        + 0.16 * np.sin(2 * math.pi * frequency * 4.08 * t)
    ) / 1.48


def soft_click(frequency: float = 2600, duration: float = 0.022, amplitude: float = 0.20) -> np.ndarray:
    t = np.arange(round(duration * RATE), dtype=np.float64) / RATE
    return amplitude * np.exp(-t * 155) * (
        np.sin(2 * math.pi * frequency * t) + 0.22 * np.sin(2 * math.pi * frequency * 1.63 * t)
    )


# A few soft terminal key taps, aligned to the deliberately slow typing.
for frame in CUES['terminalKeyFrames']:
    add(frame, soft_click(2450 + (frame % 3) * 170, duration=0.018, amplitude=0.17))

# Three clean countdown pips: the spacing follows the on-screen 3, 2, 1.
for frame, frequency in zip(CUES['countdownFrames'], (587.33, 698.46, 880.00)):
    add(frame, bell(frequency, 0.11, 0.22, decay=28.0))

# Light foot taps as the student enters; no cartoon boing.
for index, frame in enumerate(CUES['studentFootstepFrames']):
    t = np.arange(round(0.055 * RATE), dtype=np.float64) / RATE
    freq = 105 - index * 8
    add(frame, 0.24 * np.sin(2 * math.pi * freq * t) * np.exp(-t * 62))

# A single dry, descending lock thud as the paywall appears.
t = np.arange(round(0.24 * RATE), dtype=np.float64) / RATE
phase = 2 * math.pi * (98 * t - (38 / (2 * 0.24)) * t * t)
add(CUES['lockThudFrame'], 0.54 * np.sin(phase) * np.exp(-t * 10.5))

# A quiet pen-like tap at the student's discouraged reaction.
add(CUES['discouragedTapFrame'], soft_click(1680, duration=0.028, amplitude=0.22))

# The solitary C6, held for four seconds with quiet echoes and no other reverb.
duration = 4.0
t = np.arange(round(duration * RATE), dtype=np.float64) / RATE
c6 = 1046.50
envelope = (1 - np.exp(-t * 130)) * (0.78 + 0.22 * np.exp(-t * 0.7))
dry = envelope * (
    np.sin(2 * math.pi * c6 * t)
    + 0.22 * np.sin(2 * math.pi * c6 * 2.01 * t)
    + 0.08 * np.sin(2 * math.pi * c6 * 3.93 * t)
) / 1.30
note_frame = CUES['pianoNoteFrame']
add(note_frame, dry * 0.30)
for delay, gain in ((0.09, 0.12), (0.18, 0.075), (0.29, 0.045), (0.43, 0.025)):
    add(note_frame + round(delay * FPS), dry * gain)

# Two gentle ascending notes at the end of the feature sequence.
chime_frame = CUES['featureChimeFrame']
add(chime_frame, bell(659.25, 0.32, 0.30, decay=8.0))
add(chime_frame + 6, bell(880.00, 0.40, 0.28, decay=7.0))

# Normalize the sparse effects mix to a -6 dBFS peak, with no music.
peak = float(np.max(np.abs(mix)))
if peak:
    mix *= TARGET_PEAK / peak

# Keep this exact second digitally silent in the source PCM.
silence_start = CUES['trueSilenceStartFrame'] * SAMPLES_PER_FRAME
silence_end = CUES['trueSilenceEndFrame'] * SAMPLES_PER_FRAME
mix[silence_start:silence_end] = 0

pcm = np.round(np.clip(mix, -1, 1) * 32767).astype('<i2')
output = ROOT / 'public' / 'audio' / 'tutor-tax-sfx.wav'
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes(pcm.tobytes())

print(f'Wrote {output} ({FRAMES / FPS:.1f}s, {20 * math.log10(TARGET_PEAK):.1f} dBFS peak)')
