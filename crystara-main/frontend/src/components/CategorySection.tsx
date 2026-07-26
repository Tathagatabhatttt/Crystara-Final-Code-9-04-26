import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useHomepageCategories } from "@/hooks/useSiteSettings";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { getProductImages } from "@/data/productImages";
import { Price } from "@/components/Price";

interface CategoryProductCardProps {
  slot: any;
  product: any;
  index: number;
  isProductLink: boolean;
  addToCart: any;
}

const CategoryProductCard = ({ slot, product, index, isProductLink, addToCart }: CategoryProductCardProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const getReviewCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 200) + 45;
  };

  // Resolve name, price, original price, and image with custom overrides
  // Only apply custom overrides if the slot is explicitly linked to a product
  const displayName = isProductLink && slot.name && slot.name !== "" ? slot.name : product.name;
  
  // Clean custom price input and convert to number if present
  const customPriceRaw = isProductLink && slot.description ? parseFloat(slot.description.replace(/[^\d.]/g, "")) : NaN;
  const price = !isNaN(customPriceRaw) ? customPriceRaw : product.price;

  // Determine discount/original price
  const originalPrice = product.originalPrice || Math.round(price * 1.5);
  
  const displayImage = isProductLink && slot.image && slot.image !== "" ? slot.image : product.image;

  const reviews = getReviewCount(String(product.id));

  // Extract all gallery images — use Supabase/Sanity galleryImages if available,
  // otherwise fall back to category-based CDN images so we always have multiple slides
  const rawGallery: string[] = Array.isArray(product.galleryImages) && product.galleryImages.length > 0
    ? product.galleryImages
    : getProductImages(product.categorySlug || "bracelets", product.subCategorySlug || "beads-bracelet", index);
  const images = Array.from(new Set([displayImage, ...rawGallery].filter(Boolean))) as string[];

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
      name: displayName,
      price: price,
      originalPrice: originalPrice,
      image: displayImage,
      category: product.category || "Combos",
      subCategory: product.subCategory || "Combo Offers",
    });
    toast.success("Added combo to cart!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-card/45 hover:bg-card/75 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image container with horizontal scroll snap */}
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
              to={`/product/${product.id}`}
              className="w-full h-full flex-shrink-0 snap-start block"
            >
              <img
                src={img}
                alt={displayName}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                loading="lazy"
              />
            </Link>
          ))}
        </div>

        {/* Premium Discount Badge */}
        {Math.round(((originalPrice - price) / originalPrice) * 100) > 0 && (
          <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none z-10">
            {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Desktop navigation chevrons */}
        {images.length > 1 && (
          <>
            {currentImgIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md transition-all opacity-0 group-hover/slider:opacity-100 duration-200 z-10"
              >
                <ChevronLeft size={16} className="text-foreground" />
              </button>
            )}
            {currentImgIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md transition-all opacity-0 group-hover/slider:opacity-100 duration-200 z-10"
              >
                <ChevronRight size={16} className="text-foreground" />
              </button>
            )}
          </>
        )}

        {/* Slider dots indicator */}
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
      </div>

      {/* Info Block */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3 border-t border-emerald-500/10 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/70 dark:from-emerald-950/35 dark:via-card dark:to-teal-950/30">
        <div className="space-y-1.5">
          {/* Category */}
          <p className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider">
            {product.category || "Combo Offers"}
          </p>

          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-serif font-semibold text-foreground text-sm sm:text-base line-clamp-2 hover:text-emerald-400 transition-colors leading-snug min-h-[2.5rem]">
              {displayName}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 fill-current animate-pulse" viewBox="0 0 20 20" style={{ animationDelay: `${i * 150}ms`, animationDuration: '3s' }}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 ml-0.5">({reviews} reviews)</span>
          </div>
        </div>

        {/* Pricing & Add Button */}
        <div className="flex items-center justify-between border-t border-border/10 pt-2.5 gap-2">
          <div className="flex flex-col items-start sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 min-w-0">
            <Price amount={price} className="text-sm sm:text-base md:text-lg text-primary" />
            {originalPrice && (
              <Price
                amount={originalPrice}
                strike
                className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400"
              />
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full h-7 sm:h-8 px-2.5 sm:px-4 text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 border-none shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CategorySection = () => {
  const homepageSlots = useHomepageCategories();
  const { data: allProducts } = useCatalogProducts();
  const { addToCart } = useCart();

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-gradient-aurora">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-4">
            Best Selling Combos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Experience the power of synergistic crystals, handpicked to amplify your specific intentions.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(() => {
            // First, resolve explicitly linked products across all slots
            const resolvedSlots = homepageSlots.map((slot) => {
              const isProductLink = slot.href?.startsWith("/product/") || false;
              const productId = isProductLink ? slot.href.replace("/product/", "") : "";
              const linkedProduct = allProducts?.find((p) => p.id === productId);
              return { slot, isProductLink, linkedProduct };
            });

            // Gather the IDs of all resolved products to avoid duplicating them as fallbacks
            const usedProductIds = new Set(
              resolvedSlots
                .map((s) => s.linkedProduct?.id)
                .filter(Boolean)
            );

            const fallbackProducts = allProducts?.filter(p => p.categorySlug === "combos") || [];

            // Map each slot to its final product, assigning unused fallbacks where possible
            const finalSlots = resolvedSlots.map((item, index) => {
              if (item.linkedProduct) {
                return { ...item, product: item.linkedProduct };
              }

              // Find a fallback product that hasn't been used yet
              const unusedFallback = fallbackProducts.find(p => !usedProductIds.has(p.id));
              let fallbackProduct = unusedFallback;

              if (fallbackProduct) {
                usedProductIds.add(fallbackProduct.id);
              } else {
                // If all fallbacks are already used, fall back to index-based mapping
                const productIndex = (index + 1) % Math.max(1, fallbackProducts.length);
                fallbackProduct = fallbackProducts[productIndex];
              }

              return { ...item, product: fallbackProduct };
            });

            return finalSlots.map(({ slot, isProductLink, product }, index) => {
              if (!product) return null;

              return (
                <CategoryProductCard
                  key={`${product.id}-${index}`}
                  slot={slot}
                  product={product}
                  index={index}
                  isProductLink={isProductLink}
                  addToCart={addToCart}
                />
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
