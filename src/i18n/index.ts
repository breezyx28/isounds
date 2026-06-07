import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import arCommon from "./locales/ar/common.json";
import arEpisodes from "./locales/ar/episodes.json";
import arPlayer from "./locales/ar/player.json";
import arSearch from "./locales/ar/search.json";
import arLibrary from "./locales/ar/library.json";
import arPersonalization from "./locales/ar/personalization.json";
import enCommon from "./locales/en/common.json";
import enEpisodes from "./locales/en/episodes.json";
import enPlayer from "./locales/en/player.json";
import enSearch from "./locales/en/search.json";
import enLibrary from "./locales/en/library.json";
import enPersonalization from "./locales/en/personalization.json";

const resources = {
  ar: {
    common: arCommon,
    episodes: arEpisodes,
    player: arPlayer,
    search: arSearch,
    library: arLibrary,
    personalization: arPersonalization,
  },
  en: {
    common: enCommon,
    episodes: enEpisodes,
    player: enPlayer,
    search: enSearch,
    library: enLibrary,
    personalization: enPersonalization,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    defaultNS: "common",
    ns: ["common", "episodes", "player", "search", "library", "personalization"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
    },
  });

export function applyDocumentLanguage(lang: "ar" | "en") {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  void i18n.changeLanguage(lang);
  localStorage.setItem("lang", lang);
}

export default i18n;
