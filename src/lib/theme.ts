export type Theme = "light";

const STORAGE_KEY = "theme";

export function getStoredTheme(): Theme {
  return "light";
}

export function applyTheme(_theme?: Theme) {
  document.documentElement.dataset.theme = "light";
  localStorage.setItem(STORAGE_KEY, "light");
}

export function getLogoPath(_theme?: Theme): string {
  return "/logos/logo-black.png";
}
