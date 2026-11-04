"""Reusable Chinese audio + LRC -> character intervals + detected beat grid.

Lite is the default CPU backend; uncertain lines are marked for practice/review.
Advanced backends fail on incomplete alignment. Optional --vocals uses a separated
vocal stem with the same time origin for advanced alignment.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

HAN = re.compile(r'[\u3400-\u4dbf\u4e00-\u9fff]')
CREDIT = re.compile(r'(作词|作曲|编曲|词曲|制作人|制作|录音|混音|母带|发行|出品|版权|原唱|演唱|歌手|监制|和声|合声|小号|弦乐|钢琴|吉他|贝斯|键盘|鼓手|鸣谢|统筹|策划|音乐总监|词|曲)\s*[:：]|本作品|未经许可|著作权|版权所有|有限公司|股份公司|音乐工作室|^(OP|SP|发行|出品|制作|宣传|企划|营销|推广|特别鸣谢|联合发行)\s*[:：/\s]|^(作词|作曲|编曲|制作人|录音|混音|母带|监制|和声|合声)\s+[a-z]|^[《（(](海南话|黎族话|方言|独白|间奏|前奏|尾奏)[^》）)]*[》）)]$', re.I)

class SofaAligner:
    method = 'sofa-mandarin-singing'
    def __init__(self, repository, checkpoint):
        import torch
        import importlib
        if not repository.is_dir() or not checkpoint.is_file():
            raise FileNotFoundError('SOFA is not installed. See README.md / scripts/setup-alignment.ps1.')
        sys.path.insert(0, str(repository.resolve()))
        from modules.task.forced_alignment import LitForcedAlignmentTask
        from modules.g2p.dictionary_g2p import DictionaryG2P
        # SOFA's bundled librosa loader avoids torchaudio's optional torchcodec requirement.
        importlib.import_module('modules.utils.load_wav').installed_torchaudio = False
        torch.set_num_threads(4)
        self.model = LitForcedAlignmentTask.load_from_checkpoint(str(checkpoint), map_location='cpu', weights_only=False)
        self.model.eval(); self.model.set_inference_mode('force'); self.model.on_predict_start()
        self.g2p = DictionaryG2P(dictionary=str(repository / 'dictionary/opencpop-extension.txt'))

    def intervals(self, samples, chars):
        import torch
        import soundfile as sf
        from pypinyin import lazy_pinyin, Style
        syllables = lazy_pinyin(''.join(chars), style=Style.NORMAL, strict=False)
        # Dictionary uses v for ü and a dedicated erhua form.
        syllables = [s.replace('ü', 'v') for s in syllables]
        ph, words, mapping = self.g2p(' '.join(syllables))
        if len(words) != len(chars):
            raise ValueError('Some syllables are absent from the SOFA dictionary; correct pronunciation before exporting.')
        with tempfile.TemporaryDirectory(prefix='melody-sofa-') as folder:
            path = Path(folder) / 'line.wav'; sf.write(path, samples, 16000)
            with torch.inference_mode():
                prediction = self.model.predict_step((path, ph, words, mapping), 0)
        pairs = [(word, interval) for word, interval in zip(prediction[5], prediction[6]) if word not in ('SP', 'AP')]
        if [p[0] for p in pairs] != syllables:
            raise ValueError('SOFA returned an incomplete word sequence; no interpolated fallback was written.')
        return [[float(start) * 1000, float(end) * 1000] for _, (start, end) in pairs], float(prediction[2])

def whisperx_intervals(result, chars):
    aligned = [char for segment in result['segments'] for char in segment.get('chars', []) if HAN.fullmatch(char['char'])]
    if [char['char'] for char in aligned] != list(chars):
        raise ValueError('WhisperX did not align every Chinese character; no estimated fallback was written.')
    if any('start' not in char or 'end' not in char or char['end'] <= char['start'] for char in aligned):
        raise ValueError('WhisperX returned missing or zero-length character timestamps.')
    return [[char['start'] * 1000, char['end'] * 1000] for char in aligned], sum(char.get('score', 0) for char in aligned) / len(aligned)

class WhisperXAligner:
    method = 'whisperx-zh-ctc'
    def __init__(self, tail_model=None):
        import os
        # Plain HTTP avoids Xet's stalled transfer path on some Windows setups.
        os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
        import torch
        import nltk
        nltk.data.path.insert(0, str(Path(__file__).resolve().parents[1] / '.models/nltk_data'))
        from whisperx.alignment import load_align_model, align
        torch.set_num_threads(4)
        self.model, self.metadata = load_align_model(language_code='zh', device='cpu')
        self.align = align
        self.tail_model = tail_model
        if tail_model:
            self.method = 'whisperx-zh-ctc-sofa-tail'
    def intervals(self, samples, chars):
        result = self.align([{'start': 0, 'end': len(samples) / 16000, 'text': ''.join(chars)}],
                            self.model, self.metadata, samples, 'cpu',
                            interpolate_method='ignore', return_char_alignments=True)
        stamps, confidence = whisperx_intervals(result, chars)
        if self.tail_model:
            tails, tail_confidence = self.tail_model.intervals(samples, chars)
            stamps = merge_singing_tail(stamps, tails, len(samples) / 16)
        return stamps, confidence

def merge_singing_tail(stamps, tails, limit_ms):
    """Keep CTC onsets; use a singing model only when the final syllable agrees.

    Never extend to the next lyric merely because it is a segment boundary.
    A >600ms onset disagreement is left untouched for listening review.
    """
    result = [list(stamp) for stamp in stamps]
    if len(tails) == len(stamps) and stamps and abs(tails[-1][0] - stamps[-1][0]) <= 600:
        if stamps[-1][1] < tails[-1][1] <= limit_ms:
            result[-1][1] = tails[-1][1]
    return result

class FunAsrAligner:
    method = 'funasr-fa-zh'
    def __init__(self):
        from funasr import AutoModel
        self.model = AutoModel(model='fa-zh', device='cpu', disable_update=True, ncpu=4, disable_pbar=True)
    def intervals(self, samples, chars):
        result = self.model.generate(input=(samples, ' '.join(chars)), data_type=['sound', 'text'], fs=16000, batch_size=1, disable_pbar=True)
        return result[0]['timestamp'], None

def strip_singer_prefix(text):
    return re.sub(r'^\s*(?:(?:【[^】\n]{1,12}】|[（(](?:男|女|合|合唱|齐唱|男声|女声)[）)]|(?:男|女|合|合唱|齐唱|领唱|男声|女声|男女合唱)\s*[:：])\s*)+', '', text)

def parse_lrc(text, title='', artist=''):
    offset_match = re.search(r'\[offset:([+-]?\d+)\]', text)
    offset = int(offset_match[1]) / 1000 if offset_match else 0
    lines = []
    for raw in text.splitlines():
        stamps = re.findall(r'\[(\d+):(\d+(?:\.\d+)?)\]', raw)
        content = strip_singer_prefix(re.sub(r'\[[^\]]*\]', '', raw).strip())
        playable = bool(HAN.search(content)) and not CREDIT.search(content) and ' - ' not in content and content not in (title, artist)
        for minute, second in stamps:
            lines.append({'time': max(0, int(minute) * 60 + float(second) + offset), 'text': content, 'playable': bool(playable)})
    unique = {(line['time'], line['text']): line for line in lines}
    return sorted(unique.values(), key=lambda line: line['time'])

def parse_yrc(text, duration):
    lines, words = [], []
    for raw in text.splitlines():
        header = re.match(r'\[(\d+),(\d+)\]', raw)
        if not header:
            continue
        tokens = re.findall(r'\((\d+),(\d+),\d+\)([^()]*)', raw)
        raw_content = ''.join(token[2] for token in tokens)
        content = strip_singer_prefix(raw_content)
        prefix_remaining = len(raw_content) - len(content)
        if not HAN.search(content) or CREDIT.search(content):
            continue
        index = len(lines)
        lines.append({'time': int(header[1]) / 1000, 'text': content, 'playable': True})
        for begin, length, token in tokens:
            skip = min(prefix_remaining, len(token))
            prefix_remaining -= skip
            chars = HAN.findall(token[skip:])
            if not chars:
                continue
            if len(chars) != 1:
                raise ValueError('Native word timing contains multiple Chinese characters; use audio alignment instead.')
            words.extend(validate_intervals(chars, [[int(begin), int(begin) + int(length)]], 0, duration, index))
    if not words:
        raise ValueError('No Chinese character timestamps in YRC.')
    return lines, words

def decode(path):
    import imageio_ffmpeg
    import numpy as np
    result = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', str(path), '-f', 'f32le', '-ac', '1', '-ar', '16000', 'pipe:1'], check=True, capture_output=True)
    return np.frombuffer(result.stdout, dtype='<f4').copy()

def validate_intervals(chars, stamps, base, limit, line_index):
    if len(chars) != len(stamps):
        raise ValueError(f'Line {line_index}: {len(chars)} characters but {len(stamps)} intervals; correct the lyrics or provide isolated vocals.')
    words = []
    previous = -1
    for char, stamp in zip(chars, stamps):
        begin, finish = (base + float(value) / 1000 for value in stamp)
        if not (base <= begin < finish <= limit + .05) or begin < previous:
            raise ValueError(f'Line {line_index}: invalid character interval {stamp}; no estimated fallback was written.')
        previous = begin
        words.append({'char': char, 'start': round(begin, 4), 'end': round(min(finish, limit), 4), 'line': line_index})
    return words

def align_song(model, audio_path, lyric_path, output_path, title='', artist='', vocals=None):
    import librosa
    import numpy as np
    audio = decode(audio_path)
    voice = decode(vocals) if vocals else audio
    if abs(len(voice) - len(audio)) > 16000:
        raise ValueError('Vocal stem must keep the original audio time origin and duration.')
    duration = len(audio) / 16000
    lines = parse_lrc(lyric_path.read_text(encoding='utf-8-sig'), title, artist)
    if not any(line['playable'] for line in lines):
        raise ValueError('No timestamped Chinese lyrics found; supply an LRC for this recording.')
    words = []
    native = audio_path.with_suffix('.yrc')
    method = model.method
    native_ready = False
    if native.is_file():
        try:
            lines, words = parse_yrc(native.read_text(encoding='utf-8-sig'), duration)
            method = 'provider-character-timestamps'
            native_ready = True
        except ValueError:
            print('YRC is not character-level; aligning the matching LRC with audio instead.', flush=True)
    for i, line in enumerate(lines if not native_ready else []):
        if not line['playable'] or line['time'] >= duration:
            continue
        base = max(0, line['time'] - .7, words[-1]['start'] + .02 if words else 0)
        limit = min(duration, next((n['time'] for n in lines[i+1:] if n['time'] > line['time']), duration) + .5)
        chars = HAN.findall(line['text'])
        samples = voice[round(base * 16000):round(limit * 16000)]
        stamps, confidence = model.intervals(samples, chars)
        aligned = validate_intervals(chars, stamps, base, limit, i)
        for word in aligned:
            word['confidence'] = confidence
        if words:
            words[-1]['end'] = min(words[-1]['end'], aligned[0]['start'])
        words.extend(aligned)
        print(f'{audio_path.stem}: aligned line {i + 1}/{len(lines)} ({len(chars)} characters)', flush=True)
    # Percussive onset envelope and beat tracking stay separate from vocal alignment.
    _, percussion = librosa.effects.hpss(audio)
    onset = librosa.onset.onset_strength(y=percussion, sr=16000, hop_length=256)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=16000, hop_length=256, units='time')
    # Similar melodic contours (chroma + relative syllable rhythm) share a phrase ID.
    chroma = librosa.feature.chroma_stft(y=audio, sr=16000, hop_length=512)
    motifs = []
    for i, line in enumerate(lines):
        phrase = [w for w in words if w['line'] == i]
        if not phrase:
            continue
        a, b = phrase[0]['start'], phrase[-1]['end']
        indices = np.linspace(a * 16000 / 512, b * 16000 / 512, 24).astype(int).clip(0, chroma.shape[1] - 1)
        fingerprint = chroma[:, indices].flatten()
        fingerprint /= max(1e-9, np.linalg.norm(fingerprint))
        text = ''.join(w['char'] for w in phrase)
        found = next((j for j, (old_text, count, vector) in enumerate(motifs) if text == old_text or (len(phrase) == count and float(np.dot(vector, fingerprint)) > .94)), None)
        if found is None:
            found = len(motifs); motifs.append((text, len(phrase), fingerprint))
        line['melodyId'] = found
    suspicious = [i for i, word in enumerate(words) if word['end'] - word['start'] < .05 or word['end'] - word['start'] > 3]
    data = {'version': 2, 'duration': duration, 'method': method, 'beatMethod': 'librosa-hpss-beat-track',
            'audioSha256': hashlib.sha256(audio_path.read_bytes()).hexdigest(),
            'lyricSha256': hashlib.sha256(lyric_path.read_bytes()).hexdigest(),
            'bpm': float(np.asarray(tempo).reshape(-1)[0]), 'beats': [round(float(b), 4) for b in beats],
            'lines': lines, 'words': sorted(words, key=lambda w: w['start']),
            'review': {'required': bool(suspicious), 'unusualDurationIndices': suspicious,
                       'note': 'Automatic alignment; accompaniment and incorrect source lyrics may require listening review.'}}
    if not native_ready and method.startswith('whisperx'):
        from vocal_tails import separate_vocals, refine_tails
        print('Measuring vocal releases', flush=True)
        refine_tails(data, voice if vocals else separate_vocals(audio_path))
        suspicious = [i for i, word in enumerate(data['words']) if word['end'] - word['start'] < .05 or word['end'] - word['start'] > 3 or word.get('tailReview')]
        data['review']['unusualDurationIndices'] = suspicious
        data['review']['required'] = bool(suspicious)
    repair_known_timing(data)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = output_path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(output_path)
    print(f'Saved {output_path.name}: {len(words)} characters, {len(beats)} beats, {len(suspicious)} durations to review.', flush=True)
    return data

class LazyAligner:
    """Native timestamp imports do not need to load speech models."""
    def __init__(self, factory, method):
        self.factory, self.method, self.model = factory, method, None

    def intervals(self, samples, chars):
        if self.model is None:
            self.model = self.factory()
        return self.model.intervals(samples, chars)


def repair_known_timing(data):
    fixes = json.loads((Path(__file__).resolve().parents[1] / 'timing-corrections.json').read_text('utf8'))
    for fix in fixes:
        if data['audioSha256'] != fix['audioSha256']:
            continue
        for index, word in enumerate(data['words']):
            words = data['words'][index:index+len(fix['text'])]
            if ''.join(w['char'] for w in words) != fix['text']:
                continue
            def matches(times):
                return all(w['line'] == words[0]['line'] and round(w['start']*1000) == times[i]
                           and round(w['end']*1000) == times[i+1] for i,w in enumerate(words))
            if not (matches(fix['original']) or matches(fix['corrected'])):
                continue
            for i,w in enumerate(words):
                w.update(start=fix['corrected'][i]/1000, end=fix['corrected'][i+1]/1000,
                         timingCorrection=fix['method'])
            data['lines'][words[0]['line']]['time'] = fix['corrected'][0]/1000
            data['review'].update(required=True, correctedTimingIndices=list(range(index,index+len(words))))


def lite_chart(audio_path, lyric_path, output_path, title='', artist=''):
    import imageio_ffmpeg
    import numpy as np
    from lite_alignment import lite_words
    lines = parse_lrc(lyric_path.read_text(encoding='utf-8-sig'), title, artist)
    native = audio_path.with_suffix('.yrc')
    with tempfile.TemporaryDirectory(prefix='melody-pcm-') as folder:
        pcm = Path(folder) / 'mono.f32'
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', str(audio_path),
                        '-ac', '1', '-ar', '16000', '-f', 'f32le', str(pcm)], check=True)
        duration = pcm.stat().st_size / 64000
        method = 'lite-zipformer-ctc'
        words = []
        if native.is_file():
            try:
                lines, words = parse_yrc(native.read_text(encoding='utf-8-sig'), duration)
                method = 'provider-character-timestamps'
            except ValueError:
                pass
        if not words:
            audio = np.memmap(pcm, dtype='<f4', mode='r')
            try:
                words = lite_words(audio, lines, HAN.findall)
            finally:
                del audio
    if not words:
        raise ValueError('No playable timestamped Chinese lyrics.')
    for index, w in enumerate(words):
        if not 0 <= w['start'] < w['end'] <= duration + .0001:
            raise ValueError(f'Invalid lite interval at {index}')
    with audio_path.open('rb') as audio_file:
        digest = hashlib.file_digest(audio_file, 'sha256').hexdigest()
    review = [i for i,w in enumerate(words) if w.get('tailReview') or lines[w['line']].get('practiceOnly')
              or lines[w['line']].get('timingReview') or w['end']-w['start'] < .05 or w['end']-w['start'] > 3]
    data = dict(version=2, duration=duration, method=method, audioSha256=digest, lines=lines, words=words,
                bpm=0, beats=[], beatMethod='none', review=dict(required=bool(review), unusualDurationIndices=review))
    repair_known_timing(data)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp = output_path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf8')
    temp.replace(output_path)
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inspect-audio', type=Path)
    parser.add_argument('--audio', type=Path)
    parser.add_argument('--lyrics', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--vocals', type=Path)
    parser.add_argument('--library', type=Path)
    parser.add_argument('--backend', choices=['lite', 'whisperx', 'sofa', 'funasr'], default='lite')
    root = Path(__file__).resolve().parents[1]
    parser.add_argument('--sofa-dir', type=Path, default=root / '.tools/SOFA')
    parser.add_argument('--checkpoint', type=Path, default=root / '.models/sofa/pretrained_mandarin_singing/v1.0.0_mandarin_singing.ckpt')
    args = parser.parse_args()
    if args.inspect_audio:
        inspected = args.inspect_audio
        if args.output and args.output.resolve() != inspected.resolve():
            import imageio_ffmpeg
            temporary = args.output.with_suffix('.tmp.mp3')
            subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y', '-i', str(inspected), '-map', '0:a:0', '-codec:a', 'libmp3lame', '-q:a', '2', str(temporary)], check=True, capture_output=True, timeout=110)
            temporary.replace(args.output)
            inspected = args.output
        import imageio_ffmpeg
        with subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', str(inspected),
                               '-ac', '1', '-ar', '16000', '-f', 's16le', 'pipe:1'], stdout=subprocess.PIPE) as proc:
            size = sum(len(chunk) for chunk in iter(lambda: proc.stdout.read(65536), b''))
            if proc.wait():
                raise ValueError('Could not decode audio')
        if size < 3200:
            raise ValueError('Audio is empty or too short')
        print(json.dumps({'duration': size / 32000}))
        return
    if args.audio and (not args.lyrics or not args.output):
        parser.error('--audio requires --lyrics and --output')
    factory = lambda: (SofaAligner(args.sofa_dir, args.checkpoint) if args.backend == 'sofa' else
             WhisperXAligner(SofaAligner(args.sofa_dir, args.checkpoint)) if args.backend == 'whisperx' else FunAsrAligner())
    model = None if args.backend == 'lite' else LazyAligner(factory, {'sofa': 'sofa-mandarin-singing', 'whisperx': 'whisperx-zh-ctc-sofa-tail', 'funasr': 'funasr-fa-zh'}[args.backend])
    def build(audio, lyrics, output, title='', artist=''):
        if args.backend == 'lite':
            if args.vocals:
                parser.error('--vocals requires an advanced backend')
            return lite_chart(audio, lyrics, output, title, artist)
        return align_song(model, audio, lyrics, output, title, artist, args.vocals)
    if args.audio:
        build(args.audio, args.lyrics, args.output)
        return
    library_path = args.library or Path(__file__).resolve().parents[1] / 'media' / 'library.json'
    library = json.loads(library_path.read_text(encoding='utf-8-sig'))
    root = library_path.parent.parent
    for song in library:
        if song.get('available') is False:
            print(f"Skipping unavailable audio: {song['title']}", flush=True)
            continue
        audio_path = root / song['audio']
        output = audio_path.with_suffix('.chart.json')
        result = build(audio_path, root / song['lyrics'], output, song['title'], song['artist'])
        song['chart'] = './' + output.relative_to(root).as_posix()
        song['timing'] = result['method']
        song['bpm'] = result['bpm']
    temporary = library_path.with_suffix('.tmp')
    temporary.write_text(json.dumps(library, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(library_path)

if __name__ == '__main__':
    main()
