"""Create the five original, synthetic punctuation sounds for the trailer."""

from pathlib import Path
import math
import wave

import numpy as np

FPS = 30
RATE = 48_000
FRAMES = 1_800
SAMPLES_PER_FRAME = RATE // FPS
LENGTH = FRAMES * SAMPLES_PER_FRAME
TARGET_PEAK = 10 ** (-6 / 20)
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


# A brief, quiet high-frequency pen tap at the question's entrance.
t = np.arange(round(0.018 * RATE), dtype=np.float64) / RATE
pen = 0.28 * np.exp(-t * 185) * (np.sin(2 * math.pi * 2450 * t) + 0.24 * np.sin(2 * math.pi * 3900 * t))
add(6, pen)

# Four 40 ms money counter dings, each a fifth higher than the previous.
for frame, frequency in zip((120, 150, 180, 210), (620, 744, 893, 1072)):
    add(frame, bell(frequency, 0.040, 0.38, decay=72.0))

# One dry, descending low sine thud (80 Hz to 60 Hz, 300 ms).
t = np.arange(round(0.300 * RATE), dtype=np.float64) / RATE
phase = 2 * math.pi * (80 * t - (20 / (2 * 0.300)) * t * t)
thud = 0.58 * np.sin(phase) * np.exp(-t * 8.5)
add(480, thud)

# A held C6 with a restrained, piano-like partial stack and four quiet echoes.
note_duration = 4.0
t = np.arange(round(note_duration * RATE), dtype=np.float64) / RATE
c6 = 1046.50
envelope = (1 - np.exp(-t * 130)) * (0.78 + 0.22 * np.exp(-t * 0.7))
dry = envelope * (
    np.sin(2 * math.pi * c6 * t)
    + 0.22 * np.sin(2 * math.pi * c6 * 2.01 * t)
    + 0.08 * np.sin(2 * math.pi * c6 * 3.93 * t)
) / 1.30
note_start = 705
add(note_start, dry * 0.30)
for delay, gain in ((0.09, 0.12), (0.18, 0.075), (0.29, 0.045), (0.43, 0.025)):
    add(note_start + round(delay * FPS), dry * gain)

# Reward chime: E5, then A5 200 ms later. No extra impacts or sting.
add(1200, bell(659.25, 0.32, 0.30, decay=8.0))
add(1206, bell(880.00, 0.40, 0.28, decay=7.0))

# Normalize the whole sparse effects track to -6 dBFS peak; do not add a bed.
peak = float(np.max(np.abs(mix)))
if peak:
    mix *= TARGET_PEAK / peak

# Make the required 22s–23s pause digitally zero, including reverb tails.
silence_start = 660 * SAMPLES_PER_FRAME
silence_end = 690 * SAMPLES_PER_FRAME
mix[silence_start:silence_end] = 0

pcm = np.round(np.clip(mix, -1, 1) * 32767).astype('<i2')
output = Path(__file__).resolve().parents[1] / 'public' / 'audio' / 'tutor-tax-sfx.wav'
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes(pcm.tobytes())

print(f'Wrote {output} ({FRAMES} frames, {FRAMES / FPS:.1f}s, peak {20 * math.log10(TARGET_PEAK):.1f} dBFS)')
