import { serve } from "bun";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { router } from "./router";
import { runMigrations } from "./migrations";
import { injectMetaIntoShell, resolveRouteMeta } from "./og";
import { startNewEpisodePoller } from "./jobs/newEpisodePoller";
import { configureWebPush } from "./push";
import { getRobotsTxt, getSitemapXml } from "./sitemap";

const PORT = Number(process.env.PORT ?? 8888);
const DB_PATH = process.env.DB_PATH ?? "./data/isounds.db";
const DIST = "./dist";

const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH, { create: true });
runMigrations(db);
configureWebPush();
startNewEpisodePoller(db);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

serve({
  port: PORT,
  idleTimeout: 30,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/healthz" || url.pathname === "/health") {
      return Response.json({ ok: true, service: "isounds", uptime: process.uptime() });
    }
    if (url.pathname === "/readyz" || url.pathname === "/ready") {
      try {
        db.query("SELECT 1").get();
        return Response.json({ ok: true, db: "ready" });
      } catch {
        return Response.json({ ok: false, db: "unavailable" }, { status: 503 });
      }
    }

    if (url.pathname.startsWith("/api/local")) {
      return router(req, db);
    }
    if (url.pathname === "/robots.txt") {
      return new Response(getRobotsTxt(), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    if (url.pathname === "/sitemap.xml") {
      const xml = await getSitemapXml();
      return new Response(xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      });
    }

    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const diskPath = `${DIST}${filePath}`;

    if (!filePath.includes("..")) {
      const file = Bun.file(diskPath);
      if (await file.exists()) {
        const ext = filePath.slice(filePath.lastIndexOf("."));
        return new Response(file, {
          headers: MIME[ext] ? { "Content-Type": MIME[ext] } : undefined,
        });
      }
    }

    if (!url.pathname.includes(".")) {
      const index = Bun.file(`${DIST}/index.html`);
      if (await index.exists()) {
        const shell = await index.text();
        const meta = await resolveRouteMeta(url.pathname);
        const html = injectMetaIntoShell(shell, url.pathname, meta);
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`iSounds Bun server http://localhost:${PORT}`);
