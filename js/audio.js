/* Original Web Audio library inspired by Mandela Catalogue atmosphere.
   Does NOT include copyrighted audio from the series. */
const ArchiveAudio = (() => {
  let ctx = null;
  let master = null;
  let humOsc = null;
  let humGain = null;
  let noiseNode = null;
  let noiseGain = null;
  let choirNodes = [];
  let choirGain = null;
  let heartTimer = null;
  let phoneOsc = null;
  let phoneGain = null;
  let started = false;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.38;
    master.connect(ctx.destination);
    return ctx;
  }

  function createNoiseBuffer(seconds = 2) {
    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function envGain(peak = 0.1, attack = 0.02, hold = 0.1, release = 0.3) {
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + attack);
    g.gain.setValueAtTime(peak, now + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, now + attack + hold + release);
    return g;
  }

  async function start() {
    ensure();
    if (!ctx || started) return;
    if (ctx.state === "suspended") await ctx.resume();

    humOsc = ctx.createOscillator();
    humOsc.type = "sine";
    humOsc.frequency.value = 58;
    humGain = ctx.createGain();
    humGain.gain.value = 0.04;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = "lowpass";
    humFilter.frequency.value = 180;
    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(master);
    humOsc.start();

    const noiseBuffer = createNoiseBuffer(2);
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.01;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1200;
    band.Q.value = 0.7;
    noiseNode.connect(band);
    band.connect(noiseGain);
    noiseGain.connect(master);
    noiseNode.start();

    // Soft distorted "choir" pad — signature analog-horror texture
    choirGain = ctx.createGain();
    choirGain.gain.value = 0.012;
    const choirFilter = ctx.createBiquadFilter();
    choirFilter.type = "bandpass";
    choirFilter.frequency.value = 620;
    choirFilter.Q.value = 0.8;
    choirGain.connect(choirFilter);
    choirFilter.connect(master);
    [196, 247, 294, 370].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = freq;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4 + i;
      lfo.connect(lfoGain);
      lfoGain.connect(o.frequency);
      o.connect(choirGain);
      o.start();
      lfo.start();
      choirNodes.push(o, lfo);
    });

    started = true;
  }

  function setIntensity(level = 0) {
    if (!started || muted) return;
    const n = Math.max(0, Math.min(1, level));
    if (noiseGain) noiseGain.gain.setTargetAtTime(0.01 + n * 0.05, ctx.currentTime, 0.2);
    if (humGain) humGain.gain.setTargetAtTime(0.04 + n * 0.035, ctx.currentTime, 0.2);
    if (choirGain) choirGain.gain.setTargetAtTime(0.012 + n * 0.04, ctx.currentTime, 0.35);
  }

  function blip(freq = 880, dur = 0.08, gain = 0.08) {
    if (!started || muted) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(master);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur + 0.02);
  }

  function staticBurst(dur = 0.35, gain = 0.16) {
    if (!started || muted) return;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(Math.max(0.2, dur));
    const g = envGain(gain, 0.01, dur * 0.3, dur * 0.6);
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 800;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start();
    src.stop(ctx.currentTime + dur + 0.05);
  }

  function sting() {
    if (!started || muted) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(90, now);
    o.frequency.exponentialRampToValueAtTime(40, now + 0.55);
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    o.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 0.75);
    staticBurst(0.4, 0.18);
  }

  function choirSwell(seconds = 2.2) {
    if (!started || muted || !choirGain) return;
    const now = ctx.currentTime;
    const base = choirGain.gain.value;
    choirGain.gain.cancelScheduledValues(now);
    choirGain.gain.setValueAtTime(base, now);
    choirGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
    choirGain.gain.linearRampToValueAtTime(base, now + seconds);
    // dissonant overtone
    const o = ctx.createOscillator();
    const g = envGain(0.05, 0.3, seconds * 0.4, seconds * 0.4);
    o.type = "sine";
    o.frequency.setValueAtTime(666, now);
    o.frequency.linearRampToValueAtTime(440, now + seconds);
    o.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + seconds + 0.1);
  }

  function whisper(seconds = 1.6) {
    if (!started || muted) return;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(seconds);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 2.5;
    const g = envGain(0.07, 0.15, seconds * 0.4, seconds * 0.4);
    // amplitude modulation for "speech-like" texture
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 7.5;
    lfoG.gain.value = 0.045;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start();
    lfo.start();
    src.stop(ctx.currentTime + seconds);
    lfo.stop(ctx.currentTime + seconds);
  }

  function knock(times = 3) {
    if (!started || muted) return;
    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        if (!started || muted) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 90 + Math.random() * 20;
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.28, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        o.connect(g);
        g.connect(master);
        o.start(now);
        o.stop(now + 0.2);
        staticBurst(0.05, 0.04);
      }, i * 420);
    }
  }

  function scratch(seconds = 1.2) {
    if (!started || muted) return;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(seconds);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(400, ctx.currentTime);
    bp.frequency.linearRampToValueAtTime(2400, ctx.currentTime + seconds);
    bp.Q.value = 8;
    const g = envGain(0.09, 0.05, seconds * 0.5, seconds * 0.35);
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start();
    src.stop(ctx.currentTime + seconds);
  }

  function tapeRewind(seconds = 1.1) {
    if (!started || muted) return;
    const o = ctx.createOscillator();
    const g = envGain(0.07, 0.05, 0.2, seconds * 0.7);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(120, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + seconds);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + seconds + 0.05);
    staticBurst(seconds * 0.6, 0.06);
  }

  function heartbeat(times = 4) {
    if (!started || muted) return;
    stopHeartbeat();
    let n = 0;
    const beat = () => {
      if (!started || muted || n >= times) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 55;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      o.connect(g);
      g.connect(master);
      o.start(now);
      o.stop(now + 0.15);
      // double thump
      setTimeout(() => {
        if (!started || muted) return;
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = "sine";
        o2.frequency.value = 45;
        const t = ctx.currentTime;
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o2.connect(g2);
        g2.connect(master);
        o2.start(t);
        o2.stop(t + 0.16);
      }, 140);
      n += 1;
      if (n < times) heartTimer = setTimeout(beat, 780);
    };
    beat();
  }

  function stopHeartbeat() {
    if (heartTimer) {
      clearTimeout(heartTimer);
      heartTimer = null;
    }
  }

  function emergencyTone() {
    if (!started || muted) return;
    const now = ctx.currentTime;
    [853, 960].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
      g.gain.setValueAtTime(0.06, now + 1.4);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      o.connect(g);
      g.connect(master);
      o.start(now + i * 0.01);
      o.stop(now + 1.85);
    });
  }

  function thinkOfSomeone() {
    // Original eerie motif — not a rip of series audio
    if (!started || muted) return;
    const notes = [220, 247, 196, 165, 147];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.55;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.75);
    });
    setTimeout(() => whisper(1.8), 400);
  }

  function gabriel() {
    // Deep distorted "false angel" presence
    if (!started || muted) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o2.type = "square";
    o.frequency.setValueAtTime(70, now);
    o.frequency.linearRampToValueAtTime(48, now + 2.2);
    o2.frequency.setValueAtTime(71.5, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 320;
    o.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(master);
    o.start(now);
    o2.start(now);
    o.stop(now + 2.5);
    o2.stop(now + 2.5);
    choirSwell(2.5);
  }

  function doorOpen() {
    if (!started || muted) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(180, now);
    o.frequency.exponentialRampToValueAtTime(60, now + 0.5);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    o.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 0.6);
    scratch(0.4);
  }

  function breath() {
    if (!started || muted) return;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(1.4);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(500, ctx.currentTime);
    f.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.7);
    f.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.3);
    const g = envGain(0.06, 0.2, 0.5, 0.5);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start();
    src.stop(ctx.currentTime + 1.4);
  }

  function phoneRing(times = 3) {
    if (!started || muted) return;
    stopPhone();
    phoneOsc = ctx.createOscillator();
    const phoneOsc2 = ctx.createOscillator();
    phoneGain = ctx.createGain();
    phoneOsc.type = "sine";
    phoneOsc2.type = "sine";
    phoneOsc.frequency.value = 440;
    phoneOsc2.frequency.value = 480;
    phoneGain.gain.value = 0;
    phoneOsc.connect(phoneGain);
    phoneOsc2.connect(phoneGain);
    phoneGain.connect(master);
    phoneOsc.start();
    phoneOsc2.start();

    const now = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const t = now + i * 1.4;
      phoneGain.gain.setValueAtTime(0.0001, t);
      phoneGain.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
      phoneGain.gain.setValueAtTime(0.08, t + 0.35);
      phoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      phoneGain.gain.setValueAtTime(0.0001, t + 0.55);
      phoneGain.gain.exponentialRampToValueAtTime(0.08, t + 0.6);
      phoneGain.gain.setValueAtTime(0.08, t + 0.9);
      phoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    }
    // keep second osc for cleanup via stopPhone by attaching
    phoneOsc._buddy = phoneOsc2;
    setTimeout(stopPhone, times * 1400 + 200);
  }

  function stopPhone() {
    if (phoneOsc) {
      try { phoneOsc.stop(); } catch (_) { /* ok */ }
      if (phoneOsc._buddy) {
        try { phoneOsc._buddy.stop(); } catch (_) { /* ok */ }
      }
      phoneOsc.disconnect();
      phoneOsc = null;
    }
    if (phoneGain) {
      phoneGain.disconnect();
      phoneGain = null;
    }
  }

  function beepFail() {
    blip(180, 0.25, 0.1);
    setTimeout(() => blip(120, 0.35, 0.1), 120);
  }

  function beepOk() {
    blip(660, 0.07, 0.06);
    setTimeout(() => blip(880, 0.09, 0.06), 80);
  }

  function play(name) {
    const map = {
      phone: () => phoneRing(2),
      sting: () => sting(),
      face: () => sting(),
      glitch: () => { staticBurst(0.25, 0.1); blip(140, 0.2, 0.05); },
      choir: () => choirSwell(2.4),
      whisper: () => whisper(1.8),
      knock: () => knock(3),
      scratch: () => scratch(1.2),
      tape: () => tapeRewind(1.1),
      heart: () => heartbeat(5),
      emergency: () => emergencyTone(),
      think: () => thinkOfSomeone(),
      gabriel: () => gabriel(),
      door: () => doorOpen(),
      breath: () => breath(),
      static: () => staticBurst(0.45, 0.14),
    };
    (map[name] || (() => {}))();
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.38;
    if (muted) {
      stopPhone();
      stopHeartbeat();
    }
    return muted;
  }

  return {
    start,
    setIntensity,
    blip,
    sting,
    staticBurst,
    choirSwell,
    whisper,
    knock,
    scratch,
    tapeRewind,
    heartbeat,
    stopHeartbeat,
    emergencyTone,
    thinkOfSomeone,
    gabriel,
    doorOpen,
    breath,
    phoneRing,
    stopPhone,
    beepFail,
    beepOk,
    play,
    toggleMute,
    get muted() { return muted; },
    get ready() { return started; },
  };
})();
