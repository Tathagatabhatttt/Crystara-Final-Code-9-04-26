import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "@/services/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent({
      eventType: "page_view",
    });
  }, [location.pathname]);

  return null;
}
