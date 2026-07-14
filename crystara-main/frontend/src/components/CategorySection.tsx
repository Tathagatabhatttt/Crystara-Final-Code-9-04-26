import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useHomepageCategories } from "@/hooks/useSiteSettings";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CategorySection = () => {
  const homepageSlots = useHomepageCategories();
  const { data: allProducts } = useCatalogProducts();
  const { addToCart } = useCart();

  const getReviewCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 200) + 45;
  };

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
          {homepageSlots.map((slot, index) => {
            // Find the linked product
            const isProductLink = slot.href?.startsWith("/product/") || false;
            const productId = isProductLink ? slot.href.replace("/product/", "") : "";
            const linkedProduct = allProducts?.find((p) => p.id === productId);

            // Fallback product if no product is selected/found (use static combos for slots 1-4)
            const fallbackProducts = allProducts?.filter(p => p.categorySlug === "combos") || [];
            // Map indexes to show different combos in slots
            const productIndex = (index + 1) % Math.max(1, fallbackProducts.length);
            const product = linkedProduct || fallbackProducts[productIndex];

            if (!product) return null;

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
                key={`${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group bg-card/45 hover:bg-card/75 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image container */}
                <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary/5">
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    loading="lazy"
                  />
                  {/* Premium Discount Badge */}
                  {Math.round(((originalPrice - price) / originalPrice) * 100) > 0 && (
                    <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm animate-pulse">
                      {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                    </div>
                  )}
                </Link>

                {/* Info Block */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    {/* Category */}
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
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
                      <span className="text-[10px] sm:text-xs text-muted-foreground/80 ml-0.5">({reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Pricing & Add Button */}
                  <div className="flex items-center justify-between border-t border-border/10 pt-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-serif font-bold text-primary">₹{price.toLocaleString()}</span>
                      {originalPrice && (
                        <span className="text-xs text-muted-foreground/60 line-through">₹{originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={handleAddToCart}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full h-8 px-4 text-xs font-semibold flex items-center gap-1 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 border-none"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
