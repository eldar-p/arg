/* Archive audio: Mixkit royalty-free samples + light Web Audio fallback.
   Does NOT include copyrighted audio from The Mandela Catalogue. */
const ArchiveAudio = (() => {
  const BASE = "assets/sfx/";
  let ctx = null;
  let master = null;
  let busFx = null;
  let busBed = null;
  let started = false;
  let muted = false;
  let buffers = new Map();
  let loading = null;
  let bedNodes = []; // looping ambience sources
  let bedGain = null;
  let droneGain = null;
  let heartTimer = null;
  let activeOnes = new Set();

  const FILES = [
    "ambience", "drone", "room", "knock", "door", "phone", "heart",
    "static", "static_short", "radio", "radio_creepy", "glitch", "sting",
    "impact", "choir", "choir_dark", "angel", "whisper", "breath", "presence",
    "scratch", "tape", "vhs", "emergency", "laugh", "cry", "voices", "gibber",
    "wind", "swell", "riser", "creak", "alarm",
  ];

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.85;
    busFx = ctx.createGain();
    busFx.gain.value = 0.95;
    busBed = ctx.createGain();
    busBed.gain.value = 0.55;
    busFx.connect(master);
    busBed.connect(master);
    master.connect(ctx.destination);
    return ctx;
  }

  async function loadAll() {
    ensure();
    if (!ctx) return;
    if (buffers.size) return;
    if (loading) return loading;
    loading = Promise.all(
      FILES.map(async (name) => {
        try {
          const res = await fetch(`${BASE}${name}.mp3`);
          if (!res.ok) throw new Error(res.statusText);
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr.slice(0));
          buffers.set(name, buf);
        } catch (_) {
          /* synth fallback remains */
        }
      })
    );
    await loading;
    loading = null;
  }

  function has(name) {
    return buffers.has(name);
  }

  function stopNode(entry) {
    try { entry.src.stop(); } catch (_) { /* ok */ }
    try { entry.src.disconnect(); } catch (_) { /* ok */ }
    try { entry.gain.disconnect(); } catch (_) { /* ok */ }
    activeOnes.delete(entry);
  }

  /** Play a decoded sample. Returns stop() handle. */
  function playBuf(name, opts = {}) {
    if (!started || muted || !ctx) return null;
    const buf = buffers.get(name);
    if (!buf) return null;
    const {
      gain = 0.7,
      loop = false,
      dest = busFx,
      rate = 1,
      fadeIn = 0,
      offset = 0,
      duration = 0,
    } = opts;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = !!loop;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    if (fadeIn > 0) {
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), now + fadeIn);
    } else {
      g.gain.value = gain;
    }
    src.connect(g);
    g.connect(dest || busFx);
    const entry = { src, gain: g, name };
    activeOnes.add(entry);
    src.onended = () => activeOnes.delete(entry);
    try {
      if (duration > 0) src.start(now, offset, duration);
      else src.start(now, offset);
    } catch (_) {
      activeOnes.delete(entry);
      return null;
    }
    return {
      stop(fade = 0.15) {
        if (!ctx) return;
        const t = ctx.currentTime;
        try {
          g.gain.cancelScheduledValues(t);
          g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + fade);
          src.stop(t + fade + 0.02);
        } catch (_) { /* ok */ }
        setTimeout(() => stopNode(entry), (fade + 0.05) * 1000);
      },
    };
  }

  function playOne(name, gain = 0.7, rate = 1) {
    return playBuf(name, { gain, rate });
  }

  function playCombo(names, gain = 0.65) {
    names.forEach((n, i) => {
      setTimeout(() => playOne(n, gain * (i === 0 ? 1 : 0.85)), i * 40);
    });
  }

  /* ---- light synth leftovers for UI ticks ---- */
  function createNoiseBuffer(seconds = 2) {
    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function blip(freq = 880, dur = 0.08, gain = 0.08) {
    if (!started || muted || !ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(busFx);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur + 0.02);
  }

  function synthStatic(dur = 0.35, gain = 0.16) {
    if (!started || muted || !ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(Math.max(0.2, dur));
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 800;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(f);
    f.connect(g);
    g.connect(busFx);
    src.start();
    src.stop(now + dur + 0.05);
  }

  function startBeds() {
    stopBeds();
    if (!ctx) return;
    bedGain = ctx.createGain();
    bedGain.gain.value = 0.22;
    bedGain.connect(busBed);
    droneGain = ctx.createGain();
    droneGain.gain.value = 0.0;
    droneGain.connect(busBed);

    const amb = has("ambience")
      ? playBuf("ambience", { gain: 1, loop: true, dest: bedGain, fadeIn: 1.2 })
      : null;
    const drone = has("drone")
      ? playBuf("drone", { gain: 1, loop: true, dest: droneGain, fadeIn: 2.0 })
      : null;
    const room = has("room")
      ? playBuf("room", { gain: 0.55, loop: true, dest: bedGain, fadeIn: 1.8, rate: 0.95 })
      : null;
    bedNodes = [amb, drone, room].filter(Boolean);
  }

  function stopBeds() {
    bedNodes.forEach((h) => h && h.stop(0.4));
    bedNodes = [];
  }

  async function start() {
    ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    await loadAll();
    if (!started) {
      started = true;
      startBeds();
    } else if (ctx.state === "running" && !bedNodes.length) {
      startBeds();
    }
  }

  function setIntensity(level = 0) {
    if (!started || muted || !ctx) return;
    const n = Math.max(0, Math.min(1, level));
    if (bedGain) bedGain.gain.setTargetAtTime(0.18 + n * 0.2, ctx.currentTime, 0.35);
    if (droneGain) droneGain.gain.setTargetAtTime(n * 0.45, ctx.currentTime, 0.45);
  }

  function staticBurst(dur = 0.35, gain = 0.7) {
    if (has("static") || has("static_short") || has("glitch")) {
      const name = dur > 0.3 ? (has("static") ? "static" : "glitch") : (has("static_short") ? "static_short" : "static");
      playOne(name, gain);
      return;
    }
    synthStatic(dur, gain * 0.2);
  }

  function sting() {
    if (has("sting") || has("impact")) {
      playOne(has("sting") ? "sting" : "impact", 0.9);
      setTimeout(() => staticBurst(0.25, 0.55), 80);
      return;
    }
    staticBurst(0.4, 0.5);
  }

  function choirSwell() {
    if (has("choir_dark")) playOne("choir_dark", 0.75);
    else if (has("choir")) playOne("choir", 0.75);
    else if (has("swell")) playOne("swell", 0.7);
  }

  function whisper() {
    if (has("whisper")) playOne("whisper", 0.7);
    else if (has("voices")) playOne("voices", 0.65);
    else staticBurst(0.5, 0.4);
  }

  function knock() {
    if (has("knock")) {
      playOne("knock", 0.85);
      setTimeout(() => { if (has("creak")) playOne("creak", 0.35); }, 500);
      return;
    }
    staticBurst(0.1, 0.3);
  }

  function scratch() {
    if (has("scratch")) playOne("scratch", 0.75);
    else if (has("vhs")) playOne("vhs", 0.7);
    else staticBurst(0.6, 0.45);
  }

  function tapeRewind() {
    if (has("tape")) playOne("tape", 0.8);
    else if (has("vhs")) playOne("vhs", 0.75);
  }

  function heartbeat(times = 4) {
    stopHeartbeat();
    if (has("heart")) {
      // sample already loops several beats — play a slice / full once
      playOne("heart", 0.7);
      return;
    }
    let n = 0;
    const beat = () => {
      if (!started || muted || n >= times) return;
      blip(55, 0.12, 0.12);
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
    if (has("emergency")) playOne("emergency", 0.7);
    else if (has("alarm")) playOne("alarm", 0.65);
  }

  function thinkOfSomeone() {
    if (has("angel")) playOne("angel", 0.7);
    setTimeout(() => whisper(), 500);
    setTimeout(() => { if (has("choir")) playOne("choir", 0.45); }, 1200);
  }

  function gabriel() {
    if (has("choir_dark")) playOne("choir_dark", 0.8);
    else if (has("angel")) playOne("angel", 0.75);
    setTimeout(() => {
      if (has("voices")) playOne("voices", 0.55);
      else whisper();
    }, 400);
    setTimeout(() => { if (has("swell")) playOne("swell", 0.55); }, 900);
  }

  function doorOpen() {
    if (has("door")) playOne("door", 0.85);
    else if (has("creak")) playOne("creak", 0.8);
    setTimeout(() => scratch(), 350);
  }

  function breath() {
    if (has("breath")) playOne("breath", 0.7);
    else if (has("presence")) playOne("presence", 0.65);
  }

  function murmur(style = "human") {
    if (style === "angel") {
      if (has("angel")) playOne("angel", 0.55);
      else if (has("choir")) playOne("choir", 0.5);
      return;
    }
    if (style === "alternate") {
      if (has("voices")) playOne("voices", 0.7);
      else if (has("gibber")) playOne("gibber", 0.7);
      else whisper();
      return;
    }
    if (style === "whisper") {
      whisper();
      return;
    }
    if (style === "phone") {
      if (has("radio_creepy")) playOne("radio_creepy", 0.55);
      else whisper();
      return;
    }
    // human / default
    if (has("whisper")) playOne("whisper", 0.55);
    else if (has("voices")) playOne("voices", 0.5);
  }

  function speak() {
    murmur("phone");
    setTimeout(() => {
      staticBurst(0.2, 0.5);
      murmur("alternate");
    }, 700);
  }

  function angel() {
    if (has("angel")) playOne("angel", 0.8);
    else choirSwell();
    setTimeout(() => whisper(), 900);
  }

  function laugh() {
    if (has("laugh")) playOne("laugh", 0.75);
    else murmur("alternate");
  }

  function cry() {
    if (has("cry")) playOne("cry", 0.65);
    else breath();
  }

  function radio() {
    if (has("radio")) playOne("radio", 0.7);
    else if (has("radio_creepy")) playOne("radio_creepy", 0.75);
    else staticBurst(0.8, 0.6);
    setTimeout(() => whisper(), 600);
  }

  function vhs() {
    if (has("vhs")) playOne("vhs", 0.7);
    tapeRewind();
    setTimeout(() => scratch(), 300);
    setTimeout(() => staticBurst(0.35, 0.5), 700);
  }

  function presence() {
    if (has("presence")) playOne("presence", 0.7);
    else breath();
    setTimeout(() => whisper(), 450);
    if (has("wind")) setTimeout(() => playOne("wind", 0.35), 200);
  }

  function reverseGibber() {
    if (has("gibber")) playOne("gibber", 0.75, 1.05);
    else if (has("voices")) playOne("voices", 0.7, 1.15);
    staticBurst(0.3, 0.45);
  }

  function phoneRing() {
    if (has("phone")) {
      playOne("phone", 0.7);
      setTimeout(() => murmur("phone"), 800);
      return;
    }
    emergencyTone();
  }

  function stopPhone() {
    // sample-based ring is one-shot; nothing persistent
  }

  function beepFail() {
    if (has("glitch")) playOne("glitch", 0.45);
    blip(180, 0.25, 0.08);
    setTimeout(() => blip(120, 0.35, 0.08), 120);
  }

  function beepOk() {
    blip(660, 0.07, 0.05);
    setTimeout(() => blip(880, 0.09, 0.05), 80);
  }

  function play(name) {
    const map = {
      phone: () => phoneRing(),
      sting: () => { sting(); setTimeout(() => laugh(), 180); },
      face: () => { sting(); setTimeout(() => murmur("alternate"), 120); },
      glitch: () => {
        if (has("glitch")) playOne("glitch", 0.75);
        staticBurst(0.25, 0.55);
        reverseGibber();
      },
      choir: () => { choirSwell(); setTimeout(() => murmur("angel"), 350); },
      whisper: () => { whisper(); if (has("wind")) playOne("wind", 0.25); },
      knock: () => { knock(); setTimeout(() => presence(), 700); },
      scratch: () => { scratch(); setTimeout(() => presence(), 250); },
      tape: () => { tapeRewind(); setTimeout(() => vhs(), 180); },
      heart: () => heartbeat(5),
      emergency: () => { emergencyTone(); setTimeout(() => murmur("phone"), 400); },
      think: () => thinkOfSomeone(),
      gabriel: () => gabriel(),
      door: () => { doorOpen(); setTimeout(() => murmur("alternate"), 450); },
      breath: () => { breath(); setTimeout(() => whisper(), 400); },
      static: () => { staticBurst(0.5, 0.7); setTimeout(() => reverseGibber(), 80); },
      murmur: () => murmur("human"),
      speak: () => speak(),
      angel: () => angel(),
      laugh: () => laugh(),
      cry: () => cry(),
      radio: () => radio(),
      vhs: () => vhs(),
      presence: () => presence(),
      gibber: () => reverseGibber(),
      alternate: () => murmur("alternate"),
      beepOk: () => beepOk(),
      riser: () => { if (has("riser")) playOne("riser", 0.7); else if (has("swell")) playOne("swell", 0.7); },
    };
    (map[name] || (() => {}))();
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.85;
    if (muted) {
      stopPhone();
      stopHeartbeat();
      stopBeds();
    } else if (started) {
      startBeds();
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
    murmur,
    speak,
    angel,
    laugh,
    cry,
    radio,
    vhs,
    presence,
    reverseGibber,
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
