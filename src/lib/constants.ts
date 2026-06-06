const DEFAULT_ZAIN_DSP = "https://dsplp.sd.zain.com/af-lp/?p=8991632598";
const DEFAULT_API_BASE_URL = "https://api.zoalcast.com/api";

const explicitPortalId = import.meta.env.VITE_PORTAL_ID;
const parsedPortalId = Number(explicitPortalId);
export const PORTAL_ID =
  explicitPortalId && explicitPortalId.trim().length > 0 && Number.isFinite(parsedPortalId)
    ? parsedPortalId
    : 6;

const explicitZainDsp = import.meta.env.VITE_ZAIN_DSP;
export const ZAIN_DSP =
  explicitZainDsp && explicitZainDsp.trim().length > 0
    ? explicitZainDsp.trim()
    : DEFAULT_ZAIN_DSP;

const explicitBase = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;
export const API_BASE_URL =
  explicitBase && explicitBase.trim().length > 0
    ? explicitBase.trim()
    : isDev
      ? "/api/zoalcast"
      : DEFAULT_API_BASE_URL;
