import { useEffect } from "react";

const LIGHT_ICON = "/logos/outlined-primary.svg";
const DARK_ICON = "/logos/outlined-white.svg";

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-dynamic="true"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.dataset.dynamic = "true";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function FaviconManager() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setFavicon(media.matches ? DARK_ICON : LIGHT_ICON);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return null;
}
