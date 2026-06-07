import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  useRecordVisitMutation,
  useSessionHeartbeatMutation,
} from "@/store/localApi";
import { getOrCreateSessionId } from "@/lib/localIdentity";
import { parseRouteVisit } from "@/lib/visitAnalytics";

const HEARTBEAT_MS = 5 * 60 * 1000;
const VISIT_DEBOUNCE_MS = 1500;

export function LocalAnalyticsTracker() {
  const location = useLocation();
  const authStatus = useAppSelector((s) => s.auth.status);
  const [heartbeat] = useSessionHeartbeatMutation();
  const [recordVisit] = useRecordVisitMutation();
  const heartbeatTimer = useRef<number | null>(null);
  const lastRecordedPath = useRef<string | null>(null);
  const visitDebounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (authStatus !== "subscribed") return;

    const sendHeartbeat = () => {
      if (document.visibilityState !== "visible") return;
      const sessionId = getOrCreateSessionId();
      void heartbeat({
        session_id: sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || undefined,
      });
    };

    sendHeartbeat();
    heartbeatTimer.current = window.setInterval(sendHeartbeat, HEARTBEAT_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") sendHeartbeat();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (heartbeatTimer.current) window.clearInterval(heartbeatTimer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [authStatus, heartbeat]);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    if (lastRecordedPath.current === path) return;

    if (visitDebounceTimer.current) {
      window.clearTimeout(visitDebounceTimer.current);
    }

    visitDebounceTimer.current = window.setTimeout(() => {
      const currentPath = `${location.pathname}${location.search}`;
      if (lastRecordedPath.current === currentPath) return;

      lastRecordedPath.current = currentPath;
      const sessionId = getOrCreateSessionId();
      const meta = parseRouteVisit(location.pathname, location.search);

      void recordVisit({
        session_id: sessionId,
        path: currentPath,
        category_id: meta.category_id,
        podcast_id: meta.podcast_id,
        event_type: meta.event_type,
      });
    }, VISIT_DEBOUNCE_MS);

    return () => {
      if (visitDebounceTimer.current) {
        window.clearTimeout(visitDebounceTimer.current);
      }
    };
  }, [location.pathname, location.search, recordVisit]);

  return null;
}
