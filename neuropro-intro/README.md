# NeuroPro — Animated Series

All productions share one codebase, one cast and one set:

| | Length | File |
|---|---|---|
| **Episode 1 — What Is a Concussion?** | 85 s | `output/ep01-what-is-a-concussion.mp4` (+ `.srt` captions) |
| **Episode 2 — Why Do I Still Feel Bad After a Concussion?** | 81 s | `output/ep02-why-do-i-still-feel-bad.mp4` (+ `.srt` captions) |
| **Episode 3 — What Is Brain Fog?** | 82 s | `output/ep03-what-is-brain-fog.mp4` (+ `.srt` captions) |
| **Episode 4 — Why Does Everything Feel So Loud?** | 47.5 s | `output/ep04-why-does-everything-feel-so-loud.mp4` (16:9) · `…-vertical.mp4` (9:16) · `.srt` |
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

## Episode 2 — Why Do I Still Feel Bad After a Concussion?

Same mascot, studio, icons, neuron view, badge and end card as Episode 1 (imported from the same files), so the series stays visually identical.

| Time | Section | What happens |
|---|---|---|
| 0:00–0:09 | The question | The brain walks in smiling, "I thought I was fine…", then winces as a headache and dizziness pop up. |
| 0:09–0:17 | You can look fine | Split screen: OUTSIDE (the brain looks great, hands on hips) and INSIDE (a small network with signals moving less efficiently). |
| 0:17–0:29 | What changes? | The Episode 1 neuron view: a concussion shockwave, links flicker, signals slow and scatter, energy drains. "The brain is working differently." |
| 0:29–0:39 | Why you feel it | Icons synced to the narration: headache, concentration, memory, dizziness (balance), fatigue (energy), brain fog (processing). |
| 0:39–0:50 | Symptoms can fluctuate | The brain strolls while a GOOD DAY / BAD DAY meter swings above it. A graph card shows "Recovery isn't always linear." |
| 0:50–1:06 | Why this matters | Phone, laptop, exercise, bright light and chatter crowd in, the room brightens, the brain covers its ears, then everything calms. Cards: "Not necessarily new damage" and "More time + the right plan". |
| 1:06–1:21 | What to do + end card | Clean NeuroPro backdrop with REST · RECOVER · GET EVALUATED, the NeuroPro badge and a thumbs up. End card: logo, "Concussion & Brain Health", *"Your brain deserves answers."*, episode title, disclaimer. |

Files: `config/episodes/ep02.json`, `src/episodes/ep02/` (timeline, acting, overlays, main). Build with `npm run ep02:build`.

## Episode 3 — What Is Brain Fog?

Same mascot, studio, neuron view, badge and end card as Episodes 1–2, plus new desk props (`src/episodes/ep03/props.js`).

| Time | Section | What happens |
|---|---|---|
| 0:00–0:08 | Hook | The Brain sits at a desk holding a page ("What did I just read?"), re-reads the same line three times, and looks confused as a fog cloud forms around its head. |
| 0:08–0:16 | Brain fog | The Brain points at the cloud, **BRAIN FOG** appears, and letters and numbers drift into the fog and slow down. |
| 0:16–0:29 | What it feels like | Four cards synced to the narration: Reading (text blurs), Remembering (the thought vanishes), Conversations (words jumble), Multitasking (tasks pile up). |
| 0:29–0:40 | It's not laziness | Typing at a laptop while a BRAIN ENERGY battery drains, faster when pushing, until the Brain slumps. "Your brain is working harder." |
| 0:40–0:54 | Why it can happen | The shared neuron view in a gentler mode: some pathways flow smoothly while others slow down. "Automatic tasks can take more effort." |
| 0:54–1:06 | The everyday effect | A tower of morning tasks (notification, coffee, email, conversation, keys, leave the house) stacks and sways. The Brain freezes, then it all clears to one task ("One thing at a time") and it relaxes. |
| 1:06–1:22 | What helps + end card | ONE TASK · TAKE BREAKS · LISTEN TO YOUR SYMPTOMS, the NeuroPro badge, a thumbs up, then the end card with *"Your brain deserves answers."* |

Build with `npm run ep03:build`.

## Episode 4 — Why Does Everything Feel So Loud?

A short episode (47.5 s) for YouTube Shorts, Instagram Reels, TikTok and the website. Same Brain, badge, palette and end card as Episodes 1–3. It adds a new coffee-shop set (`cafe.js`), an inside-the-brain sensory-filter scene (`filter.js`) and a volume knob (`knob.js`).

| Time | Section | What happens |
|---|---|---|
| 0:00–0:07 | Hook | The Brain walks into a café. The lamps glare, the espresso wand hisses, chatter bubbles multiply, the blender whirs and a phone banner dings. The Brain freezes and covers its ears: *"Why does EVERYTHING feel so intense?"* |
| 0:07–0:15 | The filter | Inside the brain, light, sound, movement and conversation packets reach a SENSORY FILTER. IMPORTANT → LET THROUGH; BACKGROUND NOISE → TURN DOWN (it drops to a tray). |
| 0:15–0:27 | After a concussion | Packets arrive faster and bigger, the filter flickers and most of them get through. The tags LIGHT → BRIGHT, SOUND → LOUD, MOVEMENT → DISTRACTING and CONVERSATIONS → OVERLAPPING appear, along with "For some people, for a while." The knob jumps from NORMAL to TOO MUCH. |
| 0:27–0:34 | The visual joke | Back in the loud café, a giant volume knob appears over the Brain's head. The NeuroPro badge flies in and clicks it down to NORMAL. Everything goes quiet at once, then "ahh…" and a knowing smile. |
| 0:34–0:43 | Takeaway | A teal wipe leads to the Brain sitting comfortably at a café table. Two cards: "Light & sound sensitivity can be a **real** concussion symptom" and "Understanding what's happening is an important part of recovery". |
| 0:43–0:48 | End card | Logo, "Concussion & Brain Health", *"Understand the brain. Improve the outcome."*, the episode title and the disclaimer. |

The sound follows the picture. Café ambience builds layer by layer (hum, espresso, chatter, blender, phone), is cut off with a fast release when the knob turns, and a quiet room tone and a calm music section follow. The vertical cut (`scripts/vertical.mjs`) uses a branded top band, the full episode at full width, and large burned-in captions for muted playback.

Build with `npm run ep04:build` (audio → render → captions → vertical).

# NeuroPro 2026 Year to Date

A 79-second performance video built from the NeuroPro Clinic Dashboard (TherapyNotes pulled Sep 30, monthly close through August). It uses the same motion style as the ADP recap, in NeuroPro's own palette, type (Manrope + Inter) and real logo. The voice is Kokoro `af_heart`.

**Watch:** `output/neuropro-2026-ytd.mp4` (1920×1080, 30 fps) · captions `output/neuropro-2026-ytd.srt`

| Time | Scene | What happens |
|---|---|---|
| 0:00–0:06 | Open | The NeuroPro logo, then *2026 Year to Date* and "January through September". |
| 0:06–0:15 | Visits | Monthly bars grow from 340 (Jan) to 605 (Sep). +78% counts up, and a "Busiest month yet" tag appears on September. |
| 0:15–0:23 | Patients and mix | ~1,010 unique patients. Therapy is 48% of September visits (up 89%), and testing more than doubled in August. |
| 0:23–0:33 | Revenue and margin | Booked revenue bars Feb–Aug with the expense line, $1.01M booked, 49¢ kept per dollar, then August at 57¢. |
| 0:33–0:40 | Per visit | Revenue per visit $226 to $324 and cost per visit $155 to $139: $185 kept per visit in August. |
| 0:40–0:48 | Cash | $1.01M booked splits into $759K collected, $149K liens, $43K unpaid invoices and $62K timing. |
| 0:48–0:57 | Act now | $117K PI backlog, $260K lien collections and $150K rejected claims. |
| 0:57–1:07 | Clinical team | Counselor visits 92 to 213 a month, and Dr. Doran's share of visits 57% to 39%. |
| 1:07–1:19 | Q4 + end card | 999 visits already scheduled for Oct–Dec, then the logo, tagline and source line. |

Files: `config/episodes/ytd.json` (narration, end card), `src/episodes/ytd/` (`timeline.js`, `scenes.js`, `kit.js`, `main.js`). Build with `npm run ytd:build` (and `npm run ytd:voiceover` first, if the narration changes). When the September close is done, update the numbers in `scenes.js` and the narration, then rebuild.

# ADP SBS Digital Sales: Recap and Next Steps

A 74-second follow-up video for Kevin to send the ADP team after the case presentation. It sums up what was discussed and how the work moves forward. It uses the same engine, voice (Kokoro `af_heart`), procedural score and SFX as the NeuroPro episodes, styled to match the ADP case deck (navy, cream, ADP red, Source Serif 4 + Public Sans). No mascot and no logos.

**Watch:** `output/adp-sbs-recap.mp4` (1920×1080, 30 fps) · captions `output/adp-sbs-recap.srt`

| Time | Scene | What happens |
|---|---|---|
| 0:00–0:07 | Open | Navy title card like the deck cover: *Re-accelerating SBS Digital Sales*, then "Recap and next steps" and an arrow drawing forward. |
| 0:07–0:13 | The big takeaway | "Demand problem" is struck through; "Capacity problem" stamps down. |
| 0:13–0:20 | Why | Three new reps walk out the door and the ramp bar resets. A rep's day bar shows selling crowded out by CRM, quoting and paperwork, with the 50%+ goal marker. |
| 0:20–0:28 | Sizing the prize | First-year attrition counts 48% to 38% (−10 pts), ~12 sellers of capacity pop in, "No new headcount", ~$3.5M a year avoided cost. |
| 0:28–0:44 | The plan | The four priority cards pop on each word, then the foundation bar. On "one dashboard" a mini SBS Digital Command Center rises, its 12-month goal sparklines draw, and Sites A–D wire into it. |
| 0:44–0:54 | Economics | $3.1M invested, +$3.7M year-one bookings, and the cumulative value line crossing investment at month 6. |
| 0:54–1:03 | First 90 days | 30-60-90 timeline fills node by node, each with its "Done when". |
| 1:03–1:14 | Decisions + end card | The five leadership decisions, "We'd value your input on each", then a *Thank you* end card with Kevin's name and role. |

Files: `config/episodes/adp.json` (narration, end-card text), `src/episodes/adp/` (`timeline.js` beats/SFX/music moods, `scenes.js` all seven scenes, `kit.js` palette and helpers, `main.js` stage + wipes). Build with `npm run adp:voiceover` (only after editing the narration) and `npm run adp:build`. To change the name or role on the end card, edit `endCard` in `config/episodes/adp.json` and re-render.

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
