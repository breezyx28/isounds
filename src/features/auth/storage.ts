import type { AuthUser, SubscriberInfo } from "@/store/slices/authSlice";

const KEY_USER = "user";
const KEY_MSISDN = "msisdn";
const KEY_SUBSCRIBER_INFO = "subscriberInfo";

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readStoredUser(): AuthUser | null {
  const parsed = parseJson<Record<string, unknown> & { data?: Record<string, unknown> }>(
    localStorage.getItem(KEY_USER),
  );
  if (!parsed) return null;
  const nested = parsed.data ?? {};
  const token =
    (typeof parsed.token === "string" ? parsed.token : undefined) ??
    (typeof nested.token === "string" ? nested.token : undefined);
  if (!token) return null;
  const msisdn =
    (typeof parsed.msisdn === "string" ? parsed.msisdn : undefined) ??
    (typeof nested.msisdn === "string" ? nested.msisdn : undefined);
  return { token, msisdn };
}

export function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(KEY_USER);
    return;
  }
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function readStoredMsisdn(): string | null {
  return localStorage.getItem(KEY_MSISDN);
}

export function writeStoredMsisdn(msisdn: string | null) {
  if (!msisdn) localStorage.removeItem(KEY_MSISDN);
  else localStorage.setItem(KEY_MSISDN, msisdn);
}

export function readStoredSubscriberInfo(): SubscriberInfo | null {
  const parsed = parseJson<unknown>(localStorage.getItem(KEY_SUBSCRIBER_INFO));
  if (!parsed) return null;
  return { active: true, raw: parsed };
}

export function writeStoredSubscriberInfo(info: SubscriberInfo | null) {
  if (!info) {
    localStorage.removeItem(KEY_SUBSCRIBER_INFO);
    return;
  }
  localStorage.setItem(KEY_SUBSCRIBER_INFO, JSON.stringify(info.raw ?? info));
}

export function clearStoredAuth() {
  localStorage.removeItem(KEY_MSISDN);
  localStorage.removeItem(KEY_SUBSCRIBER_INFO);
  localStorage.removeItem(KEY_USER);
}
