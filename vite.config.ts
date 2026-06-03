import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === "production"
      ? [
          VitePWA({
            registerType: "autoUpdate",
            manifestFilename: "manifest.json",
      includeAssets: [
        "icons/icon.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable.svg",
        "icons/icon-maskable-512.png",
        "screenshots/home.svg",
      ],
      manifest: {
        name: "iSounds digital portal",
        short_name: "iSounds",
        description: "منصة البودكاست السودانية بالتعاون مع زين",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#08060F",
        theme_color: "#9f67db",
        lang: "ar",
        dir: "rtl",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/home.svg",
            sizes: "1280x720",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff,woff2}"],
        navigateFallback: "/offline.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "html-shell" },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "font",
            handler: "CacheFirst",
            options: { cacheName: "static-assets" },
          },
          {
            urlPattern: /^https:\/\/api\.zoalcast\.com\/api\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "zoalcast-api",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/zoalcast/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "zoalcast-api-proxy",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "episode-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) => /\/(audio|stream)\//i.test(url.pathname),
            handler: "NetworkOnly",
            options: { cacheName: "audio-streams" },
          },
        ],
      },
        }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      "/api/local": {
        target: "http://localhost:8888",
        changeOrigin: true,
      },
      "/api/zoalcast": {
        target: "https://api.zoalcast.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/zoalcast/, "/api"),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
          "vendor-motion": ["framer-motion"],
          "vendor-icons": ["@phosphor-icons/react", "iconsax-react"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
          ],
          "vendor-i18n": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
        },
      },
    },
  },
}));
