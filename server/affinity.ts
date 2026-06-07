import type { Database } from "bun:sqlite";
import { parseVisitPath } from "./visitParser";
import {
  fetchPodcastDetail,
  getPodcastCategoryFromCache,
  upsertPodcastCache,
} from "./zoalcast";

const WINDOW_SECONDS = 90 * 24 * 60 * 60;
const DECAY_DAYS = 30;
const RECOMPUTE_DEBOUNCE_MS = 5 * 60 * 1000;
const PINNED_MIN_SCORE = 80;
const AFFINITY_PUSH_THRESHOLD = 40;

const SIGNAL_WEIGHTS = {
  category_view: 1,
  podcast_view: 2,
  explore_filter: 2,
  listen_progress: 5,
  bookmark: 4,
  rating_high: 3,
} as const;

type SignalEvent = {
  category_id: number;
  weight: number;
  ageDays: number;
  type: string;
};

const recomputeTimers = new Map<string, ReturnType<typeof setTimeout>>();
const lastManualRecompute = new Map<string, number>();
const MANUAL_RECOMPUTE_COOLDOWN_MS = 60 * 1000;

function decayedWeight(weight: number, ageDays: number): number {
  return weight * Math.exp(-ageDays / DECAY_DAYS);
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

async function resolvePodcastCategory(
  db: Database,
  podcastId: number,
): Promise<number | null> {
  const cached = getPodcastCategoryFromCache(db, podcastId);
  if (cached != null) return cached;

  const detail = await fetchPodcastDetail(podcastId);
  if (!detail?.category_id) return null;
  upsertPodcastCache(db, detail);
  return detail.category_id;
}

async function resolvePodcastCategoriesParallel(
  db: Database,
  podcastIds: number[],
  concurrency = 5,
) {
  for (let i = 0; i < podcastIds.length; i += concurrency) {
    const chunk = podcastIds.slice(i, i + concurrency);
    await Promise.all(chunk.map((id) => resolvePodcastCategory(db, id)));
  }
}

function collectUnresolvedPodcastIds(db: Database, msisdn: string, since: number): number[] {
  const ids = new Set<number>();
  const sources = [
    db
      .query(
        `SELECT podcast_id FROM visits WHERE msisdn = ? AND podcast_id IS NOT NULL AND created_at >= ?`,
      )
      .all(msisdn, since) as Array<{ podcast_id: number }>,
    db
      .query(
        `SELECT podcast_id FROM listening_history WHERE msisdn = ? AND updated_at >= ?`,
      )
      .all(msisdn, since) as Array<{ podcast_id: number }>,
    db
      .query(
        `SELECT podcast_id FROM bookmarks WHERE msisdn = ? AND created_at >= ?`,
      )
      .all(msisdn, since) as Array<{ podcast_id: number }>,
    db
      .query(
        `SELECT podcast_id FROM ratings WHERE msisdn = ? AND created_at >= ?`,
      )
      .all(msisdn, since) as Array<{ podcast_id: number }>,
  ];

  for (const rows of sources) {
    for (const row of rows) {
      if (getPodcastCategoryFromCache(db, row.podcast_id) == null) {
        ids.add(row.podcast_id);
      }
    }
  }

  return [...ids];
}

function parseSignalsJson(raw: string | null): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function collectVisitSignals(db: Database, msisdn: string, since: number): SignalEvent[] {
  const rows = db
    .query(
      `SELECT path, category_id, podcast_id, event_type, created_at
       FROM visits
       WHERE msisdn = ? AND created_at >= ?
       ORDER BY created_at DESC`,
    )
    .all(msisdn, since) as Array<{
    path: string;
    category_id: number | null;
    podcast_id: number | null;
    event_type: string | null;
    created_at: number;
  }>;

  const events: SignalEvent[] = [];
  const now = nowSeconds();

  for (const row of rows) {
    const parsed = parseVisitPath(row.path);
    const categoryId = row.category_id ?? parsed.category_id;
    const podcastId = row.podcast_id ?? parsed.podcast_id;
    const eventType = row.event_type ?? parsed.event_type;
    const ageDays = (now - row.created_at) / 86400;

    if (categoryId != null && Number.isFinite(categoryId)) {
      const weight =
        eventType === "category_view"
          ? SIGNAL_WEIGHTS.category_view
          : eventType === "explore_filter"
            ? SIGNAL_WEIGHTS.explore_filter
            : SIGNAL_WEIGHTS.podcast_view;
      events.push({ category_id: categoryId, weight, ageDays, type: eventType });
    } else if (podcastId != null && Number.isFinite(podcastId)) {
      const cachedCat = getPodcastCategoryFromCache(db, podcastId);
      if (cachedCat != null) {
        events.push({
          category_id: cachedCat,
          weight: SIGNAL_WEIGHTS.podcast_view,
          ageDays,
          type: "podcast_view",
        });
      }
    }
  }

  return events;
}

function collectListeningSignals(db: Database, msisdn: string, since: number): SignalEvent[] {
  const rows = db
    .query(
      `SELECT podcast_id, position_seconds, duration_seconds, updated_at
       FROM listening_history
       WHERE msisdn = ? AND updated_at >= ?`,
    )
    .all(msisdn, since) as Array<{
    podcast_id: number;
    position_seconds: number;
    duration_seconds: number;
    updated_at: number;
  }>;

  const now = nowSeconds();
  const events: SignalEvent[] = [];

  for (const row of rows) {
    if (row.duration_seconds <= 0) continue;
    const ratio = row.position_seconds / row.duration_seconds;
    if (ratio < 0.5) continue;
    const categoryId = getPodcastCategoryFromCache(db, row.podcast_id);
    if (categoryId == null) continue;
    events.push({
      category_id: categoryId,
      weight: SIGNAL_WEIGHTS.listen_progress,
      ageDays: (now - row.updated_at) / 86400,
      type: "listen_progress",
    });
  }

  return events;
}

function collectBookmarkSignals(db: Database, msisdn: string, since: number): SignalEvent[] {
  const rows = db
    .query(
      `SELECT podcast_id, created_at FROM bookmarks WHERE msisdn = ? AND created_at >= ?`,
    )
    .all(msisdn, since) as Array<{ podcast_id: number; created_at: number }>;

  const now = nowSeconds();
  const events: SignalEvent[] = [];

  for (const row of rows) {
    const categoryId = getPodcastCategoryFromCache(db, row.podcast_id);
    if (categoryId == null) continue;
    events.push({
      category_id: categoryId,
      weight: SIGNAL_WEIGHTS.bookmark,
      ageDays: (now - row.created_at) / 86400,
      type: "bookmark",
    });
  }

  return events;
}

function collectRatingSignals(db: Database, msisdn: string, since: number): SignalEvent[] {
  const rows = db
    .query(
      `SELECT podcast_id, rating, created_at FROM ratings
       WHERE msisdn = ? AND rating >= 4 AND created_at >= ?`,
    )
    .all(msisdn, since) as Array<{ podcast_id: number; rating: number; created_at: number }>;

  const now = nowSeconds();
  const events: SignalEvent[] = [];

  for (const row of rows) {
    const categoryId = getPodcastCategoryFromCache(db, row.podcast_id);
    if (categoryId == null) continue;
    events.push({
      category_id: categoryId,
      weight: SIGNAL_WEIGHTS.rating_high,
      ageDays: (now - row.created_at) / 86400,
      type: "rating_high",
    });
  }

  return events;
}

export async function computeUserAffinities(db: Database, msisdn: string) {
  const since = nowSeconds() - WINDOW_SECONDS;

  const unresolvedIds = collectUnresolvedPodcastIds(db, msisdn, since);
  if (unresolvedIds.length > 0) {
    await resolvePodcastCategoriesParallel(db, unresolvedIds);
  }

  const allEvents = [
    ...collectVisitSignals(db, msisdn, since),
    ...collectListeningSignals(db, msisdn, since),
    ...collectBookmarkSignals(db, msisdn, since),
    ...collectRatingSignals(db, msisdn, since),
  ];

  if (allEvents.length === 0) {
    return { eventCount: 0, categories: [] as Array<{ category_id: number; score: number }> };
  }

  const rawScores = new Map<number, { score: number; signals: Record<string, number> }>();

  for (const event of allEvents) {
    const contribution = decayedWeight(event.weight, event.ageDays);
    const existing = rawScores.get(event.category_id) ?? { score: 0, signals: {} };
    existing.score += contribution;
    existing.signals[event.type] = (existing.signals[event.type] ?? 0) + contribution;
    rawScores.set(event.category_id, existing);
  }

  const settingsRows = db
    .query(
      "SELECT category_id, pinned, hidden FROM category_settings WHERE msisdn = ?",
    )
    .all(msisdn) as Array<{ category_id: number; pinned: number; hidden: number }>;

  const settingsMap = new Map(
    settingsRows.map((row) => [
      row.category_id,
      { pinned: row.pinned === 1, hidden: row.hidden === 1 },
    ]),
  );

  let maxScore = 0;
  for (const [, data] of rawScores) {
    if (data.score > maxScore) maxScore = data.score;
  }

  const upsert = db.query(
    `INSERT INTO category_affinities (msisdn, category_id, score, signals_json, updated_at)
     VALUES (?, ?, ?, ?, unixepoch())
     ON CONFLICT(msisdn, category_id) DO UPDATE SET
       score = excluded.score,
       signals_json = excluded.signals_json,
       updated_at = unixepoch()`,
  );

  const results: Array<{ category_id: number; score: number }> = [];

  const writeAffinities = db.transaction(() => {
    for (const [categoryId, data] of rawScores) {
      const settings = settingsMap.get(categoryId);
      if (settings?.hidden) {
        upsert.run(msisdn, categoryId, 0, JSON.stringify(data.signals));
        results.push({ category_id: categoryId, score: 0 });
        continue;
      }

      let normalized = maxScore > 0 ? (data.score / maxScore) * 100 : 0;
      if (settings?.pinned) normalized = Math.max(normalized, PINNED_MIN_SCORE);

      upsert.run(msisdn, categoryId, normalized, JSON.stringify(data.signals));
      results.push({ category_id: categoryId, score: Math.round(normalized * 10) / 10 });
    }

    for (const row of settingsRows) {
      if (row.pinned === 1 && !rawScores.has(row.category_id)) {
        upsert.run(
          msisdn,
          row.category_id,
          PINNED_MIN_SCORE,
          JSON.stringify({ pinned: PINNED_MIN_SCORE }),
        );
        results.push({ category_id: row.category_id, score: PINNED_MIN_SCORE });
      }
    }
  });

  writeAffinities();

  results.sort((a, b) => b.score - a.score);

  return { eventCount: allEvents.length, categories: results };
}

export function scheduleAffinityRecompute(db: Database, msisdn: string) {
  const existing = recomputeTimers.get(msisdn);
  if (existing) clearTimeout(existing);

  recomputeTimers.set(
    msisdn,
    setTimeout(() => {
      recomputeTimers.delete(msisdn);
      void computeUserAffinities(db, msisdn);
    }, RECOMPUTE_DEBOUNCE_MS),
  );
}

export async function recomputeAffinitiesNow(
  db: Database,
  msisdn: string,
  force = false,
): Promise<{ ok: boolean; error?: string; result?: Awaited<ReturnType<typeof computeUserAffinities>> }> {
  const last = lastManualRecompute.get(msisdn) ?? 0;
  if (!force && Date.now() - last < MANUAL_RECOMPUTE_COOLDOWN_MS) {
    return { ok: false, error: "rate_limited" };
  }
  lastManualRecompute.set(msisdn, Date.now());
  const result = await computeUserAffinities(db, msisdn);
  return { ok: true, result };
}

export function getPersonalizationProfile(db: Database, msisdn: string) {
  const affinities = db
    .query(
      `SELECT category_id, score, signals_json, updated_at
       FROM category_affinities WHERE msisdn = ?
       ORDER BY score DESC`,
    )
    .all(msisdn) as Array<{
    category_id: number;
    score: number;
    signals_json: string | null;
    updated_at: number;
  }>;

  const settings = db
    .query(
      `SELECT category_id, pinned, hidden, push_enabled, updated_at
       FROM category_settings WHERE msisdn = ?`,
    )
    .all(msisdn) as Array<{
    category_id: number;
    pinned: number;
    hidden: number;
    push_enabled: number;
    updated_at: number;
  }>;

  const pushCount = db
    .query("SELECT COUNT(*) AS cnt FROM push_subscriptions WHERE msisdn = ?")
    .get(msisdn) as { cnt: number };

  const visitCount = db
    .query("SELECT COUNT(*) AS cnt FROM visits WHERE msisdn = ?")
    .get(msisdn) as { cnt: number };

  const lastUpdated = affinities.reduce(
    (max, row) => Math.max(max, row.updated_at),
    0,
  );

  return {
    affinities: affinities.map((row) => ({
      category_id: row.category_id,
      score: row.score,
      signals: parseSignalsJson(row.signals_json),
    })),
    settings: settings.map((row) => ({
      category_id: row.category_id,
      pinned: row.pinned === 1,
      hidden: row.hidden === 1,
      push_enabled: row.push_enabled === 1,
    })),
    push_subscribed: pushCount.cnt > 0,
    event_count: visitCount.cnt,
    last_updated: lastUpdated,
    push_threshold: AFFINITY_PUSH_THRESHOLD,
  };
}

export function updateCategorySettings(
  db: Database,
  msisdn: string,
  categoryId: number,
  patch: { pinned?: boolean; hidden?: boolean; push_enabled?: boolean },
) {
  const existing = db
    .query(
      "SELECT pinned, hidden, push_enabled FROM category_settings WHERE msisdn = ? AND category_id = ?",
    )
    .get(msisdn, categoryId) as
    | { pinned: number; hidden: number; push_enabled: number }
    | null;

  const pinned = patch.pinned !== undefined ? (patch.pinned ? 1 : 0) : (existing?.pinned ?? 0);
  const hidden = patch.hidden !== undefined ? (patch.hidden ? 1 : 0) : (existing?.hidden ?? 0);
  const pushEnabled =
    patch.push_enabled !== undefined
      ? patch.push_enabled
        ? 1
        : 0
      : (existing?.push_enabled ?? 1);

  db.run(
    `INSERT INTO category_settings (msisdn, category_id, pinned, hidden, push_enabled, updated_at)
     VALUES (?, ?, ?, ?, ?, unixepoch())
     ON CONFLICT(msisdn, category_id) DO UPDATE SET
       pinned = excluded.pinned,
       hidden = excluded.hidden,
       push_enabled = excluded.push_enabled,
       updated_at = unixepoch()`,
    [msisdn, categoryId, pinned, hidden, pushEnabled],
  );

  scheduleAffinityRecompute(db, msisdn);
}

export function resetCategorySettings(db: Database, msisdn: string) {
  db.run("DELETE FROM category_settings WHERE msisdn = ?", [msisdn]);
  scheduleAffinityRecompute(db, msisdn);
}

export { AFFINITY_PUSH_THRESHOLD };
