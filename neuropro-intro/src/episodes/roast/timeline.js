// Roast timeline: segment starts (laid out from measured narration, in the storyboard) + line times + cue words.
// Pure module — shared by the renderer and scripts/build-audio.mjs.

export const PUNCH = ['o2', 'j2', 'j4', 'j5', 'd2', 'd4', 'p2', 'p4', 's2', 's4', 'k2', 'k3', 'k4', 'c2'];
export const ORDER = ['intro', 'jon', 'david', 'peter', 'shawn', 'kyle', 'close', 'end'];

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  const S = sb.segments;
  const ids = sb.voiceover.map((l) => l.id);
  // each caption shows from its line start until the next line starts (or its segment ends)
  const capEnd = Object.fromEntries(ids.map((id, i) => [id, i + 1 < ids.length ? lines[ids[i + 1]].at - 0.25 : S.end - 0.2]));
  const seg = Object.fromEntries(ORDER.map((k, i) => [k, { from: S[k], to: i + 1 < ORDER.length ? S[ORDER[i + 1]] : sb.duration + 1 }]));
  for (const k of ORDER.slice(0, -1)) {   // a segment's captions never outlive it
    for (const id of ids) if (lines[id].at >= seg[k].from && lines[id].at < seg[k].to) capEnd[id] = Math.min(capEnd[id], seg[k].to - 0.15);
  }
  const caption = Object.fromEntries(sb.voiceover.map((l) => [l.id, l.caption || l.text]));
  return { duration: sb.duration, vo, voEnd, S, seg, ids, capEnd, caption, wipes: ORDER.slice(1).map((k) => S[k]) };
}

export function sfxList(T) {
  const s = [];
  const add = (id, at, gain, dur) => s.push({ id, at, gain, ...(dur ? { dur } : {}) });
  for (const w of T.wipes) add('whoosh', w - 0.3, 0.42);
  for (const id of PUNCH) add('rimshot', T.voEnd(id) + 0.12, 0.55);
  add('activation', 0.3, 0.3); add('impact', 0.9, 0.35);
  const pop = (id, cue, g = 0.25) => add('pop', T.vo(id, cue), g);
  const stamp = (at, g = 0.32) => add('stamp', at, g);
  // Jon
  pop('j1', 'three degrees'); add('pop', T.vo('j1', 'three degrees') + 0.3, 0.22); add('pop', T.vo('j1', 'three degrees') + 0.6, 0.22);
  stamp(T.vo('j2', 'returning customer'));
  for (let i = 0; i < 10; i++) add('tick', T.vo('j3', 'twenty years') + i * 0.1, 0.14);
  stamp(T.vo('j4') + 0.3);
  add('boing', T.vo('j5', 'three takes') - 0.6, 0.25);
  // David
  pop('d1', 'Harvard'); pop('d1', 'Stanford'); pop('d3', 'Parthenon'); add('clock', T.vo('d3', 'under renovation'), 0.2); stamp(T.vo('d4') + 0.4);
  // Peter
  pop('p1', 'Chief Compliance'); stamp(T.vo('p2', 'approves his own') + 0.3); add('ding', T.vo('p3', 'reconciling') + 1.4, 0.25); add('pop', T.vo('p4') + 0.4, 0.3);
  // Shawn
  pop('s1', 'philosophy'); add('flip', T.vo('s2', 'Spoiler') + 0.6, 0.3); pop('s3', 'office manager'); add('powerup', T.vo('s3', 'vice president') - 0.4, 0.25);
  add('powerup', T.vo('s4') + 0.3, 0.2);
  // Kyle
  pop('k1', 'McKinsey'); pop('k1', 'Citadel'); pop('k1', 'Wharton'); stamp(T.vo('k2') + 1.2, 0.28);
  pop('k3', 'milliseconds'); add('clock', T.vo('k3', 'seven years'), 0.2); pop('k4', null, 0.25);
  // close
  for (let i = 0; i < 5; i++) add('pop', T.vo('c1', 'Five brilliant') + i * 0.18, 0.2);
  add('logo', T.S.end + 0.2, 0.5);
  return s;
}

export function musicSections(T) {
  const m = [{ from: 0, to: T.S.jon, mood: 'bright' }];
  for (const k of ['jon', 'david', 'peter', 'shawn', 'kyle']) m.push({ from: T.seg[k].from, to: T.seg[k].to, mood: 'playful' });
  m.push({ from: T.S.close, to: T.S.end, mood: 'warm' }, { from: T.S.end, to: T.duration, mood: 'resolve' });
  return m;
}
