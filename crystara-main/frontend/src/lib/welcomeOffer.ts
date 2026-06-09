export const WELCOME_COUPON_CODE = "WELCOME10";
export const WELCOME_DISCOUNT_PERCENT = 10;
export const SCROLL_POPUP_STORAGE_KEY = "crystara-scroll-offer-shown";
export const PENDING_WELCOME_KEY = "crystara-welcome10-pending";
export const CHECKOUT_COUPON_KEY = "crystara-checkout-coupon";

export const COUPONS: Record<
  string,
  { discount: number; type: "percent"; label: string; firstSignupOnly?: boolean }
> = {
  WELCOME10: {
    discount: 10,
    type: "percent",
    label: "10% OFF first signup order",
    firstSignupOnly: true,
  },
  CRYSTARAILY: { discount: 9, type: "percent", label: "Flat 9% OFF" },
};

function eligibilityKey(userId: string) {
  return `crystara-welcome10-${userId}`;
}

export function grantWelcomeOffer(userId?: string) {
  if (userId) {
    localStorage.setItem(eligibilityKey(userId), "eligible");
    localStorage.removeItem(PENDING_WELCOME_KEY);
    return;
  }
  localStorage.setItem(PENDING_WELCOME_KEY, "true");
}

export function claimPendingWelcomeOffer(userId: string) {
  if (localStorage.getItem(PENDING_WELCOME_KEY) === "true") {
    localStorage.setItem(eligibilityKey(userId), "eligible");
    localStorage.removeItem(PENDING_WELCOME_KEY);
  }
}

export function isWelcomeOfferEligible(userId: string | undefined): boolean {
  if (!userId) return false;
  return localStorage.getItem(eligibilityKey(userId)) === "eligible";
}

export function markWelcomeOfferUsed(userId: string) {
  localStorage.setItem(eligibilityKey(userId), "used");
}

export function hasSeenScrollOffer(): boolean {
  return localStorage.getItem(SCROLL_POPUP_STORAGE_KEY) === "true";
}

export function markScrollOfferSeen() {
  localStorage.setItem(SCROLL_POPUP_STORAGE_KEY, "true");
}

export function saveCheckoutCoupon(code: string | null, discount: number) {
  if (!code || discount <= 0) {
    sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
    return;
  }
  sessionStorage.setItem(
    CHECKOUT_COUPON_KEY,
    JSON.stringify({ code, discount }),
  );
}

export function readCheckoutCoupon(): { code: string; discount: number } | null {
  const raw = sessionStorage.getItem(CHECKOUT_COUPON_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.code && typeof parsed.discount === "number") {
      return parsed;
    }
  } catch {
    sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
  }
  return null;
}

export function clearCheckoutCoupon() {
  sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
}
