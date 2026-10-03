// Lifted Trucks YTD timeline: scene boundaries + measured narration cues.
// Pure module — shared by the renderer and scripts/build-audio.mjs.

export const B = { units: 5.2, footprint: 16.0, revenue: 25.2, ebitda: 34.2, leads: 41.3, watch: 47.4, outlook: 60.0, end: 66.0 };

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  return {
    duration: sb.duration, vo, voEnd, ...B,
    wipes: [B.units, B.footprint, B.revenue, B.ebitda, B.leads, B.watch, B.outlook, B.end],
    january: vo('l1', 'January'),
    sold: vo('l2', 'six thousand'), pct: vo('l2', 'thirty-seven'), september: vo('l2', 'September'), record: vo('l2', 'seven hundred seventy-seven'),
    five: vo('l3', 'Five new'), eighteen: vo('l3', 'eighteen'), texas: vo('l3', 'Texas'),
    rev: vo('l4', 'five hundred nineteen'), revPct: vo('l4', 'forty percent'), gpu: vo('l4', 'ten thousand seven hundred'),
    eb: vo('l5', 'sixteen point seven'), ebPct: vo('l5', 'thirty-six'), quarters: vo('l5', 'every quarter'),
    leadPct: vo('l6', 'forty-four'), leadN: vo('l6', 'forty-two thousand'),
    w: [vo('l7', 'newest stores'), vo('l7', 'fifty-two'), vo('l7', 'Texas recon')],
    plan: vo('l8', 'ten thousand four hundred'), planEb: vo('l8', 'thirty-two million'), finish: vo('l8', 'finish'),
  };
}

export function sfxList(T) {
  const s = [];
  const add = (id, at, gain, dur) => s.push({ id, at, gain, ...(dur ? { dur } : {}) });
  for (const w of T.wipes) add('whoosh', w - 0.3, 0.45);
  add('impact', 0.35, 0.3); add('pop', T.january - 0.1, 0.22);
  for (let i = 0; i < 9; i++) add('tick', 5.9 + i * 0.5, 0.14);
  add('pop', T.pct, 0.3); add('stamp', T.record, 0.32);
  for (let i = 0; i < 5; i++) add('pop', T.five + i * 0.35, 0.22);
  add('thud', T.eighteen, 0.3); add('pop', T.texas, 0.28);
  add('pop', T.rev, 0.3); add('pop', T.revPct, 0.25); add('pop', T.gpu, 0.3);
  add('pop', T.eb, 0.3); add('pop', T.ebPct, 0.25); add('powerup', T.quarters - 0.3, 0.25);
  add('pop', T.leadPct, 0.28); for (let i = 0; i < 4; i++) add('tick', T.leadN + i * 0.18, 0.18);
  add('thud', T.watch + 0.3, 0.25); for (const w of T.w) add('stamp', w - 0.1, 0.28);
  add('pop', T.plan, 0.3); add('pop', T.planEb, 0.3);
  add('logo', T.end + 0.2, 0.5);
  return s;
}

export function musicSections(T) {
  return [
    { from: 0, to: T.units, mood: 'bright' },
    { from: T.units, to: T.footprint, mood: 'rise' },
    { from: T.footprint, to: T.revenue, mood: 'playful' },
    { from: T.revenue, to: T.ebitda, mood: 'warm' },
    { from: T.ebitda, to: T.leads, mood: 'rise' },
    { from: T.leads, to: T.watch, mood: 'playful' },
    { from: T.watch, to: T.outlook, mood: 'tension' },
    { from: T.outlook, to: T.end, mood: 'warm' },
    { from: T.end, to: T.duration, mood: 'resolve' },
  ];
}
