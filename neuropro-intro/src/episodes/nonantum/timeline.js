// Nonantum annual meeting timeline: scene boundaries + measured narration cues.
// Pure module — shared by the renderer and scripts/build-audio.mjs.

export const B = { firm: 8.3, portfolio: 19.6, activity: 26.4, perf: 36.4, score: 45.7, funds: 58.9, lifted: 65.1, focus: 74.5, end: 81.9 };

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  return {
    duration: sb.duration, vo, voEnd, ...B,
    wipes: [B.firm, B.portfolio, B.activity, B.perf, B.score, B.funds, B.lifted, B.focus, B.end],
    ytd: vo('l1', 'year to date'),
    billion: vo('l2', 'one billion'), strat: [vo('l2', 'founder-owned'), vo('l2', 'carve-outs'), vo('l2', 'complex')],
    twelve: vo('l3', 'twelve'), sectors: [vo('l3', 'consumer'), vo('l3', 'industrials'), vo('l3', 'business services')],
    flatiron: vo('l4', 'Flatiron'), roadone: vo('l4', 'RoadOne'),
    rev: vo('l5', 'fourteen'), ebitda: vo('l5', 'seventeen'), addons: vo('l5', 'nine'),
    seven: vo('l5b', 'seven'), sc: { helix: vo('l5b', 'Helix'), momentum: vo('l5b', 'Momentum'), lifted: vo('l5b', 'Lifted Trucks'), msi: vo('l5b', 'MSI Express'), ross: vo('l5b', 'Ross-Simons') },
    f1: vo('l6', 'two point one'), f2: vo('l6', 'one point four'),
    lt: vo('l7', 'Lifted Trucks'), ltUnits: vo('l7', 'six thousand'), ltPct: vo('l7', 'thirty-seven'), ltStores: vo('l7', 'five new'),
    pr: [vo('l8', 'add-ons'), vo('l8', 'cash conversion'), vo('l8', 'realizations')],
    thanks: vo('l9'),
  };
}

export function sfxList(T) {
  const s = [];
  const add = (id, at, gain, dur) => s.push({ id, at, gain, ...(dur ? { dur } : {}) });
  for (const w of T.wipes) add('whoosh', w - 0.3, 0.38);
  add('activation', 0.35, 0.22); add('pop', T.ytd - 0.1, 0.2);
  add('pop', T.billion, 0.28); for (const a of T.strat) add('pop', a, 0.22);
  for (let i = 0; i < 12; i++) add('tick', T.twelve + i * 0.08, 0.12);
  for (const a of T.sectors) add('flip', a, 0.2);
  add('pop', T.flatiron, 0.3); add('pop', T.roadone, 0.3);
  add('pop', T.rev, 0.3); add('pop', T.ebitda, 0.3); add('pop', T.addons, 0.3);
  for (let i = 0; i < 7; i++) add('tick', T.seven + i * 0.12, 0.14);
  for (const k of ['helix', 'momentum', 'lifted', 'msi', 'ross']) add('pop', T.sc[k], 0.2);
  add('pop', T.f1, 0.3); add('pop', T.f2, 0.3);
  add('whoosh', T.lt - 0.2, 0.25); add('pop', T.ltUnits, 0.28); add('pop', T.ltPct, 0.25); add('pop', T.ltStores, 0.25);
  for (const a of T.pr) add('pop', a, 0.25);
  add('logo', T.end + 0.2, 0.45);
  return s;
}

export function musicSections(T) {
  return [
    { from: 0, to: T.firm, mood: 'calm' },
    { from: T.firm, to: T.portfolio, mood: 'warm' },
    { from: T.portfolio, to: T.activity, mood: 'rise' },
    { from: T.activity, to: T.perf, mood: 'explain' },
    { from: T.perf, to: T.score, mood: 'warm' },
    { from: T.score, to: T.funds, mood: 'explain' },
    { from: T.funds, to: T.lifted, mood: 'warm' },
    { from: T.lifted, to: T.focus, mood: 'playful' },
    { from: T.focus, to: T.end, mood: 'explain' },
    { from: T.end, to: T.duration, mood: 'resolve' },
  ];
}
