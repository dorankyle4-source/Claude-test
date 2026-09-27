// Loads the JSON config files that drive the whole project.
export async function loadConfig() {
  const get = (f) => fetch(new URL(`../../config/${f}`, import.meta.url)).then((r) => r.json());
  const [brand, characters, storyboard, audio] = await Promise.all(
    ['brand.json', 'characters.json', 'storyboard.json', 'audio.json'].map(get));
  const scene = Object.fromEntries(storyboard.scenes.map((s) => [s.id, s]));
  return { brand, characters, storyboard, audio, scene };
}

export async function loadFonts() {
  const want = ['800 40px Manrope', '700 40px Manrope', '600 40px Manrope', '500 40px Manrope', '400 40px Manrope', '600 40px Inter', '500 40px Inter'];
  await Promise.all(want.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
}
