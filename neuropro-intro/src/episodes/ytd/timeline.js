// NeuroPro YTD timeline: scene boundaries + measured narration cues.
// Pure module — shared by the renderer and scripts/build-audio.mjs.

export const B = { visits: 5.8, patients: 15.4, revenue: 22.8, unit: 33.0, cash: 39.5, act: 48.1, team: 57.3, outlook: 66.8, end: 73.4 };

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  return {
    duration: sb.duration, vo, voEnd, ...B,
    wipes: [B.visits, B.patients, B.revenue, B.unit, B.cash, B.act, B.team, B.outlook, B.end],
    january: vo('l1', 'January'),
    pct: vo('l2', 'seventy-eight'), jan: vo('l2', 'three hundred forty'), sep: vo('l2', 'six hundred five'), busiest: vo('l2', 'busiest'),
    pts: vo('l3', 'a thousand and ten'), therapy: vo('l3', 'Therapy'), testing: vo('l3', 'testing'),
    rev: vo('l4', 'one point zero one'), kept: vo('l4', 'forty-nine'), aug: vo('l4', 'fifty-seven'),
    perVisit: vo('l5', 'three hundred twenty-four'), cost: vo('l5', 'one thirty-nine'),
    lag: vo('l6', 'lagging'), collected: vo('l6', 'Seven hundred fifty-nine'), liens: vo('l6', 'Liens'),
    three: vo('l7'), a: [vo('l7', 'Submit'), vo('l7', 'Name an owner'), vo('l7', 'rejected') - 0.9],
    counselor: vo('l8', 'Counselor'), doran: vo('l8', "Doctor Doran's"), down: vo('l8', 'thirty-nine'),
    q4: vo('l9', 'nine hundred ninety-nine'), finish: vo('l9', 'strong finish'),
  };
}

export function sfxList(T) {
  const s = [];
  const add = (id, at, gain, dur) => s.push({ id, at, gain, ...(dur ? { dur } : {}) });
  for (const w of T.wipes) add('whoosh', w - 0.3, 0.42);
  add('activation', 0.3, 0.25); add('pop', T.january - 0.1, 0.22);
  for (let i = 0; i < 9; i++) add('tick', 6.6 + i * 0.55, 0.14);
  add('pop', T.busiest, 0.32);
  add('pop', T.pts - 0.1, 0.3); add('pop', T.therapy, 0.28); add('pop', T.testing + 0.4, 0.3);
  add('pop', T.rev, 0.28); add('pop', T.kept, 0.3); add('ding', T.aug + 0.2, 0.3);
  add('pop', T.perVisit, 0.3); add('pop', T.cost, 0.28); add('powerup', T.cost + 0.6, 0.22);
  add('pop', T.collected, 0.28); add('flip', T.liens, 0.3); add('flip', T.liens + 0.5, 0.25);
  add('thud', T.three + 0.2, 0.25);
  for (const a of T.a) add('stamp', a, 0.28);
  add('pop', T.counselor, 0.3); add('pop', T.doran, 0.25); add('tick', T.down, 0.3);
  for (let i = 0; i < 10; i++) add('tick', T.q4 + i * 0.09, 0.12);
  add('ding', T.finish, 0.3);
  add('logo', T.end + 0.2, 0.5);
  return s;
}

export function musicSections(T) {
  return [
    { from: 0, to: T.visits, mood: 'bright' },
    { from: T.visits, to: T.patients, mood: 'rise' },
    { from: T.patients, to: T.revenue, mood: 'explain' },
    { from: T.revenue, to: T.unit, mood: 'warm' },
    { from: T.unit, to: T.cash, mood: 'playful' },
    { from: T.cash, to: T.act, mood: 'tension' },
    { from: T.act, to: T.team, mood: 'tick' },
    { from: T.team, to: T.outlook, mood: 'rise' },
    { from: T.outlook, to: T.end, mood: 'warm' },
    { from: T.end, to: T.duration, mood: 'resolve' },
  ];
}
