import { API_URL } from "@/lib/api";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getSessionId = () => {
  let sid = sessionStorage.getItem("crystara_session_id");
  if (!sid) {
    sid = createId();
    sessionStorage.setItem("crystara_session_id", sid);
  }
  return sid;
};

const getVisitorId = () => {
  let visitorId = localStorage.getItem("crystara_visitor_id");
  if (!visitorId) {
    visitorId = createId();
    localStorage.setItem("crystara_visitor_id", visitorId);
  }
  return visitorId;
};

export const createAnalyticsEventId = () => createId();

export interface TrackEventParams {
  eventType: "page_view" | "product_click" | "add_to_cart";
  eventId?: string;
  productId?: string;
  productName?: string;
  category?: string;
  image?: string;
}

export const trackEvent = async (params: TrackEventParams) => {
  try {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const response = await fetch(`${API_URL}/api/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        ...params,
        eventId: params.eventId || createAnalyticsEventId(),
        sessionId,
        visitorId,
        path: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || undefined,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Analytics API returned ${response.status}: ${detail}`);
    }
  } catch (err) {
    console.error("Error tracking analytics event:", err);
  }
};
