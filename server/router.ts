import type { Database } from "bun:sqlite";
import {
  getRequestIdentity,
  requireMsisdn,
  requireSubscribed,
  touchUser,
} from "./auth";
import {
  computeUserAffinities,
  getPersonalizationProfile,
  recomputeAffinitiesNow,
  resetCategorySettings,
  scheduleAffinityRecompute,
  updateCategorySettings,
} from "./affinity";
import { getVapidPublicKey, isPushConfigured } from "./push";
import { parseVisitPath } from "./visitParser";
import { fetchPodcastDetail, upsertPodcastCache } from "./zoalcast";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, X-ISounds-Msisdn, X-ISounds-Subscribed",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function ratingDistribution(
  db: Database,
  podcastId: number,
): Array<{ star: number; pct: number }> {
  const rows = db
    .query(
      "SELECT rating, COUNT(*) AS cnt FROM ratings WHERE podcast_id = ? AND msisdn IS NOT NULL GROUP BY rating",
    )
    .all(podcastId) as Array<{ rating: number; cnt: number }>;
  const total = rows.reduce((sum, row) => sum + row.cnt, 0);
  const counts = new Map(rows.map((row) => [row.rating, row.cnt]));
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: total > 0 ? Math.round(((counts.get(star) ?? 0) / total) * 100) : 0,
  }));
}

function getRatingForUser(
  db: Database,
  podcastId: number,
  msisdn: string | null,
  sessionId: string,
) {
  if (msisdn) {
    return db
      .query(
        "SELECT rating FROM ratings WHERE podcast_id = ? AND msisdn = ? LIMIT 1",
      )
      .get(podcastId, msisdn) as { rating?: number } | null;
  }
  return db
    .query(
      "SELECT rating FROM ratings WHERE podcast_id = ? AND session_id = ? LIMIT 1",
    )
    .get(podcastId, sessionId) as { rating?: number } | null;
}

export async function router(req: Request, db: Database): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/local/, "") || "/";
  const identity = getRequestIdentity(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (path === "/sessions/heartbeat" && req.method === "POST") {
    const msisdn = requireMsisdn(req);
    if (msisdn instanceof Response) return msisdn;

    const body = (await req.json()) as {
      session_id?: string;
      user_agent?: string;
      referrer?: string;
    };
    if (!body.session_id?.trim()) {
      return json({ error: "session_id required" }, 400);
    }

    touchUser(db, msisdn, identity.subscribed);
    db.run(
      `INSERT INTO sessions (id, msisdn, started_at, last_active_at, user_agent, referrer)
       VALUES (?, ?, unixepoch(), unixepoch(), ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         last_active_at = unixepoch(),
         user_agent = COALESCE(excluded.user_agent, sessions.user_agent),
         referrer = COALESCE(excluded.referrer, sessions.referrer)`,
      [
        body.session_id.trim(),
        msisdn,
        body.user_agent ?? null,
        body.referrer ?? null,
      ],
    );
    return json({ ok: true });
  }

  if (path === "/visits" && req.method === "POST") {
    const body = (await req.json()) as {
      session_id?: string;
      path?: string;
      category_id?: number;
      podcast_id?: number;
      event_type?: string;
    };
    if (!body.session_id?.trim() || !body.path?.trim()) {
      return json({ error: "session_id and path required" }, 400);
    }

    if (identity.msisdn) {
      touchUser(db, identity.msisdn, identity.subscribed);
    }

    const parsed = parseVisitPath(body.path.trim());
    const categoryId = body.category_id ?? parsed.category_id ?? null;
    const podcastId = body.podcast_id ?? parsed.podcast_id ?? null;
    const eventType = body.event_type ?? parsed.event_type;

    if (podcastId && identity.msisdn) {
      void fetchPodcastDetail(podcastId).then((detail) => {
        if (detail) upsertPodcastCache(db, detail);
      });
    }

    db.run(
      `INSERT INTO visits (session_id, msisdn, path, category_id, podcast_id, event_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`,
      [
        body.session_id.trim(),
        identity.msisdn,
        body.path.trim(),
        categoryId,
        podcastId,
        eventType,
      ],
    );

    if (identity.msisdn && identity.subscribed) {
      scheduleAffinityRecompute(db, identity.msisdn);
    }

    return json({ ok: true });
  }

  if (path === "/bookmarks" && req.method === "GET") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;

    const rows = db
      .query(
        "SELECT podcast_id, created_at FROM bookmarks WHERE msisdn = ? ORDER BY created_at DESC",
      )
      .all(msisdn);
    return json(rows);
  }

  if (path === "/bookmarks" && req.method === "POST") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;

    const body = (await req.json()) as { podcast_id?: number; podcast_ids?: number[] };
    const ids =
      body.podcast_ids ??
      (body.podcast_id != null ? [body.podcast_id] : []);

    if (ids.length === 0) return json({ error: "podcast_id required" }, 400);

    const insert = db.query(
      "INSERT OR IGNORE INTO bookmarks (msisdn, podcast_id, created_at) VALUES (?, ?, unixepoch())",
    );
    for (const podcastId of ids) {
      if (Number.isFinite(podcastId)) insert.run(msisdn, podcastId);
    }
    return json({ ok: true });
  }

  if (path.startsWith("/bookmarks/") && req.method === "DELETE") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;

    const podcastId = Number(path.split("/")[2]);
    if (!Number.isFinite(podcastId)) return json({ error: "invalid podcast id" }, 400);

    db.run("DELETE FROM bookmarks WHERE msisdn = ? AND podcast_id = ?", [
      msisdn,
      podcastId,
    ]);
    return json({ ok: true });
  }

  if (path === "/search-history" && req.method === "GET") {
    const msisdn = identity.msisdn;
    const rows = msisdn
      ? db
          .query(
            "SELECT id, query, created_at FROM search_history WHERE msisdn = ? ORDER BY created_at DESC LIMIT 20",
          )
          .all(msisdn)
      : db
          .query(
            "SELECT id, query, created_at FROM search_history WHERE msisdn IS NULL ORDER BY created_at DESC LIMIT 20",
          )
          .all();
    return json(rows);
  }

  if (path === "/search-history" && req.method === "POST") {
    const body = (await req.json()) as { query?: string };
    if (!body.query?.trim()) return json({ error: "query required" }, 400);
    db.run("INSERT INTO search_history (query, msisdn) VALUES (?, ?)", [
      body.query.trim(),
      identity.msisdn,
    ]);
    return json({ ok: true });
  }

  if (path.startsWith("/search-history/") && req.method === "DELETE") {
    const id = path.split("/")[2];
    if (identity.msisdn) {
      db.run("DELETE FROM search_history WHERE id = ? AND msisdn = ?", [
        id,
        identity.msisdn,
      ]);
    } else {
      db.run("DELETE FROM search_history WHERE id = ?", [id]);
    }
    return json({ ok: true });
  }

  if (path === "/search-history" && req.method === "DELETE") {
    if (identity.msisdn) {
      db.run("DELETE FROM search_history WHERE msisdn = ?", [identity.msisdn]);
    } else {
      db.run("DELETE FROM search_history WHERE msisdn IS NULL");
    }
    return json({ ok: true });
  }

  if (path === "/preferences" && req.method === "GET") {
    const msisdn = identity.msisdn ?? "";
    const rows = db
      .query("SELECT key, value FROM user_preferences WHERE msisdn = ?")
      .all(msisdn) as { key: string; value: string }[];
    const prefs: Record<string, string> = {};
    for (const row of rows) prefs[row.key] = row.value;
    return json(prefs);
  }

  if (path === "/preferences" && req.method === "POST") {
    const msisdn = identity.msisdn ?? "";
    const body = (await req.json()) as
      | Record<string, string>
      | { key?: string; value?: string };
    const upsert = db.query(
      `INSERT INTO user_preferences (msisdn, key, value, updated_at)
       VALUES (?, ?, ?, unixepoch())
       ON CONFLICT(msisdn, key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    );
    if (
      "key" in body &&
      "value" in body &&
      typeof body.key === "string" &&
      typeof body.value === "string"
    ) {
      upsert.run(msisdn, body.key, body.value);
      return json({ ok: true });
    }
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;
      upsert.run(msisdn, key, value);
    }
    return json({ ok: true });
  }

  if (path === "/listening-history" && req.method === "GET") {
    const podcastId = url.searchParams.get("podcast_id");
    const msisdn = identity.msisdn;

    if (podcastId) {
      const row = msisdn
        ? db
            .query(
              "SELECT * FROM listening_history WHERE podcast_id = ? AND msisdn = ? LIMIT 1",
            )
            .get(podcastId, msisdn)
        : db
            .query(
              "SELECT * FROM listening_history WHERE podcast_id = ? AND msisdn IS NULL LIMIT 1",
            )
            .get(podcastId);
      return json(row ?? null);
    }

    const rows = msisdn
      ? db
          .query(
            "SELECT * FROM listening_history WHERE msisdn = ? ORDER BY updated_at DESC LIMIT 50",
          )
          .all(msisdn)
      : db
          .query(
            "SELECT * FROM listening_history WHERE msisdn IS NULL ORDER BY updated_at DESC LIMIT 50",
          )
          .all();
    return json(rows);
  }

  if (path === "/listening-history" && req.method === "POST") {
    const body = (await req.json()) as {
      podcast_id: number;
      position_seconds: number;
      duration_seconds: number;
    };
    const msisdn = identity.msisdn;

    if (msisdn) {
      const existing = db
        .query(
          "SELECT id FROM listening_history WHERE podcast_id = ? AND msisdn = ? LIMIT 1",
        )
        .get(body.podcast_id, msisdn);
      if (existing) {
        db.run(
          `UPDATE listening_history SET
             position_seconds = ?,
             duration_seconds = ?,
             updated_at = unixepoch()
           WHERE podcast_id = ? AND msisdn = ?`,
          [body.position_seconds, body.duration_seconds, body.podcast_id, msisdn],
        );
      } else {
        db.run(
          `INSERT INTO listening_history (podcast_id, msisdn, position_seconds, duration_seconds, updated_at)
           VALUES (?, ?, ?, ?, unixepoch())`,
          [body.podcast_id, msisdn, body.position_seconds, body.duration_seconds],
        );
      }
    } else {
      db.run(
        `INSERT INTO listening_history (podcast_id, position_seconds, duration_seconds, updated_at)
         VALUES (?, ?, ?, unixepoch())
         ON CONFLICT(podcast_id) DO UPDATE SET
           position_seconds = excluded.position_seconds,
           duration_seconds = excluded.duration_seconds,
           updated_at = unixepoch()`,
        [body.podcast_id, body.position_seconds, body.duration_seconds],
      );
    }
    return json({ ok: true });
  }

  if (path.startsWith("/listening-history/") && req.method === "GET") {
    const podcastId = Number(path.split("/")[2]);
    if (!Number.isFinite(podcastId)) {
      return json({ error: "invalid podcast id" }, 400);
    }
    const msisdn = identity.msisdn;
    const row = msisdn
      ? db
          .query(
            "SELECT * FROM listening_history WHERE podcast_id = ? AND msisdn = ? LIMIT 1",
          )
          .get(podcastId, msisdn)
      : db
          .query("SELECT * FROM listening_history WHERE podcast_id = ? LIMIT 1")
          .get(podcastId);
    return json(row ?? null);
  }

  if (path === "/ratings" && req.method === "POST") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;

    const body = (await req.json()) as {
      podcast_id?: number;
      rating?: number;
    };
    if (!body.podcast_id || !body.rating) {
      return json({ error: "podcast_id and rating are required" }, 400);
    }

    touchUser(db, msisdn, true);
    const existing = db
      .query(
        "SELECT id FROM ratings WHERE podcast_id = ? AND msisdn = ? LIMIT 1",
      )
      .get(body.podcast_id, msisdn);
    if (existing) {
      db.run(
        "UPDATE ratings SET rating = ?, created_at = unixepoch() WHERE podcast_id = ? AND msisdn = ?",
        [body.rating, body.podcast_id, msisdn],
      );
    } else {
      db.run(
        "INSERT INTO ratings (podcast_id, rating, msisdn, created_at) VALUES (?, ?, ?, unixepoch())",
        [body.podcast_id, body.rating, msisdn],
      );
    }

    const aggregate = db
      .query(
        "SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE podcast_id = ? AND msisdn IS NOT NULL",
      )
      .get(body.podcast_id) as { average?: number; count?: number } | null;
    return json({
      ok: true,
      average: aggregate?.average ?? 0,
      count: aggregate?.count ?? 0,
    });
  }

  if (path.startsWith("/ratings/") && req.method === "GET") {
    const podcastId = Number(path.split("/")[2]);
    const sessionId = url.searchParams.get("session_id") ?? "anon-session";
    const own = getRatingForUser(db, podcastId, identity.msisdn, sessionId);
    const aggregate = db
      .query(
        "SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE podcast_id = ? AND msisdn IS NOT NULL",
      )
      .get(podcastId) as { average?: number; count?: number } | null;
    return json({
      ownRating: own?.rating ?? null,
      average: aggregate?.average ?? 0,
      count: aggregate?.count ?? 0,
      distribution: ratingDistribution(db, podcastId),
    });
  }

  if (path === "/complaints" && req.method === "POST") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;

    const body = (await req.json()) as {
      type: string;
      description: string;
      phone?: string;
      name?: string;
      podcast_id?: number;
    };
    touchUser(db, msisdn, true);
    db.run(
      "INSERT INTO complaints (podcast_id, type, description, phone, msisdn, name) VALUES (?, ?, ?, ?, ?, ?)",
      [
        body.podcast_id ?? null,
        body.type,
        body.description,
        body.phone ?? msisdn,
        msisdn,
        body.name ?? null,
      ],
    );
    return json({ ok: true });
  }

  if (path === "/complaints" && req.method === "GET") {
    const rows = db.query("SELECT * FROM complaints ORDER BY created_at DESC").all();
    return json(rows);
  }

  if (path === "/pwa-events" && req.method === "POST") {
    const body = (await req.json()) as { event?: string };
    if (
      body.event !== "prompt_shown" &&
      body.event !== "accepted" &&
      body.event !== "dismissed"
    ) {
      return json({ error: "invalid event" }, 400);
    }
    db.run("INSERT INTO pwa_events (event, created_at) VALUES (?, unixepoch())", [
      body.event,
    ]);
    return json({ ok: true });
  }

  if (path === "/personalization/profile" && req.method === "GET") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    return json(getPersonalizationProfile(db, msisdn));
  }

  if (path === "/personalization/recompute" && req.method === "POST") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    const result = await recomputeAffinitiesNow(db, msisdn);
    if (!result.ok) {
      return json({ error: result.error ?? "failed" }, 429);
    }
    return json({ ok: true, profile: getPersonalizationProfile(db, msisdn) });
  }

  if (path === "/personalization/category-settings" && req.method === "PATCH") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    const body = (await req.json()) as {
      category_id?: number;
      pinned?: boolean;
      hidden?: boolean;
      push_enabled?: boolean;
    };
    if (!body.category_id || !Number.isFinite(body.category_id)) {
      return json({ error: "category_id required" }, 400);
    }
    updateCategorySettings(db, msisdn, body.category_id, {
      pinned: body.pinned,
      hidden: body.hidden,
      push_enabled: body.push_enabled,
    });
    void computeUserAffinities(db, msisdn);
    return json({ ok: true, profile: getPersonalizationProfile(db, msisdn) });
  }

  if (path === "/personalization/reset-settings" && req.method === "POST") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    resetCategorySettings(db, msisdn);
    void computeUserAffinities(db, msisdn);
    return json({ ok: true, profile: getPersonalizationProfile(db, msisdn) });
  }

  if (path === "/push/vapid-public-key" && req.method === "GET") {
    return json({
      configured: isPushConfigured(),
      publicKey: getVapidPublicKey(),
    });
  }

  if (path === "/push/subscribe" && req.method === "POST") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    const body = (await req.json()) as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
      user_agent?: string;
    };
    if (!body.endpoint?.trim() || !body.keys?.p256dh || !body.keys?.auth) {
      return json({ error: "invalid subscription" }, 400);
    }
    db.run(
      `INSERT INTO push_subscriptions (msisdn, endpoint, p256dh, auth, user_agent, created_at, last_used_at)
       VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())
       ON CONFLICT(endpoint) DO UPDATE SET
         msisdn = excluded.msisdn,
         p256dh = excluded.p256dh,
         auth = excluded.auth,
         user_agent = excluded.user_agent,
         last_used_at = unixepoch()`,
      [
        msisdn,
        body.endpoint.trim(),
        body.keys.p256dh,
        body.keys.auth,
        body.user_agent ?? req.headers.get("User-Agent"),
      ],
    );
    return json({ ok: true });
  }

  if (path === "/push/subscribe" && req.method === "DELETE") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    const body = (await req.json()) as { endpoint?: string };
    if (body.endpoint?.trim()) {
      db.run("DELETE FROM push_subscriptions WHERE msisdn = ? AND endpoint = ?", [
        msisdn,
        body.endpoint.trim(),
      ]);
    } else {
      db.run("DELETE FROM push_subscriptions WHERE msisdn = ?", [msisdn]);
    }
    return json({ ok: true });
  }

  if (path === "/push/status" && req.method === "GET") {
    const msisdn = requireSubscribed(req);
    if (msisdn instanceof Response) return msisdn;
    const count = db
      .query("SELECT COUNT(*) AS cnt FROM push_subscriptions WHERE msisdn = ?")
      .get(msisdn) as { cnt: number };
    const pushEnabledCategories = db
      .query(
        "SELECT category_id FROM category_settings WHERE msisdn = ? AND push_enabled = 1",
      )
      .all(msisdn) as Array<{ category_id: number }>;
    return json({
      subscribed: count.cnt > 0,
      push_configured: isPushConfigured(),
      categories_enabled: pushEnabledCategories.map((row) => row.category_id),
    });
  }

  return json({ error: "Not implemented", path }, 501);
}
