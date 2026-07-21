/* Web Audio ambience for the Mandela Archive experience */
const ArchiveAudio = (() => {
  let ctx = null;
  let master = null;
  let humOsc = null;
  let humGain = null;
  let noiseNode = null;
  let noiseGain = null;
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
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    return ctx;
  }

  function createNoiseBuffer() {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.55;
    }
    return buffer;
  }

  async function start() {
    ensure();
    if (!ctx || started) return;
    if (ctx.state === "suspended") await ctx.resume();

    humOsc = ctx.createOscillator();
    humOsc.type = "sine";
    humOsc.frequency.value = 58;
    humGain = ctx.createGain();
    humGain.gain.value = 0.045;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = "lowpass";
    humFilter.frequency.value = 180;
    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(master);
    humOsc.start();

    const noiseBuffer = createNoiseBuffer();
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.012;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1200;
    band.Q.value = 0.7;
    noiseNode.connect(band);
    band.connect(noiseGain);
    noiseGain.connect(master);
    noiseNode.start();

    started = true;
  }

  function setIntensity(level = 0) {
    if (!started || muted) return;
    const n = Math.max(0, Math.min(1, level));
    if (noiseGain) noiseGain.gain.setTargetAtTime(0.012 + n * 0.05, ctx.currentTime, 0.2);
    if (humGain) humGain.gain.setTargetAtTime(0.045 + n * 0.04, ctx.currentTime, 0.2);
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

    const n = ctx.createBufferSource();
    n.buffer = createNoiseBuffer();
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.18, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    n.connect(ng);
    ng.connect(master);
    n.start(now);
    n.stop(now + 0.4);
  }

  function phoneRing(times = 3) {
    if (!started || muted) return;
    stopPhone();
    phoneOsc = ctx.createOscillator();
    phoneGain = ctx.createGain();
    phoneOsc.type = "sine";
    phoneOsc.frequency.value = 440;
    phoneGain.gain.value = 0;
    phoneOsc.connect(phoneGain);
    phoneGain.connect(master);
    phoneOsc.start();

    const now = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const t = now + i * 1.4;
      phoneGain.gain.setValueAtTime(0.0001, t);
      phoneGain.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
      phoneGain.gain.setValueAtTime(0.09, t + 0.35);
      phoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      phoneGain.gain.setValueAtTime(0.0001, t + 0.55);
      phoneGain.gain.exponentialRampToValueAtTime(0.09, t + 0.6);
      phoneGain.gain.setValueAtTime(0.09, t + 0.9);
      phoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    }
    setTimeout(stopPhone, times * 1400 + 200);
  }

  function stopPhone() {
    if (phoneOsc) {
      try { phoneOsc.stop(); } catch (_) { /* already stopped */ }
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

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.35;
    return muted;
  }

  return {
    start,
    setIntensity,
    blip,
    sting,
    phoneRing,
    stopPhone,
    beepFail,
    beepOk,
    toggleMute,
    get muted() { return muted; },
    get ready() { return started; },
  };
})();
