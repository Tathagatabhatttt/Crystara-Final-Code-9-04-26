import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Gift, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  hasSeenScrollOffer,
  markScrollOfferSeen,
  WELCOME_COUPON_CODE,
  WELCOME_DISCOUNT_PERCENT,
} from "@/lib/welcomeOffer";

const HIDDEN_PATHS = ["/auth", "/admin", "/checkout", "/cart", "/reset-password"];

const SignupOfferPopup = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user || hasSeenScrollOffer()) return;
    if (HIDDEN_PATHS.some((path) => location.pathname.startsWith(path))) return;

    const onScroll = () => {
      if (hasSeenScrollOffer()) return;

      const threshold = Math.min(400, window.innerHeight * 0.3);
      if (window.scrollY < threshold) return;

      markScrollOfferSeen();
      setOpen(true);
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [user, loading, location.pathname]);

  const dismiss = () => {
    markScrollOfferSeen();
    setOpen(false);
  };

  const handleSignup = () => {
    markScrollOfferSeen();
    setOpen(false);
    navigate("/auth?mode=signup&offer=welcome10");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-[0_24px_70px_-28px_hsl(var(--primary)/0.8)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground"
              aria-label="Close offer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-[linear-gradient(135deg,hsl(var(--crystal-obsidian)),hsl(var(--primary)),hsl(var(--accent)))] px-6 pb-7 pt-8 text-primary-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/18">
                <Gift className="h-6 w-6" />
              </div>
              <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary-foreground/80">
                <Sparkles className="h-3.5 w-3.5" />
                Exclusive welcome offer
              </p>
              <h2 className="font-serif text-2xl font-bold">Get {WELCOME_DISCOUNT_PERCENT}% OFF</h2>
              <p className="mt-2 text-sm text-primary-foreground/85">
                Sign up today and save on your first crystal order.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your code</p>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">{WELCOME_COUPON_CODE}</p>
              </div>

              <Button className="w-full rounded-full" size="lg" onClick={handleSignup}>
                Sign Up & Save {WELCOME_DISCOUNT_PERCENT}%
              </Button>
              <button
                type="button"
                onClick={dismiss}
                className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupOfferPopup;
