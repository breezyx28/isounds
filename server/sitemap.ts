const ZOALCAST_API = process.env.VITE_API_BASE_URL ?? "https://api.zoalcast.com/api";
const PORTAL_ID = process.env.VITE_PORTAL_ID ?? "6";
const BASE_URL = process.env.SITE_URL ?? "https://isounds.sd";
const CACHE_MS = 6 * 60 * 60 * 1000;

let cachedXml = "";
let cachedAt = 0;

const STATIC_ROUTES = [
  "/",
  "/home",
  "/browse",
  "/categories",
  "/explore",
  "/library",
  "/library/saved",
  "/library/personalization",
  "/subscribe",
  "/login",
  "/about",
  "/help",
  "/terms",
  "/privacy",
  "/contact",
];

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function getCategoryUrls(): Promise<string[]> {
  try {
    const res = await fetch(`${ZOALCAST_API}/portal/${PORTAL_ID}/categories`);
    if (!res.ok) return [];
    const payload = (await res.json()) as {
      data?: Array<{ id?: number }>;
    };
    return (payload.data ?? [])
      .map((category) => category.id)
      .filter((id): id is number => typeof id === "number")
      .map((id) => `/categories/${id}`);
  } catch {
    return [];
  }
}

async function getTopPodcastUrls(): Promise<string[]> {
  try {
    const res = await fetch(
      `${ZOALCAST_API}/podcast/6/top?criteria=latest&page=1&per_page=200`,
    );
    if (!res.ok) return [];
    const payload = (await res.json()) as {
      data?: Array<{ id?: number }>;
    };
    return (payload.data ?? [])
      .map((podcast) => podcast.id)
      .filter((id): id is number => typeof id === "number")
      .map((id) => `/podcasts/${id}`);
  } catch {
    return [];
  }
}

function buildSitemapXml(paths: string[]): string {
  const now = new Date().toISOString();
  const urls = Array.from(new Set(paths)).map(
    (path) =>
      `<url><loc>${xmlEscape(`${BASE_URL}${path}`)}</loc><lastmod>${now}</lastmod></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    "\n",
  )}\n</urlset>`;
}

export async function getSitemapXml(): Promise<string> {
  const now = Date.now();
  if (cachedXml && now - cachedAt < CACHE_MS) return cachedXml;
  const [categoryUrls, podcastUrls] = await Promise.all([
    getCategoryUrls(),
    getTopPodcastUrls(),
  ]);
  cachedXml = buildSitemapXml([...STATIC_ROUTES, ...categoryUrls, ...podcastUrls]);
  cachedAt = now;
  return cachedXml;
}

export function getRobotsTxt(): string {
  return `User-agent: *\nAllow: /\nDisallow: /library\nDisallow: /api/local\nSitemap: ${BASE_URL}/sitemap.xml\n`;
}
