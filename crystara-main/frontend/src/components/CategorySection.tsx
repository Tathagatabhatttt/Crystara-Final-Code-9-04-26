import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useHomepageCategories } from "@/hooks/useSiteSettings";

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

        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {categories.map((category, index) => (
            <motion.div
              key={`${category.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link to={category.href} className="group block relative overflow-hidden rounded-xl aspect-square shadow-crystal border border-white/10">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                  <h3 className="text-base font-serif font-bold text-white mb-0.5 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{category.name}</h3>
                  <p className="text-xs font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{category.description}</p>
                </div>
                <div className="absolute inset-0 border-2 border-white/15 rounded-xl pointer-events-none transition-all duration-300 group-hover:border-primary/80" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.map((category, index) => (
            <motion.div
              key={`${category.name}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={category.href} className="group block relative overflow-hidden rounded-xl aspect-square shadow-crystal border border-white/10">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                  <h3 className="text-lg md:text-2xl font-serif font-bold text-white mb-1 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{category.name}</h3>
                  <p className="text-sm md:text-base font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{category.description}</p>
                </div>
                <div className="absolute inset-0 border-2 border-white/15 rounded-xl pointer-events-none transition-all duration-300 group-hover:border-primary/80" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
