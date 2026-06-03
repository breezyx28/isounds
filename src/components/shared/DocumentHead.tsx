import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ROUTE_META: Record<
  string,
  { title: string; description: string }
> = {
  "/": {
    title: "iSounds — بودكاست السودان",
    description: "منصتك للصوت والفيديو بالتعاون مع زين السودان.",
  },
  "/browse": {
    title: "Browse — iSounds",
    description: "Discover Sudanese podcasts and video shows.",
  },
  "/categories": {
    title: "Categories — iSounds",
    description: "Browse podcasts by category on iSounds.",
  },
  "/explore": {
    title: "Explore — iSounds",
    description: "Search and filter Sudanese podcasts on iSounds.",
  },
  "/library": {
    title: "Library — iSounds",
    description: "Your liked, saved, and listening history on iSounds.",
  },
  "/library/saved": {
    title: "Saved — iSounds",
    description: "Your bookmarked podcasts on iSounds.",
  },
  "/subscribe": {
    title: "Subscribe — iSounds",
    description: "Subscribe to iSounds through Zain Sudan.",
  },
  "/login": {
    title: "Login — iSounds",
    description: "Sign in to iSounds with your phone number.",
  },
  "/contact": {
    title: "Contact — iSounds",
    description: "Contact iSounds support.",
  },
  "/about": {
    title: "About — iSounds",
    description: "Learn about iSounds.",
  },
};

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function DocumentHead() {
  const location = useLocation();
  const { t } = useTranslation("common");

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const meta =
      ROUTE_META[path] ??
      (path.startsWith("/podcasts/")
        ? {
            title: "Episode — iSounds",
            description: t("landing.hero.subcopy"),
          }
        : path.startsWith("/categories/")
          ? {
              title: "Category — iSounds",
              description: t("landing.categories.intro"),
            }
          : ROUTE_META["/"]);

    document.title = meta.title;
    upsertMeta("description", meta.description);
    upsertProperty("og:title", meta.title);
    upsertProperty("og:description", meta.description);
    upsertProperty("og:url", `${window.location.origin}${location.pathname}`);
    upsertProperty("twitter:title", meta.title);
    upsertProperty("twitter:description", meta.description);
  }, [location.pathname, t]);

  return null;
}
