import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, ArrowRight, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { profile } = useAuth();

  const handleMoveToCart = (item: typeof items[0]) => {
    addToCart({ id: item.id, name: item.name, price: item.price, originalPrice: item.originalPrice, image: item.image, category: item.category });
    removeFromWishlist(item.id);
  };

  if (profile?.role === "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3">Wishlist Restricted for Admins</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Admins cannot add or manage wishlist items from the storefront. Use the admin panel to review customer wishlists.
            </p>
            <Link to="/admin">
              <Button>Open Admin Panel</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-center mb-3">
            Your <span className="text-gradient-mystic">Wishlist</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8 md:mb-12 text-sm md:text-base">
            Save your favorite crystals for later
          </p>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 md:py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6 text-sm">Start adding crystals you love</p>
              <Link to="/shop">
                <Button className="gap-2">Explore Crystals <ArrowRight size={18} /></Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
              {items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-xl overflow-hidden border border-border group relative">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 w-7 h-7 bg-background/80 rounded-full" onClick={() => removeFromWishlist(item.id)}>
                    <X size={14} />
                  </Button>
                  <Link to={`/product/${item.id}`} className="block aspect-square overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </Link>
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase">{item.category}</p>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-serif font-semibold text-sm line-clamp-2 hover:text-primary">{item.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 my-1.5">
                      <span className="text-sm font-bold text-primary">₹{item.price.toLocaleString()}</span>
                      {item.originalPrice && <span className="text-[10px] text-muted-foreground line-through">₹{item.originalPrice.toLocaleString()}</span>}
                    </div>
                    <Button size="sm" className="w-full text-xs h-8" onClick={() => handleMoveToCart(item)}>
                      <ShoppingBag size={14} className="mr-1.5" /> Move to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
