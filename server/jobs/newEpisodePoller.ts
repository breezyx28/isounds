import type { Database } from "bun:sqlite";
import { AFFINITY_PUSH_THRESHOLD } from "../affinity";
import { buildNewEpisodePayload, sendPushNotification } from "../push";
import {
  fetchCategories,
  fetchLatestPodcasts,
  upsertPodcastCache,
  type CachedPodcast,
} from "../zoalcast";

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 30 * 60 * 1000);
const FIRST_POLL_DELAY_MS = 15_000;
const SEND_CONCURRENCY = 20;
const SEED_STATE_KEY = "seeding";
const LAST_POLL_STATE_KEY = "last_episode_poll";

let pollInFlight = false;

type PushTarget = {
  id: number;
  msisdn: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function getPollState(db: Database, key: string): string | null {
  const row = db.query("SELECT value FROM poll_state WHERE key = ?").get(key) as
    | { value?: string }
    | null;
  return row?.value ?? null;
}

function setPollState(db: Database, key: string, value: string) {
  db.run(
    `INSERT INTO poll_state (key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    [key, value],
  );
}

function isAlreadyNotified(db: Database, podcastId: number): boolean {
  const row = db
    .query("SELECT podcast_id FROM notified_episodes WHERE podcast_id = ?")
    .get(podcastId);
  return Boolean(row);
}

function markNotified(db: Database, podcastId: number, categoryId: number) {
  db.run(
    "INSERT OR IGNORE INTO notified_episodes (podcast_id, category_id, notified_at) VALUES (?, ?, unixepoch())",
    [podcastId, categoryId],
  );
}

function getPushTargets(db: Database, categoryId: number): PushTarget[] {
  return db
    .query(
      `SELECT ps.id, ps.msisdn, ps.endpoint, ps.p256dh, ps.auth
       FROM push_subscriptions ps
       LEFT JOIN category_settings cs
         ON cs.msisdn = ps.msisdn AND cs.category_id = ?
       LEFT JOIN category_affinities ca
         ON ca.msisdn = ps.msisdn AND ca.category_id = ?
       WHERE COALESCE(cs.hidden, 0) = 0
         AND (
           cs.push_enabled = 1
           OR (COALESCE(cs.push_enabled, 1) = 1 AND COALESCE(ca.score, 0) >= ?)
         )`,
    )
    .all(categoryId, categoryId, AFFINITY_PUSH_THRESHOLD) as PushTarget[];
}

async function sendBatch(
  db: Database,
  targets: PushTarget[],
  payload: ReturnType<typeof buildNewEpisodePayload>,
): Promise<number> {
  let successCount = 0;

  for (let i = 0; i < targets.length; i += SEND_CONCURRENCY) {
    const batch = targets.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (target) => {
        const result = await sendPushNotification(target, payload);
        if (result.gone) {
          db.run("DELETE FROM push_subscriptions WHERE id = ?", [target.id]);
          return false;
        }
        if (result.ok) {
          db.run(
            "UPDATE push_subscriptions SET last_used_at = unixepoch() WHERE id = ?",
            [target.id],
          );
          return true;
        }
        return false;
      }),
    );
    successCount += results.filter(Boolean).length;
  }

  return successCount;
}

async function processNewEpisode(
  db: Database,
  podcast: CachedPodcast,
  categoryId: number,
  categoryName?: string,
) {
  if (!podcast.id || isAlreadyNotified(db, podcast.id)) return;

  upsertPodcastCache(db, { ...podcast, category_id: categoryId });
  const targets = getPushTargets(db, categoryId);

  // S-11: do not mark episodes with no eligible subscribers — retry when users subscribe.
  if (targets.length === 0) return;

  const msisdnLang = new Map<string, "ar" | "en">();
  for (const target of targets) {
    if (!msisdnLang.has(target.msisdn)) {
      const row = db
        .query("SELECT value FROM user_preferences WHERE msisdn = ? AND key = 'lang' LIMIT 1")
        .get(target.msisdn) as { value?: string } | null;
      msisdnLang.set(target.msisdn, row?.value === "en" ? "en" : "ar");
    }
  }

  const byLang = new Map<"ar" | "en", PushTarget[]>();
  for (const target of targets) {
    const lang = msisdnLang.get(target.msisdn) ?? "ar";
    const list = byLang.get(lang) ?? [];
    list.push(target);
    byLang.set(lang, list);
  }

  let totalSuccesses = 0;
  for (const [lang, langTargets] of byLang) {
    const payload = buildNewEpisodePayload(
      lang,
      podcast.name ?? "iSounds",
      categoryName,
      podcast.id,
      podcast.image,
    );
    totalSuccesses += await sendBatch(db, langTargets, payload);
  }

  if (totalSuccesses > 0) {
    markNotified(db, podcast.id, categoryId);
  }
}

export async function runNewEpisodePoll(db: Database) {
  if (getPollState(db, SEED_STATE_KEY) === "1") {
    console.log("[poller] Skipping poll — seed in progress");
    return;
  }

  const categories = await fetchCategories();
  const globalLatest = await fetchLatestPodcasts();
  const seen = new Set<number>();

  for (const podcast of globalLatest) {
    if (!podcast.id || seen.has(podcast.id)) continue;
    seen.add(podcast.id);
    const categoryId = podcast.category_id;
    if (!categoryId) continue;
    if (isAlreadyNotified(db, podcast.id)) continue;
    await processNewEpisode(db, podcast, categoryId);
  }

  const CATEGORY_FETCH_CONCURRENCY = 5;
  for (let i = 0; i < categories.length; i += CATEGORY_FETCH_CONCURRENCY) {
    const chunk = categories.slice(i, i + CATEGORY_FETCH_CONCURRENCY);
    const latestByCategory = await Promise.all(
      chunk.map(async (category) => ({
        category,
        latest: await fetchLatestPodcasts(category.id),
      })),
    );

    for (const { category, latest } of latestByCategory) {
      for (const podcast of latest) {
        if (!podcast.id || seen.has(podcast.id)) continue;
        seen.add(podcast.id);
        if (isAlreadyNotified(db, podcast.id)) continue;
        await processNewEpisode(db, podcast, category.id, category.name);
      }
    }
  }

  setPollState(db, LAST_POLL_STATE_KEY, String(Date.now()));
}

async function seedAllExistingAsNotified(db: Database) {
  setPollState(db, SEED_STATE_KEY, "1");

  try {
    const seen = new Set<number>();
    const podcasts = await fetchLatestPodcasts();
    for (const podcast of podcasts) {
      if (!podcast.id || seen.has(podcast.id)) continue;
      seen.add(podcast.id);
      const categoryId = podcast.category_id ?? 0;
      if (categoryId) markNotified(db, podcast.id, categoryId);
    }

    const categories = await fetchCategories();
    for (const cat of categories) {
      const latest = await fetchLatestPodcasts(cat.id);
      for (const podcast of latest) {
        if (!podcast.id || seen.has(podcast.id)) continue;
        seen.add(podcast.id);
        markNotified(db, podcast.id, cat.id);
      }
    }

    setPollState(db, LAST_POLL_STATE_KEY, String(Date.now()));
    console.log("[poller] Seeded notified_episodes baseline");
  } finally {
    setPollState(db, SEED_STATE_KEY, "0");
  }
}

export function startNewEpisodePoller(db: Database) {
  const enabled = process.env.ENABLE_EPISODE_POLLER !== "false";
  if (!enabled) {
    console.log("[poller] Episode poller disabled");
    return;
  }

  const tick = () => {
    if (pollInFlight) {
      console.log("[poller] Skipping tick — previous poll still in flight");
      return;
    }

    pollInFlight = true;
    void runNewEpisodePoll(db)
      .catch((error) => {
        console.error("[poller] Episode poll failed:", error);
      })
      .finally(() => {
        pollInFlight = false;
      });
  };

  void (async () => {
    const last = getPollState(db, LAST_POLL_STATE_KEY);
    if (!last) {
      await seedAllExistingAsNotified(db);
    }

    setTimeout(tick, FIRST_POLL_DELAY_MS);
    setInterval(tick, POLL_INTERVAL_MS);
    console.log(`[poller] Episode poller started (every ${POLL_INTERVAL_MS / 1000}s)`);
  })();
}
