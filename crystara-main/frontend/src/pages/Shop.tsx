import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useCatalogFeaturedProducts } from "@/hooks/useCatalog";

const Shop = () => {
  const { data: products } = useCatalogFeaturedProducts(16);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-6 sm:py-16"
        >
          <h1 className="text-xl sm:text-4xl md:text-5xl font-serif font-bold text-center mb-1 sm:mb-4">
            Shop All <span className="text-gradient-mystic">Crystals</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground text-center max-w-2xl mx-auto mb-4 sm:mb-12">
            Explore our complete collection of handpicked healing crystals and spiritual products.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: `${product.name} ${product.subCategory}`,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.image,
                  category: product.category,
                  benefit: product.benefit,
                }}
                index={index}
                linkTo={`/product/${product.id}`}
              />
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
