# My gift for Humanity

A 60-second, 30 fps bilingual intro for Thinking Bridge. The 16:9 YouTube master is 1920×1080; the vertical social cut is 1080×1920. Both use one frame-locked Remotion timeline and feature a drawn stickman, a slow command-line opening, a 3–2–1 countdown, restrained camera zooms, and alternating amber, teal, and black palettes.

## Render

From this directory:

```powershell
npm install
python -m pip install -r audio/requirements.txt
npm run build:audio
npm run render:16x9
npm run render:9x16
```

Use `npm run render:1x1` for the square crop. MP4s go to `out/` and are git-ignored.

Arabic copy uses the app's Cairo-first stack with a local Arabic-capable fallback, explicit RTL direction, and a 1.75 line height. I checked the rendered frames for joined letterforms and clipping. The handle `@SciAmrSherif` stays bottom-left throughout.

Audio has no music bed or third-party recordings. The local generator creates the synced effects in `audio/build_sfx.py`; shared frame cues live in `src/audio-cues.json`. The one-second pause at frames 660–689 is digitally silent in the WAV and encoded MP4.

The student is a minimal vector stick figure, not a realistic person. The payment screen is generic and shows no price or named company. The payoff presents Thinking Bridge's actual free, offline learning features.
