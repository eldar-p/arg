/* Themed Mandela Catalogue mini-games */
const MiniGames = (() => {
  const VOICE_ROUNDS = [
    {
      prompt: "Какая реплика — Альтернат?",
      options: [
        { text: "Марк, это Сезар. У меня сел аккумулятор у твоей двери.", alt: false },
        { text: "Марк. Открой. Я знаю, как ты дышишь, когда врёшь.", alt: true },
        { text: "Эй, братан, я забыл ключи — наберу маму, подожди.", alt: false },
      ],
    },
    {
      prompt: "Голос за дверью. Кто подмена?",
      options: [
        { text: "Это мама. Код — тот, что на браслете из лагеря.", alt: false },
        { text: "Это мама. Зачем тебе код? Я же твоя мама.", alt: true },
        { text: "Это сосед. У вас свет мигает, всё в порядке?", alt: false },
      ],
    },
    {
      prompt: "911. Какой оператор — ложный?",
      options: [
        { text: "Оставайтесь на линии. Не описывайте себя вслух.", alt: false },
        { text: "Назовите имя и как вы выглядите — чтобы мы знали, кого спасать.", alt: true },
        { text: "Патруль выехал. Не открывайте дверь до сирены.", alt: false },
      ],
    },
  ];

  const QUIZ_ROUNDS = [
    {
      q: "APS: что делать, если голос умершего зовёт вас по имени?",
      options: [
        { t: "Ответить и проверить детали", ok: false },
        { t: "Не вести диалог. Отойти от двери", ok: true },
        { t: "Посмотреть в глазок «на всякий случай»", ok: false },
      ],
    },
    {
      q: "Какой признак Type Two чаще всего верен?",
      options: [
        { t: "Идеальная симметрия лица", ok: false },
        { t: "Лицо и голос «чуть мимо», глаза-ямы", ok: true },
        { t: "Они никогда не знают личных фактов", ok: false },
      ],
    },
    {
      q: "Что делает плёнка «Гавриила»?",
      options: [
        { t: "Лечит страх через молитву", ok: false },
        { t: "Взламывает через образ того, кого вы любите", ok: true },
        { t: "Просто старый религиозный ролик", ok: false },
      ],
    },
    {
      q: "Правило камеры в доме с Альтернатом:",
      options: [
        { t: "Снимать как можно дольше — для доказательств", ok: false },
        { t: "Не смотреть в объектив на него слишком долго", ok: true },
        { t: "Разделиться, чтобы покрыть больше углов", ok: false },
      ],
    },
  ];

  const STATIC_WORDS = {
    safe: ["MARK", "SARAH", "THATCHER", "JONAH", "APS", "MCPD", "HEATHCLIFF"],
    trap: ["OPEN", "LOVE", "LOOK", "GABRIEL", "COME IN", "WAKE UP", "MIRROR"],
  };

  function finish(api, scene, ok) {
    const log = document.getElementById("mg-log");
    if (ok) {
      api.state.score += scene.scoreWin ?? 1;
      api.state.flags.minigamesWon = (api.state.flags.minigamesWon || 0) + 1;
      ArchiveAudio.beepOk();
      Effects.glitchBurst(250);
      if (log) log.textContent = scene.winText || "ПРОТОКОЛ СОБЛЮДЁН. ЗАПИСЬ ПРОДОЛЖАЕТСЯ…";
      setTimeout(() => api.go(scene.nextCorrect || scene.next), 850);
    } else {
      api.state.score += scene.scoreLose ?? -1;
      api.state.paranoia += scene.paranoiaLose ?? 1;
      api.state.flags.minigamesLost = (api.state.flags.minigamesLost || 0) + 1;
      api.clampParanoia();
      api.updateHud();
      ArchiveAudio.beepFail();
      if (scene.stingOnFail) Effects.showAlternateFace(900);
      else Effects.glitchBurst(400);
      if (scene.retryOnFail) {
        if (log) log.textContent = (scene.loseText || "СБОЙ.") + " ПОВТОРИТЕ ПРОТОКОЛ.";
        setTimeout(() => api.go(api.state.scene), 1100);
      } else {
        if (log) log.textContent = scene.loseText || "СБОЙ. ЗАПИСЬ ИДЁТ ДАЛЬШЕ — ХУЖЕ.";
        setTimeout(() => api.go(scene.nextWrong || scene.next), 1100);
      }
    }
  }

  function shell(api, scene, bodyHtml) {
    const ep = api.episodeLabel(scene.channel || "CH-00");
    api.screen().innerHTML = `
      <section class="panel">
        <p class="kicker">${ep} // МИНИ-ИГРА</p>
        <h2 class="scene-title">${api.escapeHtml(scene.title)}</h2>
        <p class="prose">${api.escapeHtml(scene.text || "")}</p>
        ${bodyHtml}
        <div class="log" id="mg-log">${api.escapeHtml(scene.hint || "Выполните протокол.")}</div>
      </section>
    `;
  }

  /* ---- LOOK AWAY: don't stare at the Alternate ---- */
  function lookaway(api, scene) {
    const limit = scene.limitMs || 2800;
    shell(
      api,
      scene,
      `<div class="mg-look" id="mg-look">
        <div class="mg-look__stage" id="mg-stage">
          <canvas id="mg-face" width="180" height="240"></canvas>
          <div class="mg-look__warn">НЕ СМОТРИТЕ В ГЛАЗА</div>
        </div>
        <div class="mg-bar"><i id="mg-gaze"></i></div>
        <div class="mg-look__meta">Взгляд: <span id="mg-pct">0</span>%</div>
        <div class="actions">
          <button class="danger" type="button" id="mg-avert">ОТВЕСТИ ВЗГЛЯД</button>
        </div>
      </div>`
    );

    const canvas = document.getElementById("mg-face");
    const faceSrc =
      scene.photo ||
      (typeof Portraits !== "undefined"
        ? Portraits.pathFor(scene.faceId || "gabriel", true)
        : null);
    Effects.drawPortrait(canvas, scene.seed || 9999, true, faceSrc);
    ArchiveAudio.play("angel");

    let gaze = 0;
    let over = false;
    let done = false;
    const stage = document.getElementById("mg-stage");
    const bar = document.getElementById("mg-gaze");
    const pct = document.getElementById("mg-pct");
    const tickMs = 50;
    const rise = 100 / (limit / tickMs);

    stage.addEventListener("mouseenter", () => { over = true; });
    stage.addEventListener("mouseleave", () => { over = false; });
    stage.addEventListener("touchstart", (e) => { e.preventDefault(); over = true; }, { passive: false });
    stage.addEventListener("touchend", () => { over = false; });

    document.getElementById("mg-avert").onclick = () => {
      if (done) return;
      done = true;
      clearInterval(timer);
      finish(api, scene, gaze < 85);
    };

    const timer = setInterval(() => {
      if (done) return;
      if (over) {
        gaze = Math.min(100, gaze + rise);
        if (gaze > 40) ArchiveAudio.blip(90 + gaze, 0.03, 0.02);
      } else {
        gaze = Math.max(0, gaze - rise * 0.55);
      }
      bar.style.width = `${gaze}%`;
      bar.classList.toggle("hot", gaze >= 70);
      pct.textContent = String(Math.floor(gaze));
      if (gaze >= 100) {
        done = true;
        clearInterval(timer);
        Effects.showAlternateFace(900);
        finish(api, scene, false);
      }
    }, tickMs);
  }

  /* ---- VOICE: pick the Alternate line ---- */
  function voice(api, scene) {
    const round = VOICE_ROUNDS[scene.round ?? Math.floor(Math.random() * VOICE_ROUNDS.length)];
    const opts = [...round.options].sort(() => Math.random() - 0.5);
    shell(
      api,
      scene,
      `<p class="mg-prompt">${api.escapeHtml(round.prompt)}</p>
       <div class="choices" id="mg-choices"></div>`
    );
    ArchiveAudio.play("speak");
    const box = document.getElementById("mg-choices");
    opts.forEach((o) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.textContent = o.text;
      btn.onclick = () => {
        [...box.querySelectorAll("button")].forEach((b) => (b.disabled = true));
        if (o.alt) {
          btn.style.borderColor = "var(--amber)";
          finish(api, scene, true);
        } else {
          btn.style.borderColor = "var(--danger)";
          finish(api, { ...scene, stingOnFail: true }, false);
        }
      };
      box.appendChild(btn);
    });
  }

  /* ---- KNOCK: door protocol ---- */
  function knock(api, scene) {
    const cases = scene.cases || [
      {
        desc: "Три стука. Голос друга. Он отказывается назвать общий пароль и злится.",
        correct: "ignore",
      },
      {
        desc: "Стучат как сосед. Называет вчерашнюю деталь верно. Просит подождать у двери, не открывать — «там кто-то ещё».",
        correct: "wait",
      },
      {
        desc: "Голос матери. Знает код. Дыхание совпадает с телефонным звонком, который идёт одновременно с другой линии.",
        correct: "ignore",
      },
    ];
    const c = cases[Math.floor(Math.random() * cases.length)];
    shell(
      api,
      scene,
      `<div class="mg-knock">
        <div class="mg-knock__pulse" id="mg-pulse"></div>
        <p class="mg-prompt">${api.escapeHtml(c.desc)}</p>
        <div class="choices">
          <button class="choice" type="button" data-a="open">Открыть дверь</button>
          <button class="choice" type="button" data-a="ignore">Игнорировать / не отвечать</button>
          <button class="choice" type="button" data-a="wait">Ждать патруль, не открывать</button>
        </div>
      </div>`
    );
    ArchiveAudio.play("knock");
    setTimeout(() => ArchiveAudio.play("presence"), 500);
    const pulse = document.getElementById("mg-pulse");
    let n = 0;
    const knockAnim = setInterval(() => {
      pulse.classList.remove("hit");
      void pulse.offsetWidth;
      pulse.classList.add("hit");
      n += 1;
      if (n >= 3) clearInterval(knockAnim);
    }, 420);

    document.querySelectorAll("[data-a]").forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll("[data-a]").forEach((b) => (b.disabled = true));
        const a = btn.getAttribute("data-a");
        // В логике Манделы открыть — всегда провал; ignore/wait — протокол
        const ok = a !== "open" && (a === c.correct || a === "ignore" || a === "wait");
        finish(api, { ...scene, stingOnFail: a === "open" }, ok);
      };
    });
  }

  /* ---- MEMORY: flash alternate, then pick ---- */
  function memory(api, scene) {
    const count = 4;
    const altIndex = Math.floor(Math.random() * count);
    const base = (Date.now() % 50000) + 3;
    shell(
      api,
      scene,
      `<p class="mg-prompt" id="mg-mem-prompt">Запомните Альтерната. Карточки мелькнут…</p>
       <div class="faces mg-memory" id="mg-mem"></div>`
    );

    const box = document.getElementById("mg-mem");
    const canvases = [];
    for (let i = 0; i < count; i++) {
      const wrap = document.createElement("div");
      wrap.className = "face mg-memory__slot";
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 240;
      Effects.drawPortrait(canvas, base + i * 41, i === altIndex);
      wrap.appendChild(canvas);
      const tag = document.createElement("div");
      tag.className = "face__tag";
      tag.textContent = `SLOT ${i + 1}`;
      wrap.appendChild(tag);
      box.appendChild(wrap);
      canvases.push({ wrap, canvas, alt: i === altIndex, seed: base + i * 41 });
    }

    ArchiveAudio.play("choir");
    setTimeout(() => {
      box.classList.add("is-hidden");
      document.getElementById("mg-mem-prompt").textContent =
        "Кто был подменой? Выберите слот.";
      box.classList.remove("is-hidden");
      box.innerHTML = "";
      // reshuffle display order but keep identity
      const order = canvases.map((c, i) => i).sort(() => Math.random() - 0.5);
      order.forEach((idx) => {
        const item = canvases[idx];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "face";
        const canvas = document.createElement("canvas");
        canvas.width = 180;
        canvas.height = 240;
        Effects.drawPortrait(canvas, item.seed, item.alt);
        btn.appendChild(canvas);
        const tag = document.createElement("div");
        tag.className = "face__tag";
        tag.textContent = `SLOT ${idx + 1}`;
        btn.appendChild(tag);
        btn.onclick = () => {
          [...box.querySelectorAll("button")].forEach((b) => (b.disabled = true));
          finish(api, { ...scene, stingOnFail: true }, item.alt);
        };
        box.appendChild(btn);
      });
    }, scene.flashMs || 2200);
  }

  /* ---- STATIC: catch the human token in noise ---- */
  function staticGame(api, scene) {
    const need = scene.need || 3;
    let got = 0;
    let lives = scene.lives || 2;
    shell(
      api,
      scene,
      `<div class="mg-static">
        <div class="mg-static__hud">СИГНАЛ <b id="mg-got">0</b>/${need} · ОШИБКИ <b id="mg-lives">${lives}</b></div>
        <div class="mg-static__stream" id="mg-stream"></div>
        <p class="mg-prompt">Кликайте человеческие метки. Ловушки (LOOK / OPEN / LOVE…) — не трогать.</p>
      </div>`
    );
    ArchiveAudio.play("radio");

    const stream = document.getElementById("mg-stream");
    let active = true;
    let spawns = 0;

    function spawn() {
      if (!active) return;
      spawns += 1;
      const trap = Math.random() < 0.55;
      const list = trap ? STATIC_WORDS.trap : STATIC_WORDS.safe;
      const word = list[Math.floor(Math.random() * list.length)];
      const el = document.createElement("button");
      el.type = "button";
      el.className = `mg-chip ${trap ? "is-trap" : "is-safe"}`;
      el.textContent = word;
      el.style.left = `${8 + Math.random() * 75}%`;
      el.style.animationDuration = `${1.8 + Math.random()}s`;
      el.onclick = () => {
        if (!active) return;
        el.remove();
        if (trap) {
          lives -= 1;
          ArchiveAudio.beepFail();
          Effects.glitchBurst(200);
          document.getElementById("mg-lives").textContent = String(lives);
          if (lives <= 0) {
            active = false;
            finish(api, { ...scene, stingOnFail: true }, false);
          }
        } else {
          got += 1;
          ArchiveAudio.blip(700, 0.05, 0.04);
          document.getElementById("mg-got").textContent = String(got);
          if (got >= need) {
            active = false;
            finish(api, scene, true);
          }
        }
      };
      stream.appendChild(el);
      setTimeout(() => el.remove(), 2600);
      if (active && spawns < 40) setTimeout(spawn, 480 + Math.random() * 420);
    }
    spawn();
    setTimeout(spawn, 300);
  }

  /* ---- QUIZ: APS rapid fire ---- */
  function quiz(api, scene) {
    const rounds = QUIZ_ROUNDS.slice().sort(() => Math.random() - 0.5).slice(0, scene.questions || 3);
    let i = 0;
    let wrong = 0;

    function show() {
      const r = rounds[i];
      shell(
        api,
        scene,
        `<p class="mg-prompt">Вопрос ${i + 1}/${rounds.length}</p>
         <p class="prose">${api.escapeHtml(r.q)}</p>
         <div class="choices" id="mg-choices"></div>`
      );
      const box = document.getElementById("mg-choices");
      const opts = [...r.options].sort(() => Math.random() - 0.5);
      opts.forEach((o) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice";
        btn.textContent = o.t;
        btn.onclick = () => {
          [...box.querySelectorAll("button")].forEach((b) => (b.disabled = true));
          if (o.ok) {
            ArchiveAudio.beepOk();
            i += 1;
            if (i >= rounds.length) finish(api, scene, wrong === 0 || wrong < 2);
            else setTimeout(show, 400);
          } else {
            wrong += 1;
            ArchiveAudio.beepFail();
            Effects.glitchBurst(250);
            i += 1;
            if (wrong >= 2) finish(api, { ...scene, stingOnFail: true }, false);
            else if (i >= rounds.length) finish(api, scene, true);
            else setTimeout(show, 450);
          }
        };
        box.appendChild(btn);
      });
    }
    ArchiveAudio.play("emergency");
    show();
  }

  function render(api, scene) {
    const game = scene.game || scene.minigame;
    const map = {
      lookaway,
      voice,
      knock,
      memory,
      static: staticGame,
      quiz,
    };
    (map[game] || lookaway)(api, scene);
  }

  return { render };
})();
