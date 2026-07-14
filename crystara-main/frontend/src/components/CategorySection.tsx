import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useHomepageCategories } from "@/hooks/useSiteSettings";

const getCategoryLabel = (name: string, href: string) => {
  const normalizedHref = href.toLowerCase();
  if (normalizedHref.includes("/category/rings")) return "Rings";
  if (normalizedHref.includes("beads-bracelet")) return "Beads";
  return name;
};

const CategorySection = () => {
  const categories = useHomepageCategories();

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-gradient-aurora">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-4">
            Best Selling Combos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Experience the power of synergistic crystals, handpicked to amplify your specific intentions.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={`${category.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Link to={category.href} className="group block space-y-2.5 sm:space-y-3">
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md border border-border/40 bg-secondary/15">
                  <img
                    src={category.image}
                    alt={getCategoryLabel(category.name, category.href)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
                </div>
                
                {/* Text underneath, left-aligned and bold */}
                <div className="px-1 text-left">
                  <h3 className="text-base sm:text-lg md:text-xl font-sans font-bold text-foreground leading-tight tracking-tight transition-colors group-hover:text-primary">
                    {getCategoryLabel(category.name, category.href)}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
