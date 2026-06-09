import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Check, X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COUPONS, WELCOME_COUPON_CODE } from "@/lib/welcomeOffer";

interface CouponSectionProps {
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCoupon: string | null;
  welcomeEligible?: boolean;
}

const CouponSection = ({ onApply, onRemove, appliedCoupon, welcomeEligible = false }: CouponSectionProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const handleApply = () => {
    if (appliedCoupon) return;
    const normalized = code.trim().toUpperCase();
    const coupon = COUPONS[normalized];
    if (coupon) {
      if (normalized === WELCOME_COUPON_CODE && !welcomeEligible) {
        setError("WELCOME10 is only valid for new signups on their first order");
        return;
      }
      setError("");
      onApply(coupon.discount, normalized);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setError("Invalid coupon code");
    }
  };

  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Tag size={16} className="text-primary" />
        <span className="text-sm font-medium">Apply Coupon</span>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-600">{appliedCoupon} applied — {COUPONS[appliedCoupon]?.label}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { onRemove(); setCode(""); }}>
            <X size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            className="text-sm h-9"
          />
          <Button size="sm" onClick={handleApply} className="h-9 px-4">Apply</Button>
        </div>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {/* Celebration Popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ y: 50, rotateZ: -5 }}
              animate={{ y: 0, rotateZ: 0 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="bg-card p-8 rounded-2xl border border-primary/30 shadow-2xl text-center max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti particles */}
              <div className="relative">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200,
                      rotate: Math.random() * 360,
                    }}
                    transition={{ duration: 1.5, delay: i * 0.05 }}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF69B4", "#FFD700"][i % 8] }}
                  />
                ))}
              </div>
              
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.6 }}>
                <PartyPopper className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-serif font-bold mb-2">🎉 Congratulations!</h3>
              <p className="text-muted-foreground mb-1">Coupon applied successfully!</p>
              <p className="text-lg font-bold text-primary">{COUPONS[appliedCoupon || ""]?.label || "Discount Applied"}</p>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-4 text-sm text-muted-foreground"
              >
                Tap anywhere to continue shopping ✨
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponSection;
