import { registerSW } from "virtual:pwa-register";

let swRegistration: ServiceWorkerRegistration | null = null;

export function getSwRegistration() {
  return swRegistration;
}

export function registerPwa() {
  const register = () => {
    registerSW({
      immediate: false,
      onRegistered(registration) {
        swRegistration = registration ?? null;
      },
    });
  };

  const idleCallback =
    "requestIdleCallback" in window ? window.requestIdleCallback.bind(window) : undefined;

  if (idleCallback) {
    idleCallback(register);
    return;
  }

  globalThis.setTimeout(register, 1200);
}
