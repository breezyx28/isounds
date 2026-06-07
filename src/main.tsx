import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { i18nReady } from "@/i18n";
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
    void import("./registerPwa").then(({ registerPwa }) => registerPwa());
  });
}

const root = createRoot(document.getElementById("root")!);

void i18nReady.then(() => {
  root.render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>,
  );
});
