#!/usr/bin/env python3
"""Generate the voiceover lines from config/storyboard.json with Kokoro-82M (Apache-2.0, runs locally).

  pip install kokoro-onnx soundfile
  python3 scripts/voiceover.py [--comp ep01]   # uses config/audio.json → voice, voiceSpeed

Model weights + voice styles are fetched once from the npm registry into audio/voiceover/.cache/
(kokoro-q8-shards = the ONNX model, kokoro-js = voice style vectors). Output: audio/voiceover/<id>.wav
+ timing.json with each line's duration (read by build-audio + the captions).
A storyboard may set "pronounce": {"Word": "<IPA phonemes>"} to fix a name the model mispronounces; captions keep the spelling.
A line may list "cues": words/phrases whose start time inside the line is measured (by synthesising the text
up to that phrase), so animation can sync to specific words. Results land in timing.json → <id>.cues.

To use a human VO artist instead: drop vo1.wav / vo2.wav into audio/voiceover/ and skip this script.
"""
import glob, io, json, os, sys, tarfile, urllib.request

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'audio', 'voiceover', '.cache')
OUT = os.path.join(ROOT, 'audio', 'voiceover')
MODEL_PKG = ('kokoro-q8-shards', '1.0.0')
VOICES_PKG = ('kokoro-js', '1.2.1')


def npm_tarball(name, version):
    url = f'https://registry.npmjs.org/{name}/-/{name.split("/")[-1]}-{version}.tgz'
    print(f'  fetching {url}')
    with urllib.request.urlopen(url) as r:
        return tarfile.open(fileobj=io.BytesIO(r.read()), mode='r:gz')


def ensure_assets():
    os.makedirs(CACHE, exist_ok=True)
    model = os.path.join(CACHE, 'kokoro-q8.onnx')
    voices = os.path.join(CACHE, 'voices.npz')
    if not os.path.exists(model):
        tf = npm_tarball(*MODEL_PKG)
        parts = sorted((m for m in tf.getmembers() if m.name.endswith('.bin')), key=lambda m: m.name)
        with open(model, 'wb') as f:
            for m in parts:
                f.write(tf.extractfile(m).read())
    if not os.path.exists(voices):
        tf = npm_tarball(*VOICES_PKG)
        vs = {}
        for m in tf.getmembers():
            if m.name.startswith('package/voices/') and m.name.endswith('.bin'):
                key = os.path.basename(m.name)[:-4]
                vs[key] = np.frombuffer(tf.extractfile(m).read(), dtype=np.float32).reshape(-1, 1, 256)
        np.savez(voices, **vs)
    return model, voices


def comp_paths(comp):
    comps = json.load(open(os.path.join(ROOT, 'config', 'compositions.json')))
    c = comps[comp]
    return os.path.join(ROOT, c['storyboard']), os.path.join(ROOT, c['voiceDir'])


def trim(audio, sr):
    idx = np.where(np.abs(audio) > 0.01)[0]
    if not len(idx):
        return audio, 0
    start = max(0, idx[0] - int(0.02 * sr))
    return audio[start: idx[-1] + int(0.08 * sr)], start


def pauses(audio, sr, th=0.02, min_len=0.08):
    """(start, end) of low-energy gaps in seconds (commas and dashes produce these)."""
    f = int(sr * 0.01)
    rms = [float(np.sqrt(np.mean(audio[i:i + f] ** 2))) for i in range(0, len(audio) - f, f)]
    out, run = [], 0
    for i, v in enumerate(rms + [1.0]):
        if v < th:
            run += 1
        else:
            if run * 0.01 >= min_len:
                out.append(((i - run) * 0.01, i * 0.01))
            run = 0
    merged = []
    for g in out:  # join gaps separated by < 30 ms
        if merged and g[0] - merged[-1][1] < 0.03:
            merged[-1] = (merged[-1][0], g[1])
        else:
            merged.append(g)
    return merged


def main():
    from kokoro_onnx import Kokoro
    comp = sys.argv[sys.argv.index('--comp') + 1] if '--comp' in sys.argv else 'intro'
    only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
    sb_path, out_dir = comp_paths(comp)
    os.makedirs(out_dir, exist_ok=True)
    sb = json.load(open(sb_path))
    au = json.load(open(os.path.join(ROOT, 'config', 'audio.json')))
    voice, speed = sb.get('voice', au['voice']), sb.get('voiceSpeed', au.get('voiceSpeed', 1.0))
    model, voices = ensure_assets()
    k = Kokoro(model, voices)
    tpath = os.path.join(out_dir, 'timing.json')
    timing = json.load(open(tpath)) if os.path.exists(tpath) and only else {}
    fixes = [(k.tokenizer.phonemize(w, 'en-us'), ph) for w, ph in sb.get('pronounce', {}).items()]

    def synth(text, spd):
        if not any(w in text for w in sb.get('pronounce', {})):
            return k.create(text, voice=voice, speed=spd, lang='en-us')
        ph = k.tokenizer.phonemize(text, 'en-us')
        for default, target in fixes:
            ph = ph.replace(default, target)
        return k.create(ph, voice=voice, speed=spd, lang='en-us', is_phonemes=True)
    for line in sb['voiceover']:
        if only and line['id'] not in only:
            continue
        audio, sr = synth(line['text'], line.get('speed', speed))
        audio, _ = trim(audio, sr)
        sf.write(os.path.join(out_dir, f"{line['id']}.wav"), audio, sr, subtype='PCM_16')
        gaps = pauses(audio, sr)
        entry = {'duration': round(len(audio) / sr, 3), 'sampleRate': sr, 'voice': voice, 'text': line['text'], 'cues': {}}
        last = -1.0
        for cue in line.get('cues', []):
            pos = line['text'].lower().find(cue.lower())
            if pos <= 0:
                entry['cues'][cue] = 0.0
                continue
            prefix = line['text'][:pos].rstrip(' ,—-')
            pa, _ = synth(prefix, line.get('speed', speed))
            pa, _ = trim(pa, sr)
            est = max(0.0, len(pa) / sr - 0.05)
            # After a comma/dash the speaker pauses: snap to the end of that pause (much more accurate).
            if any(ch in line['text'][max(0, pos - 12):pos] for ch in ',—:;'):
                cands = [(e - b, e) for (b, e) in gaps if est - 0.2 <= e <= est + 0.9 and e > last + 0.2]
                if cands:
                    est = max(cands)[1]
            est = max(est, last + 0.2)
            last = est
            entry['cues'][cue] = round(est, 3)
        timing[line['id']] = entry
        cues = ', '.join(f"{c}@{t:.2f}" for c, t in entry['cues'].items())
        print(f"  {line['id']}: {entry['duration']:.2f}s  {cues}")
    json.dump(timing, open(tpath, 'w'), indent=2)


if __name__ == '__main__':
    sys.exit(main())
