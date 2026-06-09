import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useCatalogFeaturedProducts } from "@/hooks/useCatalog";

const FeaturedProducts = () => {
  const { data: products } = useCatalogFeaturedProducts(4);

  return (
    <section className="py-8 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-4 sm:mb-12"
        >
          <div>
            <h2 className="text-lg sm:text-3xl md:text-4xl font-serif font-bold mb-1 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground max-w-xl hidden sm:block">
              
            </p>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="group text-xs sm:text-base p-0 sm:p-2 h-auto">
              View All
              <ArrowRight className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="bg-card rounded-xl shadow-sm border border-border/50">
              <ProductCard
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
