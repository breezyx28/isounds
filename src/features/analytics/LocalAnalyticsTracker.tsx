import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  useRecordVisitMutation,
  useSessionHeartbeatMutation,
} from "@/store/localApi";
import { getOrCreateSessionId } from "@/lib/localIdentity";

export function LocalAnalyticsTracker() {
  const location = useLocation();
  const authStatus = useAppSelector((s) => s.auth.status);
  const [heartbeat] = useSessionHeartbeatMutation();
  const [recordVisit] = useRecordVisitMutation();

  useEffect(() => {
    if (authStatus !== "subscribed") return;
    const sessionId = getOrCreateSessionId();
    void heartbeat({
      session_id: sessionId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
    });
  }, [authStatus, heartbeat]);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    void recordVisit({
      session_id: sessionId,
      path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search, recordVisit]);

  return null;
}
