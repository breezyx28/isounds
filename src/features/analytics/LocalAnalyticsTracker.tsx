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

export function LocalAnalyticsTracker() {
  const location = useLocation();
  const authStatus = useAppSelector((s) => s.auth.status);
  const [heartbeat] = useSessionHeartbeatMutation();
  const [recordVisit] = useRecordVisitMutation();
  const heartbeatTimer = useRef<number | null>(null);

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
    const sessionId = getOrCreateSessionId();
    const path = `${location.pathname}${location.search}`;
    const meta = parseRouteVisit(location.pathname, location.search);

    void recordVisit({
      session_id: sessionId,
      path,
      category_id: meta.category_id,
      podcast_id: meta.podcast_id,
      event_type: meta.event_type,
    });
  }, [location.pathname, location.search, recordVisit]);

  return null;
}
