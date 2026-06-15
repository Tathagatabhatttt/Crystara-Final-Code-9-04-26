import { useState, useEffect } from "react";
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
  const { user, profile, session, fetchProfile } = useAuth();
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

  const [addressesList, setAddressesList] = useState<any[]>([]);
  const [saveAsPrimary, setSaveAsPrimary] = useState(true);

  // Load saved addresses and pre-fill form
  useEffect(() => {
    if (profile) {
      const list: any[] = [];
      if (profile.address_street || profile.address_city) {
        list.push({
          id: "primary",
          label: "Primary Address",
          street: profile.address_street || "",
          city: profile.address_city || "",
          state: profile.address_state || "",
          pincode: profile.address_pincode || "",
          name: profile.name || "",
          phone: profile.phone || "",
        });
      }
      if (profile.saved_addresses && Array.isArray(profile.saved_addresses)) {
        profile.saved_addresses.forEach((addr: any) => {
          list.push({
            id: addr.id,
            label: addr.label || `${addr.type.charAt(0).toUpperCase() + addr.type.slice(1)} Address`,
            street: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
            name: profile.name || "",
            phone: profile.phone || "",
          });
        });
      }
      setAddressesList(list);

      // Pre-fill form fields
      const primary = list.find((a) => a.id === "primary") || list[0];
      if (primary) {
        setName(primary.name);
        setPhone(primary.phone);
        setAddress(primary.street);
        setCity(primary.city);
        setState(primary.state);
        setPincode(primary.pincode);
      } else {
        if (profile.name) setName(profile.name);
        if (profile.phone) setPhone(profile.phone);
      }
    }
  }, [profile]);

  const handleSelectAddress = (addressId: string) => {
    const selected = addressesList.find((addr) => addr.id === addressId);
    if (selected) {
      setName(selected.name);
      setPhone(selected.phone);
      setAddress(selected.street);
      setCity(selected.city);
      setState(selected.state);
      setPincode(selected.pincode);
    }
  };

  const saveAddressToProfile = async () => {
    if (saveAsPrimary && session?.access_token) {
      try {
        await fetch(`${API_URL}/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name,
            phone,
            address_street: address,
            address_city: city,
            address_state: state,
            address_pincode: pincode,
          }),
        });
        fetchProfile();
      } catch (error) {
        console.error("Failed to save address to profile:", error);
      }
    }
  };

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

  const PARTIAL_COD_PERCENT = 20; // 20% advance
  const codAdvance = Math.round(finalTotal * (PARTIAL_COD_PERCENT / 100));
  const codBalance = finalTotal - codAdvance;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !address || !city || !state || !pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const isCodPartial = paymentMethod === "cod";
      const paymentAmount = isCodPartial ? codAdvance : finalTotal;

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
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          amount: paymentAmount,
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
        description: isCodPartial
          ? `COD Order Advance Payment (${PARTIAL_COD_PERCENT}%)`
          : "Healing Crystals & Spiritual Products",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          setLoading(true);
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(`${API_URL}/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
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
                  payment_method: isCodPartial ? "partial_cod" : "online",
                  total_amount: finalTotal,
                  advance_paid: paymentAmount,
                  balance_due: isCodPartial ? codBalance : 0,
                },
                status: isCodPartial ? "pending" : "confirmed",
                created_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (error) throw error;

            setTrackingId(data.id.slice(0, 8).toUpperCase());
            setOrderPlaced(true);

            await saveAddressToProfile();

            if (checkoutCoupon?.code === WELCOME_COUPON_CODE && user?.id) {
              markWelcomeOfferUsed(user.id);
            }
            clearCheckoutCoupon();
            clearCart();
            toast.success(isCodPartial ? "COD Advance paid and order placed!" : "Payment successful and order placed!");
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
          type: isCodPartial ? "partial_cod" : "full_online",
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
            {paymentMethod === "cod" && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  💳 Advance payment of ₹{codAdvance.toLocaleString()} paid successfully. Please pay the remaining balance of ₹{codBalance.toLocaleString()} in cash when your order is delivered.
                </p>
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
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="font-serif font-semibold text-lg flex items-center gap-2">
                      <Package size={18} /> Shipping Details
                    </h2>
                    {addressesList.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Use address:</span>
                        <select
                          onChange={(e) => handleSelectAddress(e.target.value)}
                          className="text-xs p-1.5 rounded-lg border border-border bg-background font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {addressesList.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    <Input placeholder="Pincode *" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    <Input placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} required />
                    <Input placeholder="State *" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                  <Textarea placeholder="Full Address *" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-4" rows={3} />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveAsPrimary}
                        onChange={(e) => setSaveAsPrimary(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs font-medium text-muted-foreground">Save as primary default address</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/addresses")}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Manage saved addresses
                    </button>
                  </div>
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
                  {paymentMethod === "cod" && (
                    <div className="border-t border-border/60 pt-2 mt-2 space-y-1 text-xs">
                      <div className="flex justify-between font-medium text-foreground">
                        <span>COD Advance ({PARTIAL_COD_PERCENT}% to pay now)</span>
                        <span>₹{codAdvance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>COD Balance (Pay on handover)</span>
                        <span>₹{codBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full mt-4" size="lg" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? `Pay COD Advance (₹${codAdvance.toLocaleString()})`
                    : `Pay & Place Order (₹${finalTotal.toLocaleString()})`}
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
