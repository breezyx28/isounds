import type { RootState } from "@/store/store";
import { readStoredMsisdn, readStoredUser } from "@/features/auth/storage";

const SESSION_KEY = "isounds_session_id";

export function getSubscriberMsisdn(state?: RootState): string | null {
  const fromState = state?.auth.user?.msisdn ?? null;
  if (fromState) return fromState;
  const user = readStoredUser();
  if (user?.msisdn) return user.msisdn;
  return readStoredMsisdn();
}

export function isSubscribed(state?: RootState): boolean {
  return state?.auth.status === "subscribed";
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

export const BOOKMARKS_LEGACY_KEY = "isounds_bookmarks_v1";

export function readLegacyBookmarkIds(): number[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

export function clearLegacyBookmarks() {
  localStorage.removeItem(BOOKMARKS_LEGACY_KEY);
}
