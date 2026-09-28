// Episode 3 timeline: every beat as an absolute time (storyboard + measured narration).
// Pure module — shared by the renderer and scripts/build-audio.mjs.

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  const S = Object.fromEntries(sb.sections.map((s) => [s.id, s]));
  const b = (sec, k) => S[sec].beats[k];
  const NEVER = 1e6;
  return {
    duration: sb.duration, vo, voEnd,
    // 1 · hook (at the desk)
    lookPaper: b('hook', 'lookPaper'), sameSentence: vo('l1', 'same sentence'), threeTimes: vo('l1', 'three times'), noIdea: vo('l1', 'no idea'),
    lookBack: b('hook', 'lookBack'), fogIn: b('hook', 'fogIn'),
    // 2 · brain fog
    fogStart: S.fog.start, brainFog: vo('l2', 'brain fog'), complaint: vo('l2', 'common complaint'), tokens: b('fog', 'tokens'),
    // 3 · what it feels like (4 vignettes)
    feelStart: S.feel.start, reading: vo('l3', 'thoughts are slower'), memory: vo('l3', 'memory'), talk: vo('l3', 'takes more effort'),
    multitask: vo('l3', 'concentrate'), cardsOut3: b('feel', 'cardsOut'), feelEnd: S.feel.end,
    // 4 · not laziness
    lazyStart: S.lazy.start, laptop: b('lazy', 'laptop'), battery: b('lazy', 'battery'), faster: Math.max(b('lazy', 'faster'), vo('l4', 'not trying hard')),
    lazyWord: vo('l4', 'lazy'), exhausted: b('lazy', 'exhausted'), harder: b('lazy', 'text'), lazyEnd: S.lazy.end,
    // 5 · inside (Episode 1 neuron view, "mixed" mode)
    toNeurons: S.inside.start, disruption: b('inside', 'slow'), disrupt: NEVER, energy: NEVER, processing: vo('l5', 'processing'), coordinating: vo('l5', 'coordinating'),
    automatic: vo('l5', 'Tasks that used'), effort: vo('l5', 'much more effort'), caption: b('inside', 'caption'), toStudio: S.inside.end,
    // 6 · a busy morning
    items: ['phone', 'coffee', 'email', 'talk', 'keys', 'door'].map((k) => b('morning', k)),
    busyDay: vo('l6', 'busy day'), drained: vo('l6', 'completely drained'), freeze: b('morning', 'freeze'), simplify: b('morning', 'simplify'),
    relax: b('morning', 'relax'), morningEnd: S.morning.end,
    // 7 · takeaway + end card
    clean: b('takeaway', 'clean'), one: b('takeaway', 'one'), breaks: b('takeaway', 'breaks'), listen: b('takeaway', 'listen'),
    cardsOut: b('takeaway', 'cardsOut'), badgeIn: b('takeaway', 'badgeIn'), badgeLand: b('takeaway', 'badgeLand'), thumbs: b('takeaway', 'thumbs'),
    evaluation: vo('l7', 'evaluation'), iris: b('takeaway', 'iris'), markLand: b('takeaway', 'markLand'), wordmark: b('takeaway', 'wordmark'),
    subtitle: b('takeaway', 'subtitle'), quote: b('takeaway', 'quote'), episode: b('takeaway', 'episode'),
  };
}

export function sfxList(T) {
  const typing = Array.from({ length: 26 }, (_, i) => ({ id: 'tick', at: T.laptop + 0.4 + i * 0.22 + (i % 3) * 0.04, gain: 0.07 }));
  return [
    { id: 'flip', at: T.lookPaper - 0.2, gain: 0.2 },
    { id: 'tick', at: T.sameSentence, gain: 0.12 }, { id: 'tick', at: T.threeTimes, gain: 0.12 }, { id: 'tick', at: T.threeTimes + 0.6, gain: 0.12 },
    { id: 'wobble', at: T.noIdea, gain: 0.22 },
    { id: 'slosh', at: T.fogIn, gain: 0.3 },
    { id: 'stamp', at: T.brainFog, gain: 0.35 },
    { id: 'slosh', at: T.tokens, gain: 0.25 },
    { id: 'pop', at: T.reading, gain: 0.25 }, { id: 'pop', at: T.memory, gain: 0.25 }, { id: 'chatter', at: T.talk, gain: 0.25 }, { id: 'pop', at: T.multitask, gain: 0.25 },
    { id: 'whoosh', at: T.cardsOut3, gain: 0.25 },
    ...typing,
    { id: 'powerdown', at: T.battery + 0.2, gain: 0.2 }, { id: 'powerdown', at: T.faster, gain: 0.3 },
    { id: 'pop', at: T.harder, gain: 0.3 },
    { id: 'whoosh', at: T.toNeurons + 0.05, gain: 0.4 },
    { id: 'glitch', at: T.disruption, gain: 0.15 },
    { id: 'pop', at: T.caption, gain: 0.2 },
    { id: 'whoosh', at: T.toStudio, gain: 0.35 },
    { id: 'buzz', at: T.items[0], gain: 0.25 }, { id: 'pop', at: T.items[1], gain: 0.25 }, { id: 'ding', at: T.items[2], gain: 0.22 },
    { id: 'chatter', at: T.items[3], gain: 0.22 }, { id: 'tick', at: T.items[4], gain: 0.25 }, { id: 'thud', at: T.items[5], gain: 0.2 },
    { id: 'glitch', at: T.freeze, gain: 0.2 },
    { id: 'whoosh', at: T.simplify, gain: 0.35 }, { id: 'activation', at: T.relax, gain: 0.2 },
    { id: 'whoosh', at: T.clean, gain: 0.3 },
    { id: 'pop', at: T.one, gain: 0.3 }, { id: 'pop', at: T.breaks, gain: 0.3 }, { id: 'pop', at: T.listen, gain: 0.3 },
    { id: 'whoosh', at: T.badgeIn, gain: 0.4 }, { id: 'activation', at: T.badgeLand, gain: 0.3 },
    { id: 'pop', at: T.thumbs + 0.05, gain: 0.35 },
    { id: 'whoosh', at: T.iris - 0.05, gain: 0.45 },
    { id: 'logo', at: T.markLand - 0.05, gain: 0.5 },
  ];
}

export function musicSections(T) {
  return [
    { from: 0, to: T.fogIn, mood: 'hush' },
    { from: T.fogIn, to: T.feelStart, mood: 'playful' },
    { from: T.feelStart, to: T.lazyStart, mood: 'explain' },
    { from: T.lazyStart, to: T.toNeurons, mood: 'tension' },
    { from: T.toNeurons, to: T.toStudio, mood: 'explain' },
    { from: T.toStudio, to: T.freeze, mood: 'overload' },
    { from: T.freeze, to: T.relax, mood: 'hush' },
    { from: T.relax, to: T.clean, mood: 'calm' },
    { from: T.clean, to: T.iris, mood: 'warm' },
    { from: T.iris, to: T.duration, mood: 'resolve' },
  ];
}
