import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productCatalog } from "@/data/products";

const ShopCollections = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 sm:pt-24">
        <section className="py-12 sm:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
                Shop Collections
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Explore our complete range of authentic healing crystals, carefully curated for you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {productCatalog.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-crystal transition-shadow duration-300"
                >
                  <Link to={`/category/${category.slug}`}>
                    <div className="p-5 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                        {category.subCategories.length} varieties available
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {category.subCategories.slice(0, 4).map((sub) => (
                          <span
                            key={sub.id}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
                          >
                            {sub.name}
                          </span>
                        ))}
                        {category.subCategories.length > 4 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            +{category.subCategories.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-primary text-xs sm:text-sm font-medium">
                        Shop {category.name}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-10 sm:mt-14"
            >
              <Link to="/shop">
                <Button size="lg" className="group px-8">
                  View All Products
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ShopCollections;
