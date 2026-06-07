import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const pwaPlugin = VitePWA({
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.ts",
  registerType: "autoUpdate",
  injectRegister: null,
  devOptions: {
    enabled: false,
  },
  injectManifest: {
    globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff,woff2}"],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  },
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
});

export default defineConfig({
  plugins: [react(), pwaPlugin],
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
          "vendor-motion": ["motion"],
          "vendor-three": ["three", "@react-three/fiber"],
          "vendor-gsap": ["gsap"],
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
});
