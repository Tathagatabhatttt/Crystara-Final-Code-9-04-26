import { motion } from "framer-motion";
import CmsIcon from "@/components/CmsIcon";
import { useBenefitCards } from "@/hooks/useSiteSettings";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const BenefitsSection = () => {
  const benefits = useBenefitCards();

  return (
    <section className="py-8 sm:py-16 md:py-20 bg-gradient-crystal relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 sm:mb-14 md:mb-16"
        >
          <h2 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-1 sm:mb-4">
            The Crystara Standard
          </h2>
          <p className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Where ethical sourcing meets unparalleled quality.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative bg-card p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border hover:border-primary/30 transition-all duration-500 h-full">
                <motion.div
                  className="absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 overflow-hidden rounded-tr-xl sm:rounded-tr-2xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className={`absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br ${benefit.gradient} rotate-45 group-hover:scale-150 transition-transform duration-500`} />
                </motion.div>

                <motion.div
                  className={`w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-2 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <CmsIcon
                    iconUrl={benefit.iconUrl}
                    fallbackIcon={benefit.fallbackIcon}
                    className={`w-4 h-4 sm:w-7 sm:h-7 ${benefit.iconColor}`}
                    imageClassName="w-4 h-4 sm:w-7 sm:h-7 object-contain"
                    alt={benefit.title}
                  />
                </motion.div>

                <h3 className="text-xs sm:text-xl font-serif font-semibold mb-0.5 sm:mb-3 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>

                <p className="text-[10px] sm:text-sm md:text-base text-muted-foreground leading-snug sm:leading-relaxed">
                  {benefit.description}
                </p>

                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-b-xl sm:rounded-b-2xl"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
