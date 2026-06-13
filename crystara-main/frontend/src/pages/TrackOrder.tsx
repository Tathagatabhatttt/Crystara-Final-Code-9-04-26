import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle2, Clock, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];
const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
};
const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  shipped: Truck,
  delivered: MapPin,
};

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper function to perform the actual track request
  const performTrack = async (searchId: string, searchEmail: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingId: searchId,
          email: searchEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (!silent) toast.error(data.error || "No order found with these details. Please check and try again.");
        if (!silent) setOrder(null);
      } else {
        setOrder((prev: any) => {
          if (prev && prev.status !== data.order.status) {
            const label = data.order.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
            toast.success(`Order status updated: ${label}`);
          }
          return data.order;
        });
        // Persist in localStorage for refresh support
        localStorage.setItem("lastTrackingId", searchId);
        localStorage.setItem("lastTrackingEmail", searchEmail);
      }
    } catch {
      if (!silent) toast.error("Something went wrong. Please try again.");
      if (!silent) setOrder(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Check URL params or localStorage on mount
  useEffect(() => {
    const urlId = searchParams.get("id");
    const urlEmail = searchParams.get("email");

    if (urlId && urlEmail) {
      setTrackingId(urlId);
      setEmail(urlEmail);
      performTrack(urlId.trim(), urlEmail.trim());
    } else {
      // Fallback to localStorage if no URL params
      const savedId = localStorage.getItem("lastTrackingId");
      const savedEmail = localStorage.getItem("lastTrackingEmail");
      if (savedId && savedEmail) {
        setTrackingId(savedId);
        setEmail(savedEmail);
        performTrack(savedId.trim(), savedEmail.trim());
      }
    }
  }, [searchParams]);

  // Auto-refresh every 30 seconds when an order is actively being tracked
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    if (order && trackingId && email) {
      pollRef.current = setInterval(() => {
        performTrack(trackingId.trim(), email.trim(), true);
      }, 30000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [order, trackingId, email]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId || !email) return;
    
    // Update URL query parameters so the URL matches the tracked order
    setSearchParams({ id: trackingId.trim(), email: email.trim() });
    
    await performTrack(trackingId.trim(), email.trim());
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 sm:pt-24">
        <section className="py-12 sm:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Track Your Order</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Enter your Order Tracking ID and email address to track your shipment.</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Order Tracking ID</label>
                  <Input placeholder="e.g. CRY-2604-123456" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} required className="text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <Input type="email" placeholder="Enter the email used for your order" value={email} onChange={(e) => setEmail(e.target.value)} required className="text-sm" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Search className="mr-2 w-4 h-4" /> {loading ? "Searching..." : "Track Order"}
                </Button>
              </form>

              {order && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-border">
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">Tracking ID</p>
                    <p className="font-mono font-semibold text-sm">{order.order_tracking_id || order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium text-sm">{order.customer_name}</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-primary text-lg">₹{Number(order.amount).toLocaleString()}</p>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-0">
                    {statusSteps.map((step, index) => {
                      const Icon = statusIcons[step];
                      const isActive = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                              <Icon size={14} />
                            </div>
                            {index < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${isActive ? "bg-primary" : "bg-muted"}`} />}
                          </div>
                          <div className="pt-1">
                            <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{statusLabels[step]}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Need help? Contact us at{" "}
                  <a href="mailto:support@crystara.in" className="text-primary hover:underline">support@crystara.in</a>{" "}
                  or call <a href="tel:+917980133886" className="text-primary hover:underline">+91 79801 33886</a>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
