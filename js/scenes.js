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
      "Полный сюжет округа Мандела — в хронологии кассет.\n\nВы — оператор архива. Каждая лента — чей-то последний нормальный день.\nВыборы внутри эпизодов меняют, что попадёт в финальный каталог.",
    choices: [
      {
        label: "▶ С НАЧАЛА (полный сюжет)",
        hint: "Overcast → Vol.1 → Vol.2 → Падение округа",
        next: "ep0_overcast",
        flags: { run: "full" },
      },
      {
        label: "Ep.0 — Overcast / «Гавриил»",
        hint: "Ложный архангел. Первая ложь.",
        next: "ep0_overcast",
        flags: { run: "ep0" },
      },
      {
        label: "Ep.1 — Vol.1 / Марк и Сезар",
        hint: "Ночной звонок. Дверь. Альтернат.",
        next: "ep1_cold",
        flags: { run: "ep1" },
      },
      {
        label: "Ep.2 — Vol.2 / Адам и Джона",
        hint: "Bythorne. Камера. Не разделяйтесь.",
        next: "ep2_intro",
        flags: { run: "ep2" },
      },
      {
        label: "Ep.3 — Падение Манделы",
        hint: "Тэтчер. Сара. Пустой округ.",
        next: "ep3_intro",
        flags: { run: "ep3" },
      },
      {
        label: "Каталог лиц",
        next: "catalog_full",
      },
    ],
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
    type: "story",
    title: "ПОСЛАНИЕ",
    channel: "CH-01",
    sound: "gabriel",
    character: "gabriel",
    unlock: ["gabriel", "alternate"],
    text:
      "«Гавриил» утверждает, что принёс истину.\nВ архивной расшифровке между кадрами — другая строка:\n\nОни всегда были здесь.\nРелигия, лица святых, голоса утешения — удобная маска.\n\nПервый инструмент Альтерната — не когти.\nЭто доверие.",
    choices: [
      {
        label: "Смотреть плёнку дальше",
        hint: "Think of someone you love…",
        next: "ep0_think",
        paranoia: 1,
        flags: { watched_gabriel: true },
      },
      {
        label: "Остановить воспроизведение",
        hint: "Как велит поздний протокол APS",
        next: "ep0_stop",
        score: 1,
        flags: { stopped_gabriel: true },
      },
      {
        label: "Открыть досье «Гавриила»",
        next: "dossier_gabriel_ep0",
      },
    ],
  },

  dossier_gabriel_ep0: {
    type: "dossier",
    character: "gabriel",
    sound: "choir",
    next: "ep0_think",
  },

  ep0_think: {
    type: "story",
    title: "THINK OF SOMEONE YOU LOVE",
    channel: "CH-01",
    sound: "think",
    onEnter: "glitch",
    text:
      "Экран просит образ. Имя. Лицо.\nЧем яснее вы вспоминаете — тем точнее копия.\n\nВ статической сетке на секунду появляется улыбка:\nслишком широкая, глаза — пустые.\n\nТак начинается Каталог: не с монстра за дверью, а с мысли, которую вам разрешили подумать.",
    paranoia: 1,
    choices: [
      { label: "Перейти к Vol.1 — округ Мандела", next: "ep0_to_vol1" },
    ],
  },

  ep0_stop: {
    type: "story",
    title: "ВОСПРОИЗВЕДЕНИЕ ПРЕРВАНО",
    channel: "CH-01",
    sound: "tape",
    text:
      "Вы выключаете плёнку на полуслове.\nВ тишине всё равно слышен низкий хор — будто сигнал уже в комнате.\n\nНа этикетке кассеты чужой рукой:\n«ПОЗДНО. ОНИ УЖЕ ЗНАЮТ ИМЕНА.»",
    choices: [
      { label: "Перейти к Vol.1 — округ Мандела", next: "ep0_to_vol1" },
    ],
  },

  ep0_to_vol1: {
    type: "story",
    title: "СВЯЗЬ ЭПИЗОДОВ",
    channel: "CH-01",
    sound: "emergency",
    text:
      "Годы спустя в округе Мандела начинают исчезать люди.\nПолиция ещё пишет «самоубийство», «пропал без вести».\n\nПотом звонит телефон в доме Марка Хитклиффа.\nНа линии — голос лучшего друга.",
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
    type: "phone",
    title: "ЗВОНОК // CESAR TORRES",
    from: "CESAR TORRES → MARK HEATHCLIFF",
    line: "Марк… мне нужна помощь. Можно я приеду?",
    channel: "CH-07",
    sound: "phone",
    character: "cesar",
    unlock: ["mark", "cesar"],
    text:
      "Вы слушаете запись с позиции Марка.\nГолос Сезара знаком — слишком знаком.\nВ паузах слышен чужой воздух, будто линия длиннее, чем должна быть.\n\nСезар просит впустить. Говорит, что ему плохо. Что он уже близко.",
    choices: [
      {
        label: "Как Марк: не открывать, выяснить детали",
        next: "ep1_question",
        score: 1,
        flags: { mark_cautious: true },
      },
      {
        label: "Как Марк: поверить другу и подойти к двери",
        next: "ep1_door",
        paranoia: 1,
        flags: { mark_trust: true },
      },
      {
        label: "Открыть досье Марка",
        next: "dossier_mark_ep1",
      },
    ],
  },

  dossier_mark_ep1: {
    type: "dossier",
    character: "mark",
    sound: "heart",
    next: "ep1_question",
  },

  ep1_question: {
    type: "story",
    title: "ПРОВЕРКА",
    channel: "CH-07",
    sound: "scratch",
    character: "mark",
    text:
      "Марк не открывает сразу.\nОн спрашивает то, что должен знать только настоящий Сезар.\n\nОтветы приходят… правильные.\nИ всё же в них нет тепла. Только информация.\n\nЗа дверью — три стука.\nПотом голос снова:\n«Открой. Я же это ты.»",
    unlock: ["alternate"],
    choices: [
      {
        label: "Смотреть в глазок",
        next: "ep1_peephole",
        paranoia: 2,
        flags: { looked_peephole: true },
      },
      {
        label: "Не смотреть. Отойти. Записывать.",
        next: "ep1_record",
        score: 1,
        flags: { recorded: true },
      },
      {
        label: "Открыть дверь",
        next: "ep1_open",
        paranoia: 3,
        score: -2,
        flags: { opened_door: true },
      },
    ],
  },

  ep1_door: {
    type: "story",
    title: "У ДВЕРИ",
    channel: "CH-07",
    sound: "knock",
    text:
      "Марк подходит ближе.\nСквозь дерево — дыхание.\n\n«Пожалуйста.»\nГолос Сезара срывается в чужой регистр и возвращается обратно — как плохо настроенный приёмник.\n\nВ этот момент Марк ещё может отступить.",
    choices: [
      { label: "Отступить и не смотреть", next: "ep1_record", score: 1 },
      { label: "Взглянуть в глазок", next: "ep1_peephole", paranoia: 2, flags: { looked_peephole: true } },
      { label: "Открыть", next: "ep1_open", paranoia: 3, score: -2, flags: { opened_door: true } },
    ],
  },

  ep1_peephole: {
    type: "story",
    title: "ГЛАЗОК",
    channel: "CH-07",
    sound: "face",
    onEnter: "face",
    unlock: ["cesar", "alternate"],
    text:
      "Рыбий глаз искажает крыльцо.\n«Сезар» улыбается.\nУлыбка шире лица. Глаза — ямы.\nПропорции чуть мимо — как у плохой копии, которую всё равно узнаёшь.\n\nЭто уже не друг.\nЭто то, что выучило друга.",
    paranoia: 1,
    choices: [
      { label: "Захлопнуть взгляд. Бежать записывать.", next: "ep1_record", score: 1 },
      { label: "Замереть от ужаса у двери", next: "ep1_terror", paranoia: 2 },
    ],
  },

  ep1_open: {
    type: "story",
    title: "ДВЕРЬ ОТКРЫТА",
    channel: "CH-07",
    sound: "door",
    onEnter: "sting",
    unlock: ["alternate"],
    text:
      "На пороге — пауза.\nНикого «нормального».\n\nПотом присутствие входит само — без шагов, которые должны сопровождать тело.\nКамера Марка ловит помехи. Лицо в кадре не держит форму.\n\nВ отчёте MCPD это назовут «критическим проникновением».\nДля Марка это конец возможности притворяться, что друг ещё человек.",
    paranoia: 1,
    choices: [{ label: "Ночь внутри дома", next: "ep1_terror" }],
  },

  ep1_record: {
    type: "story",
    title: "ДОКАЗАТЕЛЬСТВА",
    channel: "CH-07",
    sound: "static",
    character: "mark",
    text:
      "Марк включает камеру.\nШёпот за стенами. Тени не совпадают с источниками света.\nНа записи он повторяет себе, что устройство поможет — что реальность останется реальностью, если её снять.\n\nАльтернаты так не работают.\nЧем дольше смотришь — тем больше они становятся «правдой».",
    choices: [
      { label: "Пережить ночь", next: "ep1_terror" },
    ],
  },

  ep1_terror: {
    type: "story",
    title: "Я ХОЧУ ПРОСНУТЬСЯ",
    channel: "CH-07",
    sound: "whisper",
    character: "mark",
    unlock: ["mark"],
    text:
      "Часы растягиваются.\nГолос Сезара то умоляет, то смеётся, то говорит из соседней комнаты, хотя дверь закрыта.\n\nМарк шепчет в камеру то, что потом назовут его последними словами:\nон хочет проснуться.\nОн больше не уверен, что сон — это сон.\n\nК утру дом тих.\nМарка находят мёртвым.\nОфициально — трагедия.\nНеофициально — образец №1 в каталоге.",
    onEnter: "glitch",
    paranoia: 1,
    choices: [
      { label: "Досье Сезара Торреса", next: "dossier_cesar_ep1" },
      { label: "Прибытие Тэтчера Дэвиса", next: "ep1_thatcher" },
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
      "Лейтенант Тэтчер Дэвис входит в дом, когда уже поздно спасать.\nРут Уивер помогает фиксировать улики.\nСара Хитклифф — сестра — становится частью дела, которого полиция ещё не умеет называть.\n\nНа столе — кассеты Марка.\nНа стене — следы того, что не оставляют люди.\nТэтчер впервые по-настоящему видит: это не «культ» и не «истерия».",
    choices: [
      {
        label: "Изучить учебную плёнку APS",
        next: "ep1_aps",
        score: 1,
        flags: { learned_aps: true },
      },
      {
        label: "Сверка лиц: кто из «Сезаров» настоящий",
        next: "faces_cesar",
      },
    ],
  },

  ep1_aps: {
    type: "broadcast",
    title: "APS — ЧТО ТАКОЕ АЛЬТЕРНАТ",
    label: "US DEPT. // PUBLIC SAFETY TAPE",
    channel: "CH-07",
    sound: "emergency",
    unlock: ["alternate"],
    body:
      "АЛЬТЕРНАТЫ — существа, имитирующие человека.\n\nТИП 1: копирует голос и манеры на расстоянии.\nТИП 2: принимает телесную форму; лицо всегда «чуть мимо».\nТИП 3: полностью замещает жертву в социальном поле.\n\nПРАВИЛА:\n1) Не вступайте в диалог.\n2) Не смотрите в глаза.\n3) Не открывайте дверь.\n4) Если оно знает ваше имя — оно уже выбрало вас.\n\nЕсли вы слышите голос умершего — это не чудо.",
    next: "faces_cesar",
  },

  faces_cesar: {
    type: "faces",
    title: "КАТАЛОГ // TORRES",
    channel: "CH-07",
    text:
      "Три карточки из дела Vol.1.\nОдна — подмена. Отметьте Альтерната — так, как должен был сделать архив после смерти Марка.",
    characterSeeds: ["cesar", "mark", "thatcher"],
    sound: "choir",
    nextCorrect: "ep1_faces_ok",
    nextWrong: "ep1_faces_bad",
  },

  ep1_faces_ok: {
    type: "story",
    title: "ВОЛ.1 — КАТАЛОГ ОБНОВЛЁН",
    channel: "CH-07",
    sound: "beepOk",
    score: 2,
    text:
      "Штамп: TYPE TWO — CESAR TORRES (DISPUTED).\nМарк Хитклифф — жертва.\nТэтчер уносит кассеты в участок.\n\nОкруг ещё жив.\nНо «Гавриил» уже добился главного: люди боятся друзей.",
    choices: [
      {
        label: "▶ Vol.2 — Bythorne (Адам и Джона)",
        next: "ep2_intro",
      },
      {
        label: "Сначала каталог лиц Vol.1",
        next: "catalog_vol1",
      },
    ],
  },

  ep1_faces_bad: {
    type: "story",
    title: "ОШИБКА АРХИВА",
    channel: "CH-07",
    sound: "gabriel",
    onEnter: "face",
    paranoia: 2,
    score: -2,
    flags: { catalog_poisoned: true },
    text:
      "Вы отметили человека.\nАльтернат остаётся в базе как «гражданин».\n\nИменно так ложь расползается из Vol.1 дальше — в патрули, в звонки, в двери соседей.",
    choices: [
      { label: "▶ Vol.2 — несмотря на ошибку", next: "ep2_intro" },
    ],
  },

  catalog_vol1: {
    type: "catalog",
    title: "КАТАЛОГ ПОСЛЕ VOL.1",
    text: "Карточки, связанные с первой волной.",
    unlock: ["mark", "cesar", "thatcher", "sarah", "ruth", "gabriel", "alternate"],
    next: "ep2_intro",
    choices: [{ label: "▶ Vol.2", next: "ep2_intro" }],
  },

  /* =========================================================
     EP.2 — VOL.2 / ADAM & JONAH
     ========================================================= */
  ep2_intro: {
    type: "broadcast",
    title: "MANDELA CATALOGUE — VOL.2",
    label: "BYTHORNE PARANORMAL SOCIETY",
    channel: "CH-09",
    sound: "static",
    unlock: ["adam", "jonah", "dave"],
    body:
      "Спустя время после дела Хитклиффа.\nАдам Мюррей и Джона Маршалл снимают «паранормальное» для своих каналов и для людей вроде Дейва Ли, которые ещё верят, что это можно выложить онлайн и остаться в живых.\n\nОни едут в дом, откуда поступали жалобы.\nПравило, которое они нарушат: не разделяться.",
    next: "ep2_choose",
  },

  ep2_choose: {
    type: "story",
    title: "ЧЬИМИ ГЛАЗАМИ",
    channel: "CH-09",
    sound: "tape",
    text:
      "Две рации. Одна камера.\nНочь вокруг Bythorne густая, как помехи.\n\nВыберите, чей канал архив держит основным.",
    choices: [
      {
        label: "Адам Мюррей — камера вперёд",
        hint: "Он хочет увидеть. Даже если нельзя.",
        next: "ep2_house",
        flags: { role: "adam", pov: "adam" },
      },
      {
        label: "Джона Маршалл — держаться у рации",
        hint: "Он хочет уйти. Рано.",
        next: "ep2_house",
        flags: { role: "jonah", pov: "jonah" },
      },
      {
        label: "Досье Адама",
        next: "dossier_adam_ep2",
      },
      {
        label: "Досье Джоны",
        next: "dossier_jonah_ep2",
      },
    ],
  },

  dossier_adam_ep2: {
    type: "dossier",
    character: "adam",
    sound: "static",
    next: "ep2_house",
  },

  dossier_jonah_ep2: {
    type: "dossier",
    character: "jonah",
    sound: "heart",
    next: "ep2_house",
  },

  ep2_house: {
    type: "story",
    title: "ДОМ",
    channel: "CH-09",
    sound: "knock",
    character: "adam",
    unlock: ["adam", "jonah"],
    text:
      "Дом встречает тишиной.\nАдам ведёт камеру по коридорам. Джона шепчет в рацию, что свет «неправильный».\n\nНа стене — детский рисунок. На полу — след, который не совпадает с обувью.\nВ дальнем углу темнеет фигура. Она не двигается — пока на неё смотрят.\n\nАдам: «Ты его видишь?»\nДжона: «Нам надо уходить.»",
    choices: [
      {
        label: "Настоять: снимать дальше",
        next: "ep2_deeper",
        paranoia: 1,
        flags: { pushed_deeper: true },
      },
      {
        label: "Согласиться уходить",
        next: "ep2_leave_try",
        score: 1,
        flags: { tried_leave: true },
      },
      {
        label: "Разделиться: один к выходу, один к источнику",
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
    sound: "face",
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
    sound: "gabriel",
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
    type: "story",
    title: "ДОКАЗАТЕЛЬСТВО ЦЕНОЙ УМА",
    channel: "CH-09",
    sound: "choir",
    character: "adam",
    text:
      "Плёнка получает то, за чем они приехали.\nИ что-то ещё: Адам смотрит слишком долго.\n\nПозже в архиве появятся версии, что Адам Мюррей после этой ночи уже не полностью «свой».\nКаталог любит таких — тех, кто сам открыл глаза.",
    paranoia: 1,
    flags: { adam_marked: true },
    choices: [{ label: "Сверка лиц Bythorne", next: "faces_vol2" }],
  },

  ep2_escape: {
    type: "story",
    title: "ВЫНОС",
    channel: "CH-09",
    sound: "door",
    character: "jonah",
    text:
      "Камера падает. Они бегут.\nЗа спиной — смех чужим горлом.\n\nНа улице воздух кажется настоящим только первые секунды.\nДжона жив. Адам молчит дольше, чем должен.\nРация в машине сама шепчет их именами.",
    score: 1,
    choices: [{ label: "Сверка лиц Bythorne", next: "faces_vol2" }],
  },

  faces_vol2: {
    type: "faces",
    title: "КАТАЛОГ // MURRAY–MARSHALL",
    channel: "CH-09",
    text: "Кто на записи — человек, а кто уже запись?\nОтметьте подмену.",
    characterSeeds: ["adam", "jonah", "dave"],
    hard: true,
    sound: "whisper",
    nextCorrect: "ep2_ok",
    nextWrong: "ep2_bad",
  },

  ep2_ok: {
    type: "story",
    title: "VOL.2 — ФАЙЛ ЗАКРЫТ?",
    channel: "CH-09",
    sound: "beepOk",
    score: 2,
    text:
      "Аномалия изъята из публичного каталога.\nНо копии плёнки уже ушли к тем, кто умеет их пересматривать.\n\nДейв Ли получит материал.\nТэтчер получит головную боль.\nОкруг Мандела получит следующую волну.",
    unlock: ["dave"],
    choices: [
      { label: "▶ Ep.3 — Падение Манделы", next: "ep3_intro" },
      { label: "Досье Дейва Ли", next: "dossier_dave_ep2" },
    ],
  },

  ep2_bad: {
    type: "story",
    title: "ПОДМЕНА В ЭФИРЕ",
    channel: "CH-09",
    sound: "sting",
    onEnter: "sting",
    paranoia: 2,
    score: -2,
    flags: { catalog_poisoned: true },
    text:
      "Неверный портрет уходит в сеть как «настоящий».\nЗрители запоминают лицо.\nАльтернат получает аудиторию.",
    choices: [{ label: "▶ Ep.3 — Падение Манделы", next: "ep3_intro" }],
  },

  dossier_dave_ep2: {
    type: "dossier",
    character: "dave",
    sound: "tape",
    next: "ep3_intro",
  },

  /* =========================================================
     EP.3 — AFTERMATH / FALL OF MANDELA
     ========================================================= */
  ep3_intro: {
    type: "broadcast",
    title: "ПОСЛЕ КАТАЛОГА",
    label: "MANDELA COUNTY // COLLAPSE TIMELINE",
    channel: "CH-13",
    sound: "emergency",
    unlock: ["thatcher", "sarah", "adam", "dave"],
    body:
      "Округ не падает за одну ночь.\nОн осыпается звонками, пустыми школами, отменёнными сменами MCPD.\n\nТэтчер Дэвис всё ещё ведет дела.\nСара Хитклифф живёт с дырой вместо брата.\nАдам Мюррей возвращается в материалы снова и снова — иногда как следователь, иногда как вопрос.\n\n«Гавриил» больше не прячется в одной кассете.",
    next: "ep3_thatcher",
  },

  ep3_thatcher: {
    type: "story",
    title: "ЛЕЙТЕНАНТ БЕЗ ОК",
    channel: "CH-13",
    sound: "heart",
    character: "thatcher",
    unlock: ["thatcher", "ruth"],
    text:
      "Тэтчер смотрит сводки: исчезновения, «самоубийства», свидетели, которые потом сами становятся пропавшими.\nРут отмечает повторяющиеся голоса на линии 911.\n\nВ одном из отчётов — фраза, которую нельзя писать официально:\nокруг проигрывает войну, о которой нельзя сообщить населению целиком.",
    choices: [
      {
        label: "Настоять на эвакуации / правде",
        next: "ep3_truth",
        score: 1,
        flags: { push_truth: true },
      },
      {
        label: "Продолжать тихие протоколы APS",
        next: "ep3_protocol",
        flags: { quiet_protocol: true },
      },
      {
        label: "Досье Сары Хитклифф",
        next: "dossier_sarah_ep3",
      },
    ],
  },

  dossier_sarah_ep3: {
    type: "dossier",
    character: "sarah",
    sound: "think",
    next: "ep3_sarah",
  },

  ep3_sarah: {
    type: "story",
    title: "САРА",
    channel: "CH-13",
    sound: "whisper",
    character: "sarah",
    unlock: ["sarah", "mark"],
    text:
      "Сара знает: брат не улыбался бы так на последней записи.\nОна сверяет лица лучше иных операторов — потому что потеря научила.\n\nК ней приходят голоса «Марка».\nОна не открывает.\nИногда это единственная победа, которая ещё возможна.",
    score: 1,
    flags: { sarah_resists: true },
    choices: [
      { label: "Вернуться к Тэтчеру", next: "ep3_truth" },
      { label: "Проверить Адама в архиве", next: "ep3_adam" },
    ],
  },

  ep3_truth: {
    type: "story",
    title: "ПРАВДА НА ВОЗДУХЕ",
    channel: "CH-13",
    sound: "emergency",
    text:
      "Попытка сказать всё сразу ломает остатки порядка:\nкто-то верит, кто-то паникует, кто-то открывает дверь «родственнику», которого видел минуту назад по ТВ.\n\nАльтернаты питаются паникой так же охотно, как тишиной.\nТэтчер это понимает слишком поздно.",
    paranoia: 1,
    choices: [{ label: "Адам в материалах дела", next: "ep3_adam" }],
  },

  ep3_protocol: {
    type: "story",
    title: "ТИХИЙ ПРОТОКОЛ",
    channel: "CH-13",
    sound: "tape",
    text:
      "Инструкции. Штампы. Ночные изъятия кассет.\nГород усыпляют полуправдой.\n\nЭто сохраняет улицы на недели дольше.\nИ делает финальный обвал глуше — когда уже некого эвакуировать.",
    choices: [{ label: "Адам в материалах дела", next: "ep3_adam" }],
  },

  ep3_adam: {
    type: "story",
    title: "ВОПРОС МЮРРЕЯ",
    channel: "CH-13",
    sound: "static",
    character: "adam",
    unlock: ["adam", "jonah"],
    text:
      "В поздних томах архива Адам — не просто оператор камеры.\nЕго прошлое, его «удача» в встречах с Альтернатами, его взгляд в объектив становятся предметом сверки.\n\nДжона в записях всё чаще звучит как тот, кто сомневался правильно.\nАдам — как тот, кого сомнение не спасло.\n\nКаталог задаёт вопрос без ответа на бумаге:\nкогда человек перестаёт быть собой — в момент подмены или в момент, когда соглашается смотреть?",
    choices: [
      {
        label: "Считать Адама скомпрометированным",
        next: "faces_final",
        flags: { adam_suspect: true },
        paranoia: 1,
      },
      {
        label: "Считать Адама жертвой, как Марка",
        next: "faces_final",
        flags: { adam_victim: true },
        score: 1,
      },
    ],
  },

  faces_final: {
    type: "faces",
    title: "ФИНАЛЬНАЯ СВЕРКА",
    channel: "CH-13",
    text:
      "Последняя партия карточек округа.\nОдна из них не должна пережить рассвет.",
    characterSeeds: ["gabriel", "alternate", "thatcher"],
    hard: true,
    sound: "gabriel",
    nextCorrect: "ep3_collapse",
    nextWrong: "ep3_replaced",
  },

  ep3_collapse: {
    type: "story",
    title: "ОКРУГ МАНДЕЛА",
    channel: "CH-13",
    sound: "choir",
    score: 1,
    text:
      "Вы верно изымаете аномалию из финального файла.\nЭто ничего не откатывает.\n\nШколы пусты. Частоты полиции шипят именами мёртвых.\nНа дорожных щитах — помехи вместо указателей.\n\nКаталог завершён не потому, что зло побеждено —\nа потому что почти некого каталогизировать.",
    choices: [{ label: "КОНЕЦ ЗАПИСИ", next: "ending_gate" }],
  },

  ep3_replaced: {
    type: "story",
    title: "ВЫ В КАТАЛОГЕ",
    channel: "CH-13",
    sound: "face",
    onEnter: "face",
    paranoia: 2,
    score: -2,
    flags: { operator_replaced: true },
    text:
      "Ошибка оператора.\nВаша карточка автоматически создаётся в системе:\nимя с терминала, лицо с вебкамеры, статус — ACTIVE RESIDENT.\n\n«Гавриил» в помехах благодарит за внимание.",
    choices: [{ label: "КОНЕЦ ЗАПИСИ", next: "ending_gate" }],
  },

  ending_gate: {
    type: "ending",
  },
};
