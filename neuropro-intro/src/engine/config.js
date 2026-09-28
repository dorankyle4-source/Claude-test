// Loads the JSON config files that drive a production (intro or an episode).
const url = (p) => new URL(`../../${p}`, import.meta.url);
const getJSON = (p) => fetch(url(p)).then((r) => (r.ok ? r.json() : null));

export async function loadConfig(comp = 'intro') {
  const comps = await getJSON('config/compositions.json');
  const C = comps[comp];
  const [brand, characters, storyboard, audio, timing] = await Promise.all([
    getJSON('config/brand.json'), getJSON('config/characters.json'), getJSON(C.storyboard), getJSON('config/audio.json'),
    getJSON(`${C.voiceDir}/timing.json`),
  ]);
  const scene = Object.fromEntries((storyboard.scenes || storyboard.sections || []).map((s) => [s.id, s]));
  if (brand.logo?.layout) brand.logoLayout = await getJSON(brand.logo.layout);

  // Absolute time of a voiceover line, or of a cue word inside it (measured by scripts/voiceover.py).
  const lines = Object.fromEntries((storyboard.voiceover || []).map((l) => [l.id, l]));
  const vo = (id, cue) => {
    const l = lines[id];
    if (!l) throw new Error(`unknown VO line ${id}`);
    if (!cue) return l.at;
    const c = timing?.[id]?.cues?.[cue];
    if (c == null) console.warn(`cue "${cue}" in ${id} not measured — run the voiceover script`);
    return l.at + (c ?? 0);
  };
  const voEnd = (id) => lines[id].at + (timing?.[id]?.duration ?? 3);

  return { comp, compInfo: C, brand, characters, storyboard, audio, timing, scene, vo, voEnd };
}

export async function loadFonts() {
  const want = ['800 40px Manrope', '700 40px Manrope', '600 40px Manrope', '500 40px Manrope', '400 40px Manrope', '600 40px Inter', '500 40px Inter'];
  await Promise.all(want.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
}
