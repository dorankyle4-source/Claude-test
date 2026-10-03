// ADP recap timeline: every beat as an absolute time (scene boundaries + measured narration cues).
// Pure module — shared by the renderer and scripts/build-audio.mjs.

// Scene boundaries (s). A wipe is centred on each boundary except the two in-scene changes (diagB, dash).
export const B = { diag: 7.0, diagB: 13.5, prize: 20.0, plan: 28.4, econ: 44.6, next: 54.5, close: 63.6, end: 67.5 };

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  return {
    duration: sb.duration, vo, voEnd, ...B,
    wipes: [B.diag, B.prize, B.plan, B.econ, B.next, B.close, B.end],
    // 1 · open
    recap: vo('l1', 'quick recap'), forward: vo('l1', 'move forward'),
    // 2 · diagnosis
    demand: vo('l2', 'demand'), capacity: vo('l2', 'capacity'),
    leave: vo('l3', 'leave'), ramp: vo('l3', 'ramp'), stay: vo('l3', 'the ones who stay'), tooLittle: vo('l3', 'too little'),
    // 3 · the prize
    tenPts: vo('l4', 'ten points'), twelve: vo('l4', 'twelve sellers'), noHire: vo('l4', 'without adding'),
    // 4 · the plan + one dashboard
    four: vo('l5', 'four priorities'),
    p: [vo('l5', 'Keep the sellers'), vo('l5', 'Give reps'), vo('l5', 'Route the right'), vo('l5', 'compete on ease')],
    model: vo('l6', 'one operating model'), dash: vo('l6', 'one dashboard'), same: vo('l6', 'same numbers'),
    // 5 · economics
    inv: vo('l7', 'three point one'), book: vo('l7', 'three point seven'), payback: vo('l7', 'payback'),
    // 6 · first 90 days
    d: [vo('l8', 'first thirty'), vo('l8', 'By sixty'), vo('l8', 'By ninety')],
    // 7 · decisions + thank you
    five: vo('l9'), input: vo('l9', 'your input'), thanks: vo('l9', 'Thank you'),
  };
}

export function sfxList(T) {
  const s = [];
  const add = (id, at, gain, dur) => s.push({ id, at, gain, ...(dur ? { dur } : {}) });
  for (const w of T.wipes) add('whoosh', w - 0.3, 0.45);
  // open
  add('activation', 0.35, 0.22); add('pop', T.recap - 0.05, 0.22); add('whoosh', T.forward, 0.22);
  // diagnosis
  add('pop', T.demand - 0.2, 0.28); add('flip', T.demand + 0.45, 0.3);
  add('stamp', T.capacity - 0.02, 0.42); add('thud', T.capacity, 0.28);
  add('whoosh', T.diagB - 0.2, 0.28); add('pop', T.diagB + 0.25, 0.18);
  for (let i = 0; i < 7; i++) add('step', T.leave + 0.1 + i * 0.22, 0.13);
  add('powerdown', T.ramp + 0.45, 0.22); add('pop', T.stay, 0.22); add('tick', T.tooLittle + 0.05, 0.3);
  // prize
  for (let i = 0; i < 10; i++) add('tick', T.tenPts + 0.1 + i * 0.08, 0.13);
  add('pop', T.tenPts + 0.95, 0.3);
  for (let i = 0; i < 12; i++) add('tick', T.twelve + i * 0.075, 0.13);
  add('pop', T.noHire + 0.1, 0.3);
  // plan
  for (const p of T.p) add('pop', p - 0.05, 0.33);
  add('whoosh', T.model - 0.15, 0.28);
  add('whoosh', T.dash - 0.25, 0.32); add('activation', T.dash + 0.3, 0.28);
  for (let i = 0; i < 4; i++) add('pop', T.same - 0.1 + i * 0.1, 0.18);
  // economics
  add('pop', T.inv - 0.05, 0.3); add('pop', T.book - 0.05, 0.3); add('powerup', T.payback - 0.1, 0.28); add('ding', T.payback + 0.25, 0.32);
  // next steps
  for (const d of T.d) add('pop', d - 0.05, 0.33);
  // close + end card
  for (let i = 0; i < 5; i++) add('tick', T.close + 0.4 + i * 0.18, 0.18);
  add('pop', T.input, 0.3);
  add('logo', T.end + 0.1, 0.5);
  return s;
}

export function musicSections(T) {
  return [
    { from: 0, to: T.diag, mood: 'bright' },
    { from: T.diag, to: T.diagB, mood: 'explain' },
    { from: T.diagB, to: T.prize, mood: 'tension' },
    { from: T.prize, to: T.plan, mood: 'rise' },
    { from: T.plan, to: T.econ, mood: 'playful' },
    { from: T.econ, to: T.next, mood: 'warm' },
    { from: T.next, to: T.close, mood: 'rise' },
    { from: T.close, to: T.end, mood: 'calm' },
    { from: T.end, to: T.duration, mood: 'resolve' },
  ];
}
