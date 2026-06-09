import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductById } from "@/integrations/supabase/types";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subCategory?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, profile } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);

  // Fetch wishlist for logged in user
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const wishlistItems = data
        .map((row: any) => {
          const product = getProductById(row.product_id);
          if (!product) return null;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
            subCategory: product.subCategory,
          } as WishlistItem;
        })
        .filter((item): item is WishlistItem => item !== null);
      
      setItems(wishlistItems);
    } else {
      setItems([]);
    }
  };

  const addToWishlist = async (item: WishlistItem) => {
    if (profile?.role === "admin") {
      toast.error("Admins cannot add products to wishlist. Please use a customer account.");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (items.find((i) => i.id === item.id)) {
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: user.id,
      product_id: item.id,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to add to wishlist");
      return;
    }

    setItems((prev) => [...prev, item]);

    toast.success(`${item.name} added to wishlist`);
  };

  const removeFromWishlist = async (id: string) => {
    if (profile?.role === "admin") {
      toast.error("Admins cannot manage a customer wishlist from the storefront.");
      return;
    }

    if (!user) return;

    const item = items.find((i) => i.id === id);

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("product_id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      toast.error("Failed to remove wishlist item");
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));

    if (item) {
      toast.info(`${item.name} removed from wishlist`);
    }
  };

  const isInWishlist = (id: string) => {
    return items.some((i) => i.id === id);
  };

  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      await removeFromWishlist(item.id);
    } else {
      await addToWishlist(item);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);

  if (!ctx) {
    throw new Error(
      "useWishlist must be used within WishlistProvider"
    );
  }

  return ctx;
};
