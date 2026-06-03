import { registerSW } from "virtual:pwa-register";

export function registerPwa() {
  const idleCallback =
    "requestIdleCallback" in window ? window.requestIdleCallback.bind(window) : undefined;

  if (idleCallback) {
    idleCallback(() => registerSW({ immediate: false }));
    return;
  }

  globalThis.setTimeout(() => registerSW({ immediate: false }), 1200);
}
