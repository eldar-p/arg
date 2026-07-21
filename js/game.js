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
    if (scene.unlock) unlockChars(scene.unlock);
    if (scene.character) unlockChars([scene.character]);

    updateHud(scene.title || "АРХИВ", scene.channel || "CH-07");
    runEnterFx(scene);

    if (scene.type === "broadcast") renderBroadcast(scene);
    else if (scene.type === "phone") renderPhone(scene);
    else if (scene.type === "faces") renderFaces(scene);
    else if (scene.type === "catalog") renderCatalog(scene);
    else if (scene.type === "dossier") renderDossier(scene);
    else renderStory(scene);
  }

  function renderTitle() {
    updateHud("ВСТАВЬТЕ КАССЕТУ", "CH-00");
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Analog Horror Interactive // Tribute</p>
        <h1 class="hero-brand"><span>MANDELA COUNTY</span>КАТАЛОГ<br/>МАНДЕЛЫ</h1>
        <p class="lead">
          Локальный архив экстренных плёнок. Марк, Сезар, Тэтчер, «Гавриил» —
          голоса и лица, которым нельзя верить.
        </p>
        <div class="actions">
          <button class="primary" id="btn-start" type="button">▶ ВОСПРОИЗВЕСТИ</button>
          <button id="btn-catalog" type="button">КАТАЛОГ ЛИЦ</button>
          <button id="btn-mute" type="button">ЗВУК: ВКЛ</button>
        </div>
        <div class="log">
          Звуки синтезированы в браузере (хор, стук, шёпот, телефон, EAS) — это не аудиодорожки из сериала.
          Персонажи — трибьют по мотивам The Mandela Catalogue (Alex Kister).
        </div>
      </section>
    `;

    document.getElementById("btn-start").onclick = async () => {
      await ArchiveAudio.start();
      state.startedAt = Date.now();
      Effects.glitchBurst(400);
      go("intro_tape");
    };

    document.getElementById("btn-catalog").onclick = async () => {
      await ArchiveAudio.start();
      unlockChars(CHARACTER_ORDER);
      ArchiveAudio.play("tape");
      go("catalog_full");
    };

    const muteBtn = document.getElementById("btn-mute");
    muteBtn.onclick = async () => {
      await ArchiveAudio.start();
      const muted = ArchiveAudio.toggleMute();
      muteBtn.textContent = muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ";
    };
  }

  function renderBroadcast(scene) {
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Трансляция</p>
        <h2 class="scene-title">${escapeHtml(scene.title)}</h2>
        <div class="tape-frame">
          <div class="tape-frame__label">${escapeHtml(scene.label || "APS")}</div>
          <div class="broadcast">
            <h3>${escapeHtml(scene.title)}</h3>
            <p id="broadcast-body"></p>
          </div>
        </div>
        <div class="actions">
          <button class="primary" id="btn-next" type="button">ПРОДОЛЖИТЬ ▶</button>
        </div>
      </section>
    `;
    Effects.typeText(document.getElementById("broadcast-body"), scene.body, 55);
    document.getElementById("btn-next").onclick = () => go(scene.next);
  }

  function renderStory(scene) {
    const char = scene.character ? CHARACTERS[scene.character] : null;
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">${state.role ? `РОЛЬ: ${roleLabel(state.role)}` : "ЗАПИСЬ"}${
          char ? ` // ${escapeHtml(char.nameRu)}` : ""
        }</p>
        <h2 class="scene-title">${escapeHtml(scene.title)}</h2>
        <div class="meter" aria-hidden="true">${meterHtml()}</div>
        ${char ? characterChip(char) : ""}
        <p class="prose" id="story-text"></p>
        <div class="choices" id="choices"></div>
      </section>
    `;
    Effects.typeText(document.getElementById("story-text"), scene.text, 64);
    mountChoices(scene.choices || []);
    paintChips();
  }

  function renderPhone(scene) {
    const char = scene.character ? CHARACTERS[scene.character] : null;
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Входящий сигнал${char ? ` // ${escapeHtml(char.name)}` : ""}</p>
        <h2 class="scene-title">${escapeHtml(scene.title || "ЗВОНОК")}</h2>
        ${char ? characterChip(char) : ""}
        <div class="phone">
          <div class="phone__from">${escapeHtml(scene.from)}</div>
          <div class="phone__line">«${escapeHtml(scene.line)}»</div>
        </div>
        <p class="prose" id="story-text"></p>
        <div class="choices" id="choices"></div>
      </section>
    `;
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
            <canvas id="dossier-canvas" width="180" height="240"></canvas>
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
    Effects.drawPortrait(document.getElementById("dossier-canvas"), ch.seed, ch.alternate);
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
        <canvas width="120" height="160"></canvas>
        <div class="catalog-card__info">
          <strong>${escapeHtml(ch.nameRu)}</strong>
          <span>${escapeHtml(ch.name)}</span>
          <em>${escapeHtml(ch.status)}</em>
        </div>
      `;
      Effects.drawPortrait(card.querySelector("canvas"), ch.seed, ch.alternate);
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
        <canvas width="48" height="64" id="chip-${ch.id}"></canvas>
        <div>
          <strong>${escapeHtml(ch.nameRu)}</strong>
          <span>${escapeHtml(ch.role)}</span>
        </div>
      </div>
    `;
  }

  function paintChips() {
    document.querySelectorAll(".char-chip canvas").forEach((c) => {
      const id = c.id.replace("chip-", "");
      const ch = CHARACTERS[id];
      if (ch) Effects.drawPortrait(c, ch.seed, ch.alternate);
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
        <p class="kicker">Каталог лиц // сверка</p>
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
      // force alternate look on the correct pick; others human-ish
      Effects.drawPortrait(canvas, seed, isAlt || !!(ch && ch.alternate && isAlt));
      if (!isAlt && ch && ch.alternate) {
        // show human version of disputed identity
        Effects.drawPortrait(canvas, seed + 11, false);
      }
      if (isAlt) Effects.drawPortrait(canvas, seed + 77, true);

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
      log.textContent = "ВЕРНО. Аномалия изъята из каталога.";
      setTimeout(() => go(scene.nextCorrect), 900);
    } else {
      btn.style.borderColor = "var(--danger)";
      ArchiveAudio.beepFail();
      Effects.showAlternateFace(900);
      state.paranoia += 1;
      state.score -= 1;
      state.faceStreak = 0;
      clampParanoia();
      updateHud();
      log.textContent = "ОШИБКА. Вы оставили Альтерната в файле.";
      setTimeout(() => go(scene.nextWrong), 1100);
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
          <div>Роль: ${roleLabel(state.role) || "—"}</div>
          <div>Паранойя: ${state.paranoia}/5</div>
          <div>Очки выживания: ${state.score}</div>
          <div>Решений: ${state.choicesMade}</div>
          <div>Открыто досье: ${state.unlocked.size}/${CHARACTER_ORDER.length}</div>
          <div>Встречены: ${escapeHtml(metNames || "—")}</div>
        </div>
        <div class="actions">
          <button class="primary" id="btn-restart" type="button">ПЕРЕМОТАТЬ КАССЕТУ</button>
          <button id="btn-end-catalog" type="button">КАТАЛОГ ЛИЦ</button>
          <button id="btn-mute-end" type="button">${ArchiveAudio.muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ"}</button>
        </div>
        <div class="log">
          Звуки оригинальные (Web Audio). Персонажи — неофициальный трибьют Mandela Catalogue.
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

    document.getElementById("btn-mute-end").onclick = (e) => {
      const muted = ArchiveAudio.toggleMute();
      e.currentTarget.textContent = muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ";
    };
  }

  function resolveEnding() {
    const p = state.paranoia;
    const s = state.score;

    if (p >= 5 || s <= -3) {
      return {
        bad: true,
        code: "ENDING // REPLACED",
        title: "ВЫ БОЛЬШЕ НЕ ОДНИ",
        text:
          "Утром соседи скажут, что вы вышли поздороваться.\nГолос будет ваш. Улыбка — почти как у Сезара на второй карточке.\nВ каталоге новая запись: ваше имя, чужие глаза.",
      };
    }

    if (s >= 4 && p <= 2) {
      return {
        bad: false,
        code: "ENDING // CONTAINED",
        title: "ДОЖИТЬ ДО СМЕНЫ",
        text:
          "Тэтчер Дэвис не звонит с благодарностью — только короткий тон на линии.\nКассета останавливается на инструкции APS.\nЭто не победа. Это отсрочка.",
      };
    }

    if (state.role === "archive" && s >= 2) {
      return {
        bad: false,
        code: "ENDING // ARCHIVIST",
        title: "КАТАЛОГ ДЕРЖИТСЯ",
        text:
          "Папки Мюррея и Маршалла закрыты.\n«Гавриил» не получил ваш взгляд дольше секунды.\nМонитор гаснет. Отражение — с задержкой.",
      };
    }

    if (state.role === "home" && p >= 3) {
      return {
        bad: true,
        code: "ENDING // THRESHOLD",
        title: "ОНИ ЗНАЛИ КОД",
        text:
          "На кухне вторая кружка.\nКто-то напевает ту же мелодию, что в образовательной плёнке — чуть медленнее.\nThink of someone you love.",
      };
    }

    return {
      bad: p >= 3,
      code: p >= 3 ? "ENDING // UNCERTAIN" : "ENDING // STATIC",
      title: p >= 3 ? "СИГНАЛ РАЗДВОИЛСЯ" : "ШУМ НА ЛЕНТЕ",
      text:
        p >= 3
          ? "Вы живы. Наверное.\nГолос в следующей записи ниже на полтона — как у Марка в последнем звонке.\nФайл: повторная сверка."
          : "Помехи съедают финал.\nНа этикетке: «не перематывать в одиночестве».\nСедьмой канал ещё секунду светится.",
    };
  }

  function roleLabel(role) {
    return (
      {
        operator: "Оператор линии",
        home: "Один дома",
        archive: "Архивариус",
      }[role] || ""
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

  setInterval(() => {
    if (state.scene === "boot") return;
    if (Math.random() < 0.08 + state.paranoia * 0.03) {
      Effects.glitchBurst(180 + Math.random() * 220);
      if (state.paranoia >= 3 && Math.random() < 0.2) {
        ArchiveAudio.play(Math.random() < 0.5 ? "whisper" : "static");
      }
    }
  }, 5000);

  setInterval(tickTape, 1000);
  render();
})();
