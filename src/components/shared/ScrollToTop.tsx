import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets window scroll on route changes. SPAs keep scrollY across navigations
 * unless explicitly cleared — without this, a long page (e.g. landing) leaves
 * the next route opened partway or at the bottom.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
