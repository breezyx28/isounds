const MSISDN_RE = /^(0|\+249)[0-9]{9}$/;

export function normalizeMsisdn(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  return MSISDN_RE.test(value) ? value : null;
}

export function getRequestIdentity(req: Request): {
  msisdn: string | null;
  subscribed: boolean;
} {
  const msisdn = normalizeMsisdn(req.headers.get("X-ISounds-Msisdn"));
  const subHeader = req.headers.get("X-ISounds-Subscribed")?.toLowerCase();
  const subscribed = subHeader === "1" || subHeader === "true";
  return { msisdn, subscribed };
}

export function requireMsisdn(req: Request): string | Response {
  const { msisdn } = getRequestIdentity(req);
  if (!msisdn) {
    return new Response(JSON.stringify({ error: "msisdn required" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  return msisdn;
}

export function requireSubscribed(req: Request): string | Response {
  const identity = getRequestIdentity(req);
  if (!identity.msisdn) {
    return new Response(JSON.stringify({ error: "msisdn required" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  if (!identity.subscribed) {
    return new Response(JSON.stringify({ error: "subscription required" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
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
