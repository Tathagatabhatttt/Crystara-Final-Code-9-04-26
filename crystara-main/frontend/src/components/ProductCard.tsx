import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useState } from "react";

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    subCategory?: string;
    tag?: string;
    benefit?: string;
    galleryImages?: string[];
  };
  index?: number;
  linkTo?: string;
}

const ProductCard = ({ product, index = 0, linkTo }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const productLink = linkTo || `/product/${product.id}`;
  const wishlisted = isInWishlist(String(product.id));

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = Array.from(new Set([product.image, ...(product.galleryImages || [])].filter(Boolean)));

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const width = scrollContainerRef.current.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentImgIndex) {
        setCurrentImgIndex(newIndex);
      }
    }
  };

  const slideTo = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: idx * width,
      behavior: "smooth",
    });
    setCurrentImgIndex(idx);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImgIndex < images.length - 1) {
      slideTo(currentImgIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImgIndex > 0) {
      slideTo(currentImgIndex - 1);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      subCategory: product.subCategory,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      subCategory: product.subCategory,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.03, 0.15) }}
      className="group"
    >
      <div className="relative bg-card rounded-lg sm:rounded-xl overflow-hidden shadow-crystal hover:shadow-glow transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden bg-secondary/5 group/slider">
          {/* Scroll snap container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          >
            {images.map((img, idx) => (
              <Link
                key={idx}
                to={productLink}
                className="w-full h-full flex-shrink-0 snap-start block"
              >
                <img
                  src={img}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>

          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {discount > 0 && <Badge variant="destructive" className="text-[11px] sm:text-xs font-bold px-2 py-0.5 shadow-sm">{discount}% OFF</Badge>}
            <Badge variant="secondary" className="bg-accent text-accent-foreground text-[9px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 hidden sm:inline-flex">+ Exclusive Gifts</Badge>
          </div>

          {/* Mobile: always-visible wishlist button */}
          {!isAdmin && (
            <button
              onClick={handleToggleWishlist}
              className="absolute top-1.5 right-1.5 sm:hidden w-7 h-7 rounded-full bg-background/80 flex items-center justify-center z-10"
            >
              <Heart size={13} className={wishlisted ? "fill-primary text-primary" : "text-foreground/60"} />
            </button>
          )}

          {/* Desktop: hover icons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:flex z-10">
            {!isAdmin && (
              <Button size="icon" variant="secondary" className={`w-8 h-8 rounded-full ${wishlisted ? 'bg-primary text-primary-foreground' : 'bg-background/90 hover:bg-background'}`} onClick={handleToggleWishlist}>
                <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
              </Button>
            )}
            <Link to={productLink}>
              <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-background/90 hover:bg-background">
                <Eye size={14} />
              </Button>
            </Link>
          </div>

          {/* Desktop Left/Right Arrows */}
          {images.length > 1 && (
            <>
              {currentImgIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md transition-opacity opacity-0 group-hover/slider:opacity-100 duration-200 z-10"
                >
                  <ChevronLeft size={16} className="text-foreground" />
                </button>
              )}
              {currentImgIndex < images.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md transition-opacity opacity-0 group-hover/slider:opacity-100 duration-200 z-10"
                >
                  <ChevronRight size={16} className="text-foreground" />
                </button>
              )}
            </>
          )}

          {/* Slider Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    slideTo(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    idx === currentImgIndex
                      ? "bg-emerald-500 scale-125 shadow-sm"
                      : "bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Desktop: hover add to cart */}
          {!isAdmin && (
            <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:block z-10">
              <Button className="w-full text-xs h-8" size="sm" onClick={handleAddToCart}>
                <ShoppingBag size={14} className="mr-1.5" /> Add to Cart
              </Button>
            </div>
          )}
        </div>

        <Link to={productLink} className="block p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{product.category}</p>
          <h3 className="font-serif font-semibold text-foreground text-xs sm:text-sm mb-0.5 line-clamp-1 sm:line-clamp-2">{product.name}</h3>
          {product.benefit && <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-1 hidden sm:block">{product.benefit}</p>}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-base font-bold text-primary leading-none">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && <span className="text-[9px] sm:text-xs text-muted-foreground line-through leading-none">₹{product.originalPrice.toLocaleString()}</span>}
            </div>
            {/* Mobile: inline Add button */}
            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                className="sm:hidden bg-primary text-primary-foreground text-[10px] font-medium px-2 py-1 rounded-md shrink-0"
              >
                Add
              </button>
            )}
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
