"""CPU-only known-lyric alignment for the Chinese streaming Zipformer CTC model."""
import numpy as np

from setup_lite import MODEL

# Icefall byte-BPE alphabet: printable ASCII plus NFKC-stable extended letters.
_BYTE_CHARS = tuple(map(chr, [*range(256, 288), *range(32, 127),
                             *[i for i in range(288, 423) if i not in (306, 307, 319, 320, 329, 383)]]))


def ctc_path(logp, tokens):
    """Best monotone CTC path; equal adjacent tokens must pass through blank."""
    labels = np.zeros(len(tokens) * 2 + 1, dtype=int)
    labels[1::2] = tokens
    skip = np.zeros(len(labels), dtype=bool)
    skip[2:] = (labels[2:] != 0) & (labels[2:] != labels[:-2])
    scores = np.full(len(labels), -np.inf)
    scores[0] = 0
    trace = np.empty((len(logp), len(labels)), np.uint8)
    for i, frame in enumerate(logp):
        moves = np.stack((scores, np.r_[-np.inf, scores[:-1]],
                          np.where(skip, np.r_[-np.inf, -np.inf, scores[:-2]], -np.inf)))
        trace[i] = moves.argmax(axis=0)
        scores = moves.max(axis=0) + frame[labels]
    state = len(labels) - 2 + int(scores[-1] > scores[-2])
    if not np.isfinite(scores[state]):
        return None
    path = np.empty(len(logp), int)
    for i in reversed(range(len(logp))):
        path[i] = state
        state -= trace[i, state]
    return path


class LiteAligner:
    def __init__(self):
        import kaldi_native_fbank as knf
        import onnxruntime as ort
        import sentencepiece as sp
        if not (MODEL / 'model.int8.onnx').is_file():
            raise FileNotFoundError('Lite model missing. Run scripts/setup_lite.py.')
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 1
        opts.inter_op_num_threads = 1
        self.session = ort.InferenceSession(str(MODEL / 'model.int8.onnx'), opts, providers=['CPUExecutionProvider'])
        self.tokenizer = sp.SentencePieceProcessor(model_file=str(MODEL / 'bbpe.model'))
        self.meta = self.session.get_modelmeta().custom_metadata_map
        self.fbank = knf.FbankOptions()
        self.fbank.frame_opts.dither = 0
        self.fbank.frame_opts.snip_edges = False
        self.fbank.mel_opts.num_bins = 80
        self.fbank.mel_opts.high_freq = -400
        self.inputs = self.session.get_inputs()

    def posteriors(self, samples):
        import kaldi_native_fbank as knf
        bank = knf.OnlineFbank(self.fbank)
        bank.accept_waveform(16000, samples)
        bank.input_finished()
        frames = np.stack([bank.get_frame(i) for i in range(bank.num_frames_ready)])
        step, window = int(self.meta['decode_chunk_len']), int(self.meta['T'])
        features = np.pad(frames, ((0, window), (0, 0)), constant_values=np.log(1e-10))
        states = [np.zeros([d if isinstance(d, int) else 1 for d in inp.shape],
                           np.int64 if inp.type == 'tensor(int64)' else np.float32) for inp in self.inputs[1:]]
        chunks = []
        for i in range(0, len(frames), step):
            args = [features[None, i:i+window], *states]
            probs, *states = self.session.run(None, dict(zip([inp.name for inp in self.inputs], args)))
            chunks.append(probs[0])
        hop = .01 * step / len(chunks[0])
        return np.concatenate(chunks)[:int(np.ceil(len(samples) / (16000 * hop)))], hop

    def intervals(self, samples, chars):
        if not chars or len(chars) > 256 or len(samples) < 400:
            return None
        pieces = [self.tokenizer.encode(''.join(_BYTE_CHARS[b] for b in char.encode('utf8'))) for char in chars]
        tokens = [part for word in pieces for part in word]
        if len(tokens) > len(samples) // 160 or 2 in tokens:
            return None
        probs, hop = self.posteriors(samples)
        path = ctc_path(probs, tokens)
        if path is None or not np.isfinite(probs).all():
            return None
        spans = []
        pos = 0
        for word in pieces:
            start = np.searchsorted(path, 2 * pos + 1)
            pos += len(word)
            end = np.searchsorted(path, 2 * pos - 1, side='right')
            frames = np.arange(start, end)
            voiced = frames[path[frames] % 2 == 1]
            score = np.exp(probs[voiced, np.asarray(tokens)[path[voiced] // 2]].mean())
            spans.append((start * hop, min(end * hop, len(samples)/16000), float(score)))
        return spans

def held_release(samples, anchor):
    """Follow a contiguous, similar voiced spectrum past the final CTC token."""
    frame, hop = 640, 320
    begin = max(0, anchor - frame)
    if len(samples) - begin < frame * 3:
        return None
    frames = np.lib.stride_tricks.sliding_window_view(samples[begin:], frame)[::hop]
    # Subtract the low-energy spectral floor to suppress steady accompaniment.
    spectrum = abs(np.fft.rfft(frames * np.hanning(frame)))[:, 4:121]
    spectrum = np.sqrt(np.maximum(0, spectrum - np.percentile(spectrum, 20, axis=0)))
    norm = np.linalg.norm(spectrum, axis=1)
    unit = spectrum / np.maximum(norm[:, None], 1e-8)
    ref = unit[:3].mean(axis=0)
    level = np.median(norm[:3])
    if level < .1:
        return None
    ref /= max(np.linalg.norm(ref), 1e-8)
    weak = 0
    for i, vector in enumerate(unit):
        if norm[i] < level * .35 or np.dot(vector, ref) < .62:
            weak += 1
            if weak == 6:
                return max(anchor, begin + (i - weak + 1) * hop)
        else:
            weak = 0
    return None  # No audible release before the search limit.


def lite_words(audio, lines, find_chars):
    model = LiteAligner()
    duration = len(audio) / 16000
    words = []
    last_anchor = 0
    for i, line in enumerate(lines):
        t = line['time']
        if not line['playable'] or t >= duration:
            continue
        chars = find_chars(line['text'])
        boundary = next((l['time'] for l in lines[i+1:] if l['time'] > t), duration)
        start = max(0, t - .7, last_anchor)
        stop = min(duration, boundary + .5, t + min(60, max(8, 1.2 * len(chars) + 2)))
        samples = audio[round(start*16000):round(stop*16000)]
        spans = model.intervals(samples, chars) if start < stop else None
        if not spans:
            line['practiceOnly'] = True
            # A single line cue retains the lyric in practice mode without invented character times.
            cue = max(last_anchor, t)
            if cue + .04 <= duration:
                words.append(dict(char=chars[0], line=i, start=cue, end=cue+.04, tailReview=True))
                last_anchor = cue + .04
            continue
        onset = [round(start + s, 4) for s, _, _ in spans]
        for j, (s, e, score) in enumerate(spans):
            end = onset[j+1] if j+1 < len(chars) else min(duration, start+e)
            words.append(dict(char=chars[j], line=i, start=onset[j], end=round(end, 4), confidence=round(score, 4)))
        last_anchor = min(duration, onset[-1] + .02)
        score = float(np.median([s[2] for s in spans]))
        if score < .04:
            line['timingReview'] = True
        if score < .001 or onset[0] > t+1.2:
            line['practiceOnly'] = True
        print(f'aligned line {i+1}/{len(lines)}', flush=True)
    for j, word in enumerate(words):
        if j+1 < len(words) and words[j+1]['line'] == word['line']:
            continue
        bound = words[j+1]['start'] if j+1 < len(words) else duration
        word['end'] = min(word['end'], bound)
        if word.get('tailReview'):
            continue
        start = round(word['start']*16000)
        end = round(word['end']*16000)
        limit = min(round(bound*16000), end+12*16000)
        release = held_release(audio[start:limit], end-start)
        if release is None:
            word['tailReview'] = True
        else:
            word['end'] = round(min(bound, (start+release)/16000), 4)
    return words
