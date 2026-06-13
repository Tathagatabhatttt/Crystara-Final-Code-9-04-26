import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, CreditCard, Banknote, ArrowLeft, CheckCircle2, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import {
  clearCheckoutCoupon,
  markWelcomeOfferUsed,
  readCheckoutCoupon,
  WELCOME_COUPON_CODE,
} from "@/lib/welcomeOffer";

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  if (profile?.role === "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <Package className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-3">Checkout Restricted</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Admins cannot buy products or access checkout. Please sign in with a customer profile to place an order.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <h1 className="text-2xl font-serif font-bold mb-4">Please Sign In First</h1>
            <p className="text-muted-foreground mb-6 text-sm">You need to sign in to place an order.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  const checkoutCoupon = readCheckoutCoupon();
  const couponDiscount = checkoutCoupon?.discount ?? 0;
  const discountAmount = Math.round(totalPrice * (couponDiscount / 100));
  const priceAfterCoupon = totalPrice - discountAmount;
  const shipping = priceAfterCoupon >= 999 ? 0 : 99;
  const finalTotal = priceAfterCoupon + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !address || !city || !state || !pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "online") {
        const resScript = await loadRazorpayScript();
        if (!resScript) {
          toast.error("Razorpay SDK failed to load. Please check your internet connection.");
          setLoading(false);
          return;
        }

        // 1. Create order on backend
        const response = await fetch(`${API_URL}/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalTotal,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to create order on payment gateway");
        }

        const orderData = await response.json();
        const { id: razorpayOrderId, key_id: razorpayKeyId } = orderData;

        // 2. Open Razorpay Checkout
        const options = {
          key: razorpayKeyId,
          amount: orderData.amount, // backend returns it in paise already
          currency: orderData.currency || "INR",
          name: "Crystara",
          description: "Healing Crystals & Spiritual Products",
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            setLoading(true);
            try {
              // 3. Verify Payment
              const verifyRes = await fetch(`${API_URL}/verify-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.valid) {
                throw new Error(verifyData.error || "Payment verification failed");
              }

              // 4. Save order to Supabase
              const { data, error } = await supabase
                .from("orders")
                .insert({
                  user_id: user.id,
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  amount: finalTotal,
                  items: items as any,
                  shipping_address: {
                    name,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                    payment_method: "online",
                  },
                  status: "confirmed",
                  created_at: new Date().toISOString(),
                })
                .select("id")
                .single();

              if (error) throw error;

              setTrackingId(data.id.slice(0, 8).toUpperCase());
              setOrderPlaced(true);

              if (checkoutCoupon?.code === WELCOME_COUPON_CODE && user?.id) {
                markWelcomeOfferUsed(user.id);
              }
              clearCheckoutCoupon();
              clearCart();
              toast.success("Payment successful and order placed!");
            } catch (err: any) {
              console.error(err);
              toast.error(err.message || "Failed to process payment verification");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name,
            email,
            contact: phone,
          },
          notes: {
            address: `${address}, ${city}, ${state} - ${pincode}`,
          },
          theme: {
            color: "#7c3aed",
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast.warning("Payment cancelled.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          toast.error(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // COD Order Flow
        const generatedOrderId =
          "ORD_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

        const generatedPaymentId = `COD_${Date.now()}`;

        const { data, error } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            order_id: generatedOrderId,
            payment_id: generatedPaymentId,
            amount: finalTotal,
            items: items as any,
            shipping_address: {
              name,
              email,
              phone,
              address,
              city,
              state,
              pincode,
              payment_method: "cod",
            },
            status: "pending",
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) throw error;

        setTrackingId(data.id.slice(0, 8).toUpperCase());
        setOrderPlaced(true);

        if (checkoutCoupon?.code === WELCOME_COUPON_CODE && user?.id) {
          markWelcomeOfferUsed(user.id);
        }
        clearCheckoutCoupon();
        clearCart();
        toast.success("Order placed successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center px-4 max-w-md">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-serif font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-1 text-sm">Your order has been placed successfully.</p>
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <p className="text-xs text-muted-foreground">Your Tracking ID</p>
              <p className="text-lg font-mono font-bold text-primary">{trackingId}</p>
              <p className="text-xs text-muted-foreground mt-1">Use this ID to track your order on the Track Order page</p>
            </div>
            {paymentMethod === "online" && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-primary font-medium">📱 For online payment, please complete your payment via UPI to our number. Our team will confirm your order shortly.</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/")}>Continue Shopping</Button>
              <Button variant="outline" onClick={() => navigate(`/track-order?id=${trackingId}&email=${email}`)}>Track Order</Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate("/cart")}>
            <ArrowLeft size={16} /> Back to Cart
          </Button>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-8">Checkout</h1>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card p-5 rounded-xl border border-border">
                  <h2 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2"><Package size={18} /> Shipping Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    <Input placeholder="Pincode *" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    <Input placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} required />
                    <Input placeholder="State *" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                  <Textarea placeholder="Full Address *" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-4" rows={3} />
                </div>

                <div className="bg-card p-5 rounded-xl border border-border">
                  <h2 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2"><CreditCard size={18} /> Payment Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-primary" />
                      <Banknote size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border"}`}>
                      <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="accent-primary" />
                      <Smartphone size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-sm">Pay Online</p>
                        <p className="text-xs text-muted-foreground">UPI, Credit/Debit Cards, Netbanking, Wallets</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border h-fit sticky top-24">
                <h2 className="font-serif font-semibold text-lg mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{item.name} ×{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Coupon ({checkoutCoupon?.code}) — {couponDiscount}%
                      </span>
                      <span className="text-green-600">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" size="lg" disabled={loading}>
                  {loading ? "Placing Order..." : paymentMethod === "cod" ? "Place Order (COD)" : "Place Order (Online)"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
