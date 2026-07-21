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

  async function runEnterFx(name) {
    if (!name) return;
    if (name === "phone") {
      ArchiveAudio.phoneRing(2);
      Effects.glitchBurst(350);
    } else if (name === "glitch") {
      Effects.glitchBurst(600);
      Effects.shake(350, 5);
      ArchiveAudio.blip(140, 0.2, 0.05);
    } else if (name === "sting") {
      Effects.showAlternateFace(850);
    } else if (name === "face") {
      Effects.showAlternateFace(1000);
    }
  }

  function go(id, choice = null) {
    if (choice) {
      state.choicesMade += 1;
      applyDelta(choice);
      ArchiveAudio.blip(520, 0.05, 0.04);
    }
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

    updateHud(scene.title || "АРХИВ", scene.channel || "CH-07");
    runEnterFx(scene.onEnter);

    if (scene.type === "broadcast") renderBroadcast(scene);
    else if (scene.type === "phone") renderPhone(scene);
    else if (scene.type === "faces") renderFaces(scene);
    else renderStory(scene);
  }

  function renderTitle() {
    updateHud("ВСТАВЬТЕ КАССЕТУ", "CH-00");
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Analog Horror Interactive // Tribute</p>
        <h1 class="hero-brand"><span>MANDELA COUNTY</span>КАТАЛОГ<br/>МАНДЕЛЫ</h1>
        <p class="lead">
          Локальный архив экстренных плёнок. Альтернаты говорят голосами тех, кого вы любите.
          Не смотрите в глаза. Не открывайте дверь. Не будьте уверены, что вы — это вы.
        </p>
        <div class="actions">
          <button class="primary" id="btn-start" type="button">▶ ВОСПРОИЗВЕСТИ</button>
          <button id="btn-mute" type="button">ЗВУК: ВКЛ</button>
        </div>
        <div class="log">
          Предупреждение: вспышки, резкий звук, психологический хоррор.
          Игра вдохновлена ARG «The Mandela Catalogue» (Alex Kister) и является неофициальным трибьютом.
        </div>
      </section>
    `;

    document.getElementById("btn-start").onclick = async () => {
      await ArchiveAudio.start();
      state.startedAt = Date.now();
      Effects.glitchBurst(400);
      go("intro_tape");
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
    const body = document.getElementById("broadcast-body");
    Effects.typeText(body, scene.body, 55);
    document.getElementById("btn-next").onclick = () => go(scene.next);
  }

  function renderStory(scene) {
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">${state.role ? `РОЛЬ: ${roleLabel(state.role)}` : "ЗАПИСЬ"}</p>
        <h2 class="scene-title">${escapeHtml(scene.title)}</h2>
        <div class="meter" aria-hidden="true">${meterHtml()}</div>
        <p class="prose" id="story-text"></p>
        <div class="choices" id="choices"></div>
      </section>
    `;
    Effects.typeText(document.getElementById("story-text"), scene.text, 64);
    mountChoices(scene.choices || []);
  }

  function renderPhone(scene) {
    screen().innerHTML = `
      <section class="panel">
        <p class="kicker">Входящий сигнал</p>
        <h2 class="scene-title">${escapeHtml(scene.title || "ЗВОНОК")}</h2>
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
  }

  function mountChoices(choices) {
    const box = document.getElementById("choices");
    box.innerHTML = "";
    choices.forEach((c, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";
      btn.innerHTML = `${escapeHtml(c.label)}${c.hint ? `<small>${escapeHtml(c.hint)}</small>` : ""}`;
      btn.style.animationDelay = `${i * 0.05}s`;
      btn.onclick = () => {
        ArchiveAudio.stopPhone();
        go(c.next, c);
      };
      box.appendChild(btn);
    });
  }

  function renderFaces(scene) {
    const hard = !!scene.hard;
    const alternateIndex = Math.floor(Math.random() * 3);
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
      btn.setAttribute("aria-label", `Портрет ${i + 1}`);
      const canvas = document.createElement("canvas");
      const isAlt = i === alternateIndex;
      // hard mode: closer seeds so normals look alike, alt still warped
      const seed = hard ? baseSeed + i : baseSeed + i * 97;
      Effects.drawPortrait(canvas, seed, isAlt);
      if (hard && isAlt) {
        // subtler mark already in draw; add slight extra noise via redraw with same flag
      }
      btn.appendChild(canvas);
      const tag = document.createElement("div");
      tag.className = "face__tag";
      tag.textContent = `SUBJECT ${String.fromCharCode(65 + i)}`;
      btn.appendChild(tag);
      btn.onclick = () => onFacePick(isAlt, scene, btn);
      faces.appendChild(btn);
    }
  }

  function onFacePick(correct, scene, btn) {
    const faces = [...document.querySelectorAll(".face")];
    faces.forEach((f) => (f.disabled = true));
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
      ArchiveAudio.sting();
    } else {
      ArchiveAudio.beepOk();
    }

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
          <div>Серия верных лиц: ${state.faceStreak}</div>
        </div>
        <div class="actions">
          <button class="primary" id="btn-restart" type="button">ПЕРЕМОТАТЬ КАССЕТУ</button>
          <button id="btn-mute-end" type="button">${ArchiveAudio.muted ? "ЗВУК: ВЫКЛ" : "ЗВУК: ВКЛ"}</button>
        </div>
        <div class="log">
          Неофициальный трибьют по мотивам The Mandela Catalogue.
          Не открывайте дверь голосам, которых не должно быть дома.
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
      });
      Effects.setDanger(false);
      render();
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
          "Утром соседи скажут, что вы вышли поздороваться.\nГолос будет ваш. Улыбка — почти.\nВ каталоге появится новая карточка: ваше имя, чужие глаза.",
      };
    }

    if (s >= 4 && p <= 2) {
      return {
        bad: false,
        code: "ENDING // CONTAINED",
        title: "ДОЖИТЬ ДО СМЕНЫ",
        text:
          "Вы не смотрели слишком долго.\nНе отвечали слишком охотно.\nКассета останавливается на кадре инструкции APS — и на этот раз инструкция совпадает с тем, что вы сделали.\nЭто не победа. Это отсрочка.",
      };
    }

    if (state.role === "archive" && s >= 2) {
      return {
        bad: false,
        code: "ENDING // ARCHIVIST",
        title: "КАТАЛОГ ДЕРЖИТСЯ",
        text:
          "Партии размечены верно.\nКто-то в темноте стеллажа так и не получил ваше лицо.\nВы гасите монитор. В отражении гаснете не сразу.",
      };
    }

    if (state.role === "home" && p >= 3) {
      return {
        bad: true,
        code: "ENDING // THRESHOLD",
        title: "ОНИ ЗНАЛИ КОД",
        text:
          "На кухне стоит вторая кружка.\nПар ещё идёт.\nКто-то напевает ту же мелодию, что и вы в детстве — чуть медленнее.",
      };
    }

    return {
      bad: p >= 3,
      code: p >= 3 ? "ENDING // UNCERTAIN" : "ENDING // STATIC",
      title: p >= 3 ? "СИГНАЛ РАЗДВОИЛСЯ" : "ШУМ НА ЛЕНТЕ",
      text:
        p >= 3
          ? "Вы живы. Наверное.\nВ каждой следующей записи ваш голос звучит на полтона ниже.\nАрхив помечает файл как «требует повторной сверки»."
          : "Помехи съедают финал.\nНа этикетке кассеты чьей-то рукой дописано: «не перематывать в одиночестве».\nВы выключаете телевизор. Седьмой канал ещё секунду светится в темноте.",
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

  // occasional ambient glitches while playing
  setInterval(() => {
    if (state.scene === "boot") return;
    if (Math.random() < 0.08 + state.paranoia * 0.03) {
      Effects.glitchBurst(180 + Math.random() * 220);
      if (state.paranoia >= 3 && Math.random() < 0.25) {
        ArchiveAudio.blip(90 + Math.random() * 40, 0.15, 0.03);
      }
    }
  }, 4000);

  setInterval(tickTape, 1000);
  render();
})();
