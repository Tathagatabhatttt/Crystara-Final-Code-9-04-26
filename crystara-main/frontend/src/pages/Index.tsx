import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import AllCategories from "@/components/AllCategories";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";
 
const HappyCustomersBanner = () => (
  <section className="py-6 sm:py-10">
    <div className="container mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-4 sm:p-6 border border-primary/20"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <Users className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
        </motion.div>
        <div>
          <p className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-primary uppercase">1200+ Happy Souls & Aura's Energized</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Trusted by crystal lovers across India</p>
        </div>
      </motion.div>
    </div>
  </section>
);
 
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <AllCategories />
        <HappyCustomersBanner />
        <BenefitsSection />
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
