/* Official Mandela Catalogue tapes — YouTube embeds from Alex Kister's channel.
   We do NOT rehost episode files; playback stays on YouTube. */
const OFFICIAL_TAPES = [
  {
    id: "overthrone",
    yt: "q0EpOiu8YkI",
    title: "overthrone",
    titleRu: "Overthrone / «Гавриил»",
    ep: "Ep.0",
    note: "Пролог. Ложный архангел.",
  },
  {
    id: "vol1",
    yt: "C8d12w6pMos",
    title: "The Mandela Catalogue Vol. 1",
    titleRu: "Vol. 1",
    ep: "Ep.1",
    note: "Марк, Сезар, APS, Intruder.",
  },
  {
    id: "vol1_restored",
    yt: "ZUrCO_x3VHk",
    title: "Vol.1 [RESTORED EDITION]",
    titleRu: "Vol. 1 Restored",
    ep: "Ep.1",
    note: "Восстановленная редакция Vol.1.",
  },
  {
    id: "intruder_alert",
    yt: "KL9Q0KItf-8",
    title: "Intruder Alert",
    titleRu: "Intruder Alert",
    ep: "Act I",
    note: "Вторженец / 6.",
  },
  {
    id: "exhibition",
    yt: "n3M8qnsztvw",
    title: "Exhibition",
    titleRu: "Exhibition",
    ep: "Act I",
    note: "Выставка / промежуток.",
  },
  {
    id: "vol2",
    yt: "XuDMawgx5Mw",
    title: "The Mandela Catalogue Vol.2",
    titleRu: "Vol. 2",
    ep: "Ep.2",
    note: "Адам и Джона / Bythorne.",
  },
  {
    id: "vol333",
    yt: "1jMFrVk2d_I",
    title: "The Mandela Catalogue Vol.333",
    titleRu: "Vol. 333",
    ep: "Ep.3",
    note: "Тэтчер, округ, коллапс.",
  },
  {
    id: "vol4",
    yt: "rf-OSO5Wrbk",
    title: "The Mandela Catalogue Vol.4",
    titleRu: "Vol. 4",
    ep: "Act II",
    note: "Продолжение лора.",
  },
  {
    id: "vol5",
    yt: "7eSAhG71j2A",
    title: "The Mandela Catalogue Vol.5",
    titleRu: "Vol. 5",
    ep: "Act II",
    note: "Поздний том.",
  },
];

const OfficialMedia = (() => {
  function byId(id) {
    return OFFICIAL_TAPES.find((t) => t.id === id) || null;
  }

  function embedUrl(ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`;
  }

  function watchUrl(ytId) {
    return `https://www.youtube.com/watch?v=${ytId}`;
  }

  function channelUrl() {
    return "https://www.youtube.com/@AlexxKister";
  }

  return { byId, embedUrl, watchUrl, channelUrl, list: OFFICIAL_TAPES };
})();
