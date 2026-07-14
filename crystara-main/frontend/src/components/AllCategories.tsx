import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import categoryBracelets from "@/assets/category-bracelets.jpg";
import categoryRing from "@/assets/category-ring.jpg";
import categoryLocket from "@/assets/category-locket.jpg";
import categoryBeadsBracelet from "@/assets/category-beads-bracelet.jpg";

const categories = [
  {
    name: "Bracelets",
    description: "Beads & chip bracelets",
    image: categoryBracelets,
    href: "/category/bracelets",
  },
  {
    name: "Rings",
    description: "Crystal energy rings",
    image: categoryRing,
    href: "/category/rings",
  },
  {
    name: "Lockets",
    description: "Healing crystal pendants",
    image: categoryLocket,
    href: "/category/lockets",
  },
  {
    name: "Combos",
    description: "Power synergy sets",
    image: categoryBeadsBracelet,
    href: "/category/combos",
  },
];

const AllCategories = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-secondary/5 border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-2 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Discover natural crystal collection items categorized by form and synergistic intention.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <Link to={category.href} className="block space-y-3">
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] shadow-crystal border border-border/20 bg-secondary/15 hover:shadow-glow transition-all duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Quick Action Icon */}
                  <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Absolute positioning inside card text for mobile / sleekness */}
                  <div className="absolute bottom-4 left-4 right-12 text-left text-white">
                    <h3 className="text-base sm:text-xl font-sans font-bold leading-tight tracking-tight">
                      {category.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-zinc-300/90 line-clamp-1 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllCategories;
