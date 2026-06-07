/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

/** API responses must always hit the network on refresh — never serve stale JSON. */
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/local") ||
    url.pathname.startsWith("/api/zoalcast") ||
    url.hostname === "api.zoalcast.com",
  new NetworkOnly(),
);

/** Audio streams — always live. */
registerRoute(
  ({ url }) => /\/(audio|stream)\//i.test(url.pathname),
  new NetworkOnly(),
);

const staticCachePlugins = [
  new CacheableResponsePlugin({ statuses: [200] }),
  new ExpirationPlugin({
    maxEntries: 256,
    maxAgeSeconds: ONE_YEAR_SECONDS,
  }),
];

/** PWA manifest — always check network so deploy metadata propagates. */
registerRoute(
  ({ url }) => url.pathname === "/manifest.json",
  new NetworkFirst({
    cacheName: "isounds-manifest",
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  }),
);

/** Same-origin UI assets: JS, CSS, fonts, icons, screenshots (not manifest.json). */
registerRoute(
  ({ request, url }) => {
    if (url.origin !== self.location.origin) return false;
    if (url.pathname.startsWith("/api/")) return false;
    if (url.pathname === "/manifest.json") return false;

    return (
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "font" ||
      request.destination === "image" ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/screenshots/") ||
      url.pathname.startsWith("/assets/") ||
      /\.(woff2?|ttf|otf|eot|svg|png|jpg|jpeg|webp|gif|ico|webmanifest)$/i.test(
        url.pathname,
      )
    );
  },
  new CacheFirst({
    cacheName: "isounds-static-ui",
    plugins: staticCachePlugins,
  }),
);

/** HTML shell — network first so deploys propagate; assets above stay cached. */
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "isounds-html-shell",
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 16,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

type PushPayload = {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  tag?: string;
};

self.addEventListener("push", (event) => {
  let data: PushPayload = {};
  try {
    data = (event.data?.json() as PushPayload | undefined) ?? {};
  } catch {
    data = { title: event.data?.text() ?? "iSounds" };
  }

  if (!data.title) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag,
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const relativeUrl =
    (event.notification.data as { url?: string } | undefined)?.url ?? "/";
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          void client.focus();
          if ("navigate" in client && typeof client.navigate === "function") {
            return (client as WindowClient).navigate(targetUrl);
          }
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
