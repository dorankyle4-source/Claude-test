// Episode 1 timeline: every beat as an absolute time, derived from config/episodes/ep01.json + the measured
// narration (audio/voiceover/ep01/timing.json). Pure module — used by the renderer AND by build-audio (SFX/music),
// so picture and sound stay locked together when narration is re-recorded or re-timed.

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  const S = Object.fromEntries(sb.sections.map((s) => [s.id, s]));
  const b = (sec, k) => S[sec].beats[k];

  const T = {
    duration: sb.duration,
    // 1 · hook
    walkEnd: b('hook', 'walkEnd'), jolt: b('hook', 'jolt'), hookTextIn: b('hook', 'textIn'), hookTextOut: b('hook', 'textOut'),
    l1: vo('l1'),
    // 2 · what is a concussion (anatomy)
    toAnatomy: S.what.start, anatomyLabels: b('what', 'labels'),
    brainInjury: vo('l2', 'brain injury'), bump: vo('l2', 'bump'), blow: vo('l2', 'blow'), jolt2: vo('l2', 'jolt'),
    bodyHit: vo('l2', 'hit to the body'), rapid: vo('l2', 'move rapidly'), settle: Math.max(b('what', 'settle'), vo('l2', 'move rapidly') + 1.2),
    // 3 · inside (neurons)
    toNeurons: S.inside.start, noDamage: vo('l3', 'no obvious damage'), disruption: vo('l3', 'sudden movement'),
    disrupt: vo('l3', 'disrupt'), communicate: vo('l3', 'communicate'), energy: vo('l3', 'energy'), recover: b('inside', 'recover'),
    // 4 · symptoms (back in the studio)
    toStudio: S.symptoms.start,
    symptoms: {
      headache: vo('l4', 'headache'), dizziness: vo('l4', 'dizziness'), fatigue: vo('l4', 'fatigue'), fog: vo('l4', 'brain fog'),
      concentration: vo('l4', 'trouble concentrating'), memory: vo('l4', 'memory problems'), lightNoise: vo('l4', 'sensitivity'),
    },
    symptomsEnd: S.symptoms.end,
    // 5 · no knockout required
    koClear: b('knockout', 'clear'), fall: b('knockout', 'fall'), popUp: b('knockout', 'popUp'),
    important: vo('l5', 'something important'), stamp: vo('l5', 'you do not'), point: Math.max(b('knockout', 'point'), vo('l5', 'you do not') + 0.4),
    inFact: vo('l5', 'In fact'), koEnd: S.knockout.end,
    // 6 · symptoms can take time
    feelFine: b('time', 'feelFine'), feelFineOut: b('time', 'feelFineOut'),
    rightAway: vo('l6', 'right away'), hours: vo('l6', 'hours'), days: vo('l6', 'days later'), payAttention: vo('l6', 'pay attention'),
    timeEnd: S.time.end,
    // 7 · takeaway + end card
    takeaway: b('takeaway', 'clear'), stop: vo('l7', 'stop the activity'), evaluate: vo('l7', 'get evaluated'),
    chipsOut: b('takeaway', 'chipsOut'), badgeIn: b('takeaway', 'badgeIn'), badgeLand: b('takeaway', 'badgeLand'),
    brainInjury2: vo('l8'), yourBrain: vo('l8', "I'm your brain"), learn: vo('l8', "let's learn"),
    iris: b('takeaway', 'iris'), markLand: b('takeaway', 'markLand'), wordmark: b('takeaway', 'wordmark'),
    subtitle: b('takeaway', 'subtitle'), episode: b('takeaway', 'episode'),
    vo, voEnd,
  };
  return T;
}

/** Sound effects, placed from the timeline (read by scripts/build-audio.mjs). */
export function sfxList(T) {
  const s = T.symptoms;
  const steps = [0.25, 0.62, 0.99, 1.36, 1.73].map((t) => ({ id: 'step', at: t, gain: 0.16 }));
  return [
    ...steps,
    { id: 'thud', at: T.jolt, gain: 0.55 },
    { id: 'whoosh', at: T.toAnatomy + 0.1, gain: 0.4 },
    { id: 'tick', at: T.anatomyLabels, gain: 0.15 },
    { id: 'impact', at: T.bump, gain: 0.45 }, { id: 'slosh', at: T.bump + 0.05, gain: 0.35 },
    { id: 'impact', at: T.blow, gain: 0.45 }, { id: 'slosh', at: T.blow + 0.05, gain: 0.35 },
    { id: 'thud', at: T.jolt2, gain: 0.35 }, { id: 'slosh', at: T.jolt2 + 0.05, gain: 0.35 },
    { id: 'impact', at: T.bodyHit, gain: 0.4 }, { id: 'slosh', at: T.bodyHit + 0.1, gain: 0.4 },
    { id: 'slosh', at: T.rapid, gain: 0.5 },
    { id: 'whoosh', at: T.toNeurons + 0.05, gain: 0.4 },
    { id: 'tick', at: T.noDamage, gain: 0.2 },
    { id: 'glitch', at: T.disruption, gain: 0.45 },
    { id: 'powerdown', at: T.disruption + 0.3, gain: 0.3 },
    { id: 'glitch', at: T.disrupt, gain: 0.25 },
    { id: 'powerup', at: T.recover, gain: 0.35 },
    { id: 'whoosh', at: T.toStudio, gain: 0.35 },
    ...Object.values(s).map((at) => ({ id: 'tick', at, gain: 0.2 })),
    { id: 'whoosh', at: T.koClear, gain: 0.25 },
    { id: 'thud', at: T.fall + 0.35, gain: 0.45 },
    { id: 'boing', at: T.popUp, gain: 0.4 },
    { id: 'stamp', at: T.stamp, gain: 0.6 },
    { id: 'pop', at: T.inFact, gain: 0.25 },
    { id: 'pop', at: T.feelFine, gain: 0.3 },
    { id: 'clock', at: T.rightAway, gain: 0.3 },
    { id: 'flip', at: T.days, gain: 0.35 },
    { id: 'tick', at: T.payAttention + 0.3, gain: 0.2 }, { id: 'tick', at: T.payAttention + 0.7, gain: 0.2 }, { id: 'tick', at: T.payAttention + 1.1, gain: 0.2 },
    { id: 'whoosh', at: T.takeaway, gain: 0.25 },
    { id: 'pop', at: T.stop, gain: 0.3 }, { id: 'pop', at: T.evaluate, gain: 0.3 },
    { id: 'whoosh', at: T.badgeIn, gain: 0.4 }, { id: 'activation', at: T.badgeLand, gain: 0.35 },
    { id: 'pop', at: T.learn + 0.05, gain: 0.35 },
    { id: 'whoosh', at: T.iris - 0.05, gain: 0.45 },
    { id: 'logo', at: T.markLand - 0.05, gain: 0.5 },
  ];
}

/** Music map: mood per stretch of the episode (read by scripts/build-audio.mjs). */
export function musicSections(T) {
  return [
    { from: 0, to: T.jolt, mood: 'bright' },
    { from: T.jolt, to: T.toAnatomy, mood: 'hush' },
    { from: T.toAnatomy, to: T.toNeurons, mood: 'explain' },
    { from: T.toNeurons, to: T.disruption, mood: 'explain' },
    { from: T.disruption, to: T.recover, mood: 'tension' },
    { from: T.recover, to: T.toStudio, mood: 'rise' },
    { from: T.toStudio, to: T.koClear, mood: 'explain' },
    { from: T.koClear, to: T.koEnd, mood: 'playful' },
    { from: T.koEnd, to: T.timeEnd, mood: 'tick' },
    { from: T.timeEnd, to: T.iris, mood: 'warm' },
    { from: T.iris, to: T.duration, mood: 'resolve' },
  ];
}
