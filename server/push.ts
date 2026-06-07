import webpush from "web-push";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:support@isounds.sd";

let configured = false;

export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
}

export function configureWebPush() {
  if (configured || !isPushConfigured()) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  configured = true;
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC;
}

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  icon?: string;
  tag?: string;
};

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<{ ok: boolean; statusCode?: number; gone?: boolean }> {
  if (!isPushConfigured()) {
    return { ok: false, statusCode: 503 };
  }
  configureWebPush();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (error: unknown) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode)
        : undefined;
    return { ok: false, statusCode, gone: statusCode === 410 || statusCode === 404 };
  }
}

export function getUserLanguage(db: import("bun:sqlite").Database, msisdn: string): "ar" | "en" {
  const row = db
    .query("SELECT value FROM user_preferences WHERE msisdn = ? AND key = 'lang' LIMIT 1")
    .get(msisdn) as { value?: string } | null;
  return row?.value === "en" ? "en" : "ar";
}

export function buildNewEpisodePayload(
  lang: "ar" | "en",
  podcastName: string,
  categoryName: string | undefined,
  podcastId: number,
  image?: string,
): PushPayload {
  if (lang === "ar") {
    return {
      title: "حلقة جديدة على iSounds",
      body: categoryName
        ? `${podcastName} — ${categoryName}`
        : podcastName,
      url: `/podcasts/${podcastId}`,
      icon: image ?? "/icons/icon-192.png",
      tag: `episode-${podcastId}`,
    };
  }
  return {
    title: "New episode on iSounds",
    body: categoryName ? `${podcastName} — ${categoryName}` : podcastName,
    url: `/podcasts/${podcastId}`,
    icon: image ?? "/icons/icon-192.png",
    tag: `episode-${podcastId}`,
  };
}
