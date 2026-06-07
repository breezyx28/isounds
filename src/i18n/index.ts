import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getStoredLanguage, type Lang } from "@/lib/language";

const NAMESPACES = ["common", "episodes", "player", "search", "library", "personalization"] as const;

async function fetchLanguageResources(lang: Lang) {
  const [common, episodes, player, search, library, personalization] = await Promise.all([
    import(`./locales/${lang}/common.json`),
    import(`./locales/${lang}/episodes.json`),
    import(`./locales/${lang}/player.json`),
    import(`./locales/${lang}/search.json`),
    import(`./locales/${lang}/library.json`),
    import(`./locales/${lang}/personalization.json`),
  ]);

  return {
    common: common.default,
    episodes: episodes.default,
    player: player.default,
    search: search.default,
    library: library.default,
    personalization: personalization.default,
  };
}

function applyDocumentAttributes(lang: Lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

const initialLang = getStoredLanguage();

export const i18nReady = (async () => {
  const resources = {
    [initialLang]: await fetchLanguageResources(initialLang),
  };

  await i18n.use(initReactI18next).init({
    lng: initialLang,
    fallbackLng: "ar",
    defaultNS: "common",
    ns: [...NAMESPACES],
    resources,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  applyDocumentAttributes(initialLang);
})();

export async function applyDocumentLanguage(lang: Lang) {
  await i18nReady;

  if (!i18n.hasResourceBundle(lang, "common")) {
    const bundles = await fetchLanguageResources(lang);
    for (const [ns, data] of Object.entries(bundles)) {
      i18n.addResourceBundle(lang, ns, data, true, true);
    }
  }

  applyDocumentAttributes(lang);
  await i18n.changeLanguage(lang);
  localStorage.setItem("lang", lang);
}

export type { Lang } from "@/lib/language";
export { getStoredLanguage } from "@/lib/language";

export default i18n;
