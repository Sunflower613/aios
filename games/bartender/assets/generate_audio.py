import wave
import struct
import math
import random

SAMPLE_RATE = 44100

def write_wav(filename, samples, sample_rate=SAMPLE_RATE):
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        max_val = max(abs(s) for s in samples) if samples else 1.0
        if max_val == 0:
            max_val = 1.0
        scale = 28000.0 / max(max_val, 1.0)
        
        frames = bytearray()
        for s in samples:
            val = int(s * scale)
            val = max(-32767, min(32767, val))
            frames.extend(struct.pack('<h', val))
        wav_file.writeframes(frames)

# 1. 倒水声：纯净温润的气泡咕嘟声 (Soft Bubble Glug & Plops, 绝无刺耳白噪)
def gen_pour():
    duration = 0.85
    total_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * total_samples
    
    # 连续 6 串温润的咕嘟气泡 (频率 280Hz ~ 520Hz 向上微滑)
    bubble_offsets = [0.04, 0.16, 0.28, 0.42, 0.55, 0.68]
    base_freqs = [260, 310, 290, 360, 340, 420]
    
    for idx, b_time in enumerate(bubble_offsets):
        start_idx = int(b_time * SAMPLE_RATE)
        b_len = int(0.12 * SAMPLE_RATE)
        f_start = base_freqs[idx]
        f_end = f_start + 180.0
        
        for j in range(b_len):
            if start_idx + j < total_samples:
                t = j / SAMPLE_RATE
                # 柔和的钟形包络
                env = math.sin(math.pi * (j / b_len)) * math.exp(-t * 18.0)
                # 正弦基波 + 微弱二次泛音（模拟圆润水体空腔共鸣）
                cur_f = f_start + (f_end - f_start) * (t / 0.12)
                tone = math.sin(2 * math.pi * cur_f * t) + 0.25 * math.sin(2 * math.pi * cur_f * 2 * t)
                samples[start_idx + j] += tone * env * 0.65

    # 底部加入极弱的柔和低频水流晃动 (120Hz ~ 180Hz 暖底音)
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * (i / total_samples)) ** 2
        body = math.sin(2 * math.pi * 140.0 * t) * 0.08 * env
        samples[i] += body

    write_wav('d:/code/bartender/assets/audio/pour.wav', samples)

# 3. 糖果/软料落水 (Jelly/candy plop)
def gen_jelly():
    duration = 0.3
    total_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * total_samples
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 18.0) * math.sin(math.pi * (i / total_samples))
        f = 520.0 - t * 900.0
        samples[i] = math.sin(2 * math.pi * max(120, f) * t) * env * 0.5
    write_wav('d:/code/bartender/assets/audio/jelly.wav', samples)

# 金币掉落入袋叮当声 (Coins clink & chime)
def gen_coin():
    duration = 0.55
    total_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * total_samples
    notes = [1760.0, 2349.32, 2793.83, 3520.0] # A6, D7, F7, A7
    for idx, f in enumerate(notes):
        offset = int(idx * 0.04 * SAMPLE_RATE)
        for i in range(total_samples - offset):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 14.0)
            tone = math.sin(2 * math.pi * f * t) + 0.35 * math.sin(2 * math.pi * f * 2 * t)
            samples[offset + i] += tone * env * 0.3
    write_wav('d:/code/bartender/assets/audio/coin.wav', samples)

# 2. 超长 64 秒木吉他指弹独奏与盛夏傍晚蝉鸣 BGM (64-Second Cozy Evening Guitar & Cicadas)
def gen_bgm():
    duration = 64.0  # 64秒超长旋律循环
    total_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * total_samples

    # ========================================================
    # A. 盛夏傍晚自然的蝉鸣与晚风环境声 (自然起伏呼吸感)
    # ========================================================
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # 慢周期自然起伏 (周期 3.8秒 和 7.5秒的群鸣潮汐)
        cicada_breath = (math.sin(2 * math.pi * 0.26 * t) ** 2) * 0.12 + (math.sin(2 * math.pi * 0.13 * t) ** 2) * 0.07 + 0.03
        tremolo = math.sin(2 * math.pi * 38.0 * t)
        carrier = math.sin(2 * math.pi * 5100.0 * t) + 0.45 * math.sin(2 * math.pi * 6200.0 * t)
        cicada = carrier * (0.6 + 0.4 * tremolo) * cicada_breath * 0.12
        
        # 傍晚微风自然底噪
        breeze = (random.random() * 2 - 1) * 0.015 * (0.7 + 0.3 * math.sin(2 * math.pi * 0.1 * t))
        samples[i] += cicada + breeze

    # ========================================================
    # B. 64 秒完整木吉他独奏指弹 (慢速 68 BPM，优美抒情 4 段式)
    # ========================================================
    # 定义完整吉他谱曲库 (频率, 开始时间秒, 持续时间, 强度)
    guitar_score = [
        # --- Section 1: 晚风初临 (0.0s ~ 16.0s) ---
        # [Cmaj7]
        (130.81, 0.0, 4.0, 0.7),   # C3
        (261.63, 0.6, 2.5, 0.5),   # C4
        (329.63, 1.2, 2.5, 0.5),   # E4
        (392.00, 1.8, 2.5, 0.55),  # G4
        (493.88, 2.4, 2.8, 0.6),   # B4
        (392.00, 3.2, 1.8, 0.45),  # G4
        
        # [Am9]
        (110.00, 4.0, 4.0, 0.7),   # A2
        (220.00, 4.6, 2.5, 0.5),   # A3
        (329.63, 5.2, 2.5, 0.5),   # E4
        (493.88, 5.8, 2.5, 0.55),  # B4
        (523.25, 6.4, 2.8, 0.65),  # C5
        (440.00, 7.2, 1.8, 0.45),  # A4
        
        # [Dm7]
        (146.83, 8.0, 4.0, 0.7),   # D3
        (293.66, 8.6, 2.5, 0.5),   # D4
        (349.23, 9.2, 2.5, 0.5),   # F4
        (440.00, 9.8, 2.5, 0.55),  # A4
        (523.25, 10.4, 2.8, 0.6),  # C5
        (349.23, 11.2, 1.8, 0.45), # F4
        
        # [G7sus4 -> G7]
        (98.00,  12.0, 4.0, 0.7),  # G2
        (293.66, 12.6, 2.5, 0.5),  # D4
        (392.00, 13.2, 2.5, 0.5),  # G4
        (493.88, 13.8, 2.5, 0.55), # B4
        (587.33, 14.4, 2.8, 0.6),  # D5
        (493.88, 15.2, 1.8, 0.45), # B4

        # --- Section 2: 暮色微醺 (16.0s ~ 32.0s) ---
        # [Em7]
        (164.81, 16.0, 4.0, 0.7),  # E3
        (329.63, 16.6, 2.5, 0.5),  # E4
        (392.00, 17.2, 2.5, 0.5),  # G4
        (493.88, 17.8, 2.5, 0.6),  # B4
        (659.25, 18.4, 3.0, 0.65), # E5
        (493.88, 19.2, 1.8, 0.45), # B4
        
        # [A7(b13)]
        (110.00, 20.0, 4.0, 0.7),  # A2
        (277.18, 20.6, 2.5, 0.5),  # C#4
        (329.63, 21.2, 2.5, 0.5),  # E4
        (440.00, 21.8, 2.5, 0.55), # A4
        (554.37, 22.4, 2.8, 0.65), # C#5
        (440.00, 23.2, 1.8, 0.45), # A4
        
        # [Dm9]
        (146.83, 24.0, 4.0, 0.7),  # D3
        (293.66, 24.6, 2.5, 0.5),  # D4
        (349.23, 25.2, 2.5, 0.5),  # F4
        (440.00, 25.8, 2.5, 0.55), # A4
        (659.25, 26.4, 3.2, 0.7),  # E5 (主音点缀)
        (523.25, 27.2, 2.0, 0.5),  # C5
        
        # [G13 -> G7]
        (98.00,  28.0, 4.0, 0.7),  # G2
        (293.66, 28.6, 2.5, 0.5),  # D4
        (440.00, 29.2, 2.5, 0.55), # A4
        (493.88, 29.8, 2.5, 0.6),  # B4
        (587.33, 30.4, 2.8, 0.6),  # D5
        (392.00, 31.2, 1.8, 0.45), # G4

        # --- Section 3: 星光亮起 (32.0s ~ 48.0s) ---
        # [Fmaj7]
        (174.61, 32.0, 4.0, 0.75), # F3
        (261.63, 32.6, 2.5, 0.5),  # C4
        (349.23, 33.2, 2.5, 0.5),  # F4
        (440.00, 33.8, 2.5, 0.6),  # A4
        (523.25, 34.4, 3.0, 0.7),  # C5
        (440.00, 35.2, 1.8, 0.45), # A4
        
        # [Em7]
        (164.81, 36.0, 4.0, 0.7),  # E3
        (329.63, 36.6, 2.5, 0.5),  # E4
        (392.00, 37.2, 2.5, 0.5),  # G4
        (493.88, 37.8, 2.5, 0.55), # B4
        (587.33, 38.4, 2.8, 0.65), # D5
        (392.00, 39.2, 1.8, 0.45), # G4
        
        # [Dm7]
        (146.83, 40.0, 4.0, 0.7),  # D3
        (293.66, 40.6, 2.5, 0.5),  # D4
        (349.23, 41.2, 2.5, 0.5),  # F4
        (440.00, 41.8, 2.5, 0.55), # A4
        (523.25, 42.4, 2.8, 0.6),  # C5
        (349.23, 43.2, 1.8, 0.45), # F4
        
        # [E7 -> Am7]
        (164.81, 44.0, 2.0, 0.7),  # E3
        (329.63, 44.5, 1.8, 0.5),  # E4
        (415.30, 45.0, 1.8, 0.55), # G#4
        (110.00, 45.8, 3.5, 0.75), # A2
        (440.00, 46.4, 2.5, 0.6),  # A4
        (523.25, 47.0, 2.8, 0.65), # C5

        # --- Section 4: 归于宁静 (48.0s ~ 64.0s) ---
        # [Fmaj7]
        (174.61, 48.0, 4.0, 0.7),  # F3
        (349.23, 48.6, 2.5, 0.5),  # F4
        (440.00, 49.2, 2.5, 0.55), # A4
        (523.25, 49.8, 2.5, 0.6),  # C5
        (659.25, 50.4, 3.2, 0.7),  # E5
        
        # [G7sus4]
        (98.00,  52.0, 4.0, 0.7),  # G2
        (293.66, 52.6, 2.5, 0.5),  # D4
        (392.00, 53.2, 2.5, 0.55), # G4
        (587.33, 53.8, 2.8, 0.65), # D5
        (493.88, 54.6, 2.0, 0.5),  # B4
        
        # [Cmaj9 终章与泛音]
        (130.81, 56.0, 7.5, 0.8),  # C3 长根音
        (261.63, 56.6, 5.0, 0.55), # C4
        (329.63, 57.2, 5.0, 0.55), # E4
        (392.00, 57.8, 5.0, 0.6),  # G4
        (493.88, 58.4, 5.0, 0.65), # B4
        (587.33, 59.2, 5.0, 0.7),  # D5 (9音)
        # 12品自然泛音回响 (C5 / G5 / E6)
        (523.25, 60.5, 3.5, 0.5),  # 泛音 C5
        (783.99, 61.2, 3.5, 0.45), # 泛音 G5
        (1318.5, 62.0, 3.0, 0.35), # 泛音 E6
    ]

    # 合成吉他音符
    for freq, start_t, dur, vel in guitar_score:
        start_idx = int(start_t * SAMPLE_RATE)
        dur_samples = int(dur * SAMPLE_RATE)
        for j in range(dur_samples):
            idx = (start_idx + j) % total_samples
            jt = j / SAMPLE_RATE
            decay = math.exp(-jt * 2.5)
            tone = (math.sin(2 * math.pi * freq * jt) + 
                    0.55 * math.sin(2 * math.pi * freq * 2 * jt) * math.exp(-jt * 3.2) + 
                    0.28 * math.sin(2 * math.pi * freq * 3 * jt) * math.exp(-jt * 4.8) +
                    0.12 * math.sin(2 * math.pi * freq * 4 * jt) * math.exp(-jt * 6.5))
            pick = math.exp(-jt * 45.0) * (random.random() * 2 - 1) * 0.12
            samples[idx] += (tone + pick) * decay * vel * 0.38

    write_wav('d:/code/bartender/assets/audio/bgm_guitar_cicada.wav', samples)

if __name__ == '__main__':
    print("重新生成优化后的温润咕嘟倒水声和超长 64 秒吉他蝉鸣 BGM...")
    gen_pour()
    gen_bgm()
    print("完成！")
