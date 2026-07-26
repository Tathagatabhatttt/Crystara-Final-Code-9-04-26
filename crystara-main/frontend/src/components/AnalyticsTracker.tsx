import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { createAnalyticsEventId, trackEvent } from "@/services/analytics";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsTracker() {
  const location = useLocation();
  const { profile, loading } = useAuth();
  const eventIds = useRef(new Map<string, string>());

  useEffect(() => {
    // Do not inflate customer metrics with dashboard/admin browsing.
    if (loading || profile?.role === "admin" || location.pathname.startsWith("/admin")) {
      return;
    }

    const navigationKey = location.key || `${location.pathname}${location.search}`;
    let eventId = eventIds.current.get(navigationKey);
    if (!eventId) {
      eventId = createAnalyticsEventId();
      eventIds.current.set(navigationKey, eventId);
    }

    trackEvent({
      eventType: "page_view",
      eventId,
    });
  }, [loading, location.key, location.pathname, location.search, profile?.role]);

  return null;
}
