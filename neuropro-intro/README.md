# NeuroPro — Animated Series

Two productions share one codebase, one cast and one set:

| | Length | File |
|---|---|---|
| **Episode 1 — What Is a Concussion?** | 85 s | `output/ep01-what-is-a-concussion.mp4` (+ `.srt` captions) |
| Series intro (style test) | 10 s | `output/neuropro-intro.mp4` |

## Episode 1 — What Is a Concussion?

| Time | Section | What happens |
|---|---|---|
| 0:00–0:06 | Hook | The NeuroPro Brain walks through the studio. A jolt shakes the room, and a surprised brain faces the question *"What actually happens when you get a concussion?"* |
| 0:06–0:20 | What is a concussion? | Iris into a simplified head profile showing skull, protective fluid and brain. A ball bump, a blow, a jolt, and a hit to the body (the camera pulls back to the shoulders) each move the head; the brain lags, presses against the skull, rebounds, then settles. Chips appear on each word: BUMP · BLOW · JOLT · HIT TO THE BODY. |
| 0:20–0:33 | What happens inside? | Zoom into a network of brain cells passing light signals. A "Brain scan: no obvious damage" card, then a shockwave: signals slow and scatter, links break and the energy gauge drains. Signals then gradually recover. A tracker at the bottom follows Normal → Disruption → Recovery. |
| 0:33–0:44 | The symptoms | Back in the studio, seven icons pop up in step with the narration (headache, dizziness, fatigue, brain fog, concentration, memory, light & noise). The brain reacts subtly to each. |
| 0:44–0:56 | No knockout required | The brain tips over and pops back up confused. **NO KNOCKOUT REQUIRED.** slams in, the brain points at it, and a subline follows. |
| 0:56–1:08 | Symptoms can take time | "I feel fine!", then a clock (right away → hours later) and a calendar (days later) while small symptoms creep in, then a "How do I feel?" check-in card. |
| 1:08–1:25 | Takeaway + end card | Step 1: stop the activity. Step 2: get evaluated by a qualified professional. The NeuroPro badge flies in; "I'm your brain" (ta-da), "let's learn together" (thumbs up). The badge match-cuts into the NeuroPro logo, then "Concussion & Brain Health", the episode title and a short education-only disclaimer. |

The episode runs about 85 s rather than 80 s because the narration alone is about 59 s and the sections need room to breathe. Every visual beat is keyed to the *measured* narration: `scripts/voiceover.py` times each cue word (e.g. "bump", "fatigue", "you do not"), so animation and sound effects stay in sync when a line is re-recorded or re-timed.

# Series intro (10-second style test)

A 10-second proof of concept for a recurring NeuroPro educational cartoon series.
The goal is to test **look, cast, animation quality, pacing and brand feel**, not to explain anything yet.

**Watch:** `output/neuropro-intro.mp4` (1920×1080, 30 fps, H.264 + AAC)
**Stills:** `output/stills/`, with one frame per scene plus the mascot model sheet

| Time | Scene | What happens |
|---|---|---|
| 0–2s | `01-establish` | The NeuroPro Brain bounces happily in the sunlit studio, glances at the window, then looks unsure as *"Something feels different…"* appears. Slow push-in. |
| 2–5s | `02-symptoms` | A wobble: the camera rolls, colour drains, focus softens. The brain clutches its head, its folds jitter, and four symptom icons pop up: spinning spiral (dizziness), throbbing bolt (headache), drifting cloud (brain fog), wandering focus dot (concentration). |
| 5–8s | `03-neuropro` | The NeuroPro badge (the real logo icon) flies in and collects the symptoms. It scans the brain, which lights up with an organised teal network. Colour returns, and the brain hops and gives a thumbs up. |
| 8–10s | `04-title` | A light iris opens from the badge. The badge lands exactly where the head icon sits in the NeuroPro logo, the wordmark wipes on beside it, then the tagline, and a teal light sweeps across the logo. |

VO (Kokoro neural TTS, voice `af_heart`): *"After a concussion, your brain can act a little differently." / "That's where understanding what's happening matters."*

## The host: the NeuroPro Brain

Rebuilt as an animatable vector character from the reference art in `assets/reference/brain-mascot-reference.png`: coral lobes with salmon folds, bold navy outline, big oval eyes, rubber-hose arms, white gloves and sneakers. Working name "Neo" (`config/characters.json`).

The rig (`src/characters/mascot.js`) supports squash and stretch, hops, tilt, a 2.5D face turn, blinks, brows, a morphing mouth, three glove poses (fist, open, thumbs-up), excitement lines, and two story states: `dizzy` (tint and jittering folds) and `order` (glowing neural network). `npm run stills` renders a model sheet of its key poses.

The earlier human cast (Jordan and Dr. Rivera, `src/characters/patient.js` and `clinician.js`) is kept as optional supporting cast for future episodes. It isn't used in this intro.

## Logo

The real NeuroPro logo lives at `assets/brand/neuropro-logo.png`. `scripts/split-logo.py` cuts it into icon and wordmark (plus `logo-layout.json`) so the title card can animate them and still reassemble the exact logo. To swap the logo, overwrite the PNG and re-run the script.

## Project layout

```
config/                 ← change things here first
  brand.json            colours, fonts, tagline, logo files
  characters.json       mascot palette (+ optional human cast palettes/expressions)
  storyboard.json       scene timings + beats, on-screen text, camera keys, VO lines + cues, SFX cues
  audio.json            TTS voice + speed, music/SFX/voice levels, ducking
src/
  main.js               stage/director: layers, parallax camera, colour grade, grain
  characters/           mascot.js (the NeuroPro Brain) · rig.js + patient.js + clinician.js (optional human cast)
  backgrounds/studio.js the NeuroPro studio set (parallax layers, clouds, plant sway, light, dust)
  props/                badge.js (NeuroPro logo-icon badge) · icons.js (symptoms)
  scenes/               01…04 scene graphics · acting.js (character performance for all scenes)
  index.html            live preview with play/scrub
  model-sheet.html      mascot model sheet
scripts/
  split-logo.py         logo → icon + wordmark + layout for the title animation
  voiceover.py          VO lines → audio/voiceover/*.wav (Kokoro-82M, local, Apache-2.0)
  build-audio.mjs       procedural music + SFX + VO mix → audio/generated/mix.wav
  render.mjs            frame-accurate render → output/neuropro-intro.mp4
  stills.mjs            review stills → output/stills/
assets/brand/           NeuroPro logo (+ split icon/wordmark)
assets/reference/       mascot reference art
assets/fonts/           Manrope + Inter (OFL, vendored)
```

Every animated value is a pure function of time, so any frame renders identically in the preview and the final render.

## How a production is organised

`config/compositions.json` lists every production. Each has a storyboard (`config/episodes/ep01.json`), a stage (`src/episodes/ep01/main.js`), and voice/audio/output paths. Episode 1's files:

```
src/episodes/ep01/
  timeline.js    every beat as an absolute time (from the storyboard + measured narration); also SFX + music moods
  acting.js      the brain's performance, studio camera, symptom icons
  anatomy.js     section 2 — head / skull / fluid / brain view
  neurons.js     section 3 — brain-cell network, energy gauge, stage tracker
  overlays.js    hook question, NO KNOCKOUT stamp, clock/calendar, check-in card, takeaway steps
  endcard.js     logo end card (reuses the intro's logo reveal)
```

To make Episode 2, copy `config/episodes/ep01.json` and `src/episodes/ep01/`, register the new copy in `config/compositions.json`, and write the new narration and beats.

## Commands

```bash
npm install
npm run preview        # http://localhost:5173 (live, with audio + scrubber)
npm run voiceover      # only after changing VO text/voice (needs: pip install kokoro-onnx soundfile)
npm run audio          # rebuild music/SFX/mix (~2s)
npm run render         # ~2 min on 4 cores
npm run stills

# Episode 1
npm run ep01:voiceover # re-time narration + cue words (after editing lines in config/episodes/ep01.json)
npm run ep01:audio     # music + SFX + voice → audio/generated/ep01/mix.wav
npm run ep01:render    # ~15 min on 4 cores → output/ep01-what-is-a-concussion.mp4
npm run ep01:captions  # → output/ep01-what-is-a-concussion.srt
# preview: http://localhost:5173/src/index.html?comp=ep01
```

## Common changes

- **New logo file**: overwrite `assets/brand/neuropro-logo.png`, then run `python3 scripts/split-logo.py`.
- **Colours / type**: `config/brand.json` (brand) and `config/characters.json` (mascot palette).
- **Retime a beat**: edit `config/storyboard.json → scenes[].beats`. Acting, graphics and camera follow.
- **Different VO voice**: `config/audio.json → voice` (e.g. `am_michael`, `af_bella`, `bf_emma`), then `npm run voiceover && npm run audio`. For a human VO artist, drop `vo1.wav`/`vo2.wav` into `audio/voiceover/`.
- **Captions for sound-off feeds**: `"captions": true` in `storyboard.json`.
- **Hide icon labels**: `"iconLabels": false`.
- **Music**: chords, instruments and percussion are in the `SCORE` section of `scripts/build-audio.mjs`.

The mascot design follows the supplied reference art and the logo is NeuroPro's own. Everything else (set, animation, music, SFX) is original and generated in this project. Fonts are OFL. The VO model is Apache-2.0.
