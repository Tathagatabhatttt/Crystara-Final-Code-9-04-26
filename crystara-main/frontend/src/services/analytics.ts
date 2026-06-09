const getSessionId = () => {
  let sid = sessionStorage.getItem("crystara_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("crystara_session_id", sid);
  }
  return sid;
};

export interface TrackEventParams {
  eventType: "page_view" | "product_click" | "add_to_cart";
  productId?: string;
  productName?: string;
  category?: string;
  image?: string;
}

export const trackEvent = async (params: TrackEventParams) => {
  try {
    const sessionId = getSessionId();
    await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/api/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        sessionId,
      }),
    });
  } catch (err) {
    console.error("Error tracking analytics event:", err);
  }
};
