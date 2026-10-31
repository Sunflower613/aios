"""Measure phrase releases on separated vocals, keeping every CTC onset fixed."""
import hashlib
import json
from pathlib import Path
import subprocess

def separate_vocals(audio_path):
    import imageio_ffmpeg
    import numpy as np
    import soundfile as sf
    import torch
    import torchaudio
    audio_path = Path(audio_path)
    stem = audio_path.with_suffix('.vocals.wav')
    record = audio_path.with_suffix('.vocals.json')
    digest = hashlib.sha256(audio_path.read_bytes()).hexdigest()
    if stem.exists() and record.exists() and json.loads(record.read_text()) == {'audioSha256': digest, 'model': 'hdemucs-high-musdb-plus-v1'}:
        return sf.read(stem, dtype='float32')[0]
    torch.set_num_threads(4)
    bundle = torchaudio.pipelines.HDEMUCS_HIGH_MUSDB_PLUS
    model = bundle.get_model().eval()
    sr = bundle.sample_rate
    decoded = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', str(audio_path), '-f', 'f32le', '-ac', '2', '-ar', str(sr), 'pipe:1'], capture_output=True, check=True)
    audio = torch.from_numpy(np.frombuffer(decoded.stdout, dtype='<f4').copy().reshape(-1, 2).T)
    output = torch.zeros(audio.shape[-1])
    step, context = sr * 6, sr
    for start in range(0, audio.shape[-1], step):
        end = min(start + step, audio.shape[-1])
        left, right = max(0, start - context), min(audio.shape[-1], end + context)
        chunk = audio[:, left:right]
        mean, std = chunk.mean(), chunk.std().clamp(min=1e-6)
        with torch.inference_mode():
            vocals = model(((chunk - mean) / std).unsqueeze(0))[0, model.sources.index('vocals')].mean(dim=0) * std
        output[start:end] = vocals[start-left:end-left]
        print(f'Separating vocals {end / audio.shape[-1]:.0%}', flush=True)
    output = torchaudio.functional.resample(output, sr, 16000).numpy()
    temporary = stem.with_suffix('.tmp.wav'); sf.write(temporary, output, 16000, subtype='FLOAT'); temporary.replace(stem)
    record.write_text(json.dumps({'audioSha256': digest, 'model': 'hdemucs-high-musdb-plus-v1'}))
    return output

def vocal_release(samples, sr=16000):
    """End of the contiguous vocal event after an already measured onset.

    Require voiced energy near the anchor and 120ms of release below a
    relative threshold. Never jump across a silent gap to a later singer.
    """
    import numpy as np
    hop = round(sr * .01); frame = round(sr * .03)
    if len(samples) < frame:
        return None
    energy = np.array([np.sqrt(np.mean(samples[i:i+frame] ** 2)) for i in range(0, len(samples)-frame+1, hop)])
    reference = float(np.max(energy[:min(50, len(energy))]))
    if reference < .003:
        return None
    threshold = max(.0015, reference * .16)
    active = energy >= threshold
    voiced = np.flatnonzero(active[:min(25, len(active))])
    if not len(voiced):
        return None
    first = int(voiced[0]); last = first; gap = 0
    for i in range(first, len(active)):
        if active[i]: last = i; gap = 0
        else: gap += 1
        if gap >= 12:
            break
    return min(len(samples) / sr, (last * hop + frame) / sr)

def refine_tails(data, vocals):
    changed = 0; measured = 0
    for index, line in enumerate(data['lines']):
        words = [w for w in data['words'] if w['line'] == index]
        if not words:
            continue
        word = max(words, key=lambda w: w['start'])
        limit = min(data['duration'], next((w['start'] for w in data['words'] if w['start'] > word['start'] and w['line'] != index), data['duration']))
        release = vocal_release(vocals[round(word['start'] * 16000):round(limit * 16000)])
        if release is None or release < .06:
            word['tailReview'] = True
            continue
        end = round(min(limit, word['start'] + release), 4)
        if end > word['start']:
            changed += abs(word['end'] - end) > .04
            word['end'] = end; word['endMethod'] = 'demucs-vocal-release'; measured += 1
    data['tailMethod'] = 'demucs-vocal-release-v1'
    data['tailMeasuredCount'] = measured
    return changed

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(); parser.add_argument('audio', type=Path); parser.add_argument('chart', type=Path)
    args = parser.parse_args(); data = json.loads(args.chart.read_text(encoding='utf-8'))
    if data['audioSha256'] != hashlib.sha256(args.audio.read_bytes()).hexdigest():
        raise ValueError('Chart/audio mismatch')
    print('Refined tails:', refine_tails(data, separate_vocals(args.audio)), flush=True)
    suspicious = [i for i, w in enumerate(data['words']) if w['end'] - w['start'] < .05 or w['end'] - w['start'] > 3 or w.get('tailReview')]
    data['review']['unusualDurationIndices'] = suspicious; data['review']['required'] = bool(suspicious)
    temp = args.chart.with_suffix('.tmp'); temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8'); temp.replace(args.chart)
