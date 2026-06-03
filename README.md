# iSounds v2

Sudan podcast streaming portal built per `ISOUNDS_V2_PRD.md`.

## Prerequisites

- [Bun](https://bun.sh) 1.x

## Setup

```bash
cp .env.example .env
bun install
```

### Brand assets

Place files as follows:

| Asset | Path |
|-------|------|
| Logo SVGs | `public/logos/` (already copied from `assets/`) |
| Guesswhat font | `public/fonts/guesswhat/Guesswhat.woff2` (or `.woff` / `.ttf`) |

If Guesswhat is missing, English display headings fall back to **Syne** (Google Fonts).

## Development

**Terminal 1 — Vite (React):**

```bash
bun run dev
```

**Terminal 2 — Bun API + SQLite (optional for local features):**

```bash
bun --watch server/index.ts
```

Or both:

```bash
bun run dev:full
```

Open http://localhost:5173 (landing route at `/`).

By default, the app uses `VITE_API_BASE_URL` (set to Zoalcast in `.env.example`).
For local development, the Vite proxy `/api/zoalcast` is available; set:

```env
VITE_API_BASE_URL=/api/zoalcast
```

to route requests through Vite and avoid CORS issues.

## Production build

```bash
bun run build
bun run serve
```

Serves `dist/` on port `8888` (configurable via `PORT`).

## Current scope

- Home discovery rails (latest, liked, viewed, featured)
- Categories list and paginated category episodes
- RTL Arabic / LTR English, dark/light theme
- Layout: header, footer, mobile nav, drawer
- Bun server + SQLite schema (local API stubs)
- Discovery + categories + explore + episode detail + library
- Subscription/login/cancel flow integration
- Landing + About + Help + Terms + Privacy + Contact pages
- PWA manifest + service worker + install prompt
- Bun SSR metadata injection (OG/Twitter/canonical), sitemap and robots

## Health and crawler endpoints

- `GET /healthz` (liveness)
- `GET /readyz` (readiness: DB check)
- `GET /robots.txt`
- `GET /sitemap.xml`

## Deployment

Use [`DEPLOYMENT.md`](DEPLOYMENT.md) for production setup and systemd instructions.

## API smoke tests

- Cross-platform Bun script: `bun run smoke:zoalcast`
- Bash variant: `bash ./scripts/smoke-zoalcast.sh`
- PowerShell variant: `pwsh ./scripts/smoke-zoalcast.ps1`
