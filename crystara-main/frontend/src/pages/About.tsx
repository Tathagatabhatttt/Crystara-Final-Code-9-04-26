import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Gem, Shield, Sparkles, Truck, Award, Heart, Globe, Mail, MessageCircle, Diamond, Leaf, Droplets, Hammer, BookOpen, Package } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Diamond className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                About <span className="text-gradient-mystic">Crystara</span>
              </h1>
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed max-w-xl mx-auto">
                Bridging the ancient wisdom of the earth with modern luxury. Discover the journey of energy, intuition, and ethereal beauty.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 sm:py-20">
          {/* Our Story & Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-5xl mx-auto mb-20 sm:mb-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-6">Our Story</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">The Alchemist's Vision</h2>
                <p className="text-foreground/80 mb-6 leading-relaxed text-sm">
                  Founded in 2020, Crystara began with a singular mission: to strip away the tropes of the metaphysical world and reveal the raw, architectural beauty of healing stones.
                </p>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  We believe that luxury and spirituality aren't mutually exclusive. Every piece in our collection is hand-sourced, ensuring that the vibrational integrity of the crystal matches the aesthetic purity of your modern lifestyle.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: "1200+", label: "HAPPY SOULS" },
                  { number: "45+", label: "GLOBAL ORIGINS" },
                  { number: "15k", label: "CRYSTAL CURATIONS" },
                  { number: "24/7", label: "ENERGY SUPPORT" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 md:p-8 rounded-xl bg-card border border-border flex flex-col items-center justify-center">
                    <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.number}</p>
                    <p className="text-[10px] text-primary font-bold tracking-widest">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Ethical Curation */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 sm:mb-28">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ethical Curation</h2>
              <p className="text-foreground/80 max-w-xl mx-auto text-sm">Beyond beauty, we prioritize the lineage and impact of every stone.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Authenticated Source", description: "Every crystal is accompanied by a certificate of authenticity and origin report." },
                { icon: Leaf, title: "Sustainable Mining", description: "We partner exclusively with family-owned mines that respect local ecosystems." },
                { icon: Sparkles, title: "Energetic Cleansing", description: "All items are cleansed with sound and sage before they leave our boutique sanctuary." },
                { icon: Hammer, title: "Artisan Jewelry", description: "Our jewelry is handcrafted using recycled precious metals and conflict-free gems." },
                { icon: BookOpen, title: "Expert Guidance", description: "Access to certified crystal therapists to help you choose your spiritual path." },
                { icon: Package, title: "Zero Plastic", description: "Sustainable, premium packaging designed to be kept and reused as keepsake boxes." },
              ].map((item, index) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-8 border border-border hover:border-primary/30 transition-all">
                  <item.icon className={`w-5 h-5 text-primary mb-4`} />
                  <h3 className="text-lg font-serif font-semibold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-xs text-foreground/70 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Our Global Mission */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto mb-20 sm:mb-28">
            <div className="bg-card rounded-2xl p-10 md:p-14 text-center">
              <Globe className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6 text-foreground">Our Global Mission</h2>
              <p className="text-foreground/80 leading-relaxed text-sm md:text-base max-w-2xl mx-auto italic">
                "To democratize high-vibrational living by curating the world's most exquisite crystals, fostering a global community of mindful individuals who seek balance in an increasingly digital world."
              </p>
            </div>
          </motion.div>

          {/* Connect Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-8">Connect With Our Alchemists</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:support@crystara.in" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#5d4496] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                <Mail size={16} /> support@crystara.in
              </a>
              <a href="https://wa.me/917980133886" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                <MessageCircle size={16} /> WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
