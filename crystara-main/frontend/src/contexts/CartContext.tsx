import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/services/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subCategory?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number, redirectPath?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const PENDING_CART_ITEM_KEY = "crystara-pending-cart-item";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { session, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasLoadedRemoteCart = useRef(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("crystara-cart");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!session?.access_token) {
      localStorage.removeItem("crystara-cart");
      setItems([]);
      hasLoadedRemoteCart.current = false;
      return;
    }

    if (profile?.role === "admin") {
      localStorage.removeItem("crystara-cart");
      setItems([]);
      return;
    }

    localStorage.setItem("crystara-cart", JSON.stringify(items));
  }, [items, session?.access_token, profile?.role, authLoading]);

  useEffect(() => {
    hasLoadedRemoteCart.current = false;

    if (authLoading) {
      return;
    }

    if (!session?.access_token) {
      localStorage.removeItem("crystara-cart");
      setItems([]);
      return;
    }

    if (profile?.role === "admin") {
      setItems([]);
      return;
    }

    const loadCart = async () => {
      try {
        const response = await fetch(`${API_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const remoteItems = Array.isArray(data.items) ? data.items : [];

        if (remoteItems.length > 0) {
          setItems(remoteItems);
        } else if (items.length > 0) {
          await fetch(`${API_URL}/cart`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ items }),
          });
        }
      } catch (error) {
        console.error("Failed to load saved cart:", error);
      } finally {
        hasLoadedRemoteCart.current = true;
      }
    };

    loadCart();
  }, [session?.access_token, profile?.role, authLoading]);

  useEffect(() => {
    if (profile?.role === "admin" || !session?.access_token || !hasLoadedRemoteCart.current) {
      return;
    }

    const saveCart = async () => {
      try {
        await fetch(`${API_URL}/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ items }),
        });
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    };

    saveCart();
  }, [items, session?.access_token, profile?.role]);

  useEffect(() => {
    if (!session?.access_token || profile?.role === "admin") {
      return;
    }

    const rawPendingItem = sessionStorage.getItem(PENDING_CART_ITEM_KEY);
    if (!rawPendingItem) {
      return;
    }

    try {
      const pendingItem = JSON.parse(rawPendingItem) as {
        item: Omit<CartItem, "quantity">;
        quantity: number;
      };

      setItems((prev) => {
        const existing = prev.find((i) => i.id === pendingItem.item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === pendingItem.item.id
              ? { ...i, quantity: i.quantity + pendingItem.quantity }
              : i,
          );
        }

        return [...prev, { ...pendingItem.item, quantity: pendingItem.quantity }];
      });
      toast.success(`${pendingItem.item.name} added to cart`);
    } catch (error) {
      console.error("Failed to restore pending cart item:", error);
    } finally {
      sessionStorage.removeItem(PENDING_CART_ITEM_KEY);
    }
  }, [session?.access_token, profile?.role]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1, redirectPath?: string) => {
    if (!session?.access_token) {
      sessionStorage.setItem(PENDING_CART_ITEM_KEY, JSON.stringify({ item, quantity }));
      toast.info("Create an account to add this product to your cart and unlock 10% off.");
      const nextRedirect = redirectPath || (location.pathname + location.search);
      navigate(`/auth?mode=signup&offer=welcome10&redirect=${encodeURIComponent(nextRedirect)}`);
      return;
    }

    if (profile?.role === "admin") {
      toast.error("Admins cannot buy products. Please log in as a customer.");
      return;
    }
    trackEvent({
      eventType: "add_to_cart",
      productId: item.id,
      productName: item.name,
      category: item.category,
      image: item.image,
    });
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast.success(`Updated quantity for ${item.name}`);
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    if (profile?.role === "admin") {
      toast.error("Admins cannot manage a customer cart from the storefront.");
      return;
    }

    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) toast.info(`${item.name} removed from cart`);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (profile?.role === "admin") {
      toast.error("Admins cannot manage a customer cart from the storefront.");
      return;
    }

    if (quantity < 1) return removeFromCart(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    if (profile?.role === "admin") {
      toast.error("Admins cannot manage a customer cart from the storefront.");
      return;
    }

    setItems([]);
    toast.info("Cart cleared");
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
