(() => {
  const state = {
    scene: "boot",
    paranoia: 0,
    score: 0,
    role: null,
    flags: {},
    choicesMade: 0,
    faceStreak: 0,
    startedAt: null,
    tapeSeconds: 0,
    unlocked: new Set(),
    met: [],
  };

  const screen = () => document.getElementById("screen");
  const statusLeft = () => document.getElementById("status-left");
  const statusCenter = () => document.getElementById("status-center");
  const statusRight = () => document.getElementById("status-right");
  const paranoiaEl = () => document.getElementById("paranoia");
  const tapeTime = () => document.getElementById("tape-time");

  function clampParanoia() {
    state.paranoia = Math.max(0, Math.min(5, state.paranoia));
  }

  function unlockChars(ids = []) {
    ids.forEach((id) => {
      if (CHARACTERS[id] && !state.unlocked.has(id)) {
        state.unlocked.add(id);
        state.met.push(id);
      }
    });
  }

  function photoFor(ch, asAlternate = false) {
    if (!ch) return null;
    if (asAlternate) return ch.photoAlt || ch.photo || null;
    return ch.photo || null;
  }

  function paintPortrait(canvas, seed, alternate, ch = null) {
    const src = ch ? photoFor(ch, !!alternate || !!ch.alternate) : null;
    // If character is marked alternate in dossier but we want human look in lineup:
    if (ch && !alternate && ch.alternate) {
      return Effects.drawPortrait(canvas, seed, false, ch.photo);
    }
    if (ch && alternate) {
      return Effects.drawPortrait(canvas, seed, true, ch.photoAlt || ch.photo);
    }
    return Effects.drawPortrait(canvas, seed, !!alternate, src);
  }

  /** Real photo element for dossiers / catalog (sharper than canvas redraw). */
  function setPhotoEl(el, ch, alternate = false) {
    if (!el || !ch) return;
    const useAlt = !!alternate;
    const src =
      photoFor(ch, useAlt) ||
      (typeof Portraits !== "undefined" ? Portraits.pathFor(ch.id, useAlt) : null);
    if (typeof Portraits !== "undefined") Portraits.setImage(el, src);
    else if (src) {
      el.src = src;
      el.alt = ch.nameRu || ch.name || "photo";
    }
    el.classList.toggle("is-alt", useAlt);
  }

  function updateHud(status, channel) {
    clampParanoia();
    const filled = "● ".repeat(state.paranoia).trim();
    const empty = "○ ".repeat(5 - state.paranoia).trim();
    paranoiaEl().textContent = [filled, empty].filter(Boolean).join(" ");
    paranoiaEl().style.color = state.paranoia >= 4 ? "var(--danger)" : "var(--amber)";
    Effects.setDanger(state.paranoia >= 4);
    ArchiveAudio.setIntensity(state.paranoia / 5);

    if (status) statusCenter().textContent = status;
    if (channel) statusRight().textContent = channel;
    statusLeft().textContent = state.paranoia >= 4 ? "REC ● SIGNAL LOST" : "REC ●";
  }

  function applyDelta(choice = {}) {
    if (typeof choice.paranoia === "number") state.paranoia += choice.paranoia;
    if (typeof choice.score === "number") state.score += choice.score;
    if (choice.flags) Object.assign(state.flags, choice.flags);
    if (choice.flags?.role) state.role = choice.flags.role;
    clampParanoia();
  }

  function runEnterFx(scene) {
    const name = scene.onEnter || scene.sound;
    if (!name) return;
    if (name === "beepOk") {
      ArchiveAudio.beepOk();
      return;
    }
    if (name === "face" || name === "sting") {
      Effects.showAlternateFace(name === "face" ? 1000 : 850);
      if (name === "sting") ArchiveAudio.play("sting");
      else ArchiveAudio.play("face");
      return;
    }
    if (name === "glitch") {
      Effects.glitchBurst(600);
      Effects.shake(350, 5);
    } else if (name === "phone") {
      Effects.glitchBurst(350);
    } else if (name === "gabriel" || name === "think" || name === "choir") {
      Effects.glitchBurst(500);
    }
    ArchiveAudio.play(name);
  }

  function go(id, choice = null) {
    if (choice) {
      state.choicesMade += 1;
      applyDelta(choice);
      ArchiveAudio.blip(520, 0.05, 0.04);
    }
    ArchiveAudio.stopPhone();
    state.scene = id;
    render();
  }

  function render() {
    const scene = SCENES[state.scene];
    if (!scene) {
      screen().innerHTML = `<div class="panel"><p class="prose">Кассета повреждена: ${state.scene}</p></div>`;
      return;
    }

    if (scene.type === "ending") {
      renderEnding();
      return;
    }

    if (scene.type === "title") {
      renderTitle();
      return;
    }

    if (typeof scene.paranoia === "number") {
      state.paranoia += scene.paranoia;
      clampParanoia();
    }
    if (typeof scene.score === "number") state.score += scene.score;
    if (scene.flags) {
      Object.assign(state.flags, scene.flags);
      if (scene.flags.role) state.role = scene.flags.role;
    }
    if (scene.unlock) unlockChars(scene.unlock);
    if (scene.character) unlockChars([scene.character]);

    updateHud(scene.title || "АРХИВ", scene.channel || "CH-07");
    runEnterFx(scene);

    if (scene.type === "broadcast") renderBroadcast(scene);
    else if (scene.type === "phone") renderPhone(scene);
    else if (scene.type === "faces") renderFaces(scene);
    else if (scene.type === "catalog") renderCatalog(scene);
    else if (scene.type === "dossier") renderDossier(scene);
    else if (scene.type === "minigame") renderMinigame(scene);
    else renderStory(scene);
  }

  function renderMinigame(scene) {
    MiniGames.render(
      {
        go,
        state,
        screen,
        escapeHtml,
        episodeLabel,
        updateHud,
        clampParanoia,
      },
      scene
    );
  }

  const DISCLAIMER_KEY = "mandela_fan_disclaimer_v1";
  const DISCLAIMER_RU =
    "Это некоммерческий фанатский проект. Все права на франшизу, персонажей и лор принадлежат Алексу Кистеру (Alex Kister). Проект не связан с официальными создателями.";

  function disclaimerAccepted() {
    try {
      return localStorage.getItem(DISCLAIMER_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function acceptDisclaimer() {
    try {
      localStorage.setItem(DISCLAIMER_KEY, "1");
    } catch (_) {
      /* ok */
    }
  }

  function showDisclaimerGate() {
    const host = document.getElementById("disclaimer-gate");
    if (!host || disclaimerAccepted()) {
      if (host) host.hidden = true;
      return false;
    }
    host.hidden = false;
    host.innerHTML = `
      <div class="disclaimer" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
        <p class="kicker">FAN PROJECT // DISCLAIMER</p>
        <h2 id="disclaimer-title">Некоммерческий фанатский проект</h2>
        <p class="disclaimer__text">${DISCLAIMER_RU}</p>
        <ul class="disclaimer__rules">
          <li>Игра и сайт полностью <strong>бесплатны</strong> — без продажи, микротранзакций и коммерческой рекламы.</li>
          <li>Донаты (если появятся) только добровольно, на покрытие хостинга.</li>
          <li>Франшиза <strong>The Mandela Catalogue</strong> принадлежит <strong>Alex Kister</strong>.</li>
        </ul>
        <div class="actions">
          <button class="primary" type="button" id="btn-accept-disclaimer">ПРИНИМАЮ / ВОЙТИ В АРХИВ</button>
        </div>
      </div>
    `;
    document.getElementById("btn-accept-disclaimer").onclick = () => {
      acceptDisclaimer();
      host.hidden = true;
      ArchiveAudio.start().catch(() => {});
    };
    return true;
  }

  function renderTitle() {
    updateHud("ВСТАВЬТЕ КАССЕТУ", "CH-00");
    showDisclaimerGate();
    screen().innerHTML = `
      <section class="media-deck media-deck--title">
        <aside class="disclaimer-banner" aria-label="Отказ от ответственности">
          <strong>DISCLAIMER:</strong> ${DISCLAIMER_RU}
        </aside>
        <div class="vhs vhs--hero" id="vhs-stage">
          <video class="vhs__video" id="vhs-video" muted loop playsinline></video>
          <div class="vhs__grain" aria-hidden="true"></div>
          <div class="vhs__hud">
            <span class="vhs__rec">● REC</span>
            <span class="vhs__label">FAN MEDIA GAME</span>
            <span class="vhs__tc" id="vhs-tc">00:00:00</span>
          </div>
          <div class="vhs__titlecard">
            <p class="kicker">фан-проект по The Mandela Catalogue · © Alex Kister</p>
            <h1 class="hero-brand"><span>MANDELA COUNTY</span>КАТАЛОГ<br/>МАНДЕЛЫ</h1>
            <p class="lead">Бесплатная медиа-игра: кассета, протоколы, не открывай дверь.</p>
          </div>
        </div>
        <div class="actions">
          <button class="primary" id="btn-start" type="button">▶ PLAY FULL TAPE</button>
          <button id="btn-episodes" type="button">ЭПИЗОДЫ</button>
          <button id="btn-catalog" type="button">КАТАЛОГ ЛИЦ</button>
          <button id="btn-mute" type="button">ЗВУК: ВКЛ</button>
          <button id="btn-disclaimer" type="button">DISCLAIMER</button>
        </div>
        <div class="log">
          Некоммерческий фанатский проект. Все права на франшизу — у Alex Kister.
          Нет продажи, нет платного доступа, нет коммерческой рекламы.
        </div>
      </section>
    `;
    TapeMedia.mount(document.getElementById("vhs-video"), { video: "overcast", channel: "CH-01" });
    TapeMedia.bindTransport();

    const ensureOk = async () => {
      if (!disclaimerAccepted()) {
        showDisclaimerGate();
        return false;
      }
      await ArchiveAudio.start();
      return true;
    };

    document.getElementById("btn-start").onclick = async () => {
      if (!(await ensureOk())) return;
      if (typeof Portraits !== "undefined") Portraits.warmup();
      state.startedAt = Date.now();
      state.flags = { run: "full" };
      Effects.glitchBurst(400);
      ArchiveAudio.play("tape");
      go("ep0_overcast");
    };

    document.getElementById("btn-episodes").onclick = async () => {
      if (!(await ensureOk())) return;
      state.startedAt = Date.now();
      ArchiveAudio.play("tape");
      go("episode_select");
    };

    document.getElementById("btn-catalog").onclick = async () => {
      if (!(await ensureOk())) return;
      unlockChars(CHARACTER_ORDER);
      ArchiveAudio.play("tape");
      go("catalog_full");
    };

    document.getElementById("btn-disclaimer").onclick = () => {
      try {
        localStorage.removeItem(DISCLAIMER_KEY);
      } catch (_) {
        /* ok */
      }
      showDisclaimerGate();
    };

    const muteBtn = document.getElementById("btn-mute");
    muteBtn.onclick = async () => {
      await ArchiveAudio.start();
      const muted = ArchiveAudio.toggleMute();
      muteBtn.textContent = muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ";
    };
  }

  function renderBroadcast(scene) {
    const ep = episodeLabel(scene.channel || "CH-00");
    screen().innerHTML =
      TapeMedia.deckHtml({
        title: escapeHtml(scene.title),
        kicker: `${ep} // ТРАНСЛЯЦИЯ`,
        label: escapeHtml(scene.label || "APS"),
        bodyId: "broadcast-body",
        extra: `<div class="actions"><button class="primary" id="btn-next" type="button">▶ NEXT TRACK</button></div>`,
      });
    TapeMedia.mount(document.getElementById("vhs-video"), scene);
    TapeMedia.bindTransport();
    Effects.typeText(document.getElementById("broadcast-body"), scene.body, 55);
    document.getElementById("btn-next").onclick = () => go(scene.next);
  }

  function episodeLabel(channel) {
    return (
      {
        "CH-01": "EP.0 OVERCAST",
        "CH-07": "EP.1 VOL.1",
        "CH-09": "EP.2 VOL.2",
        "CH-13": "EP.3 COLLAPSE",
        "CH-00": "АРХИВ",
      }[channel] || "ЗАПИСЬ"
    );
  }

  function renderStory(scene) {
    const char = scene.character ? CHARACTERS[scene.character] : null;
    const ep = episodeLabel(scene.channel || "CH-00");
    const kicker = `${ep}${state.role ? ` // ${roleLabel(state.role)}` : ""}${
      char ? ` // ${escapeHtml(char.nameRu)}` : ""
    }`;
    const still = char
      ? `<div class="vhs__still"><img class="portrait-photo" id="tape-still" alt="" /></div>`
      : "";
    screen().innerHTML =
      TapeMedia.deckHtml({
        title: escapeHtml(scene.title),
        kicker,
        label: "TAPE",
        bodyId: "story-text",
        extra: `
          <div class="meter" aria-hidden="true">${meterHtml()}</div>
          ${char ? characterChip(char) : ""}
          ${still}
          <div class="choices" id="choices"></div>
        `,
      });
    TapeMedia.mount(document.getElementById("vhs-video"), scene);
    TapeMedia.bindTransport();
    if (char) setPhotoEl(document.getElementById("tape-still"), char, !!char.alternate);
    Effects.typeText(document.getElementById("story-text"), scene.text, 64);
    mountChoices(scene.choices || []);
    paintChips();
  }

  function renderPhone(scene) {
    const char = scene.character ? CHARACTERS[scene.character] : null;
    const ep = episodeLabel(scene.channel || "CH-07");
    screen().innerHTML =
      TapeMedia.deckHtml({
        title: escapeHtml(scene.title || "ЗВОНОК"),
        kicker: `${ep} // ВХОДЯЩИЙ${char ? ` // ${escapeHtml(char.name)}` : ""}`,
        label: "PHONE",
        bodyId: "story-text",
        extra: `
          ${char ? characterChip(char) : ""}
          <div class="phone">
            <div class="phone__from">${escapeHtml(scene.from)}</div>
            <div class="phone__line">«${escapeHtml(scene.line)}»</div>
          </div>
          <div class="choices" id="choices"></div>
        `,
      });
    TapeMedia.mount(document.getElementById("vhs-video"), { ...scene, video: scene.video || "static_night" });
    TapeMedia.bindTransport();
    Effects.typeText(document.getElementById("story-text"), scene.text, 64);
    mountChoices(scene.choices || []);
    paintChips();
  }

  function renderDossier(scene) {
    const ch = CHARACTERS[scene.character];
    if (!ch) {
      go(scene.next);
      return;
    }
    unlockChars([ch.id]);
    updateHud(`ДОСЬЕ // ${ch.name}`, "CH-12");

    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Mandela County Archive // Dossier</p>
        <h2 class="scene-title">${escapeHtml(ch.nameRu)}</h2>
        <div class="dossier">
          <div class="dossier__art">
            <img class="portrait-photo" id="dossier-photo" width="180" height="240" alt="" />
            <div class="dossier__stamp ${ch.alternate ? "dossier__stamp--hot" : ""}">${
              ch.alternate ? "ALTERNATE?" : "HUMAN?"
            }</div>
          </div>
          <div class="dossier__body">
            <div class="dossier__name">${escapeHtml(ch.name)}</div>
            <div class="dossier__meta">${escapeHtml(ch.role)}</div>
            <div class="dossier__status">Статус: ${escapeHtml(ch.status)}</div>
            <div class="dossier__danger">Угроза: ${"▲".repeat(ch.danger)}${"△".repeat(5 - ch.danger)}</div>
            <p class="dossier__quote">«${escapeHtml(ch.quote)}»</p>
            <p class="prose">${escapeHtml(ch.dossier)}</p>
            <div class="tags">${ch.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
          </div>
        </div>
        <div class="actions">
          <button class="primary" id="btn-next" type="button">ВЕРНУТЬСЯ К ЗАПИСИ ▶</button>
        </div>
      </section>
    `;
    setPhotoEl(document.getElementById("dossier-photo"), ch, !!ch.alternate);
    document.getElementById("btn-next").onclick = () => go(scene.next);
  }

  function renderCatalog(scene) {
    if (scene.unlock) unlockChars(scene.unlock);
    if (scene.showAll) unlockChars(CHARACTER_ORDER);

    const list = CHARACTER_ORDER.filter((id) => state.unlocked.has(id) || scene.showAll);
    const returnId =
      Object.keys(SCENES).find((k) => SCENES[k] === scene) || "catalog_full";
    updateHud(scene.title || "КАТАЛОГ", "CH-12");

    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Каталог лиц // ${list.length} карточек</p>
        <h2 class="scene-title">${escapeHtml(scene.title)}</h2>
        <p class="prose">${escapeHtml(scene.text || "")}</p>
        <div class="catalog" id="catalog"></div>
        <div class="choices" id="choices"></div>
      </section>
    `;

    const box = document.getElementById("catalog");
    list.forEach((id) => {
      const ch = CHARACTERS[id];
      const card = document.createElement("button");
      card.type = "button";
      card.className = `catalog-card ${ch.alternate ? "is-alt" : ""}`;
      card.innerHTML = `
        <img class="portrait-photo" width="120" height="160" alt="" />
        <div class="catalog-card__info">
          <strong>${escapeHtml(ch.nameRu)}</strong>
          <span>${escapeHtml(ch.name)}</span>
          <em>${escapeHtml(ch.status)}</em>
        </div>
      `;
      setPhotoEl(card.querySelector("img"), ch, !!ch.alternate);
      card.onclick = () => {
        if (ch.alternate) {
          ArchiveAudio.play("whisper");
          ArchiveAudio.blip(180, 0.1, 0.05);
        } else {
          ArchiveAudio.beepOk();
        }
        SCENES._dossier_temp = {
          type: "dossier",
          character: id,
          sound: ch.alternate ? "gabriel" : "tape",
          next: returnId,
        };
        go("_dossier_temp");
      };
      box.appendChild(card);
    });

    mountChoices(scene.choices || [{ label: "Продолжить ▶", next: scene.next || "choose_role" }]);
  }

  function characterChip(ch) {
    return `
      <div class="char-chip ${ch.alternate ? "is-alt" : ""}">
        <img class="portrait-photo" width="48" height="64" id="chip-${ch.id}" alt="" />
        <div>
          <strong>${escapeHtml(ch.nameRu)}</strong>
          <span>${escapeHtml(ch.role)}</span>
        </div>
      </div>
    `;
  }

  function paintChips() {
    document.querySelectorAll(".char-chip img").forEach((el) => {
      const id = el.id.replace("chip-", "");
      const ch = CHARACTERS[id];
      if (ch) setPhotoEl(el, ch, !!ch.alternate);
    });
  }

  function mountChoices(choices) {
    const box = document.getElementById("choices");
    if (!box) return;
    box.innerHTML = "";
    choices.forEach((c, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";
      btn.innerHTML = `${escapeHtml(c.label)}${c.hint ? `<small>${escapeHtml(c.hint)}</small>` : ""}`;
      btn.style.animationDelay = `${i * 0.05}s`;
      btn.onclick = () => go(c.next, c);
      box.appendChild(btn);
    });
    paintChips();
  }

  function renderFaces(scene) {
    const hard = !!scene.hard;
    const alternateIndex = Math.floor(Math.random() * 3);
    const seeds = scene.characterSeeds || [];
    const baseSeed = (Date.now() % 100000) + state.choicesMade * 17;

    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">${episodeLabel(scene.channel || "CH-00")} // сверка лиц</p>
        <h2 class="scene-title">${escapeHtml(scene.title)}</h2>
        <p class="prose">${escapeHtml(scene.text)}</p>
        <div class="faces" id="faces"></div>
        <div class="log" id="face-log">Выберите карточку. У вас одна попытка.</div>
      </section>
    `;

    const faces = document.getElementById("faces");
    for (let i = 0; i < 3; i++) {
      const btn = document.createElement("button");
      btn.className = "face";
      btn.type = "button";
      const canvas = document.createElement("canvas");
      const isAlt = i === alternateIndex;
      const charId = seeds[i];
      const ch = charId ? CHARACTERS[charId] : null;
      const seed = ch ? ch.seed + (hard ? i : i * 3) : hard ? baseSeed + i : baseSeed + i * 97;
      // Real photos: human CRT grade vs Alternate grade
      if (ch) {
        paintPortrait(canvas, seed, isAlt, ch);
      } else {
        Effects.drawPortrait(canvas, seed, isAlt);
      }

      btn.appendChild(canvas);
      const tag = document.createElement("div");
      tag.className = "face__tag";
      tag.textContent = ch ? ch.name.toUpperCase().slice(0, 18) : `SUBJECT ${String.fromCharCode(65 + i)}`;
      btn.appendChild(tag);
      btn.onclick = () => onFacePick(isAlt, scene, btn);
      faces.appendChild(btn);
      if (ch) unlockChars([ch.id]);
    }
  }

  function onFacePick(correct, scene, btn) {
    [...document.querySelectorAll(".face")].forEach((f) => (f.disabled = true));
    const log = document.getElementById("face-log");

    if (correct) {
      btn.style.borderColor = "var(--amber)";
      ArchiveAudio.beepOk();
      Effects.glitchBurst(300);
      state.score += 1;
      state.faceStreak += 1;
      state.flags.minigamesWon = (state.flags.minigamesWon || 0) + 1;
      log.textContent = "ВЕРНО. ПРОТОКОЛ ПРОЙДЕН — СЮЖЕТ ДАЛЬШЕ.";
      setTimeout(() => go(scene.nextCorrect), 900);
    } else {
      btn.style.borderColor = "var(--danger)";
      ArchiveAudio.beepFail();
      Effects.showAlternateFace(900);
      state.paranoia += 1;
      state.score -= 1;
      state.faceStreak = 0;
      state.flags.minigamesLost = (state.flags.minigamesLost || 0) + 1;
      clampParanoia();
      updateHud();
      if (scene.retryOnFail) {
        log.textContent = "ОШИБКА. ПОВТОРИТЕ СВЕРКУ — БЕЗ НЕЁ СЮЖЕТ НЕ ИДЁТ.";
        setTimeout(() => go(state.scene), 1100);
      } else {
        log.textContent = "ОШИБКА. Альтернат остался в файле — сюжет идёт хуже.";
        setTimeout(() => go(scene.nextWrong), 1100);
      }
    }
  }

  function renderEnding() {
    const ending = resolveEnding();
    updateHud(ending.code, "CH-13");
    Effects.setDanger(ending.bad);
    if (ending.bad) {
      Effects.glitchBurst(800);
      ArchiveAudio.play("gabriel");
      setTimeout(() => ArchiveAudio.play("sting"), 400);
    } else {
      ArchiveAudio.beepOk();
      ArchiveAudio.play("tape");
    }

    const metNames = state.met
      .map((id) => CHARACTERS[id]?.nameRu)
      .filter(Boolean)
      .slice(0, 8)
      .join(", ");

    screen().innerHTML = `
      <section class="panel ending">
        <p class="kicker">${ending.code}</p>
        <h1 class="hero-brand"><span>КОНЕЦ ЗАПИСИ</span>${escapeHtml(ending.title)}</h1>
        <p class="prose">${escapeHtml(ending.text)}</p>
        <div class="stats">
          <div>POV / роль: ${roleLabel(state.role) || "Оператор архива"}</div>
          <div>Паранойя: ${state.paranoia}/5</div>
          <div>Очки выживания: ${state.score}</div>
          <div>Решений: ${state.choicesMade}</div>
          <div>Открыто досье: ${state.unlocked.size}/${CHARACTER_ORDER.length}</div>
          <div>Мини-игры: ✓${state.flags.minigamesWon || 0} / ✗${state.flags.minigamesLost || 0}</div>
          <div>Ключевые флаги: ${escapeHtml(flagSummary() || "—")}</div>
          <div>Встречены: ${escapeHtml(metNames || "—")}</div>
        </div>
        <div class="actions">
          <button class="primary" id="btn-restart" type="button">ПЕРЕМОТАТЬ КАССЕТУ</button>
          <button id="btn-end-episodes" type="button">ЭПИЗОДЫ</button>
          <button id="btn-end-catalog" type="button">КАТАЛОГ ЛИЦ</button>
          <button id="btn-mute-end" type="button">${ArchiveAudio.muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ"}</button>
        </div>
        <div class="log">
          ${DISCLAIMER_RU}
        </div>
      </section>
    `;

    document.getElementById("btn-restart").onclick = () => {
      Object.assign(state, {
        scene: "boot",
        paranoia: 0,
        score: 0,
        role: null,
        flags: {},
        choicesMade: 0,
        faceStreak: 0,
        startedAt: null,
        unlocked: new Set(),
        met: [],
      });
      Effects.setDanger(false);
      render();
    };

    document.getElementById("btn-end-catalog").onclick = () => {
      unlockChars(CHARACTER_ORDER);
      go("catalog_full");
    };

    document.getElementById("btn-end-episodes").onclick = () => go("episode_select");

    document.getElementById("btn-mute-end").onclick = (e) => {
      const muted = ArchiveAudio.toggleMute();
      e.currentTarget.textContent = muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ";
    };
  }

  function flagSummary() {
    const f = state.flags;
    const bits = [];
    if (f.opened_door) bits.push("дверь открыта");
    if (f.looked_peephole) bits.push("глазок");
    if (f.watched_gabriel) bits.push("смотрели «Гавриила»");
    if (f.stopped_gabriel) bits.push("остановили плёнку");
    if (f.split) bits.push("разделение");
    if (f.filmed_alternate) bits.push("сняли Альтерната");
    if (f.jonah_hurt) bits.push("Джона ранен");
    if (f.adam_marked || f.adam_suspect) bits.push("Адам под вопросом");
    if (f.catalog_poisoned) bits.push("каталог отравлен");
    if (f.operator_replaced) bits.push("оператор заменён");
    if (f.sarah_resists) bits.push("Сара держится");
    return bits.join(", ");
  }

  function resolveEnding() {
    const p = state.paranoia;
    const s = state.score;
    const f = state.flags;

    if (f.operator_replaced || p >= 5 || s <= -4) {
      return {
        bad: true,
        code: "ENDING // CATALOGUED",
        title: "НОВАЯ КАРТОЧКА",
        text:
          "Архив автоматически заводит на вас досье.\nИмя с терминала. Лицо с вебкамеры. Статус: ACTIVE RESIDENT.\n\nКак у Сезара после подмены — две версии правды, и официальной становится ложная.\n«Гавриил» в помехах шепчет спасибо, что досмотрели до конца.",
      };
    }

    if (f.opened_door && f.filmed_alternate && f.catalog_poisoned) {
      return {
        bad: true,
        code: "ENDING // MANDELA FALLS",
        title: "ОКРУГ СТЁРТ",
        text:
          "Дверь Марка. Объектив Адама. Ошибка в каталоге.\nТри классических провала сюжета складываются в один финал:\nМандела пустеет, частоты полиции отвечают голосами мёртвых, а учебная плёнка APS крутится по кругу без зрителей.\n\nКаталог завершён. Победителей нет.",
      };
    }

    if (f.saved_focus && f.sarah_resists && s >= 4 && !f.catalog_poisoned) {
      return {
        bad: false,
        code: "ENDING // HOLD THE LINE",
        title: "ДЕРЖАТЬ ЛИНИЮ",
        text:
          "Вы не открыли лишнего.\nДжону вытащили. Сара не впустила «брата». Каталог хотя бы раз отметил правильно.\n\nОкруг всё равно ранен — сюжет Mandela Catalogue не обещает хэппи-энд.\nНо на одной полке архива ещё есть кассеты, которые не лгут. Пока.",
      };
    }

    if (f.adam_marked || f.adam_suspect) {
      return {
        bad: true,
        code: "ENDING // MURRAY QUESTION",
        title: "ВОПРОС БЕЗ ОТВЕТА",
        text:
          "Адам Мюррей остаётся в файле как трещина:\nохотник, свидетель… или уже содержимое кадра.\n\nДжона в рации повторяет: «Нам надо уходить.»\nУходить уже некуда. Округ Мандела становится названием на старой карте.",
      };
    }

    if (f.watched_gabriel && p >= 3) {
      return {
        bad: true,
        code: "ENDING // THINK OF SOMEONE",
        title: "ВЫ ВСПОМНИЛИ",
        text:
          "Overcast сработал.\nТот, кого вы любите, теперь умеет звонить из темноты.\nVol.1 и Vol.2 были только примерами.\nВаш пример — следующий.",
      };
    }

    if (s >= 3 && p <= 2) {
      return {
        bad: false,
        code: "ENDING // WITNESS",
        title: "СВИДЕТЕЛЬ АРХИВА",
        text:
          "Вы прошли сюжет от ложного Гавриила до пустого округа и не отдали каталог целиком.\nМарк мёртв. Сезар — подмена. Адам и Джона — шрам на плёнке. Тэтчер — без страны, которую можно спасти.\n\nЭто канонический холод Mandela Catalogue: понять всё — не значит победить.",
      };
    }

    return {
      bad: p >= 3,
      code: p >= 3 ? "ENDING // STATIC GOSPEL" : "ENDING // TAPE ENDS",
      title: p >= 3 ? "ЕВАНГЕЛИЕ ПОМЕХ" : "ЛЕНТА КОНЧАЕТСЯ",
      text:
        p >= 3
          ? "Сюжет сошёлся в шум.\n«Гавриил», Марк, Адам — все голоса говорят разом.\nВы выключаете монитор. Отражение моргает позже."
          : "Кассеты перемотаны.\nOvercast. Vol.1. Vol.2. Падение.\nНа этикетке дописка: «не пересказывать вслух ночью».\nСедьмой канал гаснет последним.",
    };
  }

  function roleLabel(role) {
    return (
      {
        operator: "Оператор линии",
        home: "Один дома",
        archive: "Оператор архива",
        adam: "POV: Адам",
        jonah: "POV: Джона",
      }[role] || role || ""
    );
  }

  function meterHtml() {
    return Array.from({ length: 5 }, (_, i) => {
      const on = i < state.paranoia;
      const hot = on && state.paranoia >= 4;
      return `<span class="${on ? "on" : ""} ${hot ? "hot" : ""}"></span>`;
    }).join("");
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tickTape() {
    state.tapeSeconds += 1;
    const h = String(Math.floor(state.tapeSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((state.tapeSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(state.tapeSeconds % 60).padStart(2, "0");
    tapeTime().textContent = `${h}:${m}:${s}`;
  }

  const AMBIENT_VOICES = ["whisper", "presence", "murmur", "gibber", "static", "breath", "alternate"];
  setInterval(() => {
    if (state.scene === "boot" || state.scene === "arcade") return;
    if (Math.random() < 0.1 + state.paranoia * 0.04) {
      Effects.glitchBurst(180 + Math.random() * 220);
      if (state.paranoia >= 2 && Math.random() < 0.35) {
        const cue = AMBIENT_VOICES[Math.floor(Math.random() * AMBIENT_VOICES.length)];
        ArchiveAudio.play(cue);
      } else if (state.paranoia >= 1 && Math.random() < 0.2) {
        ArchiveAudio.play("static");
      }
    }
  }, 4500);

  setInterval(tickTape, 1000);
  render();
})();
