# iSounds v2 — Product Requirements Document

| Field | Value |
|-------|-------|
| **Document version** | 2.0 |
| **Date** | 2026-05-27 |
| **Status** | Active — v2 Rebuild |
| **Scope** | Full rebuild from scratch: new stack, new UI, new features |
| **Previous PRD** | ISOUNDS_PRODUCT_PRD.md (v1.1, reverse-engineered from old codebase) |
| **Backend API** | Zoalcast — `https://api.zoalcast.com/api` — Portal ID `6` — **unchanged** |
| **Subscription** | Zain Sudan DSP — `https://dsplp.sd.zain.com/af-lp/?p=8991632598` — **unchanged** |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [Brand System](#3-brand-system)
4. [Information Architecture & Routes](#4-information-architecture--routes)
5. [SQLite Architecture](#5-sqlite-architecture)
6. [SEO Architecture — Bun SSR](#6-seo-architecture--bun-ssr)
7. [PWA Specification](#7-pwa-specification)
8. [i18n — Arabic & English](#8-i18n--arabic--english)
9. [Subscription & Auth Flow](#9-subscription--auth-flow)
10. [Feature Specifications — Page by Page](#10-feature-specifications--page-by-page)
11. [Advanced Search Specification](#11-advanced-search-specification)
12. [Player Architecture](#12-player-architecture)
13. [Rating & Complaint System](#13-rating--complaint-system)
14. [Redux Toolkit Query — API Slice Reference](#14-redux-toolkit-query--api-slice-reference)
15. [UI/UX Design System](#15-uiux-design-system)
16. [Component Library Strategy](#16-component-library-strategy)
17. [Animation & Motion System](#17-animation--motion-system)
18. [Performance & Accessibility](#18-performance--accessibility)
19. [Dev Environment & Tooling](#19-dev-environment--tooling)
20. [SQLite Schema](#20-sqlite-schema)
21. [Implementation Phases](#21-implementation-phases)
22. [Gaps from v1 — Resolution Map](#22-gaps-from-v1--resolution-map)

---

## 1. Executive Summary

**iSounds v2** is a ground-up rebuild of Sudan's premier Zain-partnered podcast streaming portal. The product remains a **subscription-gated audio/video streaming web portal** — all Zoalcast API contracts and the Zain DSP carrier billing model are **preserved unchanged**. What changes is everything the user sees and experiences.

### What stays the same
- Zoalcast REST API (Portal ID `6`)
- Zain DSP subscription flow (`ZAIN_DSP` URL)
- Core content model: podcast episodes with audio/video, likes, views, categories
- `msisdn`-based auto-login via carrier redirect

### What is new
- Complete UI/UX rebuild with dark-first, editorial-magazine aesthetic
- React + TypeScript + Tailwind CSS (no MUI)
- Redux Toolkit Query replaces Redux Thunks
- Bun as package manager and HTTP server
- Persistent bottom mini-player (cross-page audio continuity)
- SQLite via Bun server for ratings, complaints, search history, and PWA data
- Full Arabic/English i18n with RTL/LTR switching
- Advanced search with filters, sorting, fuzzy matching, and SQLite history
- Marketing landing page (separate from discovery home)
- Server-Side OG/SEO injection via Bun HTTP — no React Helmet
- PWA with service worker, offline shell, and install prompt
- Star rating system + complaint form wired to SQLite
- Library/Favorites page, Continue Listening, Playlists (type stubs)
- Framer Motion animations throughout

---

## 2. Tech Stack

### 2.1 Frontend

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **UI framework** | React | 18+ | Functional components, hooks only |
| **Language** | TypeScript | 5+ | Strict mode |
| **Styling** | Tailwind CSS | 3+ | CSS variables for theme tokens |
| **Icons** | Phosphor React | latest | Consistent icon set |
| **State / API** | Redux Toolkit Query (RTK Query) | latest | All API calls — replaces axios thunks |
| **Global state** | Redux Toolkit (`createSlice`) | latest | Auth, player, UI state |
| **Forms / validation** | Yup + react-hook-form | latest | All forms |
| **i18n** | i18next + react-i18next | latest | AR/EN, RTL/LTR |
| **Animation** | Framer Motion | latest | Page transitions, micro-interactions |
| **Component library** | Shadcn/ui + ReactBit | latest | See §16 |
| **Audio player** | react-h5-audio-player | latest | Hidden; controlled by custom UI |
| **Video player** | video-react or native `<video>` | latest | Episode detail page |
| **PWA** | Workbox + custom service worker | latest | Offline shell, asset caching |
| **Package manager** | Bun | latest | Replaces npm/yarn |
| **Build tool** | Vite | latest | Replaces Create React App |

### 2.2 Server (Bun HTTP)

| Role | Technology | Notes |
|------|-----------|-------|
| **Static hosting** | Bun HTTP server | Serves Vite build output |
| **SSR OG injection** | Custom Bun middleware | Injects `<meta>` tags per route from Zoalcast API data |
| **SQLite** | `bun:sqlite` (built-in) | Ratings, complaints, search history, PWA analytics |
| **Runtime** | Bun | Replaces Node/Express entirely |

> **Why Bun SQLite?** `bun:sqlite` is a first-class, zero-dependency SQLite binding built into Bun. It is the right choice for a Bun-native server — no extra packages, fast, fully typed. The SQLite database file lives on the server (`/var/data/isounds.db`). The React client communicates with it through a thin Bun API layer (3–4 routes). This avoids WASM overhead and keeps sensitive data server-side.

### 2.3 Removed from v1

| Removed | Replaced by |
|---------|-------------|
| Create React App / `react-scripts` | Vite |
| MUI / `@mui/material` | Shadcn/ui + ReactBit + Tailwind |
| Redux Thunks | RTK Query |
| Axios (standalone) | RTK Query `fetchBaseQuery` |
| `jss-rtl` | Tailwind `dir` utilities + CSS logical properties |
| `react-meta-tags` / React Helmet | Bun SSR OG injection |
| `react-material-ui-carousel` / `react-slick` | Custom Framer Motion carousel |
| `nice-react-ticker` | CSS marquee / Framer Motion text scroll |
| `qs` | Native `URLSearchParams` |
| Express server | Bun HTTP server |

---

## 3. Brand System

### 3.1 Design Direction

**Aesthetic:** *Dark-editorial luxury* — deep near-black backgrounds with rich violet-purple as the dominant accent, editorial typography, generous negative space, and glowing card surfaces. Inspired by the reference images: floating cards on dark canvas, bold section titles, and a sense of depth through layered surfaces.

**Key visual signature:** The iSounds outlined SVG logo (`outlined-white.svg`) used as a large, low-opacity watermark/pattern layered behind cards and hero sections — giving a branded texture without cluttering content.

### 3.2 Color Palette

All values defined as CSS custom properties in `src/styles/tokens.css` and mapped to Tailwind config.

#### Dark Theme (default)

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| **Background** | `--color-bg` | `#08060F` | Page background — near-black with deep purple undertone |
| **Surface** | `--color-surface` | `#100C1E` | Cards, modals, nav |
| **Surface Raised** | `--color-surface-raised` | `#1A1530` | Elevated cards, dropdowns, player bar |
| **Surface Border** | `--color-border` | `#2A2347` | Card borders, dividers |
| **Primary** | `--color-primary` | `#A855F7` | CTAs, active states, links — purple-500 |
| **Primary Bright** | `--color-primary-bright` | `#C084FC` | Hover states, glows — purple-400 |
| **Primary Deep** | `--color-primary-deep` | `#7E22CE` | Pressed states, gradient base — purple-800 |
| **Primary Glow** | `--color-primary-glow` | `rgba(168,85,247,0.20)` | Box-shadow, card accent rings |
| **Accent Pink** | `--color-accent` | `#EC4899` | Like button, featured badge, rating stars (alt) |
| **Text Primary** | `--color-text` | `#F0EEFF` | Headings, primary body |
| **Text Secondary** | `--color-text-muted` | `#9B8FBE` | Metadata, captions, timestamps |
| **Text Disabled** | `--color-text-disabled` | `#4A4268` | Placeholders, inactive |
| **Success** | `--color-success` | `#22C55E` | Subscription confirmed, toast success |
| **Warning** | `--color-warning` | `#F59E0B` | Low-signal states |
| **Error** | `--color-error` | `#EF4444` | Form errors, complaint flag |
| **Zain Brand** | `--color-zain` | `#E8001D` | Zain co-brand elements only — use sparingly |

#### Light Theme (toggled)

Light theme inverts the surface stack and uses a warm off-white base. The purple accent remains the same — it reads well on both themes.

| Token | Hex |
|-------|-----|
| `--color-bg` | `#FAF8FF` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-raised` | `#F3F0FF` |
| `--color-border` | `#E4DCFF` |
| `--color-text` | `#0F0A1E` |
| `--color-text-muted` | `#6B5F8A` |

> Theme is toggled via a `data-theme="dark"|"light"` attribute on `<html>`. Preference stored in `localStorage.theme` and SQLite `user_preferences` table.

### 3.3 Typography

#### English

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| **Display / Hero headings** | Guesswhat | 700 | Self-hosted from provided font files. Used for large EN titles and section headers |
| **Body / UI** | DM Sans | 400, 500, 600 | Google Fonts — clean geometric sans, excellent at small sizes, good complement to Guesswhat |

> **If Guesswhat files are unavailable at build time:** fall back to `Syne` (Google Fonts, 700) for display — it shares the same confident, geometric character. Do not fall back to Inter or Space Grotesk.

#### Arabic

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| **Display / Hero headings** | Almarai | 700, 800 | Google Fonts Arabic — modern, bold, and geometrically consistent with Guesswhat's personality |
| **Body / UI** | IBM Plex Arabic | 400, 500 | Google Fonts — excellent legibility at 14–16px, designed for screen, pairs cleanly with Almarai |

> **Guesswhat for Arabic?** Guesswhat is a Latin-only typeface and cannot render Arabic glyphs. Almarai at 700–800 weight provides the same bold, confident editorial energy in Arabic. Apply `font-family: 'Guesswhat'` on `[lang="en"]` headings and `font-family: 'Almarai'` on `[lang="ar"]` headings via the i18n class system.

#### Font Scale (Tailwind custom `fontSize`)

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `display-2xl` | 72px | 1.1 | Landing hero — English only |
| `display-xl` | 56px | 1.1 | Landing hero AR / Page headers |
| `display-lg` | 40px | 1.15 | Section titles |
| `display-md` | 32px | 1.2 | Card group titles |
| `heading-lg` | 24px | 1.3 | Episode card titles |
| `heading-md` | 20px | 1.3 | Sub-section labels |
| `body-lg` | 16px | 1.6 | Descriptions, paragraphs |
| `body-md` | 14px | 1.5 | Metadata, captions |
| `label` | 12px | 1.4 | Badges, tags, timestamps |

### 3.4 Logo Usage

Three SVG variants provided:

| File | Usage |
|------|-------|
| `outlined-white.svg` | Dark theme navbar, loading screen, dark card watermark |
| `outlined-black.svg` | Light theme navbar |
| `outlined-primary.svg` | Favicons, PWA splash screen, loading animation |

**Watermark pattern:** `outlined-white.svg` placed at `opacity: 0.04–0.06`, `position: absolute`, overflowing the card's right/bottom edge, `pointer-events: none`, `z-index: 0`. Use on: hero section background, featured episode cards, category hero cards. This gives every major surface a subtle branded texture.

### 3.5 Spacing System

Tailwind default spacing scale (4px base unit). Use exclusively from the scale — no arbitrary values.

Key spacing decisions:
- **Page horizontal padding:** `px-4` (mobile) → `px-8` (md) → `px-16` (xl)
- **Card padding:** `p-4` (mobile) → `p-5` (md)
- **Section gap:** `gap-6` (mobile) → `gap-8` (md)
- **Section vertical margin:** `my-12` (mobile) → `my-16` (md)

### 3.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Badges, tags |
| `rounded-md` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Player bar, modals, drawers |
| `rounded-2xl` | 20px | Hero cards, featured content |
| `rounded-full` | 9999px | Avatars, circular buttons, pills |

---

## 4. Information Architecture & Routes

### 4.1 Route Map

| Route | Page | Auth Required | Notes |
|-------|------|---------------|-------|
| `/` | Landing Page | No | Marketing hero; separate from discovery |
| `/home` | Home / Discovery | No | Redirected to after subscription check |
| `/categories` | Categories Overview | No | Grid of all categories |
| `/categories/:categoryId` | Category Page | No | Paginated episode grid |
| `/explore` | Advanced Search / Explore | No | `?q=&page=&category=&sort=&duration=` |
| `/podcasts/:id` | Episode Detail | No (player gated) | Full player for subscribers |
| `/library` | Library / Favorites | Yes (subscriber) | Liked episodes from API |
| `/library/history` | Continue Listening | Yes (subscriber) | Resume positions from SQLite |
| `/subscribe` | Subscribe / Onboarding | No | Dedicated Zain funnel page |
| `/login` | Phone Login | No | Prominent, linked from nav |
| `/about` | About iSounds | No | §2.5/2.6 copy from old PRD |
| `/help` | Help / FAQ | No | Subscription, playback, cancel |
| `/terms` | Terms of Service | No | Legal |
| `/privacy` | Privacy Policy | No | Legal |
| `/contact` | Contact & Support | No | Form wired to SQLite `complaints` |
| `*` | 404 | No | Branded not-found page |

> **URL style:** Query-string pagination (`?page=2`) everywhere. Category IDs in URL are numeric (from API). No `page=:page` path segments (v1 anti-pattern fixed).

### 4.2 Navigation Structure

**Desktop header (sticky):**
- Logo (left)
- Nav links: Home · Categories · Explore (with search icon)
- Right cluster: Language toggle (AR/EN) · Theme toggle · Library (if subscribed) · Subscribe CTA or User menu

**Mobile bottom nav (5 tabs):**
- Home · Explore · Categories · Library · More (hamburger → Settings, About, Help)

**Mobile drawer:**
- Full category list
- Subscribe / Cancel subscription
- Language toggle
- Theme toggle

---

## 5. SQLite Architecture

### 5.1 Recommendation: Bun Server + `bun:sqlite`

The correct architecture for this stack is a **Bun HTTP server** that:

1. Serves the Vite-built React SPA from `/dist`
2. Injects dynamic OG/meta HTML per route (§6)
3. Exposes a thin internal API at `/api/local/*` for SQLite read/write
4. Stores all user-behavior data in a file-based SQLite database at `/var/data/isounds.db`

The React client calls `/api/local/*` for SQLite operations — it never accesses SQLite directly. This is the cleanest, most secure pattern.

### 5.2 Bun Server Entry Point (`server/index.ts`)

```typescript
import { serve } from "bun";
import { Database } from "bun:sqlite";
import { handleOGInjection } from "./og";
import { router } from "./router";

const db = new Database("/var/data/isounds.db", { create: true });
db.run(/* migration SQL — see §20 */);

serve({
  port: process.env.PORT ?? 8888,
  async fetch(req) {
    const url = new URL(req.url);

    // SQLite API routes
    if (url.pathname.startsWith("/api/local")) {
      return router(req, db);
    }

    // SSR OG injection for HTML routes
    if (!url.pathname.includes(".")) {
      return handleOGInjection(req, url);
    }

    // Static assets
    return new Response(Bun.file(`./dist${url.pathname}`));
  },
});
```

### 5.3 Local API Routes (`/api/local/*`)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/local/search-history` | Return last 20 searches for user session |
| `POST` | `/api/local/search-history` | Save new search query |
| `DELETE` | `/api/local/search-history/:id` | Delete single history item |
| `POST` | `/api/local/ratings` | Submit star rating for episode |
| `GET` | `/api/local/ratings/:podcastId` | Get own rating for episode |
| `POST` | `/api/local/complaints` | Submit complaint |
| `GET` | `/api/local/complaints` | List all complaints (admin view, future) |
| `GET` | `/api/local/listening-history` | Get resume positions |
| `POST` | `/api/local/listening-history` | Save/update resume position |
| `GET` | `/api/local/preferences` | Get user preferences (theme, lang) |
| `POST` | `/api/local/preferences` | Save preferences |

---

## 6. SEO Architecture — Bun SSR

### 6.1 Strategy

No React Helmet. No client-side meta injection. All `<meta>` tags, OG tags, and `<title>` are **injected server-side** into the HTML shell before the response is sent to the browser. This guarantees that crawlers and social platform scrapers always receive real, populated metadata — they do not wait for JavaScript.

### 6.2 HTML Shell (`dist/index.html` base template)

```html
<!DOCTYPE html>
<html lang="{{LANG}}" dir="{{DIR}}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{META_TITLE}}</title>
  <meta name="description" content="{{META_DESCRIPTION}}" />

  <!-- Open Graph -->
  <meta property="og:type" content="{{OG_TYPE}}" />
  <meta property="og:title" content="{{META_TITLE}}" />
  <meta property="og:description" content="{{META_DESCRIPTION}}" />
  <meta property="og:image" content="{{OG_IMAGE}}" />
  <meta property="og:url" content="{{OG_URL}}" />
  <meta property="og:site_name" content="iSounds" />
  <meta property="og:locale" content="{{OG_LOCALE}}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@isounds" />
  <meta name="twitter:title" content="{{META_TITLE}}" />
  <meta name="twitter:description" content="{{META_DESCRIPTION}}" />
  <meta name="twitter:image" content="{{OG_IMAGE}}" />

  <!-- Canonical -->
  <link rel="canonical" href="{{CANONICAL_URL}}" />

  <!-- PWA -->
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#08060F" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>
```

### 6.3 OG Injection Logic (`server/og.ts`)

```typescript
const ZOALCAST_API = "https://api.zoalcast.com/api";
const BASE_URL = process.env.SITE_URL ?? "https://isounds.sd";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

const ROUTES: Record<string, (params: Record<string, string>) => Promise<OGData>> = {
  "/": async () => ({
    title: "iSounds — بودكاست السودان",
    description: "منصتك للصوت والفيديو بالتعاون مع زين السودان",
    image: DEFAULT_IMAGE,
    type: "website",
    locale: "ar_SD",
  }),
  "/podcasts/:id": async ({ id }) => {
    const res = await fetch(`${ZOALCAST_API}/podcast/${id}`);
    const { data } = await res.json();
    return {
      title: `${data.name} — iSounds`,
      description: data.description?.slice(0, 160) ?? "",
      image: data.image ?? DEFAULT_IMAGE,
      type: "music.song",
      locale: "ar_SD",
    };
  },
  "/categories/:id": async ({ id }) => {
    // Category name lookup from categories endpoint
    const res = await fetch(`${ZOALCAST_API}/portal/6/categories`);
    const { data } = await res.json();
    const cat = data.find((c: any) => String(c.id) === id);
    return {
      title: `${cat?.name ?? "تصنيف"} — iSounds`,
      description: `استمع إلى أحدث حلقات ${cat?.name ?? ""} على iSounds`,
      image: DEFAULT_IMAGE,
      type: "website",
      locale: "ar_SD",
    };
  },
};

export async function handleOGInjection(req: Request, url: URL): Promise<Response> {
  const shell = await Bun.file("./dist/index.html").text();
  const ogData = await resolveRoute(url.pathname);
  const html = interpolate(shell, ogData, url.href);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
```

### 6.4 Sitemap (`/sitemap.xml`)

Generated dynamically by the Bun server on a cached schedule (every 6 hours). Includes:
- All static routes (landing, home, categories, about, help, terms, privacy, contact)
- All category pages (`/categories/:id`)
- Top 200 podcast episode pages (`/podcasts/:id`) from `/podcast/6/top?criteria=latest`

### 6.5 Robots.txt (`/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /library
Disallow: /api/local
Sitemap: https://isounds.sd/sitemap.xml
```

---

## 7. PWA Specification

### 7.1 Manifest (`public/manifest.json`)

```json
{
  "name": "iSounds digital portal",
  "short_name": "iSounds",
  "description": "منصة البودكاست السودانية بالتعاون مع زين",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#08060F",
  "theme_color": "#A855F7",
  "lang": "ar",
  "dir": "rtl",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "1280x720", "type": "image/png" }
  ]
}
```

### 7.2 Service Worker Strategy (Workbox)

| Resource Type | Strategy | Notes |
|--------------|----------|-------|
| App shell (`index.html`) | Network first → cache fallback | Serve offline shell on failure |
| Static assets (JS, CSS, fonts) | Cache first | Long-term cache with versioned filenames |
| API responses (categories, top) | Stale-while-revalidate | 5-minute TTL |
| Episode images | Cache first | 50MB quota limit |
| Audio streams | Network only | Cannot be cached — require token |

### 7.3 Offline Shell

When offline, the PWA shows a branded offline page with:
- Logo
- "أنت غير متصل بالإنترنت / You're offline" message
- Last-viewed category list from cache
- "Try again" button

### 7.4 Install Prompt

- Show custom "Add to home screen" banner after 30 seconds on site or second visit
- Stored in SQLite `pwa_events` table: `{ event: 'prompt_shown' | 'accepted' | 'dismissed', ts }`
- Do not show again for 7 days after dismissal

---

## 8. i18n — Arabic & English

### 8.1 Implementation

```bash
bun add i18next react-i18next i18next-browser-languagedetector
```

Translation files:
```
src/
  i18n/
    index.ts          # i18next init
    locales/
      ar/
        common.json   # shared UI strings
        episodes.json # episode-specific
        auth.json     # subscription, login
        search.json   # search & filter labels
        legal.json    # about, terms, privacy
      en/
        (same structure)
```

### 8.2 RTL/LTR Switching

On language toggle:
1. `document.documentElement.setAttribute("lang", locale)` → `"ar"` or `"en"`
2. `document.documentElement.setAttribute("dir", dir)` → `"rtl"` or `"ltr"`
3. Persist to `localStorage.lang` and `/api/local/preferences`
4. Tailwind uses CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`) everywhere instead of `ml-`/`mr-`/`pl-`/`pr-` — direction-agnostic by default

### 8.3 Font Switching by Language

```css
:root[lang="ar"] .font-display { font-family: 'Almarai', sans-serif; }
:root[lang="en"] .font-display { font-family: 'Guesswhat', 'Syne', sans-serif; }
:root[lang="ar"] .font-body    { font-family: 'IBM Plex Arabic', sans-serif; }
:root[lang="en"] .font-body    { font-family: 'DM Sans', sans-serif; }
```

### 8.4 Number Formatting

- Arabic locale: use `Intl.NumberFormat("ar-SD")` for view/like counts
- Dates: use `Intl.DateTimeFormat("ar-SD")` in AR mode; `"en-US"` in EN mode
- Duration (`"13:16.000"` from API): parse and format as `mm:ss` in both locales

### 8.5 Language Toggle Component

A single pill toggle `AR | EN` in the header. On click:
- Plays a subtle Framer Motion transition
- Swaps all text, direction, and fonts in one frame
- No page reload required

---

## 9. Subscription & Auth Flow

### 9.1 Flow Logic — Preserved from v1

The underlying Zain carrier subscription logic is **unchanged**:

1. On app mount: read `msisdn` from URL `?msisdn=` → save to `localStorage`
2. Call `GET /isounds/check_subscription/{msisdn}`
3. On success: call `POST /user/login` → store token in `localStorage.user` and Redux
4. On failure: guest state — browsing allowed, player gated

### 9.2 UI/UX Changes (v2)

#### Subscribe CTA — Unified, Consistent

- **Single DSP URL everywhere:** `https://dsplp.sd.zain.com/af-lp/?p=8991632598`
- **No test URLs** — the sidebar test URL bug from v1 is eliminated
- Subscribe button style: full-width pill, `bg-primary`, Zain logo embedded in button left side

#### States

The app has four explicit UI states (missing from v1):

| State | Indicator | UI behavior |
|-------|-----------|-------------|
| `checking` | Skeleton loaders + spinner | App mount, checking subscription |
| `guest` | Subscribe CTA banner visible | Browse allowed, player locked |
| `subscribed` | "مشترك" badge in header | Full access, mini-player active |
| `expired/error` | Warning banner | Prompt re-subscribe; do not logout silently |

#### Welcome State (new in v2)

When `checkStatus()` succeeds for the first time in a session:
- Full-screen welcome overlay (Framer Motion: scale + fade in, 1.5s, then auto-dismiss)
- Shows: logo + "مرحباً بك في iSounds" + "اشتراكك مع زين فعّال ✓"
- Only on first successful check per session (tracked in `sessionStorage`)

#### Subscribe Page (`/subscribe`) — New

A dedicated page before the Zain DSP redirect:
- Explains what iSounds offers (from §2.5 copy)
- Shows pricing note: "عن طريق فاتورة زين"
- "اشترك الآن" → opens Zain DSP in new tab
- "أنا مشترك بالفعل" → triggers `checkStatus()` manually

#### Login Page (`/login`) — Promoted

The login page now has a prominent link in the header and is explained clearly. It supports both:
- Carrier-redirect users (auto-login via `msisdn`)
- Direct login via phone number input (existing `POST /user/login`)

#### Cancel Subscription Modal — Redesigned

- Two-step confirmation: "هل أنت متأكد؟" → "نعم، ألغِ اشتراكي"
- On confirm: POST `/isounds/unsubscribe`, then clear `msisdn` + `subscriberInfo` + `user` (all three — v1 bug fixed)
- After cancel: redirect to `/subscribe` with a "يمكنك إعادة الاشتراك في أي وقت" message

---

## 10. Feature Specifications — Page by Page

### 10.1 Landing Page (`/`)

The marketing entry point for new visitors. Separate from the discovery home.

**Sections (top to bottom):**

1. **Hero Section**
   - Full-viewport height
   - Background: dark gradient mesh with animated floating orbs (Framer Motion + CSS radial gradients in purple/pink)
   - `outlined-white.svg` watermark at `opacity: 0.05`, right-aligned, oversized
   - Headline (Guesswhat/Almarai, 72px EN / 56px AR): *"iSounds — استمع. اكتشف. استمتع."*
   - Sub-headline: tagline from §2.5
   - CTA row: "اشترك مع زين" (primary) + "تصفح المحتوى" → `/home` (outline)
   - Floating podcast card mockups (3 cards, staggered Framer Motion entrance)
   - Scroll indicator

2. **Features Section**
   - Grid of 6 feature cards (icons from Phosphor)
   - Browse · Stream · Like · Search · Share · PWA install
   - Copy from §2.5 services table

3. **Content Preview Section**
   - "ألق نظرة على ما ينتظرك" heading
   - Horizontal auto-scrolling carousel of real episodes from `GET /podcast/6/top?criteria=latest`
   - Each card: cover image, name, category badge, duration
   - Subscribe gate overlay: blurred, "اشترك لتستمع"

4. **Categories Section**
   - Grid of category tiles with colored backgrounds (from v1 category color system)
   - Click → `/categories/:id`

5. **About/Partners Section**
   - iSounds + Zain logos side by side
   - One-paragraph about text (§2.6 English + Arabic)

6. **Footer**
   - Links: Home · About · Help · Terms · Privacy · Contact
   - Social: none (product has no social accounts)
   - Zain co-brand note
   - Language toggle + Theme toggle

### 10.2 Home / Discovery (`/home`)

The post-landing discovery experience.

**Sections:**
1. **Sticky header** with search bar, nav links, language/theme toggles
2. **Featured / Hero Rail** — large card for the single most-viewed episode this week; background bleed with episode image; Framer Motion entrance
3. **آخر المواضيع (Latest)** — horizontal scroll rail, `GET /top?criteria=latest`
4. **الأكثر إعجاباً (Most Liked)** — horizontal scroll rail, `GET /top?criteria=liked`
5. **الأكثر مشاهدة (Most Viewed)** — horizontal scroll rail, `GET /top?criteria=viewed`
6. **All Categories** — small grid of category pills → `/categories/:id`
7. **Continue Listening** (subscribers only) — if SQLite history exists, horizontal rail of in-progress episodes

Each rail has:
- Section heading + "عرض الكل" → category/explore page
- Horizontal scroll with invisible scrollbar
- Loading skeleton (3 card skeletons per rail while fetching)
- Empty state with illustration if no data

### 10.3 Episode Detail Page (`/podcasts/:id`)

**Layout:**
- **Hero area** (full-width, dark, episode image as blurred background):
  - Episode cover image (square, `rounded-2xl`, centered)
  - Episode title (Framer Motion text ticker if long — replaces `nice-react-ticker`)
  - Category badge · Duration · Created date · View count
  - Like button (heart icon, Phosphor, `color-accent` when liked)
  - Share button → Share Modal

- **Player Area** (subscribers only):
  - Full audio player with custom UI (progress bar, time display, play/pause, volume, speed)
  - `react-h5-audio-player` hidden; custom controls bound to its API
  - Audio source: `GET /podcast/{id}/sound?Authorization={token}`
  - For video episodes: `<video>` element with native controls (full-width)

- **Subscribe Gate** (non-subscribers):
  - Blurred player placeholder
  - "عزيزنا الزائر — اشترك مع زين للاستماع" copy
  - Subscribe CTA button (primary)

- **Description** — full text, expandable after 3 lines, `show more / أقرأ أكثر` toggle

- **Star Rating** (§13) — 5 stars, subscriber-only, stored in SQLite

- **Related Episodes Carousel** — `GET /top?criteria=latest&category_id={cat}`

- **Complaint Link** — subtle "إبلاغ عن مشكلة" text link → opens Complaint Modal (§13.2)

### 10.4 Category Page (`/categories/:id`)

**Header:**
- Category name (large display heading)
- Category color from the token map (passed via route state or looked up from categories list)
- `total_podcasts` count + `total_muinutes` total duration
- `outlined-white.svg` watermark

**Content:**
- Masonry/grid of episode cards (2 columns mobile, 3 tablet, 4 desktop)
- Pagination: `?page=N` — infinite scroll trigger at bottom OR numbered pagination (configurable in config)
- Skeleton loading for initial load and page transitions

### 10.5 Advanced Search / Explore (`/explore`)

See §11 for full specification.

### 10.6 Library (`/library`)

Subscriber-only page.

**Tabs:**
1. **Liked Episodes** — `GET /podcast/user/likes?page=N` (now wired to UI — v1 gap fixed)
2. **Continue Listening** — SQLite `listening_history` table ordered by `updated_at DESC`
3. **Search History** — SQLite `search_history` table with clear-all option

Each tab uses the same episode card grid with appropriate empty state illustrations.

### 10.7 Subscribe Page (`/subscribe`)

See §9.2.

### 10.8 About Page (`/about`)

Uses the bilingual copy from ISOUNDS_PRODUCT_PRD.md §2.6. Split into:
- Welcome section with logo + tagline
- Mission section
- Partner section (Zain branding block)
- Services overview (from §2.5 table, rendered as icon cards)

### 10.9 Help / FAQ (`/help`)

Accordion-style FAQ with these initial questions:

| Question (AR) | Category |
|--------------|----------|
| كيف أشترك في iSounds؟ | الاشتراك |
| كيف أستمع للمحتوى؟ | الاستخدام |
| كيف أُلغي اشتراكي؟ | الاشتراك |
| لماذا لا يعمل المشغل؟ | مشاكل تقنية |
| هل يعمل التطبيق بدون إنترنت؟ | PWA |
| كيف أثبّت التطبيق على هاتفي؟ | PWA |
| ما هي فئات المحتوى المتاحة؟ | المحتوى |

### 10.10 Contact Page (`/contact`)

Form fields (validated with Yup + react-hook-form):
- Name (`required`, min 2 chars)
- Phone number (`required`, Sudanese format `^(0|\+249)[0-9]{9}$`)
- Subject (select: اقتراح · شكوى · مشكلة تقنية · أخرى)
- Message (`required`, min 20 chars, max 500 chars)

On submit: `POST /api/local/complaints` → SQLite. Show success toast.

---

## 11. Advanced Search Specification

### 11.1 URL Structure

```
/explore?q={keyword}&page={N}&category={id}&sort={latest|liked|viewed}&duration_min={N}&duration_max={N}&from={YYYY-MM-DD}&to={YYYY-MM-DD}
```

All filter state lives in URL params — shareable, bookmarkable, back-button-safe.

### 11.2 Search Input

- Autofocus on page mount
- **Fuzzy matching as-you-type:** debounced 300ms → calls `GET /podcast/6/search?s={q}&page=1`
- **Search history dropdown:** appears on focus, shows last 10 searches from SQLite `search_history`, each with a delete ×
- Results update without full page navigation (RTK Query cache handles this)
- Clear button (×) inside input when query exists

### 11.3 Filter Panel

Desktop: filters appear in a sidebar (left in LTR, right in RTL).
Mobile: filters in a bottom sheet drawer toggled by a "فلتر" button.

#### Filters

| Filter | UI | Notes |
|--------|----|-------|
| **Category** | Multi-select chips (from `GET /portal/6/categories`) | OR logic |
| **Duration** | Range slider: min/max in minutes | Client-side post-filter (API doesn't support duration filter; apply after fetch) |
| **Date range** | Two date pickers (from / to) in `DD/MM/YYYY` format matching API's `created_at` | Client-side filter |
| **Sort by** | Segmented control: Latest · Most Liked · Most Viewed | Maps to `criteria` param on `top` endpoint; for keyword search, sort is client-side |

#### Sorting Logic

- **With keyword (`q` present):** calls search endpoint; client sorts results by chosen criterion
- **Without keyword:** calls `/top?criteria={sort}&category_id={id}` — API handles it

### 11.4 Results Display

- **Grid view** (default): 2-col mobile, 3-col tablet, 4-col desktop
- **List view** (toggle): full-width rows with description snippet
- Results count: "٢٣ نتيجة لـ «{query}»"
- **Empty state:** Phosphor `MagnifyingGlass` icon + "لا توجد نتائج — جرّب كلمة أخرى"
- **No query state:** show top latest episodes as default content

### 11.5 Search History (SQLite)

On each search submission (Enter key or suggestion click):
- `POST /api/local/search-history` with `{ query, timestamp }`
- History capped at 50 entries (oldest deleted on overflow)
- Displayed in dropdown on input focus
- "مسح كل السجل" button in dropdown footer

---

## 12. Player Architecture

### 12.1 Overview

Two player modes coexist:

| Mode | Location | Trigger |
|------|----------|---------|
| **Full Player** | Episode detail page (`/podcasts/:id`) | When episode loads and user is subscribed |
| **Mini Player** | Fixed bottom bar (global, all pages) | When user navigates away from episode page while audio is playing |

### 12.2 Redux Player Slice

```typescript
interface PlayerState {
  currentEpisode: Podcast | null;
  isPlaying: boolean;
  progress: number;         // seconds elapsed
  duration: number;         // total seconds
  volume: number;           // 0–1
  playbackRate: number;     // 0.5, 0.75, 1, 1.25, 1.5, 2
  showMiniPlayer: boolean;  // true when navigated away from episode page
}
```

Actions: `setEpisode`, `play`, `pause`, `seek`, `setVolume`, `setPlaybackRate`, `dismissMiniPlayer`

### 12.3 Audio Element Management

A single hidden `<audio>` element lives at the app root (outside routing), controlled exclusively by the Redux player slice. Both the full player UI (on episode page) and the mini-player UI read from the same Redux state and dispatch to the same actions. The audio element's `src` is the tokenized sound URL.

### 12.4 Mini-Player Component

Fixed to `bottom: 0`, `z-index: 50`. Height: 72px (mobile) / 80px (desktop).
Hidden when user is on the episode detail page of the currently-playing episode (full player is shown instead).
Hidden when no episode is loaded.

**Mini-player contents:**
- Episode thumbnail (40px × 40px, `rounded-md`)
- Episode name (single line, marquee if overflowing)
- Progress bar (thin, full width, `bg-primary`)
- Play/Pause button (Phosphor `Play`/`Pause`)
- Close button (×) → clears `currentEpisode`
- Clicking the non-button area → navigates to `/podcasts/:id`

**Transition:** slides up from bottom (Framer Motion `y: 100%` → `y: 0`) when audio starts.

### 12.5 Continue Listening (SQLite)

On every `timeupdate` event (throttled to every 10 seconds):
```typescript
POST /api/local/listening-history
{ podcast_id, position_seconds, duration_seconds }
```

On episode page load, check SQLite for existing position:
```typescript
GET /api/local/listening-history?podcast_id={id}
```
If found and `position_seconds > 10`, show "كمّل من حيث وقفت (mm:ss)" button → seeks to position.

---

## 13. Rating & Complaint System

### 13.1 Star Rating Component

**Location:** Episode detail page, below the player area. Subscriber-only.

**Behavior:**
- 5 stars (Phosphor `Star` filled/outlined)
- Hover highlights stars progressively (Framer Motion scale micro-animation)
- On click: `POST /api/local/ratings { podcast_id, rating, timestamp }`
- Read own rating: `GET /api/local/ratings/:podcastId`
- Average rating display (if multiple ratings exist in SQLite): shown as "⭐ 4.2 (17 تقييم)"
- Coexists with the API like button (Phosphor `Heart`) — they are separate features

**Note:** Ratings are stored **locally in SQLite** — they are not synced to the Zoalcast API (no rating endpoint exists). They represent personal or portal-level ratings visible only within this installation.

### 13.2 Complaint / Report System

**Trigger:** "إبلاغ عن مشكلة" link on episode detail page.

**Modal fields (Yup validated):**
- Complaint type (select): محتوى مسيء · خطأ تقني · حقوق ملكية · أخرى
- Description (`required`, min 20 chars)
- Phone (optional, pre-filled from `msisdn` if available)

**On submit:** `POST /api/local/complaints { podcast_id, type, description, phone, timestamp }`

**Toast confirmation:** "تم إرسال بلاغك، شكراً لك"

---

## 14. Redux Toolkit Query — API Slice Reference

All Zoalcast API calls use RTK Query. Base URL and auth header are configured in `src/store/api.ts`.

```typescript
// src/store/api.ts
export const zoalcastApi = createApi({
  reducerPath: "zoalcastApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.zoalcast.com/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.user?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Podcast", "Category", "Likes"],
  endpoints: (builder) => ({ /* see below */ }),
});
```

### Endpoint Reference

| Hook | Method | Endpoint | Cache Tag |
|------|--------|----------|-----------|
| `useGetCategoriesQuery` | GET | `/portal/6/categories` | `Category` |
| `useSearchPodcastsQuery(args)` | GET | `/podcast/6/search?s={q}&page={p}` | `Podcast` |
| `useGetCategoryPodcastsQuery(args)` | GET | `/category/{id}/podcasts?page={p}` | `Podcast` |
| `useGetTopPodcastsQuery(args)` | GET | `/podcast/6/top?criteria={c}&category_id={id}` | `Podcast` |
| `useGetPodcastDetailQuery(id)` | GET | `/podcast/{id}` | `Podcast` |
| `useLikePodcastMutation` | POST | `/podcast/like` | invalidates `Podcast` |
| `useUnlikePodcastMutation` | POST | `/podcast/dislike` | invalidates `Podcast` |
| `useCheckLikeQuery(id)` | POST | `/podcast/like` | `Likes` |
| `useGetLikedPodcastsQuery(page)` | GET | `/podcast/user/likes?page={p}` | `Likes` |
| `useIncrementViewsMutation` | POST | `/podcast/6/increment_views` | — |
| `useCheckSubscriptionQuery(msisdn)` | GET | `/isounds/check_subscription/{msisdn}` | — |
| `useUnsubscribeMutation` | POST | `/isounds/unsubscribe` | — |
| `useLoginMutation` | POST | `/user/login` | — |

> **Note on `increment_views`:** The v1 bug using portal `3` is fixed in v2 — the endpoint now correctly uses `portalId: 6`. Verify with Zoalcast backend before shipping.

---

## 15. UI/UX Design System

### 15.1 Design Principles

1. **Depth over flatness:** Three distinct surface levels (`bg`, `surface`, `surface-raised`) create visual hierarchy without borders alone.
2. **Purple as a spotlight:** Primary purple only on interactive and featured elements — not as a background fill. Let dark space breathe.
3. **Type does the talking:** Large, confident Arabic/English headings are the primary visual element. No decorative stock imagery.
4. **Logo everywhere, subtly:** The outlined SVG watermark anchors every major section to the brand without competing with content.
5. **Motion with purpose:** Every animation serves a UX function (state change, navigation, feedback). No gratuitous looping animations.
6. **RTL-first:** Design in Arabic/RTL first. English/LTR is a mirror — verify every component flips correctly.

### 15.2 Loading States

Every data-fetching surface has a skeleton state:

| Component | Skeleton |
|-----------|----------|
| Episode card | Rounded rectangle (image area) + 2 lines (title + meta) |
| Category pill | Rounded rectangle |
| Home rail | 4 side-by-side card skeletons with shimmer animation |
| Episode detail | Full-page skeleton matching the actual layout |
| Search results | 8 list-row skeletons |

Shimmer animation: CSS `@keyframes shimmer` with `background: linear-gradient(90deg, surface → surface-raised → surface)`, `background-size: 200%`, `animation: shimmer 1.5s infinite`.

### 15.3 Episode Card

The fundamental unit of all discovery surfaces.

**Variants:**
- `vertical` (grid): portrait image on top, title/meta below
- `horizontal` (list): landscape thumbnail left, content right
- `featured` (hero): full-bleed image with gradient overlay, large title over image

**All variants share:**
- Category badge (top-left on image)
- Duration pill (bottom-right on image)
- Video indicator (camera icon) when `podcast.video !== null`
- Like count with heart icon
- View count with eye icon (Phosphor)
- Click → navigate to `/podcasts/:id`
- Hover: `scale(1.02)` + `box-shadow: 0 0 0 1px var(--color-primary)` (Framer Motion `whileHover`)
- `outlined-white.svg` as 3% opacity background on featured cards

### 15.4 Button System

| Variant | Style | Usage |
|---------|-------|-------|
| `primary` | `bg-primary text-white rounded-md` | Subscribe, Play, Submit |
| `secondary` | `bg-surface-raised text-text border-border` | Cancel, Back, Secondary actions |
| `ghost` | `text-primary hover:bg-primary/10` | Text links with hover state |
| `danger` | `bg-error/10 text-error border-error/30` | Cancel subscription confirm |
| `zain` | `bg-[var(--color-zain)] text-white` | Zain DSP CTA buttons only |

All buttons: `rounded-md`, `transition-all`, `disabled:opacity-40 disabled:cursor-not-allowed`.
Loading state: spinner (Phosphor `CircleNotch` with `animate-spin`) replaces button content.

### 15.5 Toast Notifications

Use a lightweight Shadcn/ui `Sonner` toast or equivalent:
- Position: top-center (RTL-safe)
- Variants: success (green), error (red), info (purple)
- Auto-dismiss: 3 seconds
- Stacked: up to 3 at once

---

## 16. Component Library Strategy

### 16.1 Shadcn/ui

Used for: Dialog (Modal), Drawer, Sheet, Tabs, Accordion, Select, Slider, Switch, Toast, Badge, Skeleton, Avatar, Popover, Tooltip, Form (with react-hook-form integration).

Install pattern: `bunx shadcn-ui@latest add dialog drawer ...`
All components copied into `src/components/ui/` — fully owned, customized with design tokens.

### 16.2 ReactBit

Used for: high-impact animated UI elements where standard Shadcn components are too plain.

Recommended ReactBit components for iSounds:

| ReactBit Component | Use in iSounds |
|-------------------|---------------|
| `SplitText` | Hero section headline character-by-character entrance |
| `BlurText` | Section headings on scroll-into-view |
| `AnimatedList` | Search results appearing with staggered entrance |
| `MagneticButton` | Subscribe CTA button (magnetic hover pull effect) |
| `SpotlightCard` | Featured episode card with cursor-tracking spotlight |
| `TextPressure` | Landing page display headline hover deformation |
| `GlassIcons` | Category tile icons |
| `CountUp` | View count and like count animation on episode page load |
| `RollingGallery` or `Carousel` | Auto-scrolling episode previews on landing page |
| `Noise` or `Aurora` | Hero section animated background texture |

### 16.3 Custom Components (not from any library)

| Component | Description |
|-----------|-------------|
| `EpisodeCard` | Core card in 3 variants (§15.3) |
| `MiniPlayer` | Fixed bottom audio bar (§12.4) |
| `FullPlayer` | Full episode audio controls |
| `SearchInput` | Autosuggest with SQLite history dropdown |
| `FilterPanel` | Search filters sidebar/bottom-sheet |
| `StarRating` | 5-star interactive rating (§13.1) |
| `CategoryTile` | Colored category card for nav/home |
| `LanguageToggle` | AR/EN pill switcher |
| `ThemeToggle` | Dark/light icon button |
| `SubscribeGate` | Blurred player overlay for guests |
| `WelcomeOverlay` | Full-screen first-login welcome (§9.2) |
| `LogoWatermark` | SVG positioned as background texture |

---

## 17. Animation & Motion System

All animation using **Framer Motion**. Principle: fast in, slightly slower out. Nothing over 400ms for interaction feedback; page transitions up to 500ms.

### 17.1 Page Transitions

Wrap all route outlet content in:
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### 17.2 Staggered List Entrance

For episode grids and rails:
```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
```

### 17.3 Card Hover

```tsx
<motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
```

### 17.4 Mini-Player Entrance

```tsx
<motion.div
  initial={{ y: 80, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 80, opacity: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

### 17.5 Like Button Feedback

On like: Phosphor `Heart` icon animates `scale: [1, 1.4, 1]` + color change to `color-accent`. Duration: 300ms spring.

### 17.6 Star Rating Hover

Each star: `whileHover={{ scale: 1.3 }}`, progressive fill left-to-right on hover.

### 17.7 Skeleton Shimmer

CSS-only (not Framer Motion) — preserves GPU for more important animations:
```css
@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}
```

---

## 18. Performance & Accessibility

### 18.1 Performance Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| Lighthouse PWA score | ≥ 90 |
| Lighthouse Accessibility | ≥ 90 |
| Bundle size (initial) | < 200KB gzipped |

### 18.2 Code Splitting

- React `lazy()` + `Suspense` for every page component
- Framer Motion: import only needed exports (`motion`, `AnimatePresence`)
- Phosphor icons: import individually (`import { Play } from "@phosphor-icons/react"`) — never import the full package

### 18.3 Image Optimization

- All episode cover images loaded with `loading="lazy"`
- Use `width` + `height` attributes to prevent CLS
- Encode as WebP where possible (Zoalcast serves JPEG/PNG — consider a Bun image proxy)
- Low-quality placeholder (LQIP) blur-up for above-fold episode images

### 18.4 Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Correct `lang` + `dir` on `<html>` | Set by i18n system on language change |
| WCAG AA color contrast | All text on surface colors verified at ≥ 4.5:1 |
| Keyboard navigation | All interactive elements reachable via Tab; focus ring visible |
| Screen reader | All images have `alt` text; icons have `aria-label`; player controls have `aria-label` |
| Reduced motion | Wrap all Framer Motion in `useReducedMotion()` hook; disable animations if user prefers |
| Focus management | Modal/drawer open → trap focus inside; close → return focus to trigger |

---

## 19. Dev Environment & Tooling

### 19.1 Project Structure

```
isounds-v2/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── og-default.jpg
├── src/
│   ├── assets/           # Static SVG logos, etc.
│   ├── components/
│   │   ├── ui/           # Shadcn/ui components (owned)
│   │   ├── layout/       # Header, Footer, MiniPlayer, Sidebar
│   │   └── shared/       # EpisodeCard, StarRating, etc.
│   ├── features/
│   │   ├── auth/         # Subscription check, login, cancel
│   │   ├── player/       # Player slice, hooks
│   │   ├── search/       # Search slice, hooks, history
│   │   └── ratings/      # Star rating, complaints
│   ├── i18n/
│   │   └── locales/ar|en/
│   ├── pages/            # One file per route
│   ├── store/
│   │   ├── api.ts        # RTK Query zoalcastApi
│   │   ├── localApi.ts   # RTK Query for /api/local/* (Bun SQLite)
│   │   └── store.ts      # Redux store setup
│   ├── styles/
│   │   └── tokens.css    # CSS custom properties
│   ├── types/            # Shared TypeScript interfaces
│   └── main.tsx
├── server/
│   ├── index.ts          # Bun HTTP server entry
│   ├── og.ts             # OG injection logic
│   ├── router.ts         # /api/local/* routes
│   └── migrations.ts     # SQLite table creation
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── bunfig.toml
└── package.json
```

### 19.2 Environment Variables

```env
VITE_API_BASE_URL=https://api.zoalcast.com/api
VITE_PORTAL_ID=6
VITE_ZAIN_DSP=https://dsplp.sd.zain.com/af-lp/?p=8991632598
SITE_URL=https://isounds.sd
PORT=8888
DB_PATH=/var/data/isounds.db
```

### 19.3 Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "serve": "bun run server/index.ts",
    "dev:full": "concurrently \"vite\" \"bun --watch server/index.ts\"",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### 19.4 Deploy Script

Replace v1's `deploy.sh` SCP-to-Apache pattern:
1. `bun run build` → outputs to `dist/`
2. SCP `dist/` + `server/` to `94.237.88.159:/var/www/isounds/`
3. Restart Bun server via `systemd` or PM2:
   ```bash
   pm2 restart isounds-server || pm2 start "bun run server/index.ts" --name isounds-server
   ```

---

## 20. SQLite Schema

All tables created on Bun server startup via `migrations.ts`.

```sql
-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  query       TEXT    NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Episode ratings (star 1–5)
CREATE TABLE IF NOT EXISTS ratings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id  INTEGER NOT NULL,
  rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  session_id  TEXT,                  -- anonymous session identifier
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(podcast_id, session_id)     -- one rating per episode per session
);

-- Complaints / reports
CREATE TABLE IF NOT EXISTS complaints (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id  INTEGER,               -- nullable: contact page complaints have no episode
  type        TEXT    NOT NULL,      -- 'offensive_content' | 'technical' | 'copyright' | 'other'
  description TEXT    NOT NULL,
  phone       TEXT,
  status      TEXT    NOT NULL DEFAULT 'new',   -- 'new' | 'reviewed' | 'resolved'
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Listening history (continue listening)
CREATE TABLE IF NOT EXISTS listening_history (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id        INTEGER NOT NULL UNIQUE,
  position_seconds  REAL    NOT NULL DEFAULT 0,
  duration_seconds  REAL    NOT NULL DEFAULT 0,
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
-- Keys: 'theme' ('dark'|'light'), 'lang' ('ar'|'en')

-- PWA event analytics
CREATE TABLE IF NOT EXISTS pwa_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event       TEXT    NOT NULL,   -- 'prompt_shown' | 'accepted' | 'dismissed' | 'install'
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
```

---

## 21. Implementation Phases

### Phase 0 — Foundation (Week 1–2)

- [ ] Bun project init: `bun create vite isounds-v2 --template react-ts`
- [ ] Tailwind + CSS tokens setup
- [ ] RTK Query store + Zoalcast API slice stubs
- [ ] i18next setup with AR/EN locale files (keys only)
- [ ] Bun server skeleton: static serve + `/api/local` router + SQLite migrations
- [ ] Font loading (Guesswhat, DM Sans, Almarai, IBM Plex Arabic)
- [ ] Logo SVG assets in `src/assets/`
- [ ] Theme system (dark/light CSS variables, toggle)
- [ ] RTL/LTR switching

### Phase 1 — Core Discovery (Week 3–5)

- [ ] Episode card component (all 3 variants)
- [ ] Home page: all three rails (Latest, Liked, Viewed) with RTK Query + skeletons
- [ ] Categories API + categories overview page
- [ ] Category page: grid + pagination
- [ ] Header + mobile bottom nav + sidebar drawer
- [ ] Framer Motion page transitions

### Phase 2 — Episode & Player (Week 6–7)

- [ ] Episode detail page
- [ ] Full audio player UI
- [ ] Video episode support
- [ ] Mini-player (global, fixed bottom)
- [ ] Like/Unlike (RTK Query mutation + optimistic update)
- [ ] View increment (corrected to portal 6)
- [ ] Continue listening (SQLite `listening_history`)
- [ ] Share modal (Facebook, X, Telegram, WhatsApp)

### Phase 3 — Auth & Subscription (Week 8)

- [ ] Subscription check on app mount (RTK Query)
- [ ] Auto-login flow
- [ ] Welcome overlay (first session)
- [ ] Guest gate (blurred player + subscribe CTA)
- [ ] Subscribe page (`/subscribe`)
- [ ] Login page (promoted, linked from nav)
- [ ] Cancel modal (two-step, clears all localStorage keys)

### Phase 4 — Advanced Search (Week 9)

- [ ] Search input with debounce + history dropdown
- [ ] SQLite search history (`/api/local/search-history`)
- [ ] Filter panel (category, duration, date, sort)
- [ ] URL-based filter state
- [ ] Results grid/list toggle
- [ ] Empty + loading states

### Phase 5 — Rating, Complaints, Library (Week 10)

- [ ] Star rating component + SQLite storage
- [ ] Complaint modal + SQLite storage
- [ ] Contact page form + SQLite storage
- [ ] Library page: Liked tab (wired to API)
- [ ] Library page: Continue Listening tab (SQLite)
- [ ] Library page: Search History tab (SQLite)

### Phase 6 — Landing, PWA, SEO (Week 11–12)

- [ ] Landing page (all sections, ReactBit animations)
- [ ] About, Help/FAQ, Terms, Privacy pages
- [ ] PWA: service worker (Workbox), install prompt, offline shell
- [ ] Bun SSR OG injection (all routes)
- [ ] Sitemap + robots.txt
- [ ] 404 page

### Phase 7 — Polish & Launch Prep (Week 13–14)

- [ ] Full RTL/LTR pass on all components
- [ ] Accessibility audit (keyboard, ARIA, contrast)
- [ ] Performance audit (Lighthouse, bundle analysis)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Mobile Safari)
- [ ] Responsive breakpoint QA
- [ ] All i18n keys filled (AR + EN)
- [ ] Deploy script + systemd service setup
- [ ] Smoke test all Zoalcast API endpoints with live data

---

## 22. Gaps from v1 — Resolution Map

All gaps identified in the v1 PRD (§14) are addressed in v2:

| v1 Gap | v2 Resolution |
|--------|--------------|
| `getLikedPodcasts` not in UI | Library page `/library` — Liked tab |
| `subscribe()` action unused | Replaced by Zain DSP link everywhere; action removed |
| Inconsistent DSP URLs (test sidebar) | Single `ZAIN_DSP` constant used everywhere |
| AuthModal disabled on Home | Welcome overlay + subscribe gate replaces it |
| `increment_views` portal `3` | Fixed to use `portalId: 6` |
| No service worker | Workbox-based service worker in Phase 6 |
| No install prompt | PWA install banner + `pwa_events` SQLite tracking |
| No analytics | SQLite captures search history, PWA events, ratings |
| No cookie/consent banner | PWA data is fully local; no third-party analytics = no consent banner needed |
| No header link to `/login` | Login prominently linked in header nav |
| `page=:page` non-standard URLs | Query-string pagination `?page=N` everywhere |
| `lang="en"` vs Arabic content | `lang` + `dir` set correctly by i18n system |
| Explore placeholder `msounds` | Fixed (brand consistency in i18n strings) |
| Limited empty/error states | All pages have designed empty + error states |
| MetaTags commented out | Bun SSR OG injection — no client-side meta needed |
| No About/Help/Terms/Privacy/Contact | All pages in Phase 6 |
| No Library / Favorites page | `/library` in Phase 5 |
| Playlists / Continue listening | Continue Listening in Phase 2 via SQLite; Playlists deferred to v2.1 |
| Functional footer | Footer in Phase 6 with all links |
| No 404 page | 404 in Phase 6 |
| No persistent player | Mini-player in Phase 2 |
| RTL/LTR not switchable | Full i18n RTL/LTR in Phase 0 |

---

*End of iSounds v2 PRD — Version 2.0 — 2026-05-27*
