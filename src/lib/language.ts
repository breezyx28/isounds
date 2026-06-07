export type Lang = "ar" | "en";

export function getStoredLanguage(): Lang {
  const stored = localStorage.getItem("lang");
  if (stored === "ar" || stored === "en") return stored;
  return navigator.language.startsWith("en") ? "en" : "ar";
}
