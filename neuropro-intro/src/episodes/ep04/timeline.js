// Episode 4 timeline: every beat as an absolute time (storyboard + measured narration).
// Pure module — shared by the renderer and scripts/build-audio.mjs.

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  const S = Object.fromEntries(sb.sections.map((s) => [s.id, s]));
  const b = (sec, k) => S[sec].beats[k];
  return {
    duration: sb.duration, vo, voEnd,
    // 1 · hook: the coffee shop gets LOUD
    walkEnd: b('hook', 'walkEnd'), lights: b('hook', 'lights'), espresso: b('hook', 'espresso'), talk: b('hook', 'talk'),
    blender: b('hook', 'blender'), phone: b('hook', 'phone'), freeze: b('hook', 'freeze'), ears: b('hook', 'ears'),
    textIn: b('hook', 'textIn'), textOut: b('hook', 'textOut'),
    // 2 · inside: the filter works
    toInside: S.filter.start, filters: vo('l1', 'filters'), organizes: vo('l1', 'organizes'), info: vo('l1', 'information'),
    letThrough: b('filter', 'letThrough'), turnDown: b('filter', 'turnDown'),
    // 3 · after a concussion: the filter is overwhelmed
    concStart: S.concussion.start, filterCue: vo('l2', 'filtering system'), mayNot: vo('l2', 'may not work'), forAWhile: vo('l2', 'for a while'),
    light: vo('l3', 'light'), sound: b('concussion', 'soundCue'), otherSensory: vo('l3', 'other sensory'), intense: vo('l3', 'much more intense'),
    tooMuch: b('concussion', 'tooMuch'), toCafe: S.concussion.end,
    // 4 · the giant volume knob
    knobIn: b('knob', 'knobIn'), badgeIn: b('knob', 'badgeIn'), badgeLand: b('knob', 'badgeLand'), turn: b('knob', 'turn'),
    calm: b('knob', 'calm'), smile: b('knob', 'smile'),
    // 5 · takeaway, 6 · end card
    wipe: b('takeaway', 'wipe'), real: vo('l4', 'real'), important: vo('l5', 'important part'),
    iris: b('takeaway', 'iris'), markLand: b('takeaway', 'markLand'), wordmark: b('takeaway', 'wordmark'),
    subtitle: b('takeaway', 'subtitle'), quote: b('takeaway', 'quote'), episode: b('takeaway', 'episode'),
  };
}

/** How overwhelming the coffee shop is (0..1) and each source's level — shared by picture and sound. */
export function overload(t, T) {
  const ramp = (a, d = 0.35) => Math.min(1, Math.max(0, (t - a) / d));
  const inHook = t < T.toInside + 0.6;
  const inKnob = t >= T.toCafe - 0.2 && t < T.wipe;
  const calmK = Math.min(1, Math.max(0, (t - T.calm) / 0.25));
  const on = (a) => (inHook ? ramp(a) : inKnob ? 1 - calmK : 0);
  return { light: on(T.lights), espresso: on(T.espresso), talk: on(T.talk), blender: on(T.blender), phone: on(T.phone), all: inHook ? ramp(T.lights, 1.8) : inKnob ? 1 - calmK : 0 };
}

export function sfxList(T) {
  const hookEnd = T.toInside + 0.3, calm = T.calm;
  return [
    { id: 'cafe', at: 0, dur: T.toInside + 0.4, gain: 0.35 },
    { id: 'step', at: 0.3, gain: 0.14 }, { id: 'step', at: 0.7, gain: 0.14 }, { id: 'step', at: 1.1, gain: 0.14 }, { id: 'step', at: 1.5, gain: 0.14 },
    // overload builds, layer by layer
    { id: 'hum', at: T.lights, dur: hookEnd - T.lights, gain: 0.35 },
    { id: 'espresso', at: T.espresso, dur: hookEnd - T.espresso, gain: 0.5 },
    { id: 'chatter', at: T.talk, gain: 0.45 }, { id: 'chatter', at: T.talk + 0.7, gain: 0.5 }, { id: 'chatter', at: T.talk + 1.4, gain: 0.55 }, { id: 'chatter', at: T.talk + 2.1, gain: 0.55 },
    { id: 'blender', at: T.blender, dur: hookEnd - T.blender, gain: 0.55 },
    { id: 'ding', at: T.phone, gain: 0.9 }, { id: 'buzz', at: T.phone + 0.1, gain: 0.5 },
    { id: 'whoosh', at: T.toInside, gain: 0.45 },
    // inside the brain
    { id: 'tick', at: T.letThrough, gain: 0.2 }, { id: 'tick', at: T.turnDown, gain: 0.2 },
    { id: 'glitch', at: T.mayNot, gain: 0.3 }, { id: 'glitch', at: T.intense, gain: 0.25 },
    { id: 'boing', at: T.tooMuch, gain: 0.3 }, { id: 'stamp', at: T.tooMuch + 0.05, gain: 0.3 },
    { id: 'whoosh', at: T.toCafe - 0.05, gain: 0.45 },
    // knob scene: loud → the badge turns it down → sudden calm
    { id: 'hum', at: T.toCafe, dur: calm - T.toCafe, gain: 0.35 },
    { id: 'espresso', at: T.toCafe, dur: calm - T.toCafe, gain: 0.45 },
    { id: 'blender', at: T.toCafe + 0.1, dur: calm - T.toCafe - 0.1, gain: 0.5 },
    { id: 'chatter', at: T.toCafe + 0.2, gain: 0.5 }, { id: 'chatter', at: T.toCafe + 0.9, gain: 0.5 }, { id: 'chatter', at: T.toCafe + 1.6, gain: 0.5 },
    { id: 'chatter', at: T.toCafe + 2.3, gain: 0.5 }, { id: 'chatter', at: T.toCafe + 3.0, gain: 0.45 },
    { id: 'pop', at: T.knobIn, gain: 0.3 },
    { id: 'whoosh', at: T.badgeIn, gain: 0.35 },
    { id: 'knob', at: T.turn, gain: 0.5 },
    { id: 'activation', at: calm, gain: 0.25 },
    { id: 'cafe', at: calm + 0.05, dur: T.iris - calm, gain: 0.18 },
    { id: 'whoosh', at: T.wipe - 0.1, gain: 0.3 },
    { id: 'whoosh', at: T.iris - 0.05, gain: 0.45 },
    { id: 'logo', at: T.markLand - 0.05, gain: 0.5 },
  ];
}

export function musicSections(T) {
  return [
    { from: 0, to: T.lights, mood: 'bright' },
    { from: T.lights, to: T.toInside, mood: 'overload' },
    { from: T.toInside, to: T.concStart, mood: 'explain' },
    { from: T.concStart, to: T.toCafe, mood: 'tension' },
    { from: T.toCafe, to: T.calm, mood: 'overload' },
    { from: T.calm, to: T.wipe, mood: 'calm' },
    { from: T.wipe, to: T.iris, mood: 'warm' },
    { from: T.iris, to: T.duration, mood: 'resolve' },
  ];
}
