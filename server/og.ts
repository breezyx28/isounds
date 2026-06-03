const ZOALCAST_API = "https://api.zoalcast.com/api";
const BASE_URL = process.env.SITE_URL ?? "https://isounds.sd";
const DEFAULT_IMAGE = `${BASE_URL}/logos/isounds-icon-primary.svg`;

export interface RouteMeta {
  title: string;
  description: string;
  image: string;
  type: string;
  locale: string;
  lang: "ar" | "en";
  dir: "rtl" | "ltr";
}

const FALLBACK_META: RouteMeta = {
  title: "iSounds — بودكاست السودان",
  description: "منصة البودكاست السودانية بالتعاون مع زين.",
  image: DEFAULT_IMAGE,
  type: "website",
  locale: "ar_SD",
  lang: "ar",
  dir: "rtl",
};

const STATIC_META: Record<string, Partial<RouteMeta>> = {
  "/": {
    title: "iSounds — بودكاست السودان",
    description: "منصتك للصوت والفيديو بالتعاون مع زين السودان.",
  },
  "/home": {
    title: "iSounds Home",
    description: "اكتشف أحدث حلقات البودكاست السوداني على iSounds.",
  },
  "/about": {
    title: "About iSounds",
    description: "تعرف على منصة iSounds ورسالتها لدعم المحتوى السوداني.",
  },
  "/help": {
    title: "Help & FAQ — iSounds",
    description: "الدعم والأسئلة الشائعة لاستخدام iSounds والاشتراك.",
  },
  "/terms": {
    title: "Terms of Service — iSounds",
    description: "شروط الاستخدام الخاصة بمنصة iSounds.",
  },
  "/privacy": {
    title: "Privacy Policy — iSounds",
    description: "سياسة الخصوصية لمنصة iSounds.",
  },
  "/contact": {
    title: "Contact — iSounds",
    description: "تواصل مع فريق iSounds للدعم والملاحظات.",
  },
  "/categories": {
    title: "Categories — iSounds",
    description: "Browse Sudanese podcast categories on iSounds.",
  },
  "/explore": {
    title: "Explore — iSounds",
    description: "Search and discover Sudanese podcasts on iSounds.",
  },
  "/library": {
    title: "Library — iSounds",
    description: "Your liked, saved, and listening history on iSounds.",
  },
  "/subscribe": {
    title: "Subscribe — iSounds",
    description: "Subscribe to iSounds through Zain Sudan.",
  },
  "/login": {
    title: "Login — iSounds",
    description: "Sign in to iSounds with your phone number.",
  },
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function resolvePodcastMeta(id: string): Promise<Partial<RouteMeta>> {
  try {
    const res = await fetch(`${ZOALCAST_API}/podcast/${id}`);
    if (!res.ok) return {};
    const payload = (await res.json()) as { data?: Record<string, unknown> };
    const data = payload.data ?? {};
    const rawTitle = typeof data.name === "string" ? data.name : undefined;
    const rawDescription =
      typeof data.description === "string" ? data.description : undefined;
    const rawImage = typeof data.image === "string" ? data.image : undefined;
    return {
      title: rawTitle ? `${rawTitle} — iSounds` : undefined,
      description: rawDescription ? rawDescription.slice(0, 160) : undefined,
      image: rawImage ?? undefined,
      type: "music.song",
    };
  } catch {
    return {};
  }
}

async function resolveCategoryMeta(id: string): Promise<Partial<RouteMeta>> {
  try {
    const res = await fetch(`${ZOALCAST_API}/portal/6/categories`);
    if (!res.ok) return {};
    const payload = (await res.json()) as {
      data?: Array<{ id?: number; name?: string }>;
    };
    const category = payload.data?.find((item) => String(item.id) === id);
    if (!category?.name) return {};
    return {
      title: `${category.name} — iSounds`,
      description: `استمع إلى أحدث حلقات ${category.name} على iSounds`,
    };
  } catch {
    return {};
  }
}

export async function resolveRouteMeta(pathname: string): Promise<RouteMeta> {
  const base = { ...FALLBACK_META, ...(STATIC_META[pathname] ?? {}) };
  const podcastMatch = pathname.match(/^\/podcasts\/(\d+)/);
  if (podcastMatch) {
    return { ...base, ...(await resolvePodcastMeta(podcastMatch[1])) };
  }
  const categoryMatch = pathname.match(/^\/categories\/(\d+)/);
  if (categoryMatch) {
    return { ...base, ...(await resolveCategoryMeta(categoryMatch[1])) };
  }
  return base;
}

function upsertMetaTag(html: string, selector: RegExp, tag: string): string {
  return selector.test(html) ? html.replace(selector, tag) : html.replace("</head>", `${tag}\n</head>`);
}

export function injectMetaIntoShell(
  shell: string,
  pathname: string,
  meta: RouteMeta,
): string {
  const canonicalUrl = `${BASE_URL}${pathname}`;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const locale = escapeHtml(meta.locale);
  const type = escapeHtml(meta.type);
  const canonical = escapeHtml(canonicalUrl);

  let html = shell
    .replace(/<html[^>]*>/, `<html lang="${meta.lang}" dir="${meta.dir}" data-theme="dark">`)
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);

  html = upsertMetaTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${description}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${type}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${description}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${image}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:locale" content="${locale}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="iSounds" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+name="twitter:site"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:site" content="@isounds" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${title}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${description}" />`,
  );
  html = upsertMetaTag(
    html,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${image}" />`,
  );
  html = upsertMetaTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );

  return html;
}
