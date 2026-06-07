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
const SEND_CONCURRENCY = 20;

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

function shouldNotifyUser(
  db: Database,
  msisdn: string,
  categoryId: number,
): boolean {
  const settings = db
    .query(
      "SELECT hidden, push_enabled FROM category_settings WHERE msisdn = ? AND category_id = ?",
    )
    .get(msisdn, categoryId) as { hidden: number; push_enabled: number } | null;

  if (settings?.hidden === 1) return false;
  if (settings && settings.push_enabled === 0) return false;

  const affinity = db
    .query(
      "SELECT score FROM category_affinities WHERE msisdn = ? AND category_id = ?",
    )
    .get(msisdn, categoryId) as { score?: number } | null;

  if (settings?.push_enabled === 1) return true;
  return (affinity?.score ?? 0) >= AFFINITY_PUSH_THRESHOLD;
}

function getPushTargets(db: Database, categoryId: number): PushTarget[] {
  const subs = db
    .query("SELECT id, msisdn, endpoint, p256dh, auth FROM push_subscriptions")
    .all() as PushTarget[];

  return subs.filter((sub) => shouldNotifyUser(db, sub.msisdn, categoryId));
}

async function sendBatch(
  db: Database,
  targets: PushTarget[],
  payload: ReturnType<typeof buildNewEpisodePayload>,
) {
  for (let i = 0; i < targets.length; i += SEND_CONCURRENCY) {
    const batch = targets.slice(i, i + SEND_CONCURRENCY);
    await Promise.all(
      batch.map(async (target) => {
        const result = await sendPushNotification(target, payload);
        if (result.gone) {
          db.run("DELETE FROM push_subscriptions WHERE id = ?", [target.id]);
          return;
        }
        if (result.ok) {
          db.run(
            "UPDATE push_subscriptions SET last_used_at = unixepoch() WHERE id = ?",
            [target.id],
          );
        }
      }),
    );
  }
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
  if (targets.length === 0) {
    markNotified(db, podcast.id, categoryId);
    return;
  }

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

  for (const [lang, langTargets] of byLang) {
    const payload = buildNewEpisodePayload(
      lang,
      podcast.name ?? "iSounds",
      categoryName,
      podcast.id,
      podcast.image,
    );
    await sendBatch(db, langTargets, payload);
  }

  markNotified(db, podcast.id, categoryId);
}

export async function runNewEpisodePoll(db: Database) {
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

  for (const category of categories) {
    const latest = await fetchLatestPodcasts(category.id);
    for (const podcast of latest) {
      if (!podcast.id || seen.has(podcast.id)) continue;
      seen.add(podcast.id);
      if (isAlreadyNotified(db, podcast.id)) continue;
      await processNewEpisode(db, podcast, category.id, category.name);
    }
  }

  setPollState(db, "last_episode_poll", String(Date.now()));
}

export function startNewEpisodePoller(db: Database) {
  const enabled = process.env.ENABLE_EPISODE_POLLER !== "false";
  if (!enabled) {
    console.log("[poller] Episode poller disabled");
    return;
  }

  const tick = () => {
    void runNewEpisodePoll(db).catch((error) => {
      console.error("[poller] Episode poll failed:", error);
    });
  };

  const last = getPollState(db, "last_episode_poll");
  if (!last) {
    void (async () => {
      const podcasts = await fetchLatestPodcasts();
      for (const podcast of podcasts) {
        if (!podcast.id) continue;
        const categoryId = podcast.category_id ?? 0;
        if (categoryId) markNotified(db, podcast.id, categoryId);
      }
      const categories = await fetchCategories();
      for (const cat of categories) {
        const latest = await fetchLatestPodcasts(cat.id);
        for (const podcast of latest) {
          if (podcast.id) markNotified(db, podcast.id, cat.id);
        }
      }
      setPollState(db, "last_episode_poll", String(Date.now()));
      console.log("[poller] Seeded notified_episodes baseline");
    })();
  }

  setTimeout(tick, 15_000);
  setInterval(tick, POLL_INTERVAL_MS);
  console.log(`[poller] Episode poller started (every ${POLL_INTERVAL_MS / 1000}s)`);
}
