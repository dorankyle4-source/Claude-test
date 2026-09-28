// Episode 2 timeline: every beat as an absolute time, derived from config/episodes/ep02.json + measured narration.
// Pure module — shared by the renderer and scripts/build-audio.mjs (SFX + music moods).

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  const S = Object.fromEntries(sb.sections.map((s) => [s.id, s]));
  const b = (sec, k) => S[sec].beats[k];
  return {
    duration: sb.duration, vo, voEnd,
    // 1 · the question
    walkEnd: b('question', 'walkEnd'), bubbleIn: b('question', 'bubbleIn'), bubbleOut: b('question', 'bubbleOut'),
    feelOkay: vo('l1', 'feel okay'), andThen: vo('l1', 'and then'), terrible: vo('l1', 'terrible'),
    // 2 · outside vs inside
    split: b('outside', 'split'), doesnt: vo('l2', "doesn't always"), outsideCue: vo('l2', 'see from the outside'), splitEnd: S.outside.end,
    // 3 · inside the brain (reuses the Episode 1 neuron view)
    toNeurons: S.inside.start, disruption: b('inside', 'event'), disrupt: vo('l3', 'trouble communicating'),
    drainAt: vo('l3', 'managing the energy'), energy: vo('l3', 'managing the energy') + 0.8, caption: b('inside', 'caption'),
    toStudio: S.inside.end,
    // 4 · why you feel it
    symptoms: {
      headache: vo('l4', 'everything'), concentration: vo('l4', 'concentration'), memory: vo('l4', 'memory'),
      dizziness: vo('l4', 'balance'), fatigue: vo('l4', 'energy'), fog: vo('l4', 'process information'),
    },
    feelClear: b('feel', 'clear'), feelEnd: S.feel.end,
    // 5 · symptoms fluctuate
    walkStart: b('fluctuate', 'walkStart'), meterIn: b('fluctuate', 'meterIn'), fluctuate: vo('l5', 'fluctuate'),
    good1: vo('l5', 'pretty good'), bad1: vo('l5', 'struggle'), good2: b('fluctuate', 'good2'), bad2: b('fluctuate', 'bad2'),
    linear: b('fluctuate', 'linear'), flucEnd: S.fluctuate.end,
    // 6 · overload → calm
    ovStart: S.overload.start, phone: b('overload', 'phone'), laptop: b('overload', 'laptop'), exercise: b('overload', 'exercise'),
    lights: b('overload', 'lights'), talk: b('overload', 'talk'), peak: b('overload', 'peak'),
    calm: Math.max(b('overload', 'calm'), vo('l6', "That doesn't") + 0.5), note: vo('l6', 'new brain damage'),
    moreTime: vo('l6', 'a little more time'), strategy: vo('l6', 'recovery strategy'), ovEnd: S.overload.end,
    // 7 · takeaway + end card
    clean: b('takeaway', 'clean'), rest: vo('l7', "don't just push"), recover: vo('l7', 'through them') + 0.15, evaluate: vo('l7', 'Get evaluated'),
    findOut: vo('l7', 'find out'), badgeIn: b('takeaway', 'badgeIn'), badgeLand: b('takeaway', 'badgeLand'), thumbs: b('takeaway', 'thumbs'),
    iris: b('takeaway', 'iris'), markLand: b('takeaway', 'markLand'), wordmark: b('takeaway', 'wordmark'),
    subtitle: b('takeaway', 'subtitle'), quote: b('takeaway', 'quote'), episode: b('takeaway', 'episode'),
  };
}

export function sfxList(T) {
  const steps = [0.25, 0.62, 0.99, 1.36, 1.73, 2.05].map((t) => ({ id: 'step', at: t, gain: 0.16 }));
  const walk2 = Array.from({ length: 22 }, (_, i) => ({ id: 'step', at: T.walkStart + 0.2 + i * 0.5, gain: 0.1 }));
  return [
    ...steps,
    { id: 'pop', at: T.bubbleIn, gain: 0.3 },
    { id: 'wobble', at: T.terrible - 0.1, gain: 0.3 }, { id: 'tick', at: T.terrible, gain: 0.2 },
    { id: 'whoosh', at: T.split, gain: 0.35 },
    { id: 'whoosh', at: T.toNeurons + 0.05, gain: 0.4 },
    { id: 'glitch', at: T.disruption, gain: 0.45 }, { id: 'glitch', at: T.disrupt, gain: 0.25 },
    { id: 'powerdown', at: T.drainAt, gain: 0.3 },
    { id: 'pop', at: T.caption, gain: 0.2 },
    { id: 'whoosh', at: T.toStudio, gain: 0.35 },
    ...Object.values(T.symptoms).map((at) => ({ id: 'tick', at, gain: 0.2 })),
    { id: 'whoosh', at: T.feelClear, gain: 0.25 },
    ...walk2,
    { id: 'pop', at: T.meterIn, gain: 0.25 },
    { id: 'tick', at: T.good1, gain: 0.25 }, { id: 'wobble', at: T.bad1, gain: 0.22 },
    { id: 'tick', at: T.good2, gain: 0.25 }, { id: 'wobble', at: T.bad2, gain: 0.22 },
    { id: 'pop', at: T.linear, gain: 0.25 },
    { id: 'buzz', at: T.phone, gain: 0.35 }, { id: 'ding', at: T.laptop, gain: 0.25 }, { id: 'thud', at: T.exercise, gain: 0.2 },
    { id: 'buzz', at: T.lights, gain: 0.2 }, { id: 'chatter', at: T.talk, gain: 0.35 }, { id: 'ding', at: T.talk + 0.4, gain: 0.2 },
    { id: 'buzz', at: T.peak - 0.2, gain: 0.3 }, { id: 'chatter', at: T.peak, gain: 0.3 },
    { id: 'whoosh', at: T.calm - 0.1, gain: 0.35 }, { id: 'activation', at: T.calm + 0.3, gain: 0.25 },
    { id: 'pop', at: T.note, gain: 0.25 }, { id: 'tick', at: T.moreTime, gain: 0.2 }, { id: 'tick', at: T.strategy, gain: 0.2 },
    { id: 'whoosh', at: T.clean, gain: 0.3 },
    { id: 'pop', at: T.rest, gain: 0.3 }, { id: 'pop', at: T.recover, gain: 0.3 }, { id: 'pop', at: T.evaluate, gain: 0.3 },
    { id: 'whoosh', at: T.badgeIn, gain: 0.4 }, { id: 'activation', at: T.badgeLand, gain: 0.3 },
    { id: 'pop', at: T.thumbs + 0.05, gain: 0.35 },
    { id: 'whoosh', at: T.iris - 0.05, gain: 0.45 },
    { id: 'logo', at: T.markLand - 0.05, gain: 0.5 },
  ];
}

export function musicSections(T) {
  return [
    { from: 0, to: T.andThen, mood: 'bright' },
    { from: T.andThen, to: T.split, mood: 'hush' },
    { from: T.split, to: T.toNeurons, mood: 'explain' },
    { from: T.toNeurons, to: T.disruption, mood: 'explain' },
    { from: T.disruption, to: T.toStudio, mood: 'tension' },
    { from: T.toStudio, to: T.feelEnd, mood: 'explain' },
    { from: T.feelEnd, to: T.flucEnd, mood: 'tick' },
    { from: T.flucEnd, to: T.peak + 0.4, mood: 'overload' },
    { from: T.peak + 0.4, to: T.calm, mood: 'hush' },
    { from: T.calm, to: T.clean, mood: 'calm' },
    { from: T.clean, to: T.iris, mood: 'warm' },
    { from: T.iris, to: T.duration, mood: 'resolve' },
  ];
}
