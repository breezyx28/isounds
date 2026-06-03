export const PORTAL_ID = Number(import.meta.env.VITE_PORTAL_ID ?? 6);
export const ZAIN_DSP =
  import.meta.env.VITE_ZAIN_DSP ??
  "https://dsplp.sd.zain.com/af-lp/?p=8991632598";
const explicitBase = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;
export const API_BASE_URL =
  explicitBase && explicitBase.trim().length > 0
    ? explicitBase
    : isDev
      ? "/api/zoalcast"
      : "https://api.zoalcast.com/api";
