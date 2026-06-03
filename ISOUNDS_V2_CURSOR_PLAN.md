# iSounds v2 — Cursor AI Development Plan

> **How to use this file:** Paste the contents of each `### PROMPT` block into Cursor AI Composer
> (Cmd+I or Ctrl+I) one phase at a time. Complete each phase fully and verify it works before
> moving to the next. Each prompt is self-contained and references previous work.

---

## Project Context (Read Before Every Session)

```
Project: iSounds v2 — Arabic/English podcast streaming portal for Sudan (Zain carrier VAS)
Backend API: https://api.zoalcast.com/api (read-only, Portal ID: 6, DO NOT modify)
Auth model: Carrier-based — msisdn from URL ?msisdn= → check_subscription → login → Bearer token
Stack: React 18 + TypeScript + Tailwind CSS + RTK Query + Framer Motion + Shadcn/ui + ReactBit
Server: Bun HTTP (serves static build + SSR OG injection + SQLite API via bun:sqlite)
Package manager: Bun (never npm or yarn)
Primary language: Arabic (RTL). Secondary: English (LTR). Toggle at runtime.
Design: Dark-first (near-black #08060F), modern violet-purple accent (#A855F7), editorial luxury
```

---

## Phase 0 — Project Scaffold & Configuration

### PROMPT 0-A: Initialize project

```
Create a new Vite + React + TypeScript project using Bun:

1. Run: bun create vite isounds-v2 --template react-ts
2. cd isounds-v2
3. Install all dependencies in one command:

bun add react-router-dom @reduxjs/toolkit react-redux framer-motion \
  i18next react-i18next i18next-browser-languagedetector \
  react-hook-form @hookform/resolvers yup \
  react-h5-audio-player video-react \
  @phosphor-icons/react \
  react-share \
  workbox-window workbox-webpack-plugin

bun add -d tailwindcss postcss autoprefixer \
  @types/react @types/react-dom \
  typescript eslint prettier \
  @tailwindcss/typography concurrently

4. Run: bunx tailwindcss init -p

5. Install Shadcn/ui:
bunx shadcn-ui@latest init
  - Choose: TypeScript, default style, neutral base color, yes CSS variables, src/components/ui path

6. Install these Shadcn components:
bunx shadcn-ui@latest add dialog drawer sheet tabs accordion select slider switch badge skeleton avatar popover tooltip

7. Create this exact folder structure (create empty index.ts files as placeholders):

src/
  assets/
    logos/          (place outlined-white.svg, outlined-black.svg, outlined-primary.svg here)
  components/
    ui/             (Shadcn components go here - already created by shadcn init)
    layout/
      Header.tsx
      Footer.tsx
      MiniPlayer.tsx
      Sidebar.tsx
      BottomNav.tsx
    shared/
      EpisodeCard.tsx
      CategoryTile.tsx
      EpisodeSkeleton.tsx
      SubscribeGate.tsx
      StarRating.tsx
      LogoWatermark.tsx
      LanguageToggle.tsx
      ThemeToggle.tsx
  features/
    auth/
      authSlice.ts
      SubscriptionChecker.tsx
      WelcomeOverlay.tsx
      CancelModal.tsx
    player/
      playerSlice.ts
      usePlayer.ts
      AudioEngine.tsx
    search/
      searchSlice.ts
      SearchInput.tsx
      FilterPanel.tsx
    ratings/
      ratingsApi.ts
      StarRatingForm.tsx
      ComplaintModal.tsx
  i18n/
    index.ts
    locales/
      ar/
        common.json
        episodes.json
        auth.json
        search.json
      en/
        common.json
        episodes.json
        auth.json
        search.json
  pages/
    LandingPage.tsx
    HomePage.tsx
    CategoryPage.tsx
    ExplorePage.tsx
    EpisodePage.tsx
    LibraryPage.tsx
    SubscribePage.tsx
    LoginPage.tsx
    AboutPage.tsx
    HelpPage.tsx
    TermsPage.tsx
    PrivacyPage.tsx
    ContactPage.tsx
    NotFoundPage.tsx
  store/
    index.ts
    api.ts          (RTK Query — Zoalcast API)
    localApi.ts     (RTK Query — /api/local/* Bun SQLite)
  styles/
    tokens.css
    globals.css
  types/
    index.ts
  utils/
    duration.ts
    date.ts
    session.ts
  main.tsx
  App.tsx

server/
  index.ts
  og.ts
  router.ts
  migrations.ts

public/
  manifest.json
  robots.txt
  icons/
    icon-192.png    (placeholder, replace with real icon)
    icon-512.png    (placeholder, replace with real icon)
```

---

### PROMPT 0-B: Design tokens and Tailwind configuration

```
Create the complete design token system for iSounds v2.

1. Create src/styles/tokens.css with ALL these CSS custom properties:

/* ─── DARK THEME (default) ─── */
:root, :root[data-theme="dark"] {
  --color-bg:             #08060F;
  --color-surface:        #100C1E;
  --color-surface-raised: #1A1530;
  --color-border:         #2A2347;
  --color-primary:        #A855F7;
  --color-primary-bright: #C084FC;
  --color-primary-deep:   #7E22CE;
  --color-primary-glow:   rgba(168, 85, 247, 0.20);
  --color-accent:         #EC4899;
  --color-text:           #F0EEFF;
  --color-text-muted:     #9B8FBE;
  --color-text-disabled:  #4A4268;
  --color-success:        #22C55E;
  --color-warning:        #F59E0B;
  --color-error:          #EF4444;
  --color-zain:           #E8001D;
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #7E22CE 0%, #A855F7 50%, #EC4899 100%);
  --gradient-surface: linear-gradient(180deg, #1A1530 0%, #100C1E 100%);
  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border);
  --shadow-glow: 0 0 24px var(--color-primary-glow);
  --shadow-player: 0 -4px 32px rgba(0,0,0,0.6);
}

/* ─── LIGHT THEME ─── */
:root[data-theme="light"] {
  --color-bg:             #FAF8FF;
  --color-surface:        #FFFFFF;
  --color-surface-raised: #F3F0FF;
  --color-border:         #E4DCFF;
  --color-primary:        #7C3AED;
  --color-primary-bright: #9333EA;
  --color-primary-deep:   #5B21B6;
  --color-primary-glow:   rgba(124, 58, 237, 0.15);
  --color-accent:         #DB2777;
  --color-text:           #0F0A1E;
  --color-text-muted:     #6B5F8A;
  --color-text-disabled:  #B8AACE;
  --color-success:        #16A34A;
  --color-warning:        #D97706;
  --color-error:          #DC2626;
  --color-zain:           #E8001D;
  --gradient-primary: linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #DB2777 100%);
  --gradient-surface: linear-gradient(180deg, #F3F0FF 0%, #FFFFFF 100%);
  --shadow-card: 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border);
  --shadow-glow: 0 0 24px var(--color-primary-glow);
  --shadow-player: 0 -4px 32px rgba(0,0,0,0.12);
}

2. Create src/styles/globals.css:

@import "./tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-border box-border; }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  /* RTL-specific resets */
  :root[dir="rtl"] { font-feature-settings: "kern" 1; }
}

/* Font loading */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Almarai:wght@400;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');

:root[lang="en"] { --font-display: 'Guesswhat', 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif; }
:root[lang="ar"] { --font-display: 'Almarai', sans-serif; --font-body: 'IBM Plex Sans Arabic', sans-serif; }

.font-display { font-family: var(--font-display); }
.font-body    { font-family: var(--font-body); }

/* Shimmer animation for skeletons */
@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}
.skeleton {
  background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-raised) 50%, var(--color-surface) 75%);
  background-size: 200% auto;
  animation: shimmer 1.8s linear infinite;
  border-radius: 8px;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-surface); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-primary); }

/* Hide scrollbar for horizontal rails */
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }

3. Create tailwind.config.ts:

import type { Config } from 'tailwindcss'

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:             'var(--color-bg)',
        surface:        'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        border:         'var(--color-border)',
        primary:        'var(--color-primary)',
        'primary-bright': 'var(--color-primary-bright)',
        'primary-deep': 'var(--color-primary-deep)',
        accent:         'var(--color-accent)',
        text:           'var(--color-text)',
        muted:          'var(--color-text-muted)',
        disabled:       'var(--color-text-disabled)',
        success:        'var(--color-success)',
        warning:        'var(--color-warning)',
        error:          'var(--color-error)',
        zain:           'var(--color-zain)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
      },
      fontSize: {
        'display-2xl': ['4.5rem',  { lineHeight: '1.05' }],
        'display-xl':  ['3.5rem',  { lineHeight: '1.1'  }],
        'display-lg':  ['2.5rem',  { lineHeight: '1.15' }],
        'display-md':  ['2rem',    { lineHeight: '1.2'  }],
        'heading-lg':  ['1.5rem',  { lineHeight: '1.3'  }],
        'heading-md':  ['1.25rem', { lineHeight: '1.3'  }],
        'body-lg':     ['1rem',    { lineHeight: '1.6'  }],
        'body-md':     ['0.875rem',{ lineHeight: '1.5'  }],
        'label':       ['0.75rem', { lineHeight: '1.4'  }],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        card:   'var(--shadow-card)',
        glow:   'var(--shadow-glow)',
        player: 'var(--shadow-player)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-surface': 'var(--gradient-surface)',
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
```

---

### PROMPT 0-C: TypeScript types

```
Create src/types/index.ts with the complete type system for iSounds v2.

Include these exact interfaces (based on real Zoalcast API responses):

// ── Zoalcast API types ──────────────────────────────────────────────────────

export interface Podcast {
  id: number;
  category_id: number;
  name: string;
  description: string;
  likes: number;
  views: number;
  image: string;
  video: string | null;   // null = audio episode; string = video URL
  liked: boolean;
  duration: string;       // "mm:ss.000"
  created_at: string;     // "DD/MM/YYYY"
}

export interface Category {
  id: number;
  name: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface CategoryPodcastsResponse extends PaginatedResponse<Podcast> {
  total_podcasts: number;
  total_muinutes: number;  // API typo — keep as-is
}

export interface CategoriesResponse {
  current_page: number;
  data: Category[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TopPodcastsResponse {
  data: Podcast[];
}

export type TopCriteria = 'latest' | 'liked' | 'viewed';

export interface PodcastDetailResponse {
  data: Podcast;
  success: boolean;
}

export interface User {
  token: string;
  phone?: string;
  [key: string]: unknown;
}

export interface LoginRequest  { phone: string; portal_id: 6; }
export interface LikeRequest   { podcast_id: number; }
export interface LikeResponse  { success: boolean; likes: number; }
export interface IncrementViewsRequest { podcast_id: string | number; }
export interface UnsubscribeRequest    { phone: string; }

// ── Redux State ─────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'idle' | 'checking' | 'subscribed' | 'guest' | 'error';

export interface AuthState {
  user: User | null;
  msisdn: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriberInfo: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export interface PlayerState {
  currentEpisode: Podcast | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playbackRate: PlaybackRate;
  showMiniPlayer: boolean;
}

export type Theme = 'dark' | 'light';
export type Language = 'ar' | 'en';

export interface UIState {
  theme: Theme;
  language: Language;
  cancelModalOpen: boolean;
}

export interface SearchFilters {
  categories: number[];
  sortBy: TopCriteria;
  durationMin: number | null;
  durationMax: number | null;
  dateFrom: string | null;
  dateTo: string | null;
}

// ── SQLite / Local API types ─────────────────────────────────────────────────

export interface SearchHistoryItem { id: number; query: string; created_at: number; }
export interface Rating { id: number; podcast_id: number; rating: 1|2|3|4|5; session_id: string | null; created_at: number; }
export interface RatingResult { userRating: number | null; average: number | null; count: number; }
export type ComplaintType = 'offensive_content' | 'technical' | 'copyright' | 'other';
export interface Complaint { id: number; podcast_id: number | null; type: ComplaintType; description: string; phone: string | null; status: 'new'|'reviewed'|'resolved'; created_at: number; }
export interface ListeningHistoryItem { id: number; podcast_id: number; position_seconds: number; duration_seconds: number; updated_at: number; }

// ── Component helpers ────────────────────────────────────────────────────────

export type EpisodeCardVariant = 'vertical' | 'horizontal' | 'featured';

// ── Utility functions ────────────────────────────────────────────────────────

/** "13:16.000" → 796 */
export function parseDuration(d: string): number {
  const [mmss] = d.split('.');
  const [mm, ss] = mmss.split(':').map(Number);
  return (mm || 0) * 60 + (ss || 0);
}

/** 796 → "13:16" */
export function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** "20/04/2026" → Date */
export function parseApiDate(d: string): Date {
  const [dd, mm, yyyy] = d.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

/** Returns a stable anonymous session ID (localStorage) */
export function getSessionId(): string {
  let id = localStorage.getItem('_sid');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('_sid', id); }
  return id;
}
```

---

### PROMPT 0-D: Environment variables and Vite config

```
1. Create .env file in project root:

VITE_API_BASE_URL=https://api.zoalcast.com/api
VITE_PORTAL_ID=6
VITE_ZAIN_DSP=https://dsplp.sd.zain.com/af-lp/?p=8991632598
VITE_SITE_URL=https://isounds.sd

2. Create .env.local (for development):

VITE_API_BASE_URL=https://api.zoalcast.com/api
VITE_PORTAL_ID=6
VITE_ZAIN_DSP=https://dsplp.sd.zain.com/af-lp/?p=8991632598
VITE_SITE_URL=http://localhost:5173

3. Create vite.config.ts:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api/local': 'http://localhost:8888',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react:  ['react', 'react-dom', 'react-router-dom'],
          redux:  ['@reduxjs/toolkit', 'react-redux'],
          motion: ['framer-motion'],
          icons:  ['@phosphor-icons/react'],
        },
      },
    },
  },
})

4. Update tsconfig.json paths:
Add "paths": { "@/*": ["./src/*"] } under compilerOptions.
```

---

## Phase 1 — Store, API, and i18n

### PROMPT 1-A: RTK Query — Zoalcast API slice

```
Create src/store/api.ts — the complete RTK Query API slice for Zoalcast.

The base URL is import.meta.env.VITE_API_BASE_URL (https://api.zoalcast.com/api).
Portal ID is always 6.
Bearer token comes from Redux auth state.

Import all relevant types from '@/types'.

Implement these endpoints exactly:

1. getCategories → GET /portal/6/categories → CategoriesResponse
2. searchPodcasts(args: { q: string; page: number }) → GET /podcast/6/search?s={q}&page={page} → PaginatedResponse<Podcast>
3. getCategoryPodcasts(args: { categoryId: number; page: number }) → GET /category/{id}/podcasts?page={page} → CategoryPodcastsResponse
4. getTopPodcasts(args: { criteria: TopCriteria; categoryId?: number }) → GET /podcast/6/top?criteria={c}&category_id={id} → TopPodcastsResponse
5. getPodcastDetail(id: number) → GET /podcast/{id} → PodcastDetailResponse
6. getLikedPodcasts(page: number) → GET /podcast/user/likes?page={page} → PaginatedResponse<Podcast>  [requiresAuth]
7. likePodcast(body: LikeRequest) → POST /podcast/like → LikeResponse  [mutation, requiresAuth]
8. unlikePodcast(body: LikeRequest) → POST /podcast/dislike → LikeResponse  [mutation, requiresAuth]
9. checkLike(body: LikeRequest) → POST /podcast/like → LikeResponse  [requiresAuth]
10. incrementViews(body: IncrementViewsRequest) → POST /podcast/6/increment_views [mutation] — NOTE: use portal 6 (not 3 as in old code)
11. checkSubscription(msisdn: string) → GET /isounds/check_subscription/{msisdn}
12. login(body: LoginRequest) → POST /user/login → User  [mutation]
13. unsubscribe(body: UnsubscribeRequest) → POST /isounds/unsubscribe  [mutation, requiresAuth]

Use tagTypes: ['Podcast', 'Category', 'Likes'] for cache invalidation.
likePodcast and unlikePodcast should invalidatesTags: ['Podcast', 'Likes'].

All authenticated endpoints: check Redux auth.user.token in prepareHeaders and set Authorization: Bearer {token}.
```

---

### PROMPT 1-B: RTK Query — Local SQLite API slice

```
Create src/store/localApi.ts — RTK Query slice for the Bun SQLite server at /api/local.

Implement these endpoints:

1. getSearchHistory() → GET /api/local/search-history → SearchHistoryItem[]
2. addSearchHistory(query: string) → POST /api/local/search-history → mutation
3. deleteSearchHistory(id: number) → DELETE /api/local/search-history/{id} → mutation
4. clearSearchHistory() → DELETE /api/local/search-history → mutation
5. getRating(podcastId: number) → GET /api/local/ratings/{podcastId} → RatingResult
6. submitRating(body: { podcast_id: number; rating: number }) → POST /api/local/ratings → mutation
7. submitComplaint(body: Omit<Complaint, 'id'|'status'|'created_at'>) → POST /api/local/complaints → mutation
8. getListeningHistory() → GET /api/local/listening-history → ListeningHistoryItem[]
9. getEpisodeProgress(podcastId: number) → GET /api/local/listening-history/{podcastId} → ListeningHistoryItem | null
10. saveProgress(body: { podcast_id: number; position_seconds: number; duration_seconds: number }) → POST /api/local/listening-history → mutation
11. getPreferences() → GET /api/local/preferences → Record<string, string>
12. savePreference(body: { key: string; value: string }) → POST /api/local/preferences → mutation
13. logPwaEvent(event: string) → POST /api/local/pwa-events → mutation

tagTypes: ['SearchHistory', 'Ratings', 'Progress', 'Preferences']
```

---

### PROMPT 1-C: Redux store and all slices

```
Create the Redux store with all slices.

1. Create src/features/auth/authSlice.ts:
State: { user: User|null, msisdn: string|null, subscriptionStatus: SubscriptionStatus, subscriberInfo: Record|null, loading: boolean, error: string|null }
Actions:
- setMsisdn(msisdn: string)
- setUser(user: User)
- setSubscriptionStatus(status: SubscriptionStatus)
- setSubscriberInfo(info: Record)
- logout() — clears user, msisdn, subscriberInfo from state AND localStorage keys: 'user', 'msisdn', 'subscriberInfo'

On slice init: rehydrate user and msisdn from localStorage.

2. Create src/features/player/playerSlice.ts:
State: { currentEpisode: Podcast|null, isPlaying: false, progress: 0, duration: 0, volume: 0.8, playbackRate: 1, showMiniPlayer: false }
Actions:
- setEpisode(episode: Podcast)
- play()
- pause()
- togglePlay()
- seek(seconds: number)
- setProgress(seconds: number)
- setDuration(seconds: number)
- setVolume(v: number)
- setPlaybackRate(rate: PlaybackRate)
- setShowMiniPlayer(show: boolean)
- clearPlayer() — resets all state

3. Create src/store/uiSlice.ts:
State: { theme: Theme, language: Language, cancelModalOpen: false }
Actions:
- setTheme(theme: Theme) — also sets document.documentElement.setAttribute('data-theme', theme) and saves to localStorage
- setLanguage(lang: Language) — also sets document.documentElement.lang, document.documentElement.dir ('rtl' if 'ar', 'ltr' if 'en'), and saves to localStorage
- openCancelModal()
- closeCancelModal()
On init: read theme and language from localStorage, apply to document.

4. Create src/store/index.ts:
Combine all slices and both API reducers into one store.
Export RootState, AppDispatch, useAppSelector, useAppDispatch typed hooks.
Add RTK Query middleware for both api slices.
```

---

### PROMPT 1-D: i18n setup with complete translation keys

```
Set up i18next with Arabic and English translations.

1. Create src/i18n/index.ts:
- Detect language from localStorage first, then browser
- Default to 'ar'
- Set document dir and lang on init

2. Create src/i18n/locales/ar/common.json with ALL these keys:
{
  "app_name": "آي ساوندز",
  "tagline": "استمع. اكتشف. استمتع.",
  "nav": {
    "home": "الرئيسية",
    "categories": "التصنيفات",
    "explore": "استكشاف",
    "library": "مكتبتي",
    "about": "عن آي ساوندز",
    "help": "مساعدة",
    "login": "تسجيل الدخول",
    "subscribe": "اشترك الآن",
    "cancel_subscription": "إلغاء الاشتراك"
  },
  "home": {
    "latest": "آخر المواضيع",
    "most_liked": "الأكثر إعجاباً",
    "most_viewed": "الأكثر مشاهدة",
    "continue_listening": "كمّل من حيث وقفت",
    "view_all": "عرض الكل",
    "all_categories": "جميع التصنيفات"
  },
  "episode": {
    "listen": "استمع الآن",
    "views": "مشاهدة",
    "likes": "إعجاب",
    "duration": "المدة",
    "published": "نُشر في",
    "share": "مشاركة",
    "report": "إبلاغ عن مشكلة",
    "related": "حلقات ذات صلة",
    "resume_from": "كمّل من {{time}}",
    "video_episode": "حلقة فيديو"
  },
  "player": {
    "play": "تشغيل",
    "pause": "إيقاف",
    "speed": "السرعة",
    "volume": "الصوت"
  },
  "subscribe_gate": {
    "title": "اشترك للاستماع",
    "description": "عزيزنا الزائر — الرجاء الاشتراك مع زين للاستماع لهذا المحتوى",
    "cta": "اشترك مع زين",
    "already": "أنا مشترك بالفعل"
  },
  "subscription": {
    "checking": "جاري التحقق من اشتراكك...",
    "active": "اشتراكك فعّال ✓",
    "welcome": "مرحباً بك في آي ساوندز",
    "cancel_title": "إلغاء الاشتراك",
    "cancel_confirm": "هل أنت متأكد من إلغاء اشتراكك؟",
    "cancel_cta": "نعم، ألغِ اشتراكي",
    "cancel_back": "لا، تراجع",
    "cancelled": "تم إلغاء اشتراكك بنجاح"
  },
  "search": {
    "placeholder": "ابحث عن حلقات...",
    "results_count": "{{count}} نتيجة لـ «{{query}}»",
    "no_results": "لا توجد نتائج — جرّب كلمة أخرى",
    "history": "عمليات البحث الأخيرة",
    "clear_history": "مسح كل السجل",
    "filters": "فلتر",
    "sort_by": "ترتيب حسب",
    "sort_latest": "الأحدث",
    "sort_liked": "الأكثر إعجاباً",
    "sort_viewed": "الأكثر مشاهدة",
    "category_filter": "التصنيف",
    "duration_filter": "المدة (دقيقة)",
    "date_filter": "التاريخ",
    "apply_filters": "تطبيق",
    "reset_filters": "إعادة ضبط",
    "grid_view": "عرض شبكي",
    "list_view": "عرض قائمة"
  },
  "rating": {
    "title": "قيّم هذه الحلقة",
    "your_rating": "تقييمك: {{rating}} من 5",
    "average": "متوسط التقييم: {{avg}} ({{count}} تقييم)",
    "submit": "حفظ التقييم"
  },
  "complaint": {
    "title": "إبلاغ عن مشكلة",
    "type_label": "نوع المشكلة",
    "type_offensive": "محتوى مسيء",
    "type_technical": "خطأ تقني",
    "type_copyright": "حقوق ملكية",
    "type_other": "أخرى",
    "description_label": "وصف المشكلة",
    "phone_label": "رقم الهاتف (اختياري)",
    "submit": "إرسال البلاغ",
    "success": "تم إرسال بلاغك، شكراً لك"
  },
  "library": {
    "title": "مكتبتي",
    "liked": "المفضلة",
    "history": "سجل الاستماع",
    "search_history": "سجل البحث",
    "empty_liked": "لا توجد حلقات في المفضلة بعد",
    "empty_history": "لم تستمع لأي حلقة بعد",
    "empty_search": "لا يوجد سجل بحث"
  },
  "errors": {
    "generic": "حدث خطأ، حاول مرة أخرى",
    "not_found": "الصفحة غير موجودة",
    "no_connection": "أنت غير متصل بالإنترنت",
    "try_again": "حاول مرة أخرى"
  },
  "common": {
    "loading": "جاري التحميل...",
    "show_more": "أقرأ أكثر",
    "show_less": "أقل",
    "minutes": "دقيقة",
    "episodes_count": "{{count}} حلقة",
    "theme_dark": "الوضع الليلي",
    "theme_light": "الوضع النهاري",
    "lang_ar": "العربية",
    "lang_en": "English"
  }
}

3. Create src/i18n/locales/en/common.json with the English equivalents of ALL the same keys.

4. Create src/i18n/locales/ar/episodes.json, auth.json, search.json (and EN equivalents) — extend as needed per page.
```

---

## Phase 2 — Bun Server

### PROMPT 2-A: Bun server — SQLite migrations

```
Create server/migrations.ts with this complete SQLite schema.

The function runMigrations(db: Database) should execute all CREATE TABLE IF NOT EXISTS statements:

CREATE TABLE IF NOT EXISTS search_history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  query      TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS ratings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id  INTEGER NOT NULL,
  rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  session_id  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(podcast_id, session_id)
);

CREATE TABLE IF NOT EXISTS complaints (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id  INTEGER,
  type        TEXT    NOT NULL,
  description TEXT    NOT NULL,
  phone       TEXT,
  status      TEXT    NOT NULL DEFAULT 'new',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS listening_history (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id        INTEGER NOT NULL UNIQUE,
  position_seconds  REAL    NOT NULL DEFAULT 0,
  duration_seconds  REAL    NOT NULL DEFAULT 0,
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS user_preferences (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS pwa_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event      TEXT    NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

Also run: CREATE INDEX IF NOT EXISTS idx_ratings_podcast ON ratings(podcast_id);
Also run: CREATE INDEX IF NOT EXISTS idx_history_updated ON listening_history(updated_at DESC);
```

---

### PROMPT 2-B: Bun server — API router

```
Create server/router.ts with all /api/local/* route handlers.
Import Database from 'bun:sqlite'.

Each handler receives (req: Request, db: Database) and returns Response.

Implement all routes:

GET  /api/local/search-history
  → SELECT id, query, created_at FROM search_history ORDER BY created_at DESC LIMIT 20

POST /api/local/search-history  { query: string }
  → INSERT OR IGNORE INTO search_history(query) VALUES(?)
  → Then delete oldest if count > 50

DELETE /api/local/search-history/:id
  → DELETE FROM search_history WHERE id = ?

DELETE /api/local/search-history  (no id = clear all)
  → DELETE FROM search_history

GET  /api/local/ratings/:podcastId
  → Get userRating for session_id + average + count
  → Return { userRating: number|null, average: number|null, count: number }

POST /api/local/ratings  { podcast_id, rating, session_id }
  → INSERT OR REPLACE INTO ratings(podcast_id, rating, session_id)

POST /api/local/complaints  { podcast_id?, type, description, phone? }
  → INSERT INTO complaints(podcast_id, type, description, phone)

GET  /api/local/listening-history
  → SELECT * FROM listening_history ORDER BY updated_at DESC LIMIT 20

GET  /api/local/listening-history/:podcastId
  → SELECT * FROM listening_history WHERE podcast_id = ?
  → 404 if not found

POST /api/local/listening-history  { podcast_id, position_seconds, duration_seconds }
  → INSERT OR REPLACE INTO listening_history(podcast_id, position_seconds, duration_seconds, updated_at) VALUES(?,?,?,unixepoch())

GET  /api/local/preferences
  → SELECT key, value FROM user_preferences → return as { key: value } object

POST /api/local/preferences  { key, value }
  → INSERT OR REPLACE INTO user_preferences(key, value, updated_at) VALUES(?,?,unixepoch())

POST /api/local/pwa-events  { event }
  → INSERT INTO pwa_events(event)

All responses: JSON with correct Content-Type header.
All errors: return { error: message } with appropriate status code.
Add CORS headers for development (allow localhost:5173).
```

---

### PROMPT 2-C: Bun server — SSR OG injection and main entry

```
Create server/og.ts:

The function handleOGInjection(url: URL) reads dist/index.html, fetches
OG data from Zoalcast API based on the route, and returns a Response with
all {{PLACEHOLDER}} values replaced.

Placeholders to replace in the HTML: {{LANG}} {{DIR}} {{META_TITLE}} {{META_DESCRIPTION}} {{OG_TYPE}} {{OG_IMAGE}} {{OG_URL}} {{OG_LOCALE}} {{CANONICAL_URL}}

Route rules:
- / and /home → title: "iSounds — بودكاست السودان", desc: "منصتك للصوت والفيديو بالتعاون مع زين السودان", image: /og-default.jpg, type: website
- /podcasts/:id → fetch https://api.zoalcast.com/api/podcast/{id}, use data.name as title, data.description (first 160 chars) as desc, data.image as image, type: music.song
- /categories/:id → fetch https://api.zoalcast.com/api/portal/6/categories, find category by id, use name in title
- All other routes → default title/desc

Cache Zoalcast responses for 5 minutes using a Map<string, {data, ts}>.

Default values when fetch fails: title "iSounds", desc "", image VITE_SITE_URL/og-default.jpg

---

Create server/index.ts — the main Bun HTTP server:

import { serve } from 'bun';
import { Database } from 'bun:sqlite';
import { runMigrations } from './migrations';
import { handleLocalApi } from './router';
import { handleOGInjection } from './og';

const db = new Database(process.env.DB_PATH ?? './isounds.db', { create: true });
runMigrations(db);

const DIST = './dist';

serve({
  port: Number(process.env.PORT ?? 8888),
  async fetch(req) {
    const url = new URL(req.url);
    const p = url.pathname;

    // CORS preflight
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });

    // Local SQLite API
    if (p.startsWith('/api/local')) return handleLocalApi(req, url, db);

    // Sitemap and robots
    if (p === '/sitemap.xml') return handleSitemap();
    if (p === '/robots.txt')  return handleRobots();

    // Static assets (JS, CSS, images, fonts, icons)
    if (p.includes('.')) {
      const file = Bun.file(`${DIST}${p}`);
      if (await file.exists()) return new Response(file);
      return new Response('Not found', { status: 404 });
    }

    // All HTML routes → SSR OG injection
    return handleOGInjection(url);
  },
});

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}

---

Also update package.json scripts:
"dev": "vite",
"dev:server": "bun --watch server/index.ts",
"dev:full": "concurrently \"bun run dev\" \"bun run dev:server\"",
"build": "tsc && vite build",
"serve": "bun run server/index.ts",
"preview": "bun run build && bun run serve"
```

---

## Phase 3 — Core Layout Components

### PROMPT 3-A: App.tsx — routing, providers, and subscription check

```
Create src/App.tsx with:

1. React Router routes for ALL pages:
/ → LandingPage
/home → HomePage
/categories → CategoriesPage (grid of all categories)
/categories/:categoryId → CategoryPage
/explore → ExplorePage
/podcasts/:id → EpisodePage
/library → LibraryPage (protected — redirect to /subscribe if not subscribed)
/subscribe → SubscribePage
/login → LoginPage
/about → AboutPage
/help → HelpPage
/terms → TermsPage
/privacy → PrivacyPage
/contact → ContactPage
* → NotFoundPage

All page components: React.lazy() with Suspense fallback (use EpisodeSkeleton or a full-page skeleton)

2. On app mount (useEffect once):
a. Read msisdn from URL ?msisdn= param → dispatch setMsisdn if found
b. Read saved theme and language from localStorage → dispatch setTheme, setLanguage (also apply to document)
c. Dispatch subscription check via checkSubscription RTK Query (skip if no msisdn)

3. Wrap everything in: ReduxProvider → Router → Suspense

4. Render globally (outside routes):
- <AudioEngine /> (the hidden audio element)
- <MiniPlayer /> (fixed bottom, only shown when showMiniPlayer is true)
- <CancelModal /> (shown when cancelModalOpen is true in Redux)
- <WelcomeOverlay /> (shown once per session when subscription check succeeds)
- Framer Motion AnimatePresence around route outlet with page transition:
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}

5. The SubscriptionChecker component reads msisdn from Redux, calls useCheckSubscriptionQuery,
   on success: dispatch setSubscriberInfo, dispatch setSubscriptionStatus('subscribed'), then call login mutation
   on failure: dispatch setSubscriptionStatus('guest')
   on loading: dispatch setSubscriptionStatus('checking')
```

---

### PROMPT 3-B: AudioEngine — single hidden audio element

```
Create src/features/player/AudioEngine.tsx.

This component renders a single <audio> element that persists for the app's lifetime.
It reads currentEpisode, isPlaying, volume, playbackRate, progress from Redux.
It dispatches setProgress, setDuration, setShowMiniPlayer back to Redux.

Logic:
- When currentEpisode changes: set audio.src to the tokenized URL:
  `${VITE_API_BASE_URL}/podcast/${episode.id}/sound?Authorization=${user.token}`
  Then play if isPlaying.
- When isPlaying changes: audio.play() or audio.pause()
- On timeupdate: dispatch setProgress(audio.currentTime) — throttled to every 1s
- On loadedmetadata: dispatch setDuration(audio.duration)
- On ended: dispatch pause(), dispatch setProgress(0)
- Volume: audio.volume = volume (react to Redux change)
- PlaybackRate: audio.playbackRate = playbackRate

Show mini-player (dispatch setShowMiniPlayer(true)) when:
  currentEpisode is set AND user navigates away from /podcasts/:id

Also throttle progress-save to SQLite: every 10 seconds during playback, call
saveProgress({ podcast_id, position_seconds: audio.currentTime, duration_seconds: audio.duration })

This component renders null (no visible output).
```

---

### PROMPT 3-C: Header component

```
Create src/components/layout/Header.tsx.

Desktop header (sticky, blur backdrop, border-bottom border-border):
- Left side (LTR) / Right side (RTL): iSounds logo (outlined-primary.svg, 36px height)
- Center: nav links — Home · Categories · Explore — each a NavLink with active:text-primary style
- Right cluster: SearchBar (collapsible), LanguageToggle, ThemeToggle, and either:
  - "اشترك" button (primary, small) if subscriptionStatus === 'guest'
  - User menu (shows "إلغاء الاشتراك" → dispatch openCancelModal) if subscribed
  - Spinner if checking

The search bar in header: clicking the search icon expands an inline input with Framer Motion
(width 0 → 240px). On Enter → navigate to /explore?q={query}.

Mobile header:
- Logo center
- Hamburger (PhosphorIcon List) → opens Sidebar drawer
- Search icon → navigates to /explore

Use Framer Motion for header hide-on-scroll (translateY -100% when scrolling down, 0 when up).
Hide-on-scroll only activates on episode pages — on all other pages the header is always visible.

Import useTranslation from react-i18next for all text strings.
```

---

### PROMPT 3-D: MiniPlayer component

```
Create src/components/layout/MiniPlayer.tsx.

Fixed bottom bar: bottom-0 left-0 right-0, z-50.
Height: 72px mobile / 80px desktop.
Background: surface-raised with shadow-player.
Show border-top: 1px solid border color.

Framer Motion:
- AnimatePresence wraps it
- Entry: initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} spring transition

Reads from Redux: currentEpisode, isPlaying, progress, duration.

Layout (RTL-aware using logical properties):
- Episode thumbnail (40x40, rounded-md, ms-4)
- Column: episode name (1 line, ellipsis) + progress time "2:34 / 13:16"
- Progress bar: absolute at top of player, full width, thin (3px), bg-primary for elapsed portion
- Play/Pause button (Phosphor Play/Pause, 32px)
- Close button (Phosphor X, 24px, me-4)

Clicking the episode name or thumbnail → navigate('/podcasts/:id')
Clicking play/pause → dispatch togglePlay()
Clicking X → dispatch clearPlayer() + dispatch setShowMiniPlayer(false)

Add bottom padding to page content equal to mini-player height when showMiniPlayer is true.
This padding should be applied via a CSS class toggled on the main content wrapper.
```

---

### PROMPT 3-E: EpisodeCard component

```
Create src/components/shared/EpisodeCard.tsx.

Props: { podcast: Podcast; variant?: EpisodeCardVariant; categoryName?: string; className?: string }

THREE variants:

1. VERTICAL (default) — used in grids:
- Aspect ratio 1:1 image on top (rounded-lg, object-cover, w-full)
- Category badge (absolute top-2 start-2, small pill, bg-surface/80 backdrop-blur text-muted)
- Duration pill (absolute bottom-2 end-2, small, bg-black/60 text-white)
- Video camera icon (Phosphor VideoCameraSlash→VideoCamera) if podcast.video
- Below image: episode name (2 lines max, font-semibold), meta row (views + likes)
- On hover: Framer Motion whileHover scale(1.02) + box shadow glow

2. HORIZONTAL — used in list view:
- 80x80 thumbnail (rounded-md, flex-shrink-0)
- Content: name (2 lines), description (1 line, text-muted), meta row (duration + views + likes)

3. FEATURED — used in hero rails:
- Full-width, aspect ratio 16:9
- Episode image as background (object-cover, absolute fill)
- Gradient overlay: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)
- Large title (display-md, text-white) over gradient
- Category badge + meta over gradient
- outlined-white.svg watermark at 4% opacity, absolute right-0 bottom-0, h-full, overflow hidden

ALL variants:
- Clicking anywhere → navigate('/podcasts/' + podcast.id)
- Like count with Phosphor Heart icon
- View count with Phosphor Eye icon
- Format likes/views with Intl.NumberFormat based on current language
- Format duration using parseDuration + formatDuration from types/index.ts
- Image loading="lazy" with fallback (show gradient placeholder if image fails)

Export as default.
```

---

### PROMPT 3-F: EpisodeSkeleton and LogoWatermark

```
1. Create src/components/shared/EpisodeSkeleton.tsx:
A loading placeholder matching the EpisodeCard vertical variant.
Uses .skeleton CSS class (shimmer animation).
Props: { variant?: 'vertical'|'horizontal'; count?: number }
Renders `count` (default 4) skeleton cards in a grid matching the variant.

2. Create src/components/shared/LogoWatermark.tsx:
Renders outlined-white.svg (import as ReactComponent or img src).
Props: { opacity?: number; className?: string }
Default: opacity 0.04, positioned absolute, pointer-events-none, z-0.
In light mode: use outlined-black.svg instead (read theme from Redux).
Usage: drop this inside any card or section with position:relative.
```

---

## Phase 4 — Pages

### PROMPT 4-A: Landing Page

```
Create src/pages/LandingPage.tsx — the marketing entry point at route /.

This is the most visually impressive page. Follow this exact structure:

SECTION 1 — HERO (full viewport height):
- Background: radial gradient mesh — 3 overlapping radial gradients in purple and pink tones
  on top of the --color-bg dark base. Use Framer Motion to slowly animate the gradient orbs
  (scale and position shift, 8s ease in/out loop).
- outlined-white.svg as background watermark: position absolute, right side, 70% height,
  opacity 0.04, overflow hidden.
- Content centered vertically:
  * "iSounds" in font-display (Guesswhat EN / Almarai AR), text-display-2xl, gradient text
    (background: var(--gradient-primary), -webkit-background-clip: text)
  * Tagline from i18n 'tagline' key — text-display-lg text-muted
  * Two CTA buttons: primary "اشترك مع زين" → ZAIN_DSP, ghost "تصفح المحتوى" → /home
  * Animate with Framer Motion staggered entrance (staggerChildren 0.15s)
- 3 floating episode cards (use real API data — fetch top latest): positioned
  right side (LTR) / left side (RTL), slightly overlapping, rotated ±3°, with Framer Motion
  float animation (y: [0, -12, 0], repeat infinite, duration 3s staggered)

SECTION 2 — FEATURES (6 cards grid, 3 cols desktop, 2 mobile):
Each card: Phosphor icon (48px, text-primary), bold title, short description.
Features: Browse · Stream · Discover · Search · Share · Install PWA
Animate each card on scroll-into-view using Framer Motion whileInView.

SECTION 3 — CONTENT PREVIEW:
Heading: "ألق نظرة على ما ينتظرك"
Fetch top latest episodes (useGetTopPodcastsQuery({ criteria: 'latest' })).
Render as horizontal auto-scrolling marquee of EpisodeCard variant="vertical".
Each card has a subscribe-gate overlay (blur 4px + "اشترك للاستماع" text) for non-subscribers.

SECTION 4 — CATEGORIES:
Grid of CategoryTile components (fetch from useGetCategoriesQuery).
Each tile: category name, Phosphor icon (assign one per category), solid colored background.

SECTION 5 — ABOUT / PARTNER:
Split 50/50: left text (from §2.6 about copy), right iSounds + Zain logos with + between them.

SECTION 6 — FOOTER (full footer component).

Entire page uses font-display for headings and font-body for body text.
All text uses useTranslation() — no hardcoded strings.
```

---

### PROMPT 4-B: Home/Discovery Page

```
Create src/pages/HomePage.tsx — the post-landing discovery experience at /home.

This page uses useGetTopPodcastsQuery for three separate fetches:
- { criteria: 'latest' }
- { criteria: 'liked' }
- { criteria: 'viewed' }

And useGetCategoriesQuery.

Page structure:

1. FEATURED HERO CARD — top most-viewed episode:
   EpisodeCard variant="featured", full width, 280px height, with play button overlay.
   Framer Motion entrance: fade + scale from 0.97 to 1.

2. EPISODE RAIL — "آخر المواضيع" (Latest):
   Section heading (text-display-md font-display) + "عرض الكل" link → /explore?sort=latest
   Horizontal scroll container (flex, gap-4, overflow-x-auto, scrollbar-hide, pb-2)
   EpisodeCard variant="vertical" for each episode.
   While loading: EpisodeSkeleton count=4.
   Animate children with staggerChildren 0.07s on mount.

3. EPISODE RAIL — "الأكثر إعجاباً" (Most Liked): same pattern

4. EPISODE RAIL — "الأكثر مشاهدة" (Most Viewed): same pattern

5. CONTINUE LISTENING RAIL (subscribers only):
   Fetch from useGetListeningHistoryQuery.
   Show only if data exists and subscriptionStatus === 'subscribed'.
   Each card: EpisodeCard with a thin progress bar at the bottom.

6. CATEGORIES GRID — small pill buttons for all categories.

All section headings: font-display, text-display-md, with a 2px gradient-primary underline.
Page background: subtle radial glow of primary color at top center (30% opacity, large blur).
```

---

### PROMPT 4-C: Episode Detail Page

```
Create src/pages/EpisodePage.tsx — at route /podcasts/:id.

On mount:
1. useGetPodcastDetailQuery(Number(id))
2. useIncrementViewsMutation → call immediately (fire and forget)
3. useGetEpisodeProgressQuery(Number(id)) → check SQLite for resume position
4. useGetTopPodcastsQuery({ criteria: 'latest', categoryId: podcast.category_id }) for related

PAGE LAYOUT:

HERO SECTION (full width, dark, 380px min-height):
- Background: episode.image as blurred background (filter: blur(60px) + scale(1.1) + opacity 0.3)
- Overlaid dark gradient (rgba(0,0,0,0.7) → var(--color-bg))
- Center: episode cover image (300x300 rounded-2xl shadow-glow, object-cover)
- Episode title below image: font-display, text-heading-lg, text-center, with Framer Motion
  marquee scroll if text overflows (translate X animation for very long titles)
- Meta row: category badge · duration · views · created_at
- Action row: Like button (Heart icon, accent color when liked) · Share button (Export icon)
  Like button: optimistic update — dispatch immediately, call API, revert on error

SUBSCRIBE GATE (if subscriptionStatus !== 'subscribed'):
- Below hero: blurred episode waveform illustration placeholder (CSS gradient)
- SubscribeGate component: dark card, lock icon (Phosphor LockSimple), subscribe CTA

FULL PLAYER (if subscribed):
- Below hero: custom audio player UI
- Progress bar: full width, clickable (seek), shows elapsed / total time
- Controls row: Speed selector (0.5x→2x dropdown) · Rewind 15s · Play/Pause (large) · Forward 15s · Volume slider
- Resume button: if SQLite has position > 10s, show "كمّل من {{time}}" button above play button

VIDEO player (if podcast.video !== null AND subscribed):
- Replace audio player with <video controls> element, full width, rounded-xl

DESCRIPTION:
- Text collapsible after 4 lines (show more / show less toggle)
- Framer Motion height animation on expand/collapse

STAR RATING:
- Only for subscribers
- 5 Phosphor Star icons, interactive
- Show average rating below if count > 0

REPORT LINK:
- Small text link "إبلاغ عن مشكلة" → opens ComplaintModal

RELATED EPISODES:
- Heading "حلقات ذات صلة"
- Horizontal scroll rail of EpisodeCard variant="vertical"

Share Modal: Dialog with 4 social share buttons (react-share):
  - FacebookShareButton, TwitterShareButton, TelegramShareButton, WhatsappShareButton
  Each with its Phosphor icon equivalent.
  Share URL: window.location.href
  Share title: podcast.name
```

---

### PROMPT 4-D: Category and Explore pages

```
1. Create src/pages/CategoryPage.tsx at /categories/:categoryId:

Read categoryId from URL param.
Fetch: useGetCategoryPodcastsQuery({ categoryId: Number(categoryId), page: currentPage })
Read currentPage from URL ?page=N (default 1).

Header area:
- Category name (large, font-display)
- Stats: total_podcasts episodes · total_muinutes minutes total (format nicely)
- outlined-white.svg watermark
- Category color tint as a subtle radial glow behind heading

Content:
- Grid: 2 cols mobile, 3 tablet, 4 desktop
- EpisodeCard variant="vertical" for each episode
- EpisodeSkeleton while loading
- Pagination: "السابق" / "التالي" buttons + page number display, update URL ?page=N

2. Create src/pages/ExplorePage.tsx at /explore:

Read all filter state from URL search params:
  q, page, category (comma-separated ids), sort (latest|liked|viewed), duration_min, duration_max, date_from, date_to

Search logic:
- If q is present: useSearchPodcastsQuery({ q, page }) → then client-side filter/sort by other params
- If q is empty: useGetTopPodcastsQuery({ criteria: sort || 'latest', categoryId: first selected category })

Components on this page:
- SearchInput component (autofocus, shows SQLite history dropdown on focus)
- FilterPanel component (sidebar desktop / bottom sheet mobile)
- View toggle: grid / list (Phosphor SquaresFour / ListBullets icons)
- Results count display
- Episode grid/list with EpisodeCard in appropriate variant
- Empty state with Phosphor MagnifyingGlass icon
- Pagination

FilterPanel props: current filters + onFilterChange callback → updates URL params
All filter changes: use React Router useSearchParams hook to update URL without navigation.
```

---

### PROMPT 4-E: Library, Subscribe, Login pages

```
1. Create src/pages/LibraryPage.tsx at /library:

Protect: if subscriptionStatus === 'guest', redirect to /subscribe.

Three tabs (Shadcn Tabs component):
Tab 1: "المفضلة" → useGetLikedPodcastsQuery(currentPage) → grid of EpisodeCard
Tab 2: "سجل الاستماع" → useGetListeningHistoryQuery() → list of EpisodeCard horizontal with progress bar
Tab 3: "سجل البحث" → useGetSearchHistoryQuery() → list of search terms with delete buttons + "مسح الكل"

Empty states for each tab with illustration placeholder and descriptive message.

2. Create src/pages/SubscribePage.tsx at /subscribe:

Full-page layout:
- Logo + "آي ساوندز" heading
- "استمع لكل المحتوى بالاشتراك مع زين السودان"
- List of 6 service features with Phosphor CheckCircle icon
- Two buttons:
  * "اشترك مع زين الآن" → opens VITE_ZAIN_DSP in new tab, primary, large, with Zain logo inside
  * "أنا مشترك بالفعل" → re-trigger subscription check via checkSubscription mutation
- If subscriptionStatus === 'checking': show spinner over the "أنا مشترك" button
- If subscriptionStatus === 'subscribed': show success state + redirect to /home after 2s

3. Create src/pages/LoginPage.tsx at /login:

Center card (max-w-sm):
- iSounds logo
- "تسجيل الدخول" heading
- Phone input (Yup validation: required, Sudanese format /^(0|\+249)[0-9]{9}$/)
- Submit button (loading state while mutation is pending)
- useLoginMutation: on success dispatch setUser, navigate(-1)
- Error message display
- Link: "ليس لديك اشتراك؟" → /subscribe
```

---

### PROMPT 4-F: Static pages and 404

```
1. Create src/pages/AboutPage.tsx:
- Hero: iSounds + Zain logos + heading "من نحن"
- Two-column text (Arabic + English) using the about copy from the PRD §2.6
- Mission section
- Services list (match the services table from PRD §2.5)

2. Create src/pages/HelpPage.tsx:
Shadcn Accordion with these FAQ items (bilingual):
- كيف أشترك في iSounds؟
- كيف أستمع للمحتوى؟
- كيف أُلغي اشتراكي؟
- لماذا لا يعمل المشغل؟
- هل يعمل التطبيق بدون إنترنت؟
- كيف أثبّت التطبيق على هاتفي؟
- ما هي فئات المحتوى المتاحة؟

3. Create src/pages/ContactPage.tsx:
Form with react-hook-form + Yup:
Fields: name (required), phone (required, Sudanese format), subject (select), message (required, min 20)
On submit: useSubmitComplaintMutation → show success toast (Shadcn Sonner)
Use Phosphor icons for input icons.

4. Create src/pages/TermsPage.tsx and PrivacyPage.tsx:
Simple prose layouts with placeholder headings and "يتم إضافة المحتوى قريباً" placeholder text.
Use @tailwindcss/typography prose class.

5. Create src/pages/NotFoundPage.tsx:
- Large "404" in gradient text
- "الصفحة غير موجودة" heading
- Short message
- "العودة للرئيسية" button → navigate('/')
- Phosphor Ghost icon (large, text-muted)
- Framer Motion entrance animation
```

---

## Phase 5 — Auth Components and Modals

### PROMPT 5-A: Subscription components

```
1. Create src/features/auth/WelcomeOverlay.tsx:
Full-screen overlay, shown once per session when subscriptionStatus changes to 'subscribed'.
Track with sessionStorage key 'welcome_shown'.

Content:
- Dark semi-transparent overlay (bg-black/80)
- Center card: outlined-primary.svg logo (80px) + "مرحباً بك في آي ساوندز" + "اشتراكك مع زين فعّال ✓" (success color)
- Framer Motion: scale 0.8 → 1 + opacity 0 → 1 on enter, reverse on exit
- Auto-dismiss after 2.5 seconds (setTimeout → dispatch setWelcomeShown / animate out)
- Click anywhere to dismiss early

2. Create src/features/auth/CancelModal.tsx:
Shadcn Dialog, controlled by Redux cancelModalOpen state.

Two-step flow:
Step 1: "هل أنت متأكد من إلغاء اشتراكك؟" + two buttons: "نعم، تابع" (danger) + "لا، تراجع" (secondary)
Step 2 (after "نعم"): "هل أنت متأكد تماماً؟" + "نعم، ألغِ اشتراكي" (danger, full width) + cancel
On final confirm: call useUnsubscribeMutation({ phone: msisdn }), on success: dispatch logout(), dispatch closeCancelModal(), navigate('/subscribe')
Loading state on mutation pending.

3. Create src/components/shared/SubscribeGate.tsx:
A blurred overlay component shown instead of the player when user is a guest.
Props: { className?: string }
Renders: backdrop-blur-sm dark overlay + LockSimple icon + subscribe message + CTA button
The CTA opens VITE_ZAIN_DSP in new tab.
```

---

### PROMPT 5-B: Search components

```
1. Create src/features/search/SearchInput.tsx:
Props: { onSearch?: (q: string) => void; autoFocus?: boolean; placeholder?: string }

Features:
- Controlled input with local state
- Debounced (300ms) onChange for real-time suggestions
- On focus: show history dropdown from useGetSearchHistoryQuery()
- History dropdown: list of recent queries, each clickable (fills input), each has × delete button
- "مسح الكل" button at dropdown bottom
- On Enter or search icon click: call onSearch(query) AND save to SQLite via useAddSearchHistoryMutation
- Clear button (X) when query is not empty
- Phosphor MagnifyingGlass icon as prefix
- Framer Motion: dropdown slides down from top, staggered list items

2. Create src/features/search/FilterPanel.tsx:
Props: { filters: SearchFilters; onChange: (f: SearchFilters) => void; categories: Category[] }

Renders differently by screen size:
- Desktop (md+): sidebar panel, always visible
- Mobile: bottom sheet (Shadcn Sheet), triggered by filter button

Panel contents:
- Sort by: segmented control (3 options: latest/liked/viewed)
- Category: multi-select chips (all from categories API, toggle on/off)
- Duration range: two number inputs (min/max in minutes)
- Date range: two date inputs (from/to)
- "تطبيق الفلاتر" primary button
- "إعادة ضبط" ghost button

All values controlled by filters prop, changes dispatched via onChange.
```

---

## Phase 6 — Rating, PWA, and Final Polish

### PROMPT 6-A: Rating and complaint components

```
1. Create src/features/ratings/StarRatingForm.tsx:
Props: { podcastId: number }
Subscriber-only (hide if subscriptionStatus !== 'subscribed').

5 Phosphor Star icons (Star for filled, StarHalf for half — but keep it to full stars only).
Hover state: progressively highlight stars left-to-right.
Current rating: read from useGetRatingQuery(podcastId).
On click: call useSubmitRatingMutation({ podcast_id, rating, session_id: getSessionId() })
Show average below: "متوسط التقييم: 4.2 (17 تقييم)"
Framer Motion: whileHover scale(1.3) on each star, clicking star pulses (scale 1 → 1.5 → 1)

2. Create src/features/ratings/ComplaintModal.tsx:
Shadcn Dialog, opened by "إبلاغ عن مشكلة" link.
Props: { podcastId: number; isOpen: boolean; onClose: () => void }

Form (react-hook-form + Yup):
- type: select (4 options from i18n keys)
- description: textarea (min 20 chars, max 500), with character counter
- phone: optional input (pre-fill from Redux msisdn if available)
On submit: useSubmitComplaintMutation → Shadcn toast success → close modal.
```

---

### PROMPT 6-B: PWA manifest, service worker, and install prompt

```
1. Update public/manifest.json:
{
  "name": "iSounds digital portal",
  "short_name": "iSounds",
  "description": "منصة البودكاست السودانية بالتعاون مع زين",
  "start_url": "/home",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#08060F",
  "theme_color": "#A855F7",
  "lang": "ar",
  "dir": "rtl",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}

2. Create public/sw.js — service worker using Workbox patterns (inline, no build step):

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { precacheAndRoute, createHandlerBoundToURL } = workbox.precaching;
const { registerRoute, NavigationRoute } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

// Cache app shell assets (set precache manifest from vite build)
precacheAndRoute(self.__WB_MANIFEST ?? []);

// Navigation: serve index.html for all routes
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api/] }));

// Cache Zoalcast API responses (categories, top) — stale while revalidate
registerRoute(
  ({ url }) => url.hostname === 'api.zoalcast.com' && !url.pathname.includes('/sound'),
  new StaleWhileRevalidate({ cacheName: 'zoalcast-api', plugins: [new ExpirationPlugin({ maxAgeSeconds: 300 })] })
);

// Cache episode images — cache first
registerRoute(
  ({ url }) => url.hostname === 'api.zoalcast.com' && url.pathname.includes('/images'),
  new CacheFirst({ cacheName: 'episode-images', plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 * 7 })] })
);

// Audio streams — network only (require auth token)
registerRoute(
  ({ url }) => url.pathname.includes('/sound'),
  new NetworkOnly()
);

3. Create src/utils/pwa.ts with:
- registerServiceWorker() — registers /sw.js, handles updates
- usePWAInstall() hook — listens for beforeinstallprompt, returns { canInstall, install }
  Logs pwa_events to SQLite via POST /api/local/pwa-events

4. Create src/components/shared/InstallBanner.tsx:
- Uses usePWAInstall() hook
- Shows a dismissible banner at page bottom (above mini-player) after 30s on site
- "ثبّت التطبيق على هاتفك" + install button
- Stores dismissal in localStorage, don't show again for 7 days
```

---

### PROMPT 6-C: LanguageToggle, ThemeToggle, and global polish

```
1. Create src/components/shared/LanguageToggle.tsx:
A pill toggle showing "AR | EN".
On click: dispatch setLanguage() from uiSlice.
Framer Motion: sliding indicator behind the active option (layoutId="lang-indicator").
Also call usePreferenceMutation to save to SQLite.

2. Create src/components/shared/ThemeToggle.tsx:
Icon button: Phosphor Sun (light mode) / Moon (dark mode).
On click: dispatch setTheme() from uiSlice.
Framer Motion: rotate 360° on toggle (whileTap).
Also call usePreferenceMutation.

3. Create src/components/layout/Footer.tsx:
6-column grid (2 on mobile):
- Logo + tagline + "Powered by Zain Sudan"
- Navigate: Home · Categories · Explore
- Account: Subscribe · Login · Library
- Info: About · Help · Terms · Privacy · Contact
- Language toggle + Theme toggle
- Copyright line: "© 2026 iSounds · زين السودان"
Use font-body, text-muted for link text.

4. Create src/components/layout/BottomNav.tsx (mobile only, md:hidden):
Fixed bottom, above mini-player (z-40).
5 tab icons (Phosphor): House · MagnifyingGlass · GridFour · BookBookmark · List (More)
Active tab: text-primary with small dot indicator below icon.
Framer Motion: whileTap scale(0.9).
"More" tab: opens Sidebar drawer.

5. Add global toast setup:
In App.tsx, add <Toaster /> from Shadcn Sonner at root level.
Toast theme: match current theme (dark/light) by passing theme prop.

6. RTL correctness audit — verify ALL components use:
- ms- / me- instead of ml- / mr- for horizontal spacing
- ps- / pe- instead of pl- / pr- for padding
- start- / end- instead of left- / right- for absolute positioning
- text-start / text-end instead of text-left / text-right
- Flex direction is unaffected by RTL in Tailwind — use logical props only for margins/paddings
```

---

### PROMPT 6-D: public/robots.txt and sitemap

```
1. Create public/robots.txt:

User-agent: *
Allow: /
Disallow: /library
Disallow: /api/
Sitemap: https://isounds.sd/sitemap.xml

2. In server/og.ts, add handleSitemap() function:
Fetches from Zoalcast API:
  - GET /portal/6/categories → all category URLs
  - GET /podcast/6/top?criteria=latest → top episode URLs
Build XML string:

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://isounds.sd/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://isounds.sd/home</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://isounds.sd/explore</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  [... categories ...]
  [... episodes ...]
  <url><loc>https://isounds.sd/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  ...
</urlset>

Cache the sitemap response for 6 hours.
Return with Content-Type: application/xml.

3. In public/index.html, add to <head>:
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#08060F" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
Replace all static OG meta tags with the {{PLACEHOLDER}} format for Bun SSR injection.
```

---

## Phase 7 — Final Verification Checklist

### PROMPT 7-A: RTL/LTR full audit

```
Audit every component in the project for RTL/LTR correctness.

Rules to enforce:
1. Replace ml-* with ms-*, mr-* with me-*, pl-* with ps-*, pr-* with pe-*
2. Replace left-* / right-* with start-* / end-* in absolute/fixed positioning
3. Replace text-left / text-right with text-start / text-end
4. Ensure all Framer Motion x-axis animations account for RTL (e.g. x: -20 on LTR should be x: 20 on RTL)
5. Ensure the logo watermark (outlined-white.svg) flips appropriately
6. Ensure the MiniPlayer layout flows correctly in both directions
7. Ensure the FilterPanel appears on the correct side in both directions
8. Ensure search input icon positions are correct in both directions
9. Verify all Shadcn components (Dialog, Sheet, Drawer) handle RTL correctly — add dir={dir} props where needed
10. Test player controls layout in both directions

After the audit, run the app in both AR (RTL) and EN (LTR) mode and fix any layout issues.
```

---

### PROMPT 7-B: Performance, accessibility, and error states

```
Performance optimizations:
1. Add React.memo() to EpisodeCard, CategoryTile, EpisodeSkeleton to prevent unnecessary re-renders
2. Verify all images have loading="lazy" and explicit width/height
3. Check bundle with: bun run build && bunx vite-bundle-visualizer
   Target: react+router+redux < 100KB, framer-motion < 50KB, phosphor < 20KB (tree-shaken)
4. Add error boundaries: create src/components/shared/ErrorBoundary.tsx wrapping each page

Accessibility:
1. All <img> elements have descriptive alt text (use podcast.name)
2. All icon-only buttons have aria-label (use i18n keys)
3. Audio player controls have aria-label, role="slider" on progress bar with aria-valuenow/min/max
4. Modal/Dialog components trap focus correctly (Shadcn handles this, verify)
5. Add skip-to-content link at page top for keyboard users
6. Verify color contrast: primary (#A855F7) on bg (#08060F) — run through WCAG checker

Error states — add to every page:
1. API error: show error card with retry button (call refetch())
2. No internet: show offline state (check navigator.onLine)
3. Empty data: show illustrated empty state with Phosphor icon

Add useReducedMotion() check:
import { useReducedMotion } from 'framer-motion';
If prefersReducedMotion is true, set all animation duration to 0 and disable transform animations.
```

---

### PROMPT 7-C: End-to-end smoke test checklist

```
Verify these flows work end-to-end in the running app (bun run dev:full):

GUEST FLOW:
□ Landing page loads, hero animation plays, content preview shows real episodes
□ Clicking "تصفح المحتوى" → navigates to /home
□ Home page shows 3 rails with real data from Zoalcast API
□ Category page loads episodes with pagination
□ Episode detail page shows subscribe gate (not player) for guest
□ Search page: type a query, results appear, history saves to SQLite
□ Filters work: select category, results update in URL and display

SUBSCRIPTION FLOW:
□ Adding ?msisdn=123456789 to URL triggers subscription check
□ If subscribed: welcome overlay appears, mini-player becomes available
□ Episode page shows player for subscribed user
□ Audio plays and progress saves to SQLite every 10s
□ Mini-player appears when navigating away from episode page
□ Mini-player progress bar updates in real-time
□ Clicking mini-player navigates back to episode page

LANGUAGE/THEME:
□ AR → EN toggle changes all text, direction flips to LTR, fonts change
□ EN → AR toggle reverses
□ Dark → Light toggle changes all colors via CSS variables
□ Preferences save to SQLite and persist on page reload

SQLITE:
□ POST /api/local/search-history saves and GET returns results
□ POST /api/local/ratings saves and GET returns with average
□ POST /api/local/listening-history saves and resumes correctly
□ POST /api/local/complaints saves successfully

SEO:
□ curl http://localhost:8888/podcasts/707 | grep og:title → shows episode name
□ curl http://localhost:8888/ | grep og:description → shows iSounds tagline
□ curl http://localhost:8888/sitemap.xml → returns valid XML with URLs

PWA:
□ manifest.json loads correctly (DevTools → Application → Manifest)
□ Service worker registers (DevTools → Application → Service Workers)
□ Offline: disable network in DevTools → offline shell appears
```

---

## Key Constants Reference

```typescript
// Use these in code — never hardcode values

const API_BASE   = import.meta.env.VITE_API_BASE_URL;  // https://api.zoalcast.com/api
const PORTAL_ID  = Number(import.meta.env.VITE_PORTAL_ID);  // 6
const ZAIN_DSP   = import.meta.env.VITE_ZAIN_DSP;  // https://dsplp.sd.zain.com/af-lp/?p=8991632598
const SITE_URL   = import.meta.env.VITE_SITE_URL;

// Audio URL pattern (tokenized)
const audioUrl = (podcastId: number, token: string) =>
  `${API_BASE}/podcast/${podcastId}/sound?Authorization=${token}`;

// Category color map (for tiles and page backgrounds)
export const CATEGORY_COLORS: Record<number, { bg: string; text: string }> = {
  16: { bg: '#01954B', text: '#fff' },  // رياضة
  17: { bg: '#D21F87', text: '#fff' },  // فن
  18: { bg: '#004D7C', text: '#fff' },  // سياسة و اقتصاد
  19: { bg: '#57BEDA', text: '#000' },  // قضايا المرأة
  22: { bg: '#565658', text: '#fff' },  // مراجعات ثقافية
};
```

---

## Notes for Cursor

- **Never use npm or yarn** — always `bun add` or `bunx`
- **Never hardcode Arabic strings** — always use `useTranslation()` hook with i18n keys
- **Never use `ml-`, `mr-`, `pl-`, `pr-`** — use logical properties `ms-`, `me-`, `ps-`, `pe-`
- **All Zoalcast API calls go through RTK Query** — no direct fetch() calls in components
- **SQLite calls go through localApi RTK Query** — no direct fetch to /api/local in components
- **Import Phosphor icons individually**: `import { Play } from '@phosphor-icons/react'` — never import the full package
- **Portal ID is always 6** — the old code used 3 in one endpoint (increment_views); use 6 everywhere
- **The `total_muinutes` field from the API is intentionally misspelled** — keep the typo in types to match the API
- **Audio streams require the token in the URL query param**, not the Authorization header — see audioUrl constant above
- **All forms use react-hook-form + Yup** — no uncontrolled inputs
- **Framer Motion: always check `useReducedMotion()`** before applying transforms/animations

---

*End of Cursor Development Plan — iSounds v2*
