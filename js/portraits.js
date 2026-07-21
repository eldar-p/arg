/* Photo portrait helpers — real stock faces with CRT / Alternate grades */
const Portraits = (() => {
  const BASE = "assets/portraits/";
  const POOL = ["mark", "cesar", "thatcher", "adam", "jonah", "sarah", "dave", "ruth", "gabriel", "alternate"];
  const cache = new Map();

  function pathFor(id, alternate = false) {
    const key = POOL.includes(id) ? id : POOL[Math.abs(hash(id)) % POOL.length];
    return `${BASE}${key}${alternate ? "_alt" : "_crt"}.jpg`;
  }

  function pathForSeed(seed, alternate = false) {
    const id = POOL[Math.abs(seed | 0) % POOL.length];
    return pathFor(id, alternate);
  }

  function hash(str) {
    let h = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }

  function load(src) {
    if (cache.has(src)) return Promise.resolve(cache.get(src));
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        cache.set(src, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error("photo load failed: " + src));
      img.src = src;
    });
  }

  function coverDraw(ctx, img, w, h) {
    const ir = img.width / img.height;
    const cr = w / h;
    let dw, dh, dx, dy;
    if (ir > cr) {
      dh = h;
      dw = h * ir;
      dx = (w - dw) / 2;
      dy = 0;
    } else {
      dw = w;
      dh = w / ir;
      dx = 0;
      dy = (h - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function grade(ctx, w, h, alternate) {
    // scanlines
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

    // phosphor wash
    ctx.fillStyle = alternate ? "rgba(90,20,20,0.18)" : "rgba(40,90,50,0.16)";
    ctx.fillRect(0, 0, w, h);

    // vignette
    const g = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.15, w / 2, h * 0.5, h * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (alternate) {
      ctx.strokeStyle = "rgba(255,70,70,0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, w - 6, h - 6);
      // slight RGB split
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgba(255,0,0,0.06)";
      ctx.fillRect(2, 0, w, h);
      ctx.fillStyle = "rgba(0,255,120,0.04)";
      ctx.fillRect(-2, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function drawToCanvas(canvas, src, alternate = false) {
    const ctx = canvas.getContext("2d");
    if (!canvas.width) canvas.width = 180;
    if (!canvas.height) canvas.height = 240;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.fillStyle = "#050805";
    ctx.fillRect(0, 0, cw, ch);

    const paint = (img) => {
      ctx.save();
      if (alternate) {
        ctx.translate(cw * 0.02, 0);
        ctx.transform(1, 0, 0.04, 1.02, 0, 0);
      }
      coverDraw(ctx, img, cw, ch);
      ctx.restore();
      grade(ctx, cw, ch, alternate);
    };

    const cached = cache.get(src);
    if (cached) {
      paint(cached);
      return Promise.resolve();
    }
    return load(src)
      .then(paint)
      .catch(() => {
        ctx.fillStyle = "#1a241c";
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = "#3d9a55";
        ctx.font = "12px monospace";
        ctx.fillText("NO SIGNAL", 40, ch / 2);
      });
  }

  /** Prefetch common portraits */
  function warmup(ids = POOL) {
    ids.forEach((id) => {
      load(pathFor(id, false)).catch(() => {});
      load(pathFor(id, true)).catch(() => {});
    });
  }

  return {
    POOL,
    pathFor,
    pathForSeed,
    load,
    drawToCanvas,
    warmup,
  };
})();
