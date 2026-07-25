import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, ArrowRight, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useState } from "react";

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
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  onRemove={removeFromWishlist}
                  onMoveToCart={handleMoveToCart}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

type WishlistItem = ReturnType<typeof useWishlist>["items"][number];

const WishlistItemCard = ({
  item,
  onRemove,
  onMoveToCart,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onMoveToCart: (item: WishlistItem) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  // Wishlist items carry only one image currently; structure is ready for multiple
  const images = [item.image].filter(Boolean) as string[];

  const slideTo = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: "smooth" });
    setCurrentIdx(idx);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) setCurrentIdx(Math.round(scrollLeft / clientWidth));
  };

  const discount = item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl overflow-hidden border border-border group relative flex flex-col"
    >
      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-20 w-7 h-7 bg-background/80 rounded-full"
        onClick={() => onRemove(item.id)}
      >
        <X size={14} />
      </Button>

      {/* Scroll gallery */}
      <div className="relative aspect-square overflow-hidden bg-secondary/5 group/slider">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {images.map((img, idx) => (
            <Link key={idx} to={`/product/${item.id}`} className="w-full h-full flex-shrink-0 snap-start block">
              <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </Link>
          ))}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none z-10">
            {discount}% OFF
          </div>
        )}

        {/* Chevrons */}
        {images.length > 1 && (
          <>
            {currentIdx > 0 && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); slideTo(currentIdx - 1); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 z-10">
                <ChevronLeft size={16} />
              </button>
            )}
            {currentIdx < images.length - 1 && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); slideTo(currentIdx + 1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 z-10">
                <ChevronRight size={16} />
              </button>
            )}
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <button key={idx} onClick={(e) => { e.preventDefault(); e.stopPropagation(); slideTo(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${idx === currentIdx ? "bg-emerald-500 scale-125" : "bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{item.category}</p>
          <Link to={`/product/${item.id}`}>
            <h3 className="font-serif font-semibold text-sm line-clamp-2 hover:text-primary">{item.name}</h3>
          </Link>
          <div className="flex flex-col items-start sm:flex-row sm:items-center gap-0.5 sm:gap-2 my-1.5">
            <span className="text-sm font-bold text-primary leading-none">₹{item.price.toLocaleString()}</span>
            {item.originalPrice && <span className="text-[10px] text-slate-500 dark:text-slate-400 line-through leading-none">₹{item.originalPrice.toLocaleString()}</span>}
          </div>
        </div>
        <Button size="sm" className="w-full text-xs h-8 mt-2" onClick={() => onMoveToCart(item)}>
          <ShoppingBag size={14} className="mr-1.5" /> Move to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default Wishlist;
