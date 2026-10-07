// NeuroPro Playbook partner training (MoveDocs): scene boundaries + measured narration cues.
// Pure module — shared by the renderer and scripts/build-audio.mjs.
// Each scene opens just before its narration line, so retiming a line in the storyboard moves its scene too.

const SCENES = ['who', 'founding', 'role', 'network', 'scan', 'dti', 'faq', 'refer', 'end'];
const LINE_OF = { who: 'l2', founding: 'l3', role: 'l4', network: 'l5', scan: 'l6', dti: 'l7', faq: 'l8', refer: 'l9', end: 'l10' };
const LEAD = { end: 1.4 };

export function buildTimeline(sb, timing) {
  const lines = Object.fromEntries(sb.voiceover.map((l) => [l.id, l]));
  const vo = (id, cue) => lines[id].at + (cue ? timing?.[id]?.cues?.[cue] ?? 0 : 0);
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);
  const B = Object.fromEntries(SCENES.map((s) => [s, lines[LINE_OF[s]].at - (LEAD[s] ?? 0.6)]));
  return {
    duration: sb.duration, vo, voEnd, ...B,
    wipes: SCENES.map((s) => B[s]),
    partners: vo('l1', 'MoveDocs'),
    svc: [vo('l2', 'concussion care'), vo('l2', 'neuropsychological testing'), vo('l2', 'mental health care')],
    stat: [vo('l2', 'a hundred fifty thousand'), vo('l2', 'forty-six'), vo('l2', 'seven to ten'), vo('l2', 'seven to ten') + 0.6],
    years: vo('l3', 'fifteen years'),
    bio: [vo('l3', 'Navy'), vo('l3', 'Naval Academy'), vo('l3', 'Johns Hopkins'), vo('l3', "Maryland's")],
    oneDoc: vo('l3', 'one doctor'), thirty: vo('l3', 'close to thirty'),
    recognize: vo('l4', 'recognize'),
    trig: [vo('l4', 'a head injury'), vo('l4', 'anxiety'), vo('l4', 'needs testing')], sendRef: vo('l4', 'send the referral'),
    path: [vo('l5', 'concussion evaluation'), vo('l5', 'neuropsychological testing'), vo('l5', 'mental health treatment'), vo('l5', 'medico-legal')], oneTeam: vo('l5', 'one team'),
    clean: vo('l6', 'clean scan'), most: vo('l6', 'most concussions'), neuro: vo('l6', 'A neurologist'), measures: vo('l6', 'NeuroPro measures'),
    disc: vo('l7', 'discoverable'), normal: vo('l7', 'comes back normal'), lead: vo('l7', 'Lead with'), helps: vo('l7', 'only if it helps'),
    q: [vo('l8', 'a while ago'), vo('l8', 'faking'), vo('l8', 'Who pays')], a: [vo('l8', 'not too late'), vo('l8', 'effort checks'), vo('l8', 'a lien')],
    steps: [vo('l9', 'spot the need'), vo('l9', 'send the referral'), vo('l9', 'take it from there')], think: vo('l9', 'think NeuroPro'),
    thanks: vo('l10'),
  };
}

export function sfxList(T) {
  const s = [];
  const add = (id, at, gain, dur) => s.push({ id, at, gain, ...(dur ? { dur } : {}) });
  for (const w of T.wipes.slice(0, -1)) add('whoosh', w - 0.3, 0.4);
  add('activation', 0.3, 0.25); add('pop', T.partners, 0.22);
  for (const a of T.svc) add('pop', a, 0.24);
  for (const a of T.stat) add('tick', a, 0.22);
  add('pop', T.years, 0.26);
  for (const a of T.bio) add('tick', a, 0.2);
  add('pop', T.oneDoc, 0.26);
  for (let i = 0; i < 12; i++) add('tick', T.thirty + i * 0.08, 0.1);
  add('ding', T.thirty + 1.0, 0.26);
  for (const a of T.trig) add('pop', a, 0.26);
  add('stamp', T.sendRef, 0.26);
  for (const a of T.path) add('pop', a, 0.24);
  add('ding', T.oneTeam, 0.26);
  add('thud', T.clean, 0.22); add('pop', T.most, 0.28); add('flip', T.neuro, 0.26); add('flip', T.measures, 0.26);
  add('thud', T.normal + 0.6, 0.26); add('pop', T.lead, 0.26); add('ding', T.helps + 0.3, 0.26);
  T.q.forEach((q, i) => { add('pop', q - 0.1, 0.24); add('flip', T.a[i], 0.26); });
  for (const a of T.steps) add('stamp', a, 0.24);
  add('ding', T.think + 0.2, 0.3);
  add('logo', T.end + 0.2, 0.5);
  return s;
}

export function musicSections(T) {
  return [
    { from: 0, to: T.who, mood: 'bright' },
    { from: T.who, to: T.founding, mood: 'rise' },
    { from: T.founding, to: T.role, mood: 'warm' },
    { from: T.role, to: T.network, mood: 'explain' },
    { from: T.network, to: T.scan, mood: 'rise' },
    { from: T.scan, to: T.dti, mood: 'explain' },
    { from: T.dti, to: T.faq, mood: 'tension' },
    { from: T.faq, to: T.refer, mood: 'playful' },
    { from: T.refer, to: T.end, mood: 'warm' },
    { from: T.end, to: T.duration, mood: 'resolve' },
  ];
}
