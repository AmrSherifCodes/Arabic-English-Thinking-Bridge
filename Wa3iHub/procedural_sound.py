import os
import numpy as np
import wave
import contextlib

def _play_tone(frequency, duration_ms):
    try:
        import winsound
        winsound.Beep(int(frequency), int(duration_ms))
    except ImportError:
        pass
    except Exception:
        pass

def chime_start():
    _play_tone(880, 200)
    _play_tone(1108, 300)

def chime_end():
    _play_tone(1108, 200)
    _play_tone(880, 400)

def chime_error():
    _play_tone(300, 500)

if __name__ == "__main__":
    chime_start()