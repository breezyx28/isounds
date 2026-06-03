import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "@/i18n";
import { store } from "@/store/store";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
}

if (import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void import("virtual:pwa-register").then(({ registerSW }) => {
      const idleCallback =
        "requestIdleCallback" in window ? window.requestIdleCallback.bind(window) : undefined;
      if (idleCallback) {
        idleCallback(() => registerSW({ immediate: false }));
        return;
      }
      globalThis.setTimeout(() => registerSW({ immediate: false }), 1200);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
