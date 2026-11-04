import unittest
import json
from pathlib import Path
import numpy as np
from align import repair_known_timing
from lite_alignment import ctc_path, held_release, _BYTE_CHARS


class LiteTests(unittest.TestCase):
    def test_known_yrc_fix_is_scoped_to_the_recording_and_exact_sequence(self):
        fix = json.loads((Path(__file__).resolve().parents[1] / 'timing-corrections.json').read_text('utf8'))[0]
        data = dict(audioSha256='different', lines=[{}], review={}, words=[
            dict(char=c, line=0, start=fix['original'][i]/1000, end=fix['original'][i+1]/1000)
            for i,c in enumerate(fix['text'])])
        repair_known_timing(data)
        self.assertEqual(data['words'][0]['start'], 207.35)
        data['audioSha256'] = fix['audioSha256']
        repair_known_timing(data)
        self.assertEqual(data['words'][0]['start'], 207.6)
        self.assertEqual(data['words'][-1]['end'], 213.06)
        self.assertTrue(data['review']['required'])
        data['words'][0]['start'] += .01
        repair_known_timing(data)
        self.assertAlmostEqual(data['words'][0]['start'], 207.61)

    def test_byte_alphabet_and_repeated_ctc_labels(self):
        self.assertEqual(len(set(_BYTE_CHARS)), 256)
        p = np.log(np.array([[.01,.99],[.99,.01],[.01,.99]]))
        self.assertEqual(ctc_path(p, [1,1]).tolist(), [1,2,3])
        self.assertIsNone(ctc_path(p[:1], [1,1]))

    def test_path_may_start_after_leading_blank(self):
        p = np.log(np.array([[.99,.01],[.99,.01],[.01,.99],[.99,.01]]))
        self.assertEqual(ctc_path(p, [1]).tolist(), [0,0,1,2])

    def test_release_stops_before_next_sound(self):
        tone = .2*np.sin(2*np.pi*220*np.arange(16000)/16000)
        samples = np.concatenate([tone, np.zeros(8000), tone])
        release = held_release(samples, 3200)
        self.assertIsNotNone(release)
        self.assertGreater(release, 14000)
        self.assertLess(release, 18000)
        self.assertIsNone(held_release(np.zeros(16000), 1000))


if __name__ == '__main__':
    unittest.main()
