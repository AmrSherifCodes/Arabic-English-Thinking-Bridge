# The Tutor Tax

60-second, 30 fps text-only social animatic for Thinking Bridge. The vertical export is 1080×1920. The one composition component is registered at 9:16, 1:1, and 16:9; all three use the same frame constants in `src/timeline.ts`.

## Render

From this directory, after installing the dependencies:

```powershell
npm install
python -m pip install -r audio/requirements.txt
npm run build:audio
npm run render:9x16
```

The other crops use `npm run render:1x1` and `npm run render:16x9`.

The reveal uses `--secondary-amber` (`#F5B942`) from the app tokens with pure black type. Contrast is 11.90:1.

There is no music bed. The sparse sound effects are synthesized locally by `audio/build_sfx.py`, with no third-party recordings. The f660–689 audio samples are digitally zero; the video interval is black and empty. The final AAC track peaks at approximately −6 dBFS.

This is a type-only motion brief. It does not show figures, illustration, stock footage, or character animation. A future motion-designer pass can build around this locked timing and restrained typography.
