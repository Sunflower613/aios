// Original procedural soundtrack and stone foley; no downloads or autoplay needed.
export function createAudio(settings) {
  let context, effects, music, noise, windNoise, rollGain, weatherGain, weatherFilter, rumble, rollUntil = 0, timer, nextNote = 0, noteIndex = 0, unlocked = false, paused = false;
  const voices = new Set();
  function tone(frequency, when, length, volume, bus, type = 'sine') {
    const oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + .035);
    envelope.gain.exponentialRampToValueAtTime(.0001, when + length);
    oscillator.connect(envelope).connect(bus); voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(when); oscillator.stop(when + length + .02);
  }
  function schedule() {
    if (!context || paused || settings.musicVolume <= 0 || context.state !== 'running') return;
    const scale = [0, 7, 12, 16, 19, 16, 12, 7, 4, 11, 16, 19, 23, 19, 16, 11];
    nextNote = Math.max(nextNote, context.currentTime);
    while (nextNote < context.currentTime + .4) {
      const index = noteIndex++ % scale.length;
      tone(130.81 * 2 ** (scale[index] / 12), nextNote, 1.7, .055, music);
      if (index % 4 === 0) {
        const bass = index < 8 ? 65.405 : 82.407;
        tone(bass, nextNote, 3.1, .055, music);
        tone(bass * 3, nextNote, 2.6, .018, music, 'triangle');
      }
      nextNote += .6;
    }
  }
  function sync() {
    if (!context) return;
    effects.gain.cancelScheduledValues(context.currentTime);
    effects.gain.value = !paused && (settings.stoneVolume > 0 || settings.weatherVolume > 0) ? .8 : 0;
    if (rollGain && settings.stoneVolume === 0) { rollGain.gain.cancelScheduledValues(context.currentTime); rollGain.gain.value = 0; }
    music.gain.cancelScheduledValues(context.currentTime);
    music.gain.setTargetAtTime(!paused ? settings.musicVolume / 100 * .65 : 0, context.currentTime, .06);
    clearInterval(timer); timer = null;
    if (unlocked && !paused && settings.musicVolume > 0) { schedule(); timer = setInterval(schedule, 150); }
  }
  async function unlock() {
    if (settings.stoneVolume <= 0 && settings.weatherVolume <= 0 && settings.musicVolume <= 0) return;
    try {
      if (!context) {
        const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Audio) return;
        context = new Audio(); effects = context.createGain(); music = context.createGain();
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -12; compressor.knee.value = 16; compressor.ratio.value = 3;
        effects.connect(compressor); music.connect(compressor); compressor.connect(context.destination);
        noise = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
        windNoise = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
        const samples = noise.getChannelData(0), wind = windNoise.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < samples.length; i++) {
          const white = Math.random() * 2 - 1;
          brown = (brown + white * .025) / 1.025;
          samples[i] = brown * 4; wind[i] = white;
        }
        buildRollingBed();
      }
      paused = false; unlocked = true;
      if (context.state === 'suspended') await context.resume();
      sync();
    } catch { /* Audio is optional if a browser or device declines playback. */ }
  }
  function buildRollingBed() {
    // A continuous brown-noise axle rumble, with slow uneven amplitude modulation.
    // The low-pass removes the sharp scrape/click of the previous one-shot foley.
    rollGain = context.createGain(); rollGain.gain.value = 0; rollGain.connect(effects);
    const source = context.createBufferSource(), lowpass = context.createBiquadFilter();
    source.buffer = noise; source.loop = true; lowpass.type = 'lowpass'; lowpass.frequency.value = 260;
    const texture = context.createGain(); texture.gain.value = .8;
    source.connect(lowpass).connect(texture).connect(rollGain); source.start();
    const wobble = context.createOscillator(), depth = context.createGain();
    wobble.frequency.value = 6.5; depth.gain.value = .2;
    wobble.connect(depth).connect(texture.gain); wobble.start();
    rumble = context.createOscillator(); rumble.frequency.value = 54;
    const body = context.createGain(); body.gain.value = .12;
    rumble.connect(body).connect(rollGain); rumble.start();
    const breeze = context.createBufferSource(); breeze.buffer = windNoise; breeze.loop = true;
    weatherFilter = context.createBiquadFilter(); weatherFilter.type = 'lowpass'; weatherFilter.frequency.value = 450;
    weatherGain = context.createGain(); weatherGain.gain.value = 0;
    breeze.connect(weatherFilter).connect(weatherGain).connect(effects); breeze.start();
  }
  function pushSound() {
    if (!context || paused || settings.stoneVolume <= 0) return;
    rollUntil = context.currentTime + .45;
    roll(.8);
    rollGain.gain.setTargetAtTime(0, context.currentTime + .45, .08);
  }
  function roll(intensity) {
    if (!context || !rollGain) return;
    const remaining = Math.max(0, (rollUntil - context.currentTime) / .45);
    const volume = !paused ? Math.min(1, Math.max(intensity, remaining * .8)) * 1.6 * settings.stoneVolume / 100 : 0;
    rollGain.gain.cancelScheduledValues(context.currentTime);
    rollGain.gain.setTargetAtTime(volume, context.currentTime, .065);
    rumble.frequency.setTargetAtTime(48 + volume * 18, context.currentTime, .15);
  }
  function weather(kind, inGame = true) {
    if (!context || !weatherGain) return;
    const rain = kind === 'rain' || kind === 'storm';
    const volume = !paused && inGame ? (rain ? .06 : kind === 'wind' || kind === 'snow' ? .03 : 0) * settings.weatherVolume / 100 : 0;
    weatherGain.gain.setTargetAtTime(volume, context.currentTime, .35);
    weatherFilter.frequency.setTargetAtTime(rain ? 1700 : 380, context.currentTime, .3);
  }
  function stopRolling() {
    rollUntil = 0;
    if (rollGain) { rollGain.gain.cancelScheduledValues(context.currentTime); rollGain.gain.value = 0; }
    if (weatherGain) { weatherGain.gain.cancelScheduledValues(context.currentTime); weatherGain.gain.value = 0; }
  }
  function pause() {
    paused = true; stopRolling(); clearInterval(timer); timer = null;
    if (!context) return;
    effects.gain.cancelScheduledValues(context.currentTime); music.gain.cancelScheduledValues(context.currentTime);
    effects.gain.value = 0; music.gain.value = 0;
    for (const voice of voices) { try { voice.stop(); } catch { /* Already ended. */ } }
    nextNote = context.currentTime;
  }
  return { unlock, sync, push: pushSound, roll, weather, stopRolling, pause };
}
