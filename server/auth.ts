import { createHmac, timingSafeEqual } from "node:crypto";

const MSISDN_RE = /^(0|\+249)[0-9]{9}$/;
const SESSION_COOKIE = "isounds_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const ZOALCAST_API = process.env.VITE_API_BASE_URL ?? "https://api.zoalcast.com/api";

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-insecure-change-me";
}

export function normalizeMsisdn(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  return MSISDN_RE.test(value) ? value : null;
}

type SessionPayload = {
  msisdn: string;
  subscribed: boolean;
  exp: number;
};

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.msisdn || typeof parsed.subscribed !== "boolean" || typeof parsed.exp !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function sign(encoded: string): string {
  return createHmac("sha256", sessionSecret()).update(encoded).digest("base64url");
}

export function issueSessionToken(msisdn: string, subscribed: boolean): string {
  const payload: SessionPayload = {
    msisdn,
    subscribed,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token?.includes(".")) return null;
  const [encoded, signature] = token.split(".", 2);
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

  const payload = decodePayload(encoded);
  if (!payload || payload.exp < Date.now()) return null;
  if (!normalizeMsisdn(payload.msisdn)) return null;
  return payload;
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.get("Cookie");
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
}

export function getSessionFromRequest(req: Request): SessionPayload | null {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

export function buildSessionSetCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`;
}

export function buildSessionClearCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function verifyZoalcastToken(
  token: string,
  expectedMsisdn: string,
): Promise<{ ok: boolean; subscribed: boolean }> {
  const msisdn = normalizeMsisdn(expectedMsisdn);
  if (!msisdn || !token.trim()) return { ok: false, subscribed: false };

  try {
    const likesRes = await fetch(`${ZOALCAST_API}/podcast/user/likes?page=1`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!likesRes.ok) return { ok: false, subscribed: false };

    const subRes = await fetch(
      `${ZOALCAST_API}/isounds/check_subscription/${encodeURIComponent(msisdn)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!subRes.ok) return { ok: true, subscribed: false };

    const subPayload = (await subRes.json()) as { active?: boolean; data?: { active?: boolean } };
    const subscribed = Boolean(subPayload.active ?? subPayload.data?.active ?? true);
    return { ok: true, subscribed };
  } catch (error) {
    console.error("[auth] Zoalcast token verification failed:", error);
    return { ok: false, subscribed: false };
  }
}

export function getRequestIdentity(req: Request): {
  msisdn: string | null;
  subscribed: boolean;
} {
  const session = getSessionFromRequest(req);
  if (session) {
    return { msisdn: session.msisdn, subscribed: session.subscribed };
  }

  const msisdn = normalizeMsisdn(req.headers.get("X-ISounds-Msisdn"));
  const subHeader = req.headers.get("X-ISounds-Subscribed")?.toLowerCase();
  const subscribed = subHeader === "1" || subHeader === "true";
  return { msisdn, subscribed };
}

export function corsOrigin(): string {
  return process.env.SITE_URL ?? "*";
}

function authError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": corsOrigin(),
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export function requireMsisdn(req: Request): string | Response {
  const { msisdn } = getRequestIdentity(req);
  if (!msisdn) return authError(401, "msisdn required");
  return msisdn;
}

export function requireSubscribed(req: Request): string | Response {
  const identity = getRequestIdentity(req);
  if (!identity.msisdn) return authError(401, "msisdn required");
  if (!identity.subscribed) return authError(403, "subscription required");
  return identity.msisdn;
}

export function touchUser(db: import("bun:sqlite").Database, msisdn: string, subscribed: boolean) {
  db.run(
    `INSERT INTO users (msisdn, first_seen_at, last_seen_at, is_subscribed)
     VALUES (?, unixepoch(), unixepoch(), ?)
     ON CONFLICT(msisdn) DO UPDATE SET
       last_seen_at = unixepoch(),
       is_subscribed = excluded.is_subscribed`,
    [msisdn, subscribed ? 1 : 0],
  );
}
