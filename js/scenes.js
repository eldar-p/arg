/* Полная интерактивная адаптация сюжета The Mandela Catalogue (трибьют).
   События пересказаны своими словами — не дословный скрипт сериала. */
const SCENES = {
  boot: {
    type: "title",
    status: "ВСТАВЬТЕ КАССЕТУ",
    channel: "CH-00",
  },

  /* ========== EPISODE SELECT ========== */
  episode_select: {
    type: "story",
    title: "АРХИВ ЭПИЗОДОВ",
    channel: "CH-00",
    sound: "tape",
    text:
      "Две полки:\n1) Фан-адаптация с протоколами.\n2) Официальные кассеты Alex Kister — через YouTube.",
    choices: [
      {
        label: "▶ ОФИЦИАЛЬНЫЕ КАССЕТЫ (Alex Kister / YouTube)",
        hint: "overthrone, Vol.1–5 и др. — без перезаливки файлов",
        next: "official_tapes",
        flags: { officialTape: "overthrone" },
      },
      {
        label: "▶ С НАЧАЛА (фан-сюжет)",
        hint: "Каждый акт = сюжет → обязательная мини-игра → дальше",
        next: "ep0_overcast",
        flags: { run: "full" },
      },
      {
        label: "Ep.0 — Overcast / «Гавриил»",
        next: "ep0_overcast",
        flags: { run: "ep0" },
      },
      {
        label: "Ep.1 — Vol.1 / Марк и Сезар",
        next: "ep1_cold",
        flags: { run: "ep1" },
      },
      {
        label: "Ep.2 — Vol.2 / Адам и Джона",
        next: "ep2_intro",
        flags: { run: "ep2" },
      },
      {
        label: "Ep.3 — Падение Манделы",
        next: "ep3_intro",
        flags: { run: "ep3" },
      },
      {
        label: "Каталог лиц",
        next: "catalog_full",
      },
    ],
  },

  official_tapes: {
    type: "official",
    title: "ОФИЦИАЛЬНЫЕ КАССЕТЫ",
    channel: "CH-00",
    tape: "overthrone",
    sound: "tape",
    next: "boot",
  },

  catalog_full: {
    type: "catalog",
    title: "ПОЛНЫЙ АРХИВ ПЕРСОНАЛИЙ",
    text: "Все карточки, связанные с делом округа Мандела.",
    unlock: ["mark", "cesar", "thatcher", "sarah", "adam", "jonah", "dave", "ruth", "gabriel", "alternate"],
    showAll: true,
    next: "episode_select",
    choices: [{ label: "К списку эпизодов", next: "episode_select" }],
  },

  /* =========================================================
     EP.0 — OVERCAST / THE BEGINNING
     ========================================================= */
  ep0_overcast: {
    video: "overcast",
    type: "broadcast",
    title: "OVERCAST",
    label: "PRE-MANDELA // CLASSIFIED REEL",
    channel: "CH-01",
    sound: "think",
    unlock: ["gabriel"],
    body:
      "До того как округ узнал слово «Альтернат», людям показали другую историю.\n\nНа плёнке — фигура, называющая себя Гавриилом.\nОна говорит мягко. Она просит вспомнить кого-то, кого вы любите.\n\nЭто не молитва.\nЭто взлом.",
    next: "ep0_message",
  },

  ep0_message: {
    video: "overcast",
    type: "story",
    title: "ПОСЛАНИЕ",
    channel: "CH-01",
    sound: "angel",
    character: "gabriel",
    unlock: ["gabriel", "alternate"],
    text:
      "«Гавриил» утверждает, что принёс истину.\nВ архивной расшифровке между кадрами — другая строка:\n\nОни всегда были здесь.\nРелигия, лица святых, голоса утешения — удобная маска.\n\nПервый инструмент Альтерната — не когти.\nЭто доверие.\n\nКассета замирает. Чтобы идти дальше, архив требует протокол взгляда.",
    choices: [
      {
        label: "Дальше → протокол «не смотри»",
        hint: "Обязательная мини-игра",
        next: "gate_ep0",
        flags: { watched_gabriel: true },
      },
      {
        label: "Сначала досье «Гавриила»",
        next: "dossier_gabriel_ep0",
      },
    ],
  },

  dossier_gabriel_ep0: {
    type: "dossier",
    character: "gabriel",
    sound: "choir",
    next: "gate_ep0",
  },

  gate_ep0: {
    type: "story",
    title: "ШЛЮЗ EP.0",
    channel: "CH-01",
    sound: "think",
    text:
      "THINK OF SOMEONE YOU LOVE.\nНа экране — улыбка, которой нельзя смотреть.\n\n▶ Без этой мини-игры Vol.1 не откроется.",
    choices: [
      { label: "▶ НАЧАТЬ ПРОТОКОЛ ВЗГЛЯДА", next: "mg_lookaway_ep0" },
    ],
  },

  mg_lookaway_ep0: {
    type: "minigame",
    game: "lookaway",
    title: "ПРОТОКОЛ: НЕ СМОТРИТЕ",
    channel: "CH-01",
    text: "«Гавриил» в кадре. Отведите взгляд, пока шкала не достигла 100% — иначе кассета считает вас «посмотревшим».",
    hint: "Курсор на лице = смотрите. Нужно нажать «Отвести взгляд» вовремя.",
    winText: "ПРОТОКОЛ ПРОЙДЕН → Vol.1",
    loseText: "СМОТРЕЛИ СЛИШКОМ ДОЛГО. ПОВТОР.",
    nextCorrect: "ep0_to_vol1",
    nextWrong: "mg_lookaway_ep0",
    retryOnFail: true,
    seed: 9999,
    faceId: "gabriel",
    photo: "assets/portraits/gabriel_alt.jpg",
    stingOnFail: true,
    paranoiaLose: 1,
  },

  ep0_to_vol1: {
    type: "story",
    title: "СВЯЗЬ ЭПИЗОДОВ",
    channel: "CH-01",
    sound: "emergency",
    text:
      "Протокол взгляда закрыт.\nГоды спустя в округе Мандела начинают исчезать люди.\n\nЗвонит телефон в доме Марка Хитклиффа.\nНа линии — голос лучшего друга.",
    choices: [
      {
        label: "▶ Vol.1 — Ночь Марка",
        next: "ep1_cold",
        flags: { role: "archive" },
      },
    ],
  },

  /* =========================================================
     EP.1 — VOL.1 / MARK & CESAR
     ========================================================= */
  ep1_cold: {
    video: "house",
    type: "broadcast",
    title: "MANDELA CATALOGUE — VOL.1",
    label: "MCPD EVIDENCE // TAPE A",
    channel: "CH-07",
    sound: "emergency",
    unlock: ["mark", "cesar", "thatcher"],
    body:
      "ОКРУГ МАНДЕЛА.\nНочь. Дом Марка Хитклиффа.\n\nДоказательная кассета изъята лейтенантом Тэтчером Дэвисом.\nСодержание: телефонные переговоры, домашнее видео, последствия визита.\n\nСубъект на линии представляется как CESAR TORRES.",
    next: "ep1_phone",
  },

  ep1_phone: {
    video: "static_night",
    type: "phone",
    title: "ЗВОНОК // CESAR TORRES",
    from: "CESAR TORRES → MARK HEATHCLIFF",
    line: "Марк… мне нужна помощь. Можно я приеду?",
    channel: "CH-07",
    sound: "phone",
    character: "cesar",
    unlock: ["mark", "cesar"],
    text:
      "Вы слушаете запись с позиции Марка.\nГолос Сезара знаком — слишком знаком.\nВ паузах слышен чужой воздух, будто линия длиннее, чем должна быть.\n\nСезар просит впустить. Говорит, что ему плохо. Что он уже близко.\n\nАрхив не пустит к двери, пока вы не отметите подмену на линии.",
    choices: [
      {
        label: "Дальше → протокол голоса",
        hint: "Обязательная мини-игра",
        next: "gate_ep1_voice",
      },
      {
        label: "Сначала досье Марка",
        next: "dossier_mark_ep1",
      },
    ],
  },

  dossier_mark_ep1: {
    type: "dossier",
    character: "mark",
    sound: "heart",
    next: "gate_ep1_voice",
  },

  gate_ep1_voice: {
    type: "story",
    title: "ШЛЮЗ: ЛИНИЯ",
    channel: "CH-07",
    sound: "speak",
    text:
      "Три реплики. Одна — Альтернат.\nНайди её — иначе сюжет двери не откроется.",
    choices: [
      { label: "▶ ПРОТОКОЛ ГОЛОСА", next: "mg_voice_ep1" },
    ],
  },

  mg_voice_ep1: {
    type: "minigame",
    game: "voice",
    title: "ПРОТОКОЛ: ЧЕЙ ГОЛОС",
    channel: "CH-07",
    text: "Отметьте реплику Альтерната. Без этого кассета не перейдёт к стуку в дверь.",
    round: 0,
    nextCorrect: "ep1_question",
    nextWrong: "mg_voice_ep1",
    retryOnFail: true,
    scoreWin: 1,
    paranoiaLose: 1,
    stingOnFail: true,
    winText: "ПОДМЕНА НАЙДЕНА → ДВЕРЬ",
    loseText: "ОШИБКА. СЛУШАЙТЕ СНОВА.",
  },

  ep1_question: {
    type: "story",
    title: "ПРОВЕРКА",
    channel: "CH-07",
    sound: "scratch",
    character: "mark",
    text:
      "Марк не открывает сразу.\nОн спрашивает то, что должен знать только настоящий Сезар.\n\nОтветы приходят… правильные.\nИ всё же в них нет тепла. Только информация.\n\nЗа дверью — три стука.\n«Открой. Я же это ты.»\n\nДальше только протокол двери.",
    unlock: ["alternate"],
    choices: [
      {
        label: "Дальше → протокол двери",
        hint: "Обязательная мини-игра",
        next: "gate_ep1_door",
        flags: { mark_cautious: true },
      },
    ],
  },

  gate_ep1_door: {
    type: "story",
    title: "ШЛЮЗ: ДВЕРЬ",
    channel: "CH-07",
    sound: "knock",
    text:
      "Три стука. Протокол APS.\nОткрыть = провал сюжета этой ночи.\nИгнорировать / ждать = пройти дальше.",
    choices: [
      { label: "▶ ПРОТОКОЛ ДВЕРИ", next: "mg_knock_ep1" },
    ],
  },

  mg_knock_ep1: {
    type: "minigame",
    game: "knock",
    title: "ПРОТОКОЛ: ТРИ СТУКА",
    channel: "CH-07",
    text: "Выберите действие. Открыть дверь — нельзя. Это ворота к записи ночи.",
    nextCorrect: "ep1_record",
    nextWrong: "ep1_open",
    scoreWin: 1,
    paranoiaLose: 2,
    stingOnFail: true,
    winText: "ДВЕРЬ ДЕРЖИТСЯ → ЗАПИСЬ НОЧИ",
    loseText: "ВЫ ОТКРЫЛИ. ПРОНИКНОВЕНИЕ.",
  },

  ep1_open: {
    video: "house",
    type: "story",
    title: "ДВЕРЬ ОТКРЫТА",
    channel: "CH-07",
    sound: "laugh",
    onEnter: "sting",
    unlock: ["alternate"],
    flags: { opened_door: true },
    text:
      "Протокол провален.\nНа пороге — пауза, потом присутствие входит само.\nКамера ловит лицо, которое не держит форму.\n\nСюжет всё равно идёт — но уже по худшей ветке.",
    paranoia: 1,
    choices: [{ label: "Пережить ночь (сюжет дальше)", next: "ep1_terror" }],
  },

  ep1_record: {
    type: "story",
    title: "ДОКАЗАТЕЛЬСТВА",
    channel: "CH-07",
    sound: "static",
    character: "mark",
    flags: { recorded: true },
    text:
      "Протокол двери пройден. Марк не открыл.\nОн включает камеру. Шёпот за стенами.\nТени не совпадают с источниками света.\n\nАльтернаты так не работают: чем дольше смотришь — тем больше они «правда».",
    choices: [
      { label: "Пережить ночь (сюжет дальше)", next: "ep1_terror" },
    ],
  },

  ep1_terror: {
    video: "terror",
    type: "story",
    title: "Я ХОЧУ ПРОСНУТЬСЯ",
    channel: "CH-07",
    sound: "cry",
    character: "mark",
    unlock: ["mark"],
    text:
      "Часы растягиваются.\nГолос Сезара то умоляет, то смеётся.\nМарк шепчет в камеру: он хочет проснуться.\n\nК утру дом тих. Марка находят мёртвым.\nОбразец №1 в каталоге.\n\nДальше — только через протоколы Тэтчера.",
    onEnter: "glitch",
    paranoia: 1,
    choices: [
      { label: "Дальше → Тэтчер Дэвис", next: "ep1_thatcher" },
      { label: "Досье Сезара (опционально)", next: "dossier_cesar_ep1" },
    ],
  },

  dossier_cesar_ep1: {
    type: "dossier",
    character: "cesar",
    sound: "whisper",
    next: "ep1_thatcher",
  },

  ep1_thatcher: {
    type: "story",
    title: "MCPD // LT. THATCHER DAVIS",
    channel: "CH-07",
    sound: "heart",
    character: "thatcher",
    unlock: ["thatcher", "ruth", "sarah"],
    text:
      "Лейтенант Тэтчер Дэвис входит, когда уже поздно.\nРут фиксирует улики. Сара — сестра — в деле.\n\nЧтобы открыть сверку лиц Торреса, архив требует: плёнка APS → тест → каталог.",
    choices: [
      {
        label: "Дальше → плёнка APS и протоколы",
        next: "ep1_aps",
        flags: { learned_aps: true },
      },
    ],
  },

  ep1_aps: {
    video: "watcher",
    type: "broadcast",
    title: "APS — ЧТО ТАКОЕ АЛЬТЕРНАТ",
    label: "US DEPT. // PUBLIC SAFETY TAPE",
    channel: "CH-07",
    sound: "emergency",
    unlock: ["alternate"],
    body:
      "АЛЬТЕРНАТЫ — существа, имитирующие человека.\n\nТИП 1: копирует голос и манеры на расстоянии.\nТИП 2: принимает телесную форму; лицо всегда «чуть мимо».\nТИП 3: полностью замещает жертву в социальном поле.\n\nПРАВИЛА:\n1) Не вступайте в диалог.\n2) Не смотрите в глаза.\n3) Не открывайте дверь.\n4) Если оно знает ваше имя — оно уже выбрало вас.\n\nСледующий шлюз: тест APS.",
    next: "gate_ep1_quiz",
  },

  gate_ep1_quiz: {
    type: "story",
    title: "ШЛЮЗ: ТЕСТ APS",
    channel: "CH-07",
    sound: "emergency",
    text: "Три вопроса. Без теста сверка лиц не откроется. При провале — повтор.",
    choices: [{ label: "▶ ПРОТОКОЛ APS", next: "mg_quiz_ep1" }],
  },

  mg_quiz_ep1: {
    type: "minigame",
    game: "quiz",
    title: "ПРОТОКОЛ: ТЕСТ APS",
    channel: "CH-07",
    text: "Ответьте по правилам. Это ворота к каталогу Торреса.",
    questions: 3,
    nextCorrect: "gate_ep1_faces",
    nextWrong: "mg_quiz_ep1",
    retryOnFail: true,
    scoreWin: 1,
    paranoiaLose: 1,
    winText: "ТЕСТ СДАН → СВЕРКА ЛИЦ",
    loseText: "НЕ СДАНО. ПОВТОР ТЕСТА.",
  },

  gate_ep1_faces: {
    type: "story",
    title: "ШЛЮЗ: КАТАЛОГ TORRES",
    channel: "CH-07",
    sound: "choir",
    text: "Последний протокол Vol.1: отметьте Альтерната среди трёх карточек.",
    choices: [{ label: "▶ СВЕРКА ЛИЦ", next: "faces_cesar" }],
  },

  faces_cesar: {
    type: "faces",
    title: "ПРОТОКОЛ: КАТАЛОГ // TORRES",
    channel: "CH-07",
    text:
      "Три карточки. Одна — подмена. Нужно угадать верно, чтобы открыть Vol.2.",
    characterSeeds: ["cesar", "mark", "thatcher"],
    sound: "choir",
    nextCorrect: "ep1_faces_ok",
    nextWrong: "faces_cesar",
    retryOnFail: true,
  },

  ep1_faces_ok: {
    type: "story",
    title: "VOL.1 ЗАКРЫТ",
    channel: "CH-07",
    sound: "beepOk",
    score: 2,
    text:
      "Все протоколы Vol.1 пройдены.\nШтамп: TYPE TWO — CESAR TORRES.\nМарк — жертва. Тэтчер уносит кассеты.\n\nСледующая кассета: Bythorne. Адам и Джона.",
    choices: [
      { label: "▶ Vol.2 — сюжет дальше", next: "ep2_intro" },
    ],
  },

  /* =========================================================
     EP.2 — VOL.2 / ADAM & JONAH
     ========================================================= */
  ep2_intro: {
    video: "radio_room",
    type: "broadcast",
    title: "MANDELA CATALOGUE — VOL.2",
    label: "BYTHORNE PARANORMAL SOCIETY",
    channel: "CH-09",
    sound: "static",
    unlock: ["adam", "jonah", "dave"],
    body:
      "Адам Мюррей и Джона Маршалл едут в дом с жалобами.\nПравило, которое они нарушат: не разделяться.\n\nСначала — протокол рации. Без него дом не откроется.",
    next: "gate_ep2_radio",
  },

  gate_ep2_radio: {
    type: "story",
    title: "ШЛЮЗ: РАЦИЯ",
    channel: "CH-09",
    sound: "radio",
    text:
      "Помехи. Человеческие позывные падают сквозь статику.\nЛовушки LOOK / OPEN / LOVE кликать нельзя.\nСоберите 3 верных сигнала — иначе Bythorne не загрузится.",
    choices: [{ label: "▶ ПРОТОКОЛ РАЦИИ", next: "mg_static_ep2" }],
  },

  mg_static_ep2: {
    type: "minigame",
    game: "static",
    title: "ПРОТОКОЛ: РАЦИЯ BYTHORNE",
    channel: "CH-09",
    sound: "radio",
    text: "Выцепите человеческие метки. Без этого сюжет дома не начнётся.",
    need: 3,
    lives: 2,
    nextCorrect: "ep2_choose",
    nextWrong: "mg_static_ep2",
    retryOnFail: true,
    scoreWin: 1,
    paranoiaLose: 1,
    winText: "СВЯЗЬ ЕСТЬ → ДОМ",
    loseText: "ЧАСТОТА ПОТЕРЯНА. ПОВТОР.",
  },

  ep2_choose: {
    video: "radio_room",
    type: "story",
    title: "ЧЬИМИ ГЛАЗАМИ",
    channel: "CH-09",
    sound: "tape",
    text:
      "Рация жива. Дальше — чей POV архив пишет основным.\nПосле выбора сразу протокол камеры (не смотри).",
    choices: [
      {
        label: "Адам — камера → протокол взгляда",
        next: "gate_ep2_look",
        flags: { role: "adam", pov: "adam" },
      },
      {
        label: "Джона — рация → протокол взгляда",
        next: "gate_ep2_look",
        flags: { role: "jonah", pov: "jonah" },
      },
    ],
  },

  gate_ep2_look: {
    type: "story",
    title: "ШЛЮЗ: КАМЕРА",
    channel: "CH-09",
    sound: "angel",
    text:
      "В углу дома — фигура.\nАдам целится объективом. Джона шепчет уходить.\nЧтобы войти в дом сюжетно, нужно не смотреть слишком долго.",
    unlock: ["adam", "jonah"],
    choices: [{ label: "▶ ПРОТОКОЛ ВЗГЛЯДА / КАМЕРА", next: "mg_lookaway_ep2" }],
  },

  mg_lookaway_ep2: {
    type: "minigame",
    game: "lookaway",
    title: "ПРОТОКОЛ: НЕ СНИМАЙ В ГЛАЗА",
    channel: "CH-09",
    text: "Лицо в видоискателе. Отведите взгляд. Иначе запись «съест» вас.",
    hint: "Как в Ep.0 — но уже в доме Bythorne.",
    seed: 6666,
    faceId: "alternate",
    photo: "assets/portraits/alternate_alt.jpg",
    limitMs: 2600,
    nextCorrect: "ep2_house",
    nextWrong: "mg_lookaway_ep2",
    retryOnFail: true,
    stingOnFail: true,
    paranoiaLose: 1,
    winText: "ОБЪЕКТИВ ОПУЩЕН → ДОМ",
    loseText: "СЛИШКОМ ДОЛГО В КАДРЕ. ПОВТОР.",
  },

  ep2_house: {
    video: "corridor",
    type: "story",
    title: "ДОМ",
    channel: "CH-09",
    sound: "knock",
    character: "adam",
    unlock: ["adam", "jonah"],
    text:
      "Протокол камеры пройден. Вы внутри записи дома.\nДжона: «Нам надо уходить.»\nАдам: «Ты его видишь?»\n\nВыбор влияет на флаги — но к сверке лиц всё равно ведёт протокол.",
    choices: [
      {
        label: "Снимать дальше → к финалу Vol.2",
        next: "ep2_deeper",
        paranoia: 1,
        flags: { pushed_deeper: true },
      },
      {
        label: "Пытаться уйти → к финалу Vol.2",
        next: "ep2_leave_try",
        score: 1,
        flags: { tried_leave: true },
      },
      {
        label: "Разделиться → к финалу Vol.2",
        next: "ep2_split",
        paranoia: 2,
        score: -1,
        flags: { split: true },
      },
    ],
  },

  ep2_leave_try: {
    type: "story",
    title: "ВЫХОД ЗАКРЫТ",
    channel: "CH-09",
    sound: "door",
    text:
      "Они разворачиваются к двери.\nРучка поддаётся — и тут же замирает, будто с другой стороны держат.\n\nИз темноты — голос одного из них, хотя оба молчат.\n«Останься. Нам ещё нужно, чтобы ты посмотрел.»",
    onEnter: "glitch",
    choices: [{ label: "Углубиться — другого пути нет", next: "ep2_deeper" }],
  },

  ep2_split: {
    video: "corridor",
    type: "story",
    title: "РАЗДЕЛЕНИЕ",
    channel: "CH-09",
    sound: "whisper",
    character: "jonah",
    text:
      "Рация шипит.\nДжона остаётся у лестницы. Адам уходит в коридор с камерой.\n\nЧерез минуту голос Адама просит Джону «подойти ближе к углу».\nЧерез две — голос Адама просит того же… из двух мест сразу.\n\nДжона понимает: один из голосов — не Адам.",
    paranoia: 1,
    choices: [
      {
        label: "Джона зовёт настоящего по паролю",
        next: "ep2_password",
        score: 1,
        flags: { used_password: true },
      },
      {
        label: "Джона бежит на голос",
        next: "ep2_jonah_runs",
        paranoia: 2,
        score: -1,
      },
    ],
  },

  ep2_password: {
    type: "story",
    title: "ПАРОЛЬ",
    channel: "CH-09",
    sound: "scratch",
    text:
      "Настоящий Адам отвечает с задержкой — человеком.\nЛожный отвечает идеально и сразу.\n\nОни снова вместе. Камера дрожит.\nВ конце коридора сущность больше не прячется: она хочет, чтобы её записали.",
    choices: [{ label: "Смотреть в объектив", next: "ep2_deeper" }],
  },

  ep2_jonah_runs: {
    type: "story",
    title: "НЕ ТОТ ГОЛОС",
    channel: "CH-09",
    sound: "speak",
    onEnter: "face",
    text:
      "Джона находит «Адама» слишком быстро.\nУлыбка уже готова. Глаза — нет.\n\nКрик в рацию обрывается помехами.\nАдам (настоящий) слышит это слишком поздно.",
    paranoia: 1,
    flags: { jonah_hurt: true },
    choices: [{ label: "Адам бежит на звук", next: "ep2_deeper" }],
  },

  ep2_deeper: {
    type: "story",
    title: "ОН В КАДРЕ",
    channel: "CH-09",
    sound: "alternate",
    onEnter: "glitch",
    unlock: ["alternate", "gabriel"],
    text:
      "Камера ловит Альтерната целиком.\nРост человеческий. Лицо — ошибка. Присутствие — как у «Гавриила» на старой плёнке: оно хочет быть увиденным.\n\nАдам не отпускает запись.\nДжона умоляет выключить свет на объективе, выключить всё.\n\nВ этот миг решается больше, чем жизнь одного дома: что именно уйдёт в интернет, в архив Дейва, в головы зрителей.",
    choices: [
      {
        label: "Продолжать снимать (как Адам)",
        next: "ep2_film",
        paranoia: 2,
        flags: { filmed_alternate: true },
      },
      {
        label: "Выключить камеру и тащить Джону к выходу",
        next: "ep2_escape",
        score: 2,
        flags: { saved_focus: true },
      },
    ],
  },

  ep2_film: {
    video: "watcher",
    type: "story",
    title: "ДОКАЗАТЕЛЬСТВО ЦЕНОЙ УМА",
    channel: "CH-09",
    sound: "choir",
    character: "adam",
    text:
      "Плёнка получает то, за чем они приехали.\nАдам смотрит слишком долго.\nДальше — обязательная сверка лиц Bythorne.",
    paranoia: 1,
    flags: { adam_marked: true, filmed_alternate: true },
    choices: [{ label: "Дальше → шлюз сверки", next: "gate_ep2_faces" }],
  },

  ep2_escape: {
    type: "story",
    title: "ВЫНОС",
    channel: "CH-09",
    sound: "door",
    character: "jonah",
    text:
      "Камера падает. Они бегут.\nДжона жив. Адам молчит слишком долго.\nДальше — обязательная сверка лиц.",
    score: 1,
    flags: { saved_focus: true },
    choices: [{ label: "Дальше → шлюз сверки", next: "gate_ep2_faces" }],
  },

  gate_ep2_faces: {
    type: "story",
    title: "ШЛЮЗ: BYTHORNE CATALOG",
    channel: "CH-09",
    sound: "whisper",
    text: "Отметьте подмену Murray/Marshall. Без верного ответа Ep.3 не откроется.",
    choices: [{ label: "▶ ПРОТОКОЛ СВЕРКИ ЛИЦ", next: "faces_vol2" }],
  },

  faces_vol2: {
    type: "faces",
    title: "ПРОТОКОЛ: КАТАЛОГ // MURRAY–MARSHALL",
    channel: "CH-09",
    text: "Кто на записи — человек, а кто уже запись? Угадайте верно.",
    characterSeeds: ["adam", "jonah", "dave"],
    hard: true,
    sound: "whisper",
    nextCorrect: "ep2_ok",
    nextWrong: "faces_vol2",
    retryOnFail: true,
  },

  ep2_ok: {
    type: "story",
    title: "VOL.2 ЗАКРЫТ",
    channel: "CH-09",
    sound: "beepOk",
    score: 2,
    text:
      "Протоколы Vol.2 пройдены.\nДейв Ли получит материал. Тэтчер — головную боль.\nОкруг — следующую волну.",
    unlock: ["dave"],
    choices: [
      { label: "▶ Ep.3 — падение Манделы", next: "ep3_intro" },
    ],
  },

  /* =========================================================
     EP.3 — AFTERMATH / FALL OF MANDELA
     ========================================================= */
  ep3_intro: {
    video: "fog",
    type: "broadcast",
    title: "ПОСЛЕ КАТАЛОГА",
    label: "MANDELA COUNTY // COLLAPSE TIMELINE",
    channel: "CH-13",
    sound: "emergency",
    unlock: ["thatcher", "sarah", "adam", "dave"],
    body:
      "Округ осыпается.\nТэтчер, Сара, вопрос об Адаме.\n\nФинальный акт на протоколах: линия 911 → память каталога → последняя сверка.",
    next: "ep3_thatcher",
  },

  ep3_thatcher: {
    type: "story",
    title: "ЛЕЙТЕНАНТ БЕЗ СТРАНЫ",
    channel: "CH-13",
    sound: "heart",
    character: "thatcher",
    unlock: ["thatcher", "ruth"],
    text:
      "Тэтчер смотрит сводки. Рут слышит на 911 одни и те же голоса.\nСначала — распознать ложную линию. Без протокола сюжет не идёт.",
    choices: [
      { label: "Дальше → протокол голоса 911", next: "gate_ep3_voice" },
    ],
  },

  gate_ep3_voice: {
    type: "story",
    title: "ШЛЮЗ: ЛИНИЯ 911",
    channel: "CH-13",
    sound: "speak",
    text: "Какая реплика диспетчера — Альтернат? Без этого финал закрыт.",
    choices: [{ label: "▶ ПРОТОКОЛ ГОЛОСА", next: "mg_voice_ep3" }],
  },

  mg_voice_ep3: {
    type: "minigame",
    game: "voice",
    title: "ПРОТОКОЛ: 911",
    channel: "CH-13",
    text: "Отметьте ложного оператора.",
    round: 2,
    nextCorrect: "ep3_branch",
    nextWrong: "mg_voice_ep3",
    retryOnFail: true,
    scoreWin: 1,
    paranoiaLose: 1,
    stingOnFail: true,
    winText: "ЛИНИЯ РАСПОЗНАНА → ДАЛЬШЕ",
    loseText: "ЭТО НЕ ОН. ПОВТОР.",
  },

  ep3_branch: {
    type: "story",
    title: "КАК ДЕРЖАТЬ ОК",
    channel: "CH-13",
    sound: "tape",
    text: "Голос отфильтрован. Выбор Тэтчера — и путь к Саре.",
    choices: [
      {
        label: "Правда в эфир",
        next: "ep3_truth",
        score: 1,
        flags: { push_truth: true },
      },
      {
        label: "Тихий протокол",
        next: "ep3_protocol",
        flags: { quiet_protocol: true },
      },
    ],
  },

  ep3_truth: {
    video: "collapse",
    type: "story",
    title: "ПРАВДА НА ВОЗДУХЕ",
    channel: "CH-13",
    sound: "emergency",
    text:
      "Паника. Кто-то открывает дверь «родственнику» с ТВ.\nСара — одна из немногих, кто не открывает.",
    paranoia: 1,
    choices: [{ label: "К Саре → финальные протоколы", next: "ep3_sarah" }],
  },

  ep3_protocol: {
    type: "story",
    title: "ТИХИЙ ПРОТОКОЛ",
    channel: "CH-13",
    sound: "tape",
    text:
      "Полуправда сохраняет улицы на недели.\nСара всё равно слышит «брата» — и не отвечает.",
    choices: [{ label: "К Саре → финальные протоколы", next: "ep3_sarah" }],
  },

  ep3_sarah: {
    video: "fog",
    type: "story",
    title: "САРА",
    channel: "CH-13",
    sound: "whisper",
    character: "sarah",
    unlock: ["sarah", "mark"],
    text:
      "«Брат не стал бы так улыбаться.»\nОна не открывает.\nДальше — память каталога и финальная сверка.",
    score: 1,
    flags: { sarah_resists: true },
    choices: [
      {
        label: "Адам скомпрометирован → протокол памяти",
        next: "gate_ep3_memory",
        flags: { adam_suspect: true },
        paranoia: 1,
      },
      {
        label: "Адам жертва → протокол памяти",
        next: "gate_ep3_memory",
        flags: { adam_victim: true },
        score: 1,
      },
    ],
  },

  gate_ep3_memory: {
    type: "story",
    title: "ШЛЮЗ: ПАМЯТЬ",
    channel: "CH-13",
    sound: "choir",
    text: "Вспышка карточек. Запомните Альтерната — иначе финал закрыт.",
    choices: [{ label: "▶ ПРОТОКОЛ ПАМЯТИ", next: "mg_memory_ep3" }],
  },

  mg_memory_ep3: {
    type: "minigame",
    game: "memory",
    title: "ПРОТОКОЛ: ПАМЯТЬ КАТАЛОГА",
    channel: "CH-13",
    text: "Запомните подмену. Провал = повтор.",
    flashMs: 2000,
    nextCorrect: "gate_ep3_faces",
    nextWrong: "mg_memory_ep3",
    retryOnFail: true,
    scoreWin: 1,
    paranoiaLose: 1,
    stingOnFail: true,
    winText: "ПАМЯТЬ ДЕРЖИТ → ФИНАЛ",
    loseText: "ЗАБЫЛИ. ПОВТОР ВСПЫШКИ.",
  },

  gate_ep3_faces: {
    type: "story",
    title: "ШЛЮЗ: ФИНАЛ",
    channel: "CH-13",
    sound: "angel",
    text: "Последняя сверка. Угадайте аномалию — откроется концовка.",
    choices: [{ label: "▶ ФИНАЛЬНАЯ СВЕРКА", next: "faces_final" }],
  },

  faces_final: {
    type: "faces",
    title: "ПРОТОКОЛ: ФИНАЛЬНАЯ СВЕРКА",
    channel: "CH-13",
    text: "Отметьте аномалию. Ошибка = повтор.",
    characterSeeds: ["gabriel", "alternate", "thatcher"],
    hard: true,
    sound: "angel",
    nextCorrect: "ep3_collapse",
    nextWrong: "faces_final",
    retryOnFail: true,
  },

  ep3_collapse: {
    video: "end",
    type: "story",
    title: "ОКРУГ МАНДЕЛА",
    channel: "CH-13",
    sound: "presence",
    score: 1,
    text:
      "Все сюжетные протоколы пройдены.\nШколы пусты. Частоты шипят именами мёртвых.\nКаталог завершён не победой — отсутствием живых карточек.",
    choices: [{ label: "КОНЕЦ ЗАПИСИ", next: "ending_gate" }],
  },

  ending_gate: {
    type: "ending",
  },
};
