import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, Sparkles, Award, Zap, Banknote, Gift, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { trackEvent } from "@/services/analytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductImages } from "@/data/productImages";
import {
  useCatalogProductById,
  useCatalogProducts,
  getProductGalleryImages,
} from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductReviews from "@/components/ProductReviews";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isWelcomeOfferEligible, WELCOME_DISCOUNT_PERCENT } from "@/lib/welcomeOffer";
import CmsIcon from "@/components/CmsIcon";
import { useProductFeatures } from "@/hooks/useSiteSettings";

// Stone material/composition data
const stoneMaterials: Record<string, string> = {
  "Money Magnet": "Green Aventurine, Citrine, Pyrite composite blend",
  "Green Aventurine": "Natural Green Aventurine (Quartz family, Fuchsite inclusions)",
  "Turquoise": "Natural Turquoise (Hydrated Copper Aluminium Phosphate)",
  "Lapis": "Natural Lapis Lazuli (Lazurite, Calcite, Pyrite mix)",
  "Amethyst": "Natural Amethyst (Iron-bearing Silicon Dioxide)",
  "Citrine Natural": "Natural Citrine (Heat-treated Amethyst, SiO₂)",
  "Citrine": "Natural Citrine Quartz (Silicon Dioxide)",
  "Clear Quartz": "Natural Clear Quartz (Pure Silicon Dioxide crystal)",
  "Rose Quartz": "Natural Rose Quartz (Titanium/Manganese trace SiO₂)",
  "Sun Stone": "Natural Sunstone (Feldspar with Hematite/Goethite)",
  "Sunstone": "Natural Sunstone (Feldspar with copper inclusions)",
  "Green Jade": "Natural Nephrite Jade (Calcium Magnesium Silicate)",
  "Black Tourmaline": "Natural Black Tourmaline (Iron-rich Borosilicate)",
  "Pyrite": "Natural Iron Pyrite (Iron Disulfide, FeS₂)",
  "Golden Pyrite": "Premium Golden Pyrite (High-grade Iron Disulfide)",
  "Opal": "Natural Opal (Hydrated Amorphous Silica)",
  "Opalite": "Man-made Opalite (Dolomite & glass fusion)",
  "Hematite": "Natural Hematite (Iron Oxide, Fe₂O₃)",
  "Tiger Eye": "Natural Tiger Eye (Crocidolite-replaced Quartz)",
  "7 Chakra": "Multi-stone blend: Amethyst, Lapis, Aquamarine, Aventurine, Citrine, Carnelian, Garnet",
  "Rainbow Moon Stone": "Natural Rainbow Moonstone (Labradorite Feldspar)",
  "Rainbow Moonstone": "Natural Rainbow Moonstone (Labradorite Feldspar)",
  "Blue Gold Stone": "Blue Goldstone (Cobalt-infused glass with copper)",
  "Larvikite": "Natural Larvikite (Feldspar from Norway)",
  "Sodalite": "Natural Sodalite (Sodium Aluminium Silicate)",
  "Dalmatian": "Dalmatian Jasper (Feldspar with Black Tourmaline spots)",
  "Aquamarine": "Natural Aquamarine (Beryl family, Iron traces)",
  "Ruby Matrix": "Natural Ruby in Matrix (Corundum, Al₂O₃)",
  "Serpentine": "Natural Serpentine (Magnesium Silicate Hydroxide)",
  "Blood Stone": "Natural Bloodstone (Chalcedony with Iron Oxide)",
  "Amazonite": "Natural Amazonite (Green Microcline Feldspar)",
  "Black Onyx": "Natural Black Onyx (Chalcedony, SiO₂)",
  "Pink Onyx": "Natural Pink Onyx (Calcium Carbonate)",
  "Yellow Quartz": "Natural Yellow Quartz (Iron-trace Silicon Dioxide)",
  "Black Ocean Jasper": "Natural Ocean Jasper (Orbicular Chalcedony)",
};

// Stone healing properties
const stoneProperties: Record<string, string[]> = {
  "Money Magnet": ["Attracts financial abundance", "Removes money blocks", "Boosts prosperity energy", "Enhances business growth"],
  "Green Aventurine": ["Brings luck & opportunity", "Opens heart chakra", "Promotes emotional calm", "Attracts wealth"],
  "Turquoise": ["Master healer stone", "Protects travellers", "Enhances communication", "Balances mood"],
  "Lapis": ["Activates third eye", "Enhances wisdom", "Improves memory", "Stimulates truth-seeking"],
  "Amethyst": ["Calms the mind", "Enhances intuition", "Aids restful sleep", "Protects from negativity"],
  "Citrine": ["Manifests abundance", "Boosts self-confidence", "Ignites creativity", "Radiates positivity"],
  "Citrine Natural": ["Manifests abundance", "Boosts self-confidence", "Ignites creativity", "Radiates positivity"],
  "Clear Quartz": ["Master healer", "Amplifies energy", "Enhances clarity", "Programmable for any intention"],
  "Rose Quartz": ["Attracts unconditional love", "Heals emotional wounds", "Promotes self-love", "Opens heart chakra"],
  "Sun Stone": ["Boosts vitality", "Enhances leadership", "Dispels fear", "Promotes independence"],
  "Sunstone": ["Boosts vitality", "Enhances leadership", "Dispels fear", "Promotes independence"],
  "Green Jade": ["Promotes harmony", "Attracts good luck", "Supports emotional balance", "Enhances dreams"],
  "Black Tourmaline": ["Strongest protection stone", "Blocks negative energy", "Grounds & stabilizes", "Shields from EMF"],
  "Pyrite": ["Attracts wealth", "Boosts confidence", "Protects from harm", "Enhances willpower"],
  "Golden Pyrite": ["Attracts abundance", "Strengthens determination", "Promotes vitality", "Enhances willpower"],
  "Tiger Eye": ["Builds courage", "Sharpens focus", "Boosts self-confidence", "Attracts prosperity"],
  "Hematite": ["Grounding energy", "Sharpens mental focus", "Absorbs negativity", "Balances root chakra"],
  "7 Chakra": ["Aligns all 7 chakras", "Full-body energy balance", "Promotes spiritual growth", "Harmonizes mind-body"],
  "Rainbow Moon Stone": ["Enhances intuition", "Supports new beginnings", "Balances emotions", "Connects to divine feminine"],
  "Opal": ["Inspires creativity", "Enhances imagination", "Amplifies emotions", "Brings spontaneity"],
  "Opalite": ["Eases life transitions", "Enhances communication", "Stabilizes mood swings", "Promotes inner peace"],
};

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const showSignupOfferBadge = !isAdmin && (!user || isWelcomeOfferEligible(user.id));
  const navigate = useNavigate();
  const features = useProductFeatures();

  const { data: product } = useCatalogProductById(productId);
  const { data: allProducts = [] } = useCatalogProducts();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (product && !isAdmin) {
      trackEvent({
        eventType: "product_click",
        productId: product.id,
        productName: `${product.name} ${product.subCategory || ""}`,
        category: product.category,
        image: product.image,
      });
    }
  }, [productId, product, isAdmin]);

  const relatedProducts = product
    ? allProducts.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4)
    : [];

  const productIndex = product ? allProducts.findIndex((p) => p.id === product.id) : 0;
  const galleryImages = product
    ? getProductGalleryImages(
        product,
        getProductImages(product.categorySlug, product.subCategorySlug, productIndex),
      )
    : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <h1 className="text-2xl font-serif font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6 text-sm">The product you're looking for doesn't exist.</p>
            <Link to="/shop"><Button><ChevronLeft size={18} className="mr-2" />Back to Shop</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const stoneName = product.stone || product.name;
  const material = stoneMaterials[stoneName] || `Natural ${stoneName} crystal`;
  const properties = stoneProperties[stoneName] || [product.benefit];

  const handleAddToCart = () => {
    addToCart({
      id: product.id, name: `${product.name} ${product.subCategory}`, price: product.price,
      originalPrice: product.originalPrice, image: product.image, category: product.category, subCategory: product.subCategory,
    }, quantity);
  };

  const handleBuyNow = () => {
    if (isAdmin) {
      toast.error("Admins cannot buy products. Please log in as a customer.");
      return;
    }
    addToCart({
      id: product.id, name: `${product.name} ${product.subCategory}`, price: product.price,
      originalPrice: product.originalPrice, image: product.image, category: product.category, subCategory: product.subCategory,
    }, quantity, "/checkout");
    
    if (user) {
      navigate("/checkout");
    }
  };

  const handleToggleWishlist = () => {
    if (isAdmin) {
      toast.error("Admins cannot add products to wishlist. Please use a customer account.");
      return;
    }

    toggleWishlist({
      id: product.id, name: `${product.name} ${product.subCategory}`, price: product.price,
      originalPrice: product.originalPrice, image: product.image, category: product.category, subCategory: product.subCategory,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground mb-6 md:mb-8 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/category/${product.categorySlug}`} className="hover:text-foreground transition-colors">{product.category}</Link>
            <span>/</span>
            <Link to={`/category/${product.categorySlug}/${product.subCategorySlug}`} className="hover:text-foreground transition-colors">{product.subCategory}</Link>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
            {/* Product Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <ProductImageGallery images={galleryImages} productName={product.name} />
            </motion.div>

            {/* Product Info - Reordered */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
              {/* Product Name */}
              <span className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider mb-1">{product.subCategory}</span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold mb-3">{product.name} {product.subCategory}</h1>

              {/* About the Crystal */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm md:text-base">About this crystal</h3>
                <p className="text-muted-foreground leading-relaxed text-sm line-clamp-2">
                  This beautiful {product.name} is carefully selected for its exceptional quality and powerful
                  metaphysical properties. Known for its ability to {product.benefit.toLowerCase()}, this crystal
                  makes a perfect addition to your spiritual practice or as a meaningful gift.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg md:text-xl text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <Badge variant="destructive" className="text-xs">-{discount}% OFF</Badge>
                  </>
                )}
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="w-fit bg-accent/20 text-accent-foreground text-xs">
                  + Exclusive Gifts
                </Badge>
                <Badge variant="secondary" className="w-fit border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                  <Banknote size={12} className="mr-1" /> COD Available
                </Badge>
                {showSignupOfferBadge && (
                  <Link to={user ? "/cart" : "/auth?mode=signup&offer=welcome10"}>
                    <Badge
                      variant="secondary"
                      className="w-fit cursor-pointer border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/15 text-xs"
                    >
                      <Gift size={12} className="mr-1" />
                      {WELCOME_DISCOUNT_PERCENT}% Signup
                    </Badge>
                  </Link>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-medium text-sm">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></Button>
                  <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></Button>
                </div>
              </div>

              {/* Admin Notice */}
              {isAdmin && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                  <Shield size={18} className="flex-shrink-0" />
                  <span>Logged in as Admin. Please log in with a customer account to purchase crystals.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <Button 
                  size="lg" 
                  className="relative h-14 overflow-hidden rounded-full border border-primary/30 bg-[linear-gradient(135deg,hsl(var(--crystal-obsidian)),hsl(var(--primary)),hsl(var(--accent)))] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[0_18px_38px_-18px_hsl(var(--primary)/0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-18px_hsl(var(--accent)/0.9)] disabled:translate-y-0 disabled:opacity-50"
                  onClick={handleBuyNow}
                  disabled={isAdmin}
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                  <span className="relative flex items-center justify-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18">
                      <Zap size={16} />
                    </span>
                    Buy Now
                  </span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 rounded-full border-primary/35 bg-background/70 px-5 text-sm font-semibold uppercase tracking-[0.14em] text-foreground shadow-[0_14px_32px_-22px_hsl(var(--crystal-obsidian))] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary disabled:translate-y-0 disabled:opacity-50"
                  onClick={handleAddToCart}
                  disabled={isAdmin}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag size={16} />
                  </span>
                  <span className="ml-3">Add to Cart</span>
                </Button>
                {!isAdmin && (
                  <Button size="lg" variant="ghost" className="h-11 rounded-full sm:col-span-2 text-sm text-muted-foreground hover:text-primary" onClick={handleToggleWishlist}>
                    <Heart size={18} className="mr-2" fill={isWishlisted ? "currentColor" : "none"} />
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </Button>
                )}
              </div>

              {/* What it does */}
              <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-serif font-semibold mb-2 text-sm md:text-base text-primary flex items-center gap-2">
                  <Sparkles size={16} /> What This Crystal Does
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {properties.map((prop, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {prop}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Made Of */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                <h3 className="font-semibold text-xs md:text-sm mb-1">Made Of</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{material}</p>
              </div>

              {/* Authenticity Certificate */}
              <div className="mb-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <h3 className="font-semibold text-sm md:text-base text-green-600 flex items-center gap-2 mb-1">
                  <Award size={16} /> Authenticity Certificate Included
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">Every crystal comes with a Certificate of Authenticity verifying it is 100% natural and energetically cleansed.</p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={`${feature.text}-${index}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <CmsIcon
                      iconUrl={feature.iconUrl}
                      fallbackIcon={feature.fallbackIcon}
                      className="w-4 h-4 text-primary flex-shrink-0"
                      imageClassName="w-4 h-4 object-contain flex-shrink-0"
                      alt={feature.text}
                    />
                    <span className="text-xs md:text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <ProductReviews productId={product.id} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-16 md:mt-20">
              <h2 className="text-xl md:text-3xl font-serif font-bold mb-6 md:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {relatedProducts.map((rp, index) => (
                  <ProductCard key={rp.id} product={{ id: rp.id, name: `${rp.name} ${rp.subCategory}`, price: rp.price, originalPrice: rp.originalPrice, image: rp.image, category: rp.category, benefit: rp.benefit }} index={index} linkTo={`/product/${rp.id}`} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
