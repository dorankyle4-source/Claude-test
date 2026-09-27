# NeuroPro — Animated Series Intro (10-second style test)

A 10-second proof of concept for a recurring NeuroPro educational cartoon series.
The goal is to test **look, cast, animation quality, pacing and brand feel**, not to explain anything yet.

**Watch:** `output/neuropro-intro.mp4` (1920×1080, 30 fps, H.264 + AAC)
**Stills:** `output/stills/`, with one frame per scene plus the cast model sheet

| Time | Scene | What happens |
|---|---|---|
| 0–2s | `01-establish` | Jordan in the sunlit NeuroPro studio. Breathing, blinking, a glance at the window, slow push-in. *"Something feels different…"* |
| 2–5s | `02-symptoms` | A wobble: the camera rolls, colour drains, focus softens. Jordan's hand goes to the head. A friendly brain "insight panel" pops up with 4 symptom metaphors: spinning spiral (dizziness), throbbing bolt (headache), drifting cloud (brain fog), wandering focus dot (concentration). |
| 5–8s | `03-neuropro` | Dr. Rivera walks in. The symptoms are pulled into the brain, which lights up teal and organises into a glowing network. Colour returns. Rivera gestures toward the brain, and Jordan relaxes and nods. |
| 8–10s | `04-title` | An iris opens from the brain, the brain flies to centre and resolves into the NeuroPro mark, then wordmark, descriptor and tagline build in, and a light pulse runs through the logo. |

VO (Kokoro neural TTS, voice `af_heart`): *"After a concussion, your brain can act a little differently." / "That's where understanding what's happening matters."*

## The cast (reusable across the series)

- **Jordan**: athlete/patient, late 20s. Curly high-top, coral track jacket, teal-accent sneakers, water bottle.
- **Dr. Rivera**: NeuroPro clinician. Navy quarter-zip with the NeuroPro mark, sleeves pushed up, round glasses, top bun, lanyard, tablet, smartwatch. Deliberately no white coat or stethoscope.

Both use one shared rig (`src/characters/rig.js`): two-bone IK arms, level feet, breathing, blinks, brow and mouth expressions, eye direction, and a 2.5D head turn. A new cast member is just a new costume file, with no new animation code.

## Project layout

```
config/                 ← change things here first
  brand.json            colours, fonts, wordmark, tagline, optional real logo file
  characters.json       cast palettes + expression presets (neutral, confused, relieved, warm…)
  storyboard.json       scene timings + beats, on-screen text, camera keys, VO lines + cues, SFX cues
  audio.json            TTS voice + speed, music/SFX/voice levels, ducking
src/
  main.js               stage/director: layers, parallax camera, colour grade, grain
  characters/           rig.js (shared skeleton) · patient.js (Jordan) · clinician.js (Dr. Rivera)
  backgrounds/studio.js the NeuroPro studio set (parallax layers, clouds, plant sway, light, dust)
  props/                brain.js (insight panel) · icons.js (symptoms) · logo.js (temporary mark)
  scenes/               01…04 scene graphics · acting.js (character performance for all scenes)
  index.html            live preview with play/scrub
  model-sheet.html      cast model sheet
scripts/
  voiceover.py          VO lines → audio/voiceover/*.wav (Kokoro-82M, local, Apache-2.0)
  build-audio.mjs       procedural music + SFX + VO mix → audio/generated/mix.wav
  render.mjs            frame-accurate render → output/neuropro-intro.mp4
  stills.mjs            review stills → output/stills/
assets/fonts/           Manrope + Inter (OFL, vendored)
```

Every animated value is a pure function of time, so any frame renders identically in the preview and the final render.

## Commands

```bash
npm install
npm run preview        # http://localhost:5173 (live, with audio + scrubber)
npm run voiceover      # only after changing VO text/voice (needs: pip install kokoro-onnx soundfile)
npm run audio          # rebuild music/SFX/mix (~2s)
npm run render         # ~2 min on 4 cores
npm run stills
```

## Common changes

- **Real logo**: put it in `assets/brand/` and set `"logoImage"` in `config/brand.json`. It replaces the temporary mark and wordmark on the title card.
- **Colours / type**: `config/brand.json` (brand) and `config/characters.json` (cast palettes).
- **Retime a beat**: edit `config/storyboard.json → scenes[].beats`. Acting, graphics and camera follow.
- **Different VO voice**: `config/audio.json → voice` (e.g. `am_michael`, `af_bella`, `bf_emma`), then `npm run voiceover && npm run audio`. For a human VO artist, drop `vo1.wav`/`vo2.wav` into `audio/voiceover/`.
- **Captions for sound-off feeds**: `"captions": true` in `storyboard.json`.
- **Hide icon labels**: `"iconLabels": false`.
- **Music**: chords, instruments and percussion are in the `SCORE` section of `scripts/build-audio.mjs`.

All visuals, music and SFX are original and generated in this project. Fonts are OFL. The VO model is Apache-2.0.
