/* VHS / tape media stage helpers for the tribute media-game. */
const TapeMedia = (() => {
  const BASE = "assets/video/";
  const CLIPS = {
    overcast: "overcast.mp4",
    house: "house.mp4",
    static_night: "static_night.mp4",
    terror: "terror.mp4",
    fog: "fog.mp4",
    corridor: "corridor.mp4",
    watcher: "watcher.mp4",
    collapse: "collapse.mp4",
    radio_room: "radio_room.mp4",
    end: "end.mp4",
  };

  const CHANNEL_CLIP = {
    "CH-01": "overcast",
    "CH-07": "house",
    "CH-09": "radio_room",
    "CH-13": "collapse",
    "CH-00": "fog",
    "CH-12": "watcher",
  };

  function clipFor(scene = {}) {
    if (scene.video && CLIPS[scene.video]) return scene.video;
    if (scene.type === "phone") return "static_night";
    if (scene.type === "faces" || scene.type === "minigame") return "terror";
    if (scene.type === "broadcast") return scene.channel === "CH-01" ? "overcast" : "watcher";
    if (scene.type === "ending") return "end";
    return CHANNEL_CLIP[scene.channel] || "fog";
  }

  function srcFor(name) {
    const key = CLIPS[name] ? name : "fog";
    return BASE + CLIPS[key];
  }

  function mount(videoEl, scene, { still = null } = {}) {
    if (!videoEl) return null;
    const name = clipFor(scene);
    try {
      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.setAttribute("playsinline", "");
      videoEl.setAttribute("muted", "");
      videoEl.autoplay = true;
      videoEl.preload = "auto";
      videoEl.src = srcFor(name);
      const play = () => videoEl.play().catch(() => {});
      videoEl.onloadeddata = play;
      videoEl.onerror = () => {
        videoEl.removeAttribute("src");
        videoEl.load();
      };
      play();
    } catch (_) {
      /* keep UI usable without video */
    }

    if (still) still.dataset.clip = name;
    return name;
  }

  function deckHtml({
    title = "",
    kicker = "",
    label = "VHS",
    bodyId = "tape-caption",
    extra = "",
    controls = true,
  } = {}) {
    return `
      <section class="media-deck">
        <p class="kicker">${kicker}</p>
        <h2 class="scene-title">${title}</h2>
        <div class="vhs" id="vhs-stage">
          <video class="vhs__video" id="vhs-video" muted loop playsinline></video>
          <div class="vhs__grain" aria-hidden="true"></div>
          <div class="vhs__hud">
            <span class="vhs__rec">● REC</span>
            <span class="vhs__label">${label}</span>
            <span class="vhs__tc" id="vhs-tc">00:00:00</span>
          </div>
          <div class="vhs__caption">
            <p id="${bodyId}"></p>
          </div>
        </div>
        ${extra}
        ${
          controls
            ? `<div class="vhs__transport" id="vhs-transport">
          <button type="button" id="vhs-play" title="play">▶</button>
          <button type="button" id="vhs-stop" title="pause">❚❚</button>
          <button type="button" id="vhs-glitch" title="tracking">TRACKING</button>
        </div>`
            : ""
        }
      </section>
    `;
  }

  function bindTransport() {
    const video = document.getElementById("vhs-video");
    const tc = document.getElementById("vhs-tc");
    const play = document.getElementById("vhs-play");
    const stop = document.getElementById("vhs-stop");
    const glitch = document.getElementById("vhs-glitch");
    if (!video) return;

    const tick = () => {
      if (!tc) return;
      const t = Math.floor(video.currentTime || 0);
      const h = String(Math.floor(t / 3600)).padStart(2, "0");
      const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
      const s = String(t % 60).padStart(2, "0");
      tc.textContent = `${h}:${m}:${s}`;
    };
    video.ontimeupdate = tick;
    tick();

    if (play) play.onclick = () => video.play().catch(() => {});
    if (stop) stop.onclick = () => video.pause();
    if (glitch) {
      glitch.onclick = () => {
        if (typeof Effects !== "undefined") Effects.glitchBurst(280);
        if (typeof ArchiveAudio !== "undefined") ArchiveAudio.play("static");
        video.currentTime = Math.random() * Math.min(3, video.duration || 3);
        video.play().catch(() => {});
      };
    }
  }

  return { CLIPS, clipFor, srcFor, mount, deckHtml, bindTransport };
})();
