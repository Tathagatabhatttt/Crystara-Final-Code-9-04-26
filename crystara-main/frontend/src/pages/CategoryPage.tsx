import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useCatalogStructure,
  useCatalogProductsByCategory,
  useCatalogProductsBySubCategory,
} from "@/hooks/useCatalog";

const CategoryPage = () => {
  const { categorySlug, subCategorySlug } = useParams<{ 
    categorySlug: string; 
    subCategorySlug?: string 
  }>();

  const { data: productCatalog } = useCatalogStructure();
  const { data: categoryProducts } = useCatalogProductsByCategory(categorySlug);
  const { data: subCategoryProducts } = useCatalogProductsBySubCategory(
    categorySlug,
    subCategorySlug,
  );

  const category = productCatalog.find((c) => c.slug === categorySlug);
  const subCategoryIndex = category
    ? category.subCategories.findIndex((s) => s.slug === subCategorySlug)
    : -1;
  const subCategory = category?.subCategories.find((s) => s.slug === subCategorySlug);
  const subCategoryDisplayName = subCategoryIndex !== -1 ? `Combo ${subCategoryIndex + 1}` : undefined;

  const products = subCategorySlug && categorySlug
    ? subCategoryProducts
    : categoryProducts;

  const title = subCategoryDisplayName || category?.name || "Products";
  const description = subCategoryDisplayName
    ? `Explore our collection of ${subCategory?.name || ""} crystals`
    : category
    ? `Discover all ${category.name} in our collection`
    : "Browse our crystal collection";
  const shouldNumberProducts = false;

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The category you're looking for doesn't exist.
            </p>
            <Link to="/shop">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
                Back to Shop
              </button>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-16"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            {subCategory ? (
              <>
                <Link 
                  to={`/category/${categorySlug}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
                <span className="text-foreground">{subCategoryDisplayName}</span>
              </>
            ) : (
              <span className="text-foreground">{category.name}</span>
            )}
          </nav>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">
            {title.split(' ')[0]} <span className="text-gradient-mystic">{title.split(' ').slice(1).join(' ') || ''}</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            {description}
          </p>

          {/* Sub-category filters */}
          {category.subCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Link
                to={`/category/${categorySlug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !subCategorySlug
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                All {category.name}
              </Link>
              {category.subCategories.map((sub, idx) => {
                const isActive = subCategorySlug === sub.slug;
                return (
                  <Link
                    key={sub.id}
                    to={`/category/${categorySlug}/${sub.slug}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    Combo {idx + 1}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => {
              const isCombo = categorySlug === "combos";

              if (isCombo) {
                return (
                  <ComboProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                );
              }

              return (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: shouldNumberProducts ? `Combo ${index + 1}` : `${product.name} ${product.subCategory}`,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.image,
                    category: product.category,
                    benefit: product.benefit,
                  }}
                  index={index}
                  linkTo={`/product/${product.id}`}
                />
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const ComboProductCard = ({ product, index }: { product: any; index: number }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

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
    toast.success("Added combo to cart!");
  };

  const getReviewCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 200) + 45;
  };

  const reviews = getReviewCount(String(product.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.03, 0.15) }}
      className="group bg-card/45 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-border/20 hover:border-primary/30 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image container */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary/5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          loading="lazy"
        />

        {/* Premium Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-rose-500/90 text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
            {discount}% OFF
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
            <h3 className="font-serif font-semibold text-foreground text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
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
            <span className="text-base sm:text-lg font-serif font-bold text-primary">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground/60 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-zinc-950 hover:bg-zinc-900 text-white border border-white/10 hover:border-primary/20 rounded-full h-8 px-3.5 text-xs font-semibold flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryPage;
