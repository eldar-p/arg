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
      <div class="glitch-face__photo-wrap">
        <canvas class="glitch-face__svg" id="glitch-photo" width="240" height="320"></canvas>
        <div class="glitch-face__label">ALTERNATE</div>
      </div>
    `;
    el.classList.add("is-on");
    const canvas = document.getElementById("glitch-photo");
    const src =
      typeof Portraits !== "undefined"
        ? Portraits.pathFor("gabriel", true)
        : "assets/portraits/gabriel_alt.jpg";
    drawPortrait(canvas, 9999, true, src);
    ArchiveAudio.sting();
    shake(ms, 8);
    glitchBurst(ms);
    whiteFlash();
    setTimeout(() => {
      el.classList.remove("is-on");
      el.innerHTML = "";
    }, ms);
  }

  function drawPortrait(canvas, seed, alternate = false, photo = null) {
    if (!canvas) return;
    if (!canvas.width) canvas.width = 180;
    if (!canvas.height) canvas.height = 240;

    let src = photo;
    if (!src && typeof Portraits !== "undefined") {
      src = Portraits.pathForSeed(seed || 1, !!alternate);
    }
    if (src && typeof Portraits !== "undefined") {
      return Portraits.drawToCanvas(canvas, src, !!alternate);
    }

    // Fallback stub if portraits module missing
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#070b08";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = alternate ? "#7a1f1f" : "#3d9a55";
    ctx.font = "11px monospace";
    ctx.fillText(alternate ? "ALTERNATE" : "SUBJECT", 40, canvas.height / 2);
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
