const ZOALCAST_API = process.env.VITE_API_BASE_URL ?? "https://api.zoalcast.com/api";
const PORTAL_ID = Number(process.env.VITE_PORTAL_ID ?? 6);

export type CachedPodcast = {
  id: number;
  category_id?: number;
  name?: string;
  image?: string;
  created_at?: string;
};

export type ZoalcastCategory = {
  id: number;
  name?: string;
};

export async function fetchCategories(): Promise<ZoalcastCategory[]> {
  try {
    const res = await fetch(`${ZOALCAST_API}/portal/${PORTAL_ID}/categories`);
    if (!res.ok) return [];
    const payload = (await res.json()) as { data?: ZoalcastCategory[] };
    return (payload.data ?? []).filter((c) => typeof c.id === "number");
  } catch {
    return [];
  }
}

export async function fetchLatestPodcasts(categoryId?: number): Promise<CachedPodcast[]> {
  try {
    const params = new URLSearchParams({ criteria: "latest" });
    if (categoryId) params.set("category_id", String(categoryId));
    const res = await fetch(`${ZOALCAST_API}/podcast/${PORTAL_ID}/top?${params.toString()}`);
    if (!res.ok) return [];
    const payload = (await res.json()) as { data?: CachedPodcast[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchPodcastDetail(id: number): Promise<CachedPodcast | null> {
  try {
    const res = await fetch(`${ZOALCAST_API}/podcast/${id}`);
    if (!res.ok) return null;
    const payload = (await res.json()) as { data?: CachedPodcast & { category?: { id: number } } };
    const podcast = payload.data;
    if (!podcast) return null;
    return {
      id: podcast.id,
      category_id: podcast.category_id ?? podcast.category?.id,
      name: podcast.name,
      image: podcast.image ?? undefined,
      created_at: podcast.created_at ?? undefined,
    };
  } catch {
    return null;
  }
}

export function upsertPodcastCache(
  db: import("bun:sqlite").Database,
  podcast: CachedPodcast,
) {
  db.run(
    `INSERT INTO podcast_cache (id, category_id, name, image, created_at, cached_at)
     VALUES (?, ?, ?, ?, ?, unixepoch())
     ON CONFLICT(id) DO UPDATE SET
       category_id = COALESCE(excluded.category_id, podcast_cache.category_id),
       name = COALESCE(excluded.name, podcast_cache.name),
       image = COALESCE(excluded.image, podcast_cache.image),
       created_at = COALESCE(excluded.created_at, podcast_cache.created_at),
       cached_at = unixepoch()`,
    [
      podcast.id,
      podcast.category_id ?? null,
      podcast.name ?? null,
      podcast.image ?? null,
      podcast.created_at ?? null,
    ],
  );
}

export function getPodcastCategoryFromCache(
  db: import("bun:sqlite").Database,
  podcastId: number,
): number | null {
  const row = db
    .query("SELECT category_id FROM podcast_cache WHERE id = ? LIMIT 1")
    .get(podcastId) as { category_id?: number | null } | null;
  return row?.category_id ?? null;
}
