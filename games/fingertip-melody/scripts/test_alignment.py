import unittest
from align import parse_lrc, parse_yrc, validate_intervals, whisperx_intervals, merge_singing_tail, LazyAligner

class AlignmentTests(unittest.TestCase):
    def test_vocal_release_stops_at_silence_and_keeps_onsets(self):
        import numpy as np
        from vocal_tails import vocal_release, refine_tails
        voice = np.concatenate([np.full(8000, .1), np.zeros(4800), np.full(8000, .1)])
        self.assertAlmostEqual(vocal_release(voice), .52, delta=.04)
        self.assertIsNone(vocal_release(np.zeros(16000)))
        data = {'duration': 1.3, 'lines': [{'text': '花'}], 'words': [{'char': '花', 'line': 0, 'start': 0, 'end': .02}]}
        refine_tails(data, voice)
        self.assertEqual(data['words'][0]['start'], 0)
        self.assertLess(data['words'][0]['end'], .6)
        self.assertGreater(data['words'][0]['end'], .4)
    def test_native_import_does_not_load_models(self):
        calls = []
        class Fake:
            def intervals(self, samples, chars):
                return chars
        def factory():
            calls.append(True)
            return Fake()
        model = LazyAligner(factory, 'test-method')
        self.assertEqual(model.method, 'test-method')
        self.assertEqual(calls, [])
        self.assertEqual(model.intervals([], '花'), '花')
        model.intervals([], '开')
        self.assertEqual(len(calls), 1)
    def test_singing_tail_keeps_ctc_onsets_and_rejects_disagreement(self):
        original = [[100, 200], [600, 620]]
        self.assertEqual(merge_singing_tail(original, [[110, 250], [650, 1400]], 1500), [[100, 200], [600, 1400]])
        self.assertEqual(merge_singing_tail(original, [[110, 250], [1250, 1400]], 1500), original)
        self.assertEqual(merge_singing_tail(original, [[110, 250], [650, 1700]], 1500), original)
    def test_whisperx_requires_real_character_timestamps(self):
        result = {'segments': [{'chars': [{'char': '花', 'start': .1, 'end': .2, 'score': .9}, {'char': '开', 'start': .3, 'end': .6, 'score': .7}]}]}
        stamps, score = whisperx_intervals(result, '花开')
        self.assertEqual(stamps, [[100, 200], [300, 600]])
        self.assertAlmostEqual(score, .8)
        with self.assertRaises(ValueError):
            whisperx_intervals(result, '花落')
        del result['segments'][0]['chars'][1]['start']
        with self.assertRaises(ValueError):
            whisperx_intervals(result, '花开')
    def test_credits_and_offset(self):
        self.assertFalse(parse_lrc('[00:00.4]编曲 Music Arranged by：阿瑞')[0]['playable'])
        self.assertFalse(parse_lrc('[03:41.15]《海南话 黎族话》')[0]['playable'])
        lines = parse_lrc('[offset:-100]\n[00:01]花开\n[00:02]某某音乐有限公司\n[00:03]歌手：某某\n[00:04]出品：音乐\n[00:05]OP:某某')
        self.assertEqual([line['time'] for line in lines if line['playable']], [.9])
    def test_intervals_preserved(self):
        words = validate_intervals('花开', [[100, 200], [400, 1100]], 2, 5, 0)
        self.assertEqual([(w['start'], w['end']) for w in words], [(2.1, 2.2), (2.4, 3.1)])
    def test_native_character_timing_and_credits(self):
        lines, words = parse_yrc('[1000,1000](1000,200,0)花(1200,800,0)开\n[3000,500](3000,500,0)合声：甲', 5)
        self.assertEqual([w['end'] - w['start'] for w in words], [.19999999999999996, .8])
        self.assertEqual(len(lines), 1)
        self.assertFalse(parse_lrc('[00:01]小号：王某')[0]['playable'])
        with self.assertRaises(ValueError):
            parse_yrc('[1000,1000](1000,1000,0)花开', 5)
    def test_missing_or_invalid_output_is_not_filled_with_estimates(self):
        for stamps in ([[0, 100]], [[0, 0], [100, 200]], [[0, 100], [100, 99999]]):
            with self.assertRaises(ValueError):
                validate_intervals('花开', stamps, 0, 2, 0)

if __name__ == '__main__':
    unittest.main()
