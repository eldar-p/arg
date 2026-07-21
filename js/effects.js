const Effects = (() => {
  const crt = () => document.getElementById("crt");
  const flash = () => document.getElementById("flash");
  const faceLayer = () => document.getElementById("glitch-face");

  function shake(ms = 400, strength = 4) {
    const el = crt();
    if (!el) return;
    const start = performance.now();
    function frame(t) {
      const p = (t - start) / ms;
      if (p >= 1) {
        el.style.setProperty("--shake", "0px");
        return;
      }
      const s = strength * (1 - p);
      el.style.setProperty("--shake", `${(Math.random() * 2 - 1) * s}px`);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function glitchBurst(ms = 500) {
    const el = crt();
    if (!el) return;
    el.classList.add("is-glitching");
    setTimeout(() => el.classList.remove("is-glitching"), ms);
  }

  function whiteFlash() {
    const el = flash();
    if (!el) return;
    el.classList.remove("is-on");
    void el.offsetWidth;
    el.classList.add("is-on");
  }

  function setDanger(on) {
    const el = crt();
    if (!el) return;
    el.classList.toggle("is-danger", !!on);
  }

  function showAlternateFace(ms = 900) {
    const el = faceLayer();
    if (!el) return;
    el.innerHTML = `
      <svg class="glitch-face__svg" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="200" height="260" fill="#050805"/>
        <ellipse cx="100" cy="120" rx="62" ry="78" fill="#1a241c" stroke="#7dff9a" stroke-width="2"/>
        <ellipse cx="72" cy="110" rx="10" ry="18" fill="#000"/>
        <ellipse cx="128" cy="110" rx="10" ry="28" fill="#000"/>
        <path d="M70 165 Q100 145 130 175" stroke="#7dff9a" stroke-width="3" fill="none"/>
        <path d="M55 95 L85 100" stroke="#e6b35a" stroke-width="2"/>
        <path d="M115 90 L150 105" stroke="#e6b35a" stroke-width="2"/>
        <text x="100" y="245" text-anchor="middle" fill="#7a1f1f" font-family="monospace" font-size="14">ALTERNATE</text>
      </svg>
    `;
    el.classList.add("is-on");
    ArchiveAudio.sting();
    shake(ms, 8);
    glitchBurst(ms);
    whiteFlash();
    setTimeout(() => {
      el.classList.remove("is-on");
      el.innerHTML = "";
    }, ms);
  }

  function drawPortrait(canvas, seed, alternate = false) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 180;
    const h = canvas.height = 240;
    const rnd = mulberry32(seed);

    ctx.fillStyle = "#070b08";
    ctx.fillRect(0, 0, w, h);

    // grain
    for (let i = 0; i < 900; i++) {
      const g = Math.floor(rnd() * 40);
      ctx.fillStyle = `rgba(${g + 40},${g + 70},${g + 45},${0.15 + rnd() * 0.2})`;
      ctx.fillRect(rnd() * w, rnd() * h, 1, 1);
    }

    const cx = w / 2 + (rnd() - 0.5) * 6;
    const cy = h * 0.42;
    const faceW = 48 + rnd() * 10;
    const faceH = 60 + rnd() * 12;

    ctx.fillStyle = "#1d2a20";
    ctx.beginPath();
    ctx.ellipse(cx, cy, faceW, faceH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = alternate ? "#ff4d4d" : "#3d9a55";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // hair
    ctx.fillStyle = "#0f1611";
    ctx.beginPath();
    ctx.ellipse(cx, cy - faceH * 0.55, faceW * 1.05, faceH * 0.45, 0, Math.PI, 0);
    ctx.fill();

    // eyes
    const eyeY = cy - 6;
    const eyeSpread = 18 + rnd() * 4;
    const eyeH = alternate ? 16 + rnd() * 10 : 7 + rnd() * 3;
    const eyeW = alternate ? 5 + rnd() * 2 : 7 + rnd() * 2;

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpread, eyeY, eyeW, eyeH, alternate ? 0.2 : 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeSpread, eyeY + (alternate ? 4 : 0), eyeW, eyeH * (alternate ? 1.35 : 1), alternate ? -0.25 : 0, 0, Math.PI * 2);
    ctx.fill();

    if (!alternate) {
      ctx.fillStyle = "#7dff9a";
      ctx.beginPath();
      ctx.arc(cx - eyeSpread, eyeY, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + eyeSpread, eyeY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // nose
    ctx.strokeStyle = "#3d9a55";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 2);
    ctx.lineTo(cx + (alternate ? 8 : 3), cy + 14);
    ctx.stroke();

    // mouth
    ctx.strokeStyle = alternate ? "#e6b35a" : "#3d9a55";
    ctx.lineWidth = alternate ? 2.5 : 1.5;
    ctx.beginPath();
    if (alternate) {
      ctx.moveTo(cx - 18, cy + 28);
      ctx.quadraticCurveTo(cx, cy + 18, cx + 22, cy + 34);
      ctx.moveTo(cx - 10, cy + 32);
      ctx.lineTo(cx - 6, cy + 40);
      ctx.moveTo(cx + 4, cy + 33);
      ctx.lineTo(cx + 8, cy + 42);
    } else {
      ctx.moveTo(cx - 14, cy + 28);
      ctx.quadraticCurveTo(cx, cy + 34 + rnd() * 4, cx + 14, cy + 28);
    }
    ctx.stroke();

    // scanlines
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

    if (alternate) {
      ctx.fillStyle = "rgba(255,77,77,0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,77,77,0.35)";
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  async function typeText(el, text, cps = 42) {
    el.textContent = "";
    el.classList.add("typecursor");
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      if (text[i] !== " " && i % 2 === 0) ArchiveAudio.blip(420 + Math.random() * 80, 0.02, 0.015);
      await wait(1000 / cps);
      if (el.dataset.cancel === "1") break;
    }
    el.classList.remove("typecursor");
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  return {
    shake,
    glitchBurst,
    whiteFlash,
    setDanger,
    showAlternateFace,
    drawPortrait,
    typeText,
    wait,
  };
})();
