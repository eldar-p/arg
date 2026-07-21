/* Narrative data — tribute inspired by Mandela Catalogue */
const SCENES = {
  boot: {
    type: "title",
    status: "ВСТАВЬТЕ КАССЕТУ",
    channel: "CH-00",
  },

  intro_tape: {
    type: "broadcast",
    title: "ОБРАЗОВАТЕЛЬНАЯ ПЛЁНКА №3",
    label: "APS // PUBLIC SAFETY",
    sound: "emergency",
    body:
      "Если вы смотрите эту запись — значит, в округе Мандела снова зафиксирована активность.\n\nСущества, известные как АЛЬТЕРНАТЫ, имитируют голоса и лица знакомых вам людей.\n\nПравило первое: не смотрите им в глаза.\nПравило второе: не отвечайте незнакомым голосам за дверью.\nПравило третье: если сомневаетесь — вы уже опоздали.",
    next: "catalog_intro",
  },

  catalog_intro: {
    type: "catalog",
    title: "КАТАЛОГ ЛИЦ ОК 1992",
    text: "Перед сменой откройте досье. Некоторые карточки уже помечены красным.\nВыберите запись — или перейдите к дежурству.",
    unlock: ["mark", "cesar", "thatcher", "gabriel", "alternate"],
    next: "choose_role",
    choices: [
      { label: "К выбору роли ▶", next: "choose_role" },
    ],
  },

  choose_role: {
    type: "story",
    title: "Кто вы сегодня?",
    sound: "tape",
    text:
      "Ленты из архива 1992 года. Официально их не существует.\nНеофициально — кто-то должен их пересмотреть.\n\nНа столе — телефон без АОН, папка MCPD с именем Тэтчера Дэвиса и телевизор на седьмом канале.\nВ статике на секунду проявляется улыбка «Гавриила».",
    unlock: ["thatcher", "gabriel"],
    choices: [
      {
        label: "Я — оператор горячей линии",
        hint: "Звонок Марка. Голос Сезара.",
        next: "operator_start",
        flags: { role: "operator" },
      },
      {
        label: "Я — один дома",
        hint: "Три стука. Знакомый голос.",
        next: "home_start",
        flags: { role: "home" },
      },
      {
        label: "Я — сотрудник архива",
        hint: "Досье Адама, Джоны, Сары…",
        next: "archive_start",
        flags: { role: "archive" },
      },
      {
        label: "Открыть полный каталог лиц",
        hint: "Все досье округа",
        next: "catalog_full",
      },
    ],
  },

  catalog_full: {
    type: "catalog",
    title: "ПОЛНЫЙ АРХИВ ПЕРСОНАЛИЙ",
    text: "Mandela County Archive — все доступные карточки.",
    unlock: ["mark", "cesar", "thatcher", "sarah", "adam", "jonah", "dave", "ruth", "gabriel", "alternate"],
    showAll: true,
    next: "choose_role",
    choices: [{ label: "Назад к выбору роли", next: "choose_role" }],
  },

  /* ===== OPERATOR PATH ===== */
  operator_start: {
    type: "story",
    title: "ГОРЯЧАЯ ЛИНИЯ APS",
    sound: "phone",
    character: "ruth",
    unlock: ["ruth"],
    text:
      "Смена 02:14. На стене выцветшая инструкция и стикер Рут Уивер:\n«Не подтверждайте личность. Не называйте своё имя.»\n\nДисплей мигает: ВХОДЯЩИЙ — HEATHCLIFF, M.\n\nТелефон звонит.",
    choices: [
      { label: "Поднять трубку (Марк Хитклифф?)", next: "op_mark_call" },
      { label: "Подождать три гудка", next: "op_wait", paranoia: 1 },
    ],
  },

  op_wait: {
    type: "story",
    title: "ТИШИНА",
    sound: "breath",
    text:
      "Гудки обрываются на четвёртом.\nВ динамике — чужой вдох.\n\nПотом голос, почти как у Сезара Торреса:\n«Ты же знаешь, что я здесь.»",
    unlock: ["cesar"],
    onEnter: "glitch",
    choices: [
      { label: "Ответить: «Кто это?»", next: "op_mark_call", paranoia: 1 },
      { label: "Открыть досье Сезара", next: "dossier_cesar_op" },
    ],
  },

  dossier_cesar_op: {
    type: "dossier",
    character: "cesar",
    sound: "whisper",
    next: "op_mark_call",
  },

  op_mark_call: {
    type: "phone",
    title: "ЗВОНОК // HEATHCLIFF",
    from: "MARK HEATHCLIFF / ЛОКАЛЬНЫЙ",
    line: "За дверью Сезар. Но Сезар… он говорит не так.",
    sound: "phone",
    character: "mark",
    unlock: ["mark", "cesar"],
    text:
      "Голос Марка срывается. На фоне — тихое царапанье.\n\n«Он просит впустить. Говорит, что замёрз. Говорит моим детским прозвищем — тем, которое знал только Сезар.»\n\nВ системе всплывает вторая карточка: CESAR TORRES — IDENTITY DISPUTED.",
    choices: [
      {
        label: "«Не открывай. Отойди от двери.»",
        next: "op_good_advice",
        score: 1,
      },
      {
        label: "«Спроси то, что знает только настоящий Сезар.»",
        next: "op_bad_advice",
        paranoia: 1,
      },
      {
        label: "«Опиши его лицо. Не смотри в глаза.»",
        next: "op_face_ask",
        paranoia: 2,
        score: -1,
      },
      {
        label: "Открыть досье Марка",
        next: "dossier_mark_op",
      },
    ],
  },

  dossier_mark_op: {
    type: "dossier",
    character: "mark",
    sound: "tape",
    next: "op_mark_call",
  },

  op_good_advice: {
    type: "story",
    title: "ПРАВИЛЬНЫЙ ПРОТОКОЛ",
    sound: "scratch",
    text:
      "Марк отодвигается. Царапанье становится громче.\n\nЗатем — другой голос в трубке. Голос Сезара, но спокойный:\n«Спасибо, оператор. Теперь я знаю, на какой ты линии.»\n\nСвязь обрывается. В журнале Рут уже стоит пометка: TORRES — POSSIBLE TYPE TWO.",
    unlock: ["ruth", "cesar"],
    onEnter: "glitch",
    paranoia: 1,
    choices: [{ label: "Следующий вызов — Тэтчер Дэвис", next: "op_thatcher" }],
  },

  op_bad_advice: {
    type: "story",
    title: "ОШИБКА ОПЕРАТОРА",
    sound: "door",
    text:
      "Марк спрашивает. За дверью отвечают правильно.\nСлишком правильно.\n\nЩелчок замка. Длинный выдох. Тишина.\nНа линии остаётся только хор, которого не должно быть в телефонной сети.",
    onEnter: "sting",
    paranoia: 2,
    score: -1,
    unlock: ["alternate"],
    choices: [{ label: "Записать инцидент для Тэтчера", next: "op_thatcher" }],
  },

  op_face_ask: {
    type: "story",
    title: "НЕ СМОТРИТЕ",
    sound: "face",
    text:
      "«У него глаза как ямы. Улыбка шире рта. Как на той плёнке с „Гавриилом“.»\n\nМарк замолкает.\nВ стекле монитора на секунду — чужое лицо.",
    onEnter: "face",
    paranoia: 2,
    unlock: ["gabriel", "alternate"],
    choices: [{ label: "Отвести взгляд. Вызов лейтенанта.", next: "op_thatcher" }],
  },

  op_thatcher: {
    type: "phone",
    title: "ВНУТРЕННИЙ // MCPD",
    from: "LT. THATCHER DAVIS",
    line: "Мне нужна сверка лиц. Сейчас. Партия с Торресом и Хитклиффом.",
    sound: "phone",
    character: "thatcher",
    unlock: ["thatcher"],
    text:
      "Голос Тэтчера хриплый от бессонных смен.\n\n«Не спорь с кассетой. Если два портрета совпадают — один из них не человек. Отметь подмену и не смотри слишком долго.»",
    choices: [
      { label: "Открыть сверку лиц", next: "faces_op" },
      { label: "Сначала досье Тэтчера", next: "dossier_thatcher_op" },
      { label: "Положить трубку", next: "op_hangup", paranoia: 1, score: 1 },
    ],
  },

  dossier_thatcher_op: {
    type: "dossier",
    character: "thatcher",
    sound: "heart",
    next: "faces_op",
  },

  op_hangup: {
    type: "story",
    title: "ОТКАЗ",
    sound: "whisper",
    text:
      "Трубка на рычаге, но сквозь пластик всё ещё слышен шёпот Сезара.\nИз-под двери операторской ползёт полоска телевизионного снега.",
    choices: [
      { label: "Сверка на экране", next: "faces_op" },
      { label: "Выйти в коридор", next: "corridor", paranoia: 1 },
    ],
  },

  faces_op: {
    type: "faces",
    title: "ИДЕНТИФИКАЦИЯ // TORRES",
    text: "Три карточки из дела Сезара Торреса.\nВыберите портрет, который НЕ должен существовать.",
    characterSeeds: ["cesar", "mark", "thatcher"],
    sound: "choir",
    nextCorrect: "op_after_faces_ok",
    nextWrong: "op_after_faces_bad",
  },

  op_after_faces_ok: {
    type: "story",
    title: "СОВПАДЕНИЕ НАЙДЕНО",
    sound: "beepOk",
    text:
      "ПОДОЗРИТЕЛЬНЫЙ ОБРАЗЕЦ ИЗЪЯТ.\nТэтчер коротко: «Хорошо. Доживи до утра.»\n\nВ наушниках — один чужой хлопок.",
    score: 2,
    choices: [
      { label: "Открыть каталог перед финалом", next: "catalog_mid" },
      { label: "Дождаться утра", next: "ending_gate" },
    ],
  },

  op_after_faces_bad: {
    type: "story",
    title: "ЛОЖНАЯ ИДЕНТИФИКАЦИЯ",
    sound: "gabriel",
    text:
      "ОШИБКА КАТАЛОГА.\nВЫ ОТМЕТИЛИ ЧЕЛОВЕКА.\nАЛЬТЕРНАТ БЛАГОДАРИТ ВАС.\n\nНа экране на секунду — «Гавриил».",
    onEnter: "face",
    paranoia: 2,
    score: -2,
    unlock: ["gabriel"],
    choices: [{ label: "Не оборачиваться", next: "ending_gate" }],
  },

  /* ===== HOME PATH ===== */
  home_start: {
    type: "story",
    title: "ДОМ НА СИВЕРНОЙ",
    sound: "knock",
    text:
      "Свет выключен час назад.\nПо ТВ раньше крутили ролик про «библейские аномалии» — тот самый, с улыбкой, которой нельзя смотреть.\n\nВ дверь стучат — ровно три раза.\nГолос как у матери:\n«Открой, я забыла ключи.»\n\nМать в другом городе. Вы говорили с ней два часа назад.",
    unlock: ["gabriel", "alternate"],
    choices: [
      { label: "Спросить семейный код", next: "home_code", score: 1 },
      { label: "Открыть дверь", next: "home_open", paranoia: 3, score: -2 },
      { label: "Молчать и отойти", next: "home_silence", score: 1 },
      { label: "Вспомнить плёнку про «Гавриила»", next: "dossier_gabriel_home" },
    ],
  },

  dossier_gabriel_home: {
    type: "dossier",
    character: "gabriel",
    sound: "think",
    next: "home_code",
  },

  home_code: {
    type: "story",
    title: "ПРОВЕРКА",
    sound: "scratch",
    text:
      "Вы задаёте вопрос.\nЗа дверью отвечают мгновенно — и неправильно.\nПотом уже раздражённо, «правильным» голосом:\n\n«Зачем тебе код? Я же твоя мама.»\n\nЦарапанье к глазку. В голове всплывает строка с плёнки: Think of someone you love.",
    onEnter: "glitch",
    paranoia: 1,
    choices: [
      { label: "Посмотреть в глазок", next: "home_peephole", paranoia: 2 },
      { label: "Запереться в ванной", next: "home_bathroom", score: 1 },
    ],
  },

  home_open: {
    type: "story",
    title: "ДВЕРЬ ОТКРЫТА",
    sound: "door",
    text:
      "На пороге никого.\nЗапах мокрой земли и старого кинескопа.\n\nОбувь стоит носками наружу — вы так не ставите.\nВ зеркале отражение моргает позже вас.",
    onEnter: "face",
    paranoia: 3,
    unlock: ["alternate"],
    choices: [{ label: "Бежать к телефону", next: "home_call_911" }],
  },

  home_silence: {
    type: "story",
    title: "ОНИ НЕ УХОДЯТ",
    sound: "knock",
    text:
      "Стучат снова. Уже вашим голосом:\n«Пусти меня. Мне холодно.»\n\nТелефон звонит сам — на дисплее ваше имя.\nВспоминается дело Марка Хитклиффа.",
    unlock: ["mark"],
    choices: [
      { label: "Ответить на телефон", next: "home_call_911" },
      { label: "Выдернуть шнур", next: "home_bathroom", score: 1 },
    ],
  },

  home_peephole: {
    type: "story",
    title: "ГЛАЗОК",
    sound: "face",
    text:
      "Рыбий глаз. Лица нет — только улыбка на высоте лица.\nГлаза чуть ниже, чем должны.\nКак у Альтерната типа II из каталога APS.",
    onEnter: "face",
    paranoia: 2,
    unlock: ["alternate"],
    choices: [{ label: "Отскочить", next: "home_bathroom" }],
  },

  home_bathroom: {
    type: "story",
    title: "ВАННАЯ",
    sound: "whisper",
    character: "sarah",
    unlock: ["sarah"],
    text:
      "Вы запираетесь.\nВ зеркале — помехи.\nИз вентиляции шепчут:\n«Мы можем быть тем, кого ты любишь.»\n\nНа кафеле — чужая пометка от руки, похожая на почерк Сары Хитклифф из старого дела:\n«Брат не стал бы так улыбаться.»",
    choices: [
      { label: "Прочитать инструкцию APS", next: "home_rules", score: 1 },
      { label: "Открыть досье Сары", next: "dossier_sarah_home" },
      { label: "Разбить зеркало", next: "home_break", paranoia: 1 },
    ],
  },

  dossier_sarah_home: {
    type: "dossier",
    character: "sarah",
    sound: "heart",
    next: "home_rules",
  },

  home_rules: {
    type: "broadcast",
    title: "НАПОМИНАНИЕ ДЛЯ НАСЕЛЕНИЯ",
    label: "APS // EMERGENCY",
    sound: "emergency",
    body:
      "1. Не ведите диалог с Альтернатом.\n2. Не смотрите в глаза.\n3. Если Альтернат использует голос умершего — молитесь. Если использует ваш — бегите.\n4. Утро не гарантировано.\n\nДописка на обороте:\n«ЕСЛИ ТЫ ЧИТАЕШЬ ЭТО В ВАННОЙ — ОН УЖЕ В ДОМЕ.»",
    next: "home_call_911",
  },

  home_break: {
    type: "story",
    title: "ОСКОЛКИ",
    sound: "sting",
    text:
      "Зеркало осыпается.\nВ каждом осколке одно лицо — и ни одно не моргает синхронно.\nИз коридора — ваш смех с задержкой.",
    onEnter: "sting",
    paranoia: 2,
    choices: [{ label: "Хватить телефон", next: "home_call_911" }],
  },

  home_call_911: {
    type: "phone",
    title: "911 / ПЕРЕАДРЕСАЦИЯ",
    from: "MANDELA COUNTY DISPATCH",
    line: "Служба спасения. Вы в безопасности? Назовите себя.",
    sound: "phone",
    character: "ruth",
    unlock: ["ruth"],
    text:
      "Оператор слишком спокоен. На фоне — гул, как за вашей стеной.\nГолос почти как у Рут Уивер… или как у вас.\n\n«Опишите, кто в доме. Или опишите себя — чтобы мы знали, кого спасать.»",
    choices: [
      {
        label: "Не описывать себя. Просить патруль.",
        next: "faces_home",
        score: 2,
      },
      {
        label: "Назвать имя, адрес, приметы",
        next: "home_gave_name",
        paranoia: 2,
        score: -2,
      },
    ],
  },

  home_gave_name: {
    type: "story",
    title: "ТЕПЕРЬ ОНИ ЗНАЮТ",
    sound: "gabriel",
    text:
      "«Спасибо, — говорит оператор вашим голосом. — Мы уже внутри.»\nСвет мигает в ритме седьмого канала.",
    onEnter: "face",
    paranoia: 2,
    choices: [{ label: "Сверка портретов на ТВ", next: "faces_home" }],
  },

  faces_home: {
    type: "faces",
    title: "КТО ИЗ НИХ — ВЫ?",
    text: "Три портрета из досье APS. Один — подмена.\nНа этикетках мелькают имена Хитклифф / Торрес / ???",
    characterSeeds: ["mark", "cesar", "alternate"],
    sound: "choir",
    nextCorrect: "home_after_ok",
    nextWrong: "home_after_bad",
  },

  home_after_ok: {
    type: "story",
    title: "РАССВЕТ?",
    sound: "tape",
    text:
      "Лишний портрет вычеркнут. Стуки стихают.\nЗа окном светлеет — но не с той стороны горизонта.",
    score: 2,
    choices: [
      { label: "Каталог перед выходом", next: "catalog_mid" },
      { label: "Выйти на улицу", next: "ending_gate" },
    ],
  },

  home_after_bad: {
    type: "story",
    title: "ПОДМЕНА ПРИНЯТА",
    sound: "sting",
    text:
      "Система подтверждает «верный» выбор.\nНастоящий портрет стёрт.\nВ осколках вас становится меньше.",
    onEnter: "sting",
    paranoia: 2,
    score: -2,
    choices: [{ label: "Принять утро", next: "ending_gate" }],
  },

  /* ===== ARCHIVE PATH ===== */
  archive_start: {
    type: "story",
    title: "АРХИВ ВРЕМЕННЫХ АНОМАЛИЙ",
    sound: "tape",
    character: "dave",
    unlock: ["dave", "adam", "jonah"],
    text:
      "Подвал администрации. Озон и пыль кассет.\nНа столе стикер Дейва Ли: «Не смотри ролик до конца.»\n\nПапки: MURRAY, A. / MARSHALL, J. / HEATHCLIFF, S.\nНадпись на двери: «НЕ РАБОТАТЬ ОДНОМУ ПОСЛЕ 01:00.»\n\nНа часах 01:07. Вы одни.",
    choices: [
      { label: "Сверка партии A", next: "faces_archive", score: 1 },
      { label: "Учебная плёнка", next: "archive_tape" },
      { label: "Досье Адама Мюррея", next: "dossier_adam" },
      { label: "Досье Джоны Маршалла", next: "dossier_jonah" },
    ],
  },

  dossier_adam: {
    type: "dossier",
    character: "adam",
    sound: "static",
    next: "archive_tape",
  },

  dossier_jonah: {
    type: "dossier",
    character: "jonah",
    sound: "heart",
    next: "archive_tape",
  },

  archive_tape: {
    type: "broadcast",
    title: "ЧТО ТАКОЕ АЛЬТЕРНАТ",
    label: "CLASSIFIED // REEL 12",
    sound: "think",
    body:
      "Альтернат — не демон в старом смысле.\nЭто ошибка, которая хочет быть любимой.\n\nГолос копируется раньше лица.\nЛицо — всегда чуть мимо.\n\nЕсли в каталоге два одинаковых человека — один из них не человек.\nЕсли на плёнке улыбается «Гавриил» — остановите воспроизведение.",
    unlock: ["gabriel", "alternate"],
    next: "faces_archive",
  },

  faces_archive: {
    type: "faces",
    title: "ПАРТИЯ A — MURRAY / MARSHALL",
    text: "Три карточки. Одна аномалия.\nКликните по Альтернату.",
    characterSeeds: ["adam", "jonah", "dave"],
    sound: "choir",
    nextCorrect: "archive_mid_ok",
    nextWrong: "archive_mid_bad",
  },

  archive_mid_ok: {
    type: "story",
    title: "ПАРТИЯ A ЗАКРЫТА",
    sound: "tape",
    text:
      "Штамп: КРАСНЫЙ УРОВЕНЬ.\nСоседний плеер сам перематывается.\nВ колонках: «Спасибо, что видишь разницу.» — голосом Джоны… или нет.",
    score: 2,
    unlock: ["jonah"],
    choices: [
      { label: "Досье Дейва Ли", next: "dossier_dave" },
      { label: "Партия B", next: "faces_archive_b" },
      { label: "Коридор", next: "corridor" },
    ],
  },

  archive_mid_bad: {
    type: "story",
    title: "ШТАМП НЕ ТУДА",
    sound: "scratch",
    text:
      "Карточка человека — в «УНИЧТОЖИТЬ».\nКарточка Альтерната — в «ЖИТЕЛЬ».\nЛифт скрежещет над вами, хотя здание закрыто.",
    onEnter: "glitch",
    paranoia: 2,
    score: -1,
    choices: [{ label: "Исправить во второй партии", next: "faces_archive_b" }],
  },

  dossier_dave: {
    type: "dossier",
    character: "dave",
    sound: "tape",
    next: "faces_archive_b",
  },

  faces_archive_b: {
    type: "faces",
    title: "ПАРТИЯ B — СЕМЬЯ ХИТКЛИФФ",
    text: "Отличия тоньше. Сара. Марк. И кто-то третий.",
    hard: true,
    characterSeeds: ["sarah", "mark", "cesar"],
    sound: "whisper",
    nextCorrect: "archive_after_ok",
    nextWrong: "archive_after_bad",
  },

  archive_after_ok: {
    type: "story",
    title: "КАТАЛОГ ЦЕЛ",
    sound: "beepOk",
    text:
      "Две партии очищены.\nПринтер без запроса:\n«ОПЕРАТОР ПРИЗНАН ЧЕЛОВЕКОМ. ПОКА.»\n\nДверь архива закрыта снаружи.",
    score: 2,
    choices: [
      { label: "Полный каталог", next: "catalog_mid" },
      { label: "Ждать смену", next: "ending_gate" },
    ],
  },

  archive_after_bad: {
    type: "story",
    title: "КАТАЛОГ ОТРАВЛЕН",
    sound: "gabriel",
    text:
      "Ошибка записана как истина.\nЗавтра по этим карточкам сверят живых.\nВ темноте стеллажа кто-то учится вашей улыбке.",
    onEnter: "face",
    paranoia: 2,
    score: -2,
    choices: [{ label: "Покинуть архив", next: "corridor" }],
  },

  catalog_mid: {
    type: "catalog",
    title: "ОБНОВЛЁННЫЙ КАТАЛОГ",
    text: "Новые совпадения добавлены в вашу смену.",
    next: "ending_gate",
    choices: [{ label: "Завершить смену ▶", next: "ending_gate" }],
  },

  corridor: {
    type: "story",
    title: "КОРИДОР",
    sound: "gabriel",
    text:
      "Лампы мигают морзянкой.\nВ конце — силуэт ростом с вас. Машет, как машете вы.\n\nЗа спиной открывается дверь.\nНа мгновение слышен хор и голос «Гавриила».",
    onEnter: "glitch",
    paranoia: 1,
    unlock: ["gabriel", "alternate"],
    choices: [
      { label: "Идти к силуэту", next: "ending_gate", paranoia: 2, score: -1 },
      { label: "Закрыть глаза и стоять", next: "ending_gate", score: 1 },
      { label: "Последний взгляд в каталог", next: "catalog_mid" },
    ],
  },

  ending_gate: {
    type: "ending",
  },
};
