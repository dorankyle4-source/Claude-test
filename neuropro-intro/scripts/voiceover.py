#!/usr/bin/env python3
"""Generate the voiceover lines from config/storyboard.json with Kokoro-82M (Apache-2.0, runs locally).

  pip install kokoro-onnx soundfile
  python3 scripts/voiceover.py            # uses config/audio.json → voice, voiceSpeed

Model weights + voice styles are fetched once from the npm registry into audio/voiceover/.cache/
(kokoro-q8-shards = the ONNX model, kokoro-js = voice style vectors). Output: audio/voiceover/<id>.wav
+ timing.json with each line's duration (read by build-audio + the captions).

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


def main():
    from kokoro_onnx import Kokoro
    sb = json.load(open(os.path.join(ROOT, 'config', 'storyboard.json')))
    au = json.load(open(os.path.join(ROOT, 'config', 'audio.json')))
    model, voices = ensure_assets()
    k = Kokoro(model, voices)
    timing = {}
    for line in sb['voiceover']:
        audio, sr = k.create(line['text'], voice=au['voice'], speed=au.get('voiceSpeed', 1.0), lang='en-us')
        # trim leading/trailing near-silence so cue times are exact
        idx = np.where(np.abs(audio) > 0.01)[0]
        if len(idx):
            audio = audio[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
        path = os.path.join(OUT, f"{line['id']}.wav")
        sf.write(path, audio, sr, subtype='PCM_16')
        timing[line['id']] = {'duration': round(len(audio) / sr, 3), 'sampleRate': sr, 'voice': au['voice'], 'text': line['text']}
        print(f"  {line['id']}: {timing[line['id']]['duration']:.2f}s  “{line['text']}”")
    json.dump(timing, open(os.path.join(OUT, 'timing.json'), 'w'), indent=2)


if __name__ == '__main__':
    sys.exit(main())
