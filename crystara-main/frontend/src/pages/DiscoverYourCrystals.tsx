import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Zap } from "lucide-react";

const destinyNumbers = {
  1: {
    name: "The Leader",
    description: "Independent, ambitious, and pioneering. You are meant to lead and create new paths.",
    stones: ["Tiger Eye", "Carnelian", "Pyrite", "Citrine", "Sunstone"],
    color: "from-yellow-500 to-orange-500",
    traits: ["Leadership", "Independence", "Innovation", "Courage"],
  },
  2: {
    name: "The Diplomat",
    description: "Harmonious, cooperative, and intuitive. You excel at bringing people together.",
    stones: ["Rose Quartz", "Moonstone", "Pearl", "Aquamarine", "Lepidolite"],
    color: "from-pink-500 to-purple-500",
    traits: ["Harmony", "Intuition", "Cooperation", "Sensitivity"],
  },
  3: {
    name: "The Creator",
    description: "Expressive, optimistic, and creative. You're here to inspire and entertain.",
    stones: ["Citrine", "Sunstone", "Amber", "Golden Topaz", "Carnelian"],
    color: "from-yellow-400 to-pink-500",
    traits: ["Creativity", "Expression", "Optimism", "Communication"],
  },
  4: {
    name: "The Builder",
    description: "Practical, reliable, and grounded. You build lasting foundations.",
    stones: ["Hematite", "Black Tourmaline", "Smoky Quartz", "Jasper", "Magnetite"],
    color: "from-gray-600 to-brown-700",
    traits: ["Stability", "Discipline", "Reliability", "Practicality"],
  },
  5: {
    name: "The Adventurer",
    description: "Dynamic, curious, and free-spirited. You embrace change and seek adventure.",
    stones: ["Agate", "Tourmaline", "Fluorite", "Aventurine", "Amazonite"],
    color: "from-teal-500 to-blue-500",
    traits: ["Freedom", "Curiosity", "Adaptability", "Energy"],
  },
  6: {
    name: "The Nurturer",
    description: "Loving, responsible, and caring. You're devoted to helping others.",
    stones: ["Rose Quartz", "Green Aventurine", "Jade", "Tourmaline", "Malachite"],
    color: "from-green-500 to-pink-500",
    traits: ["Compassion", "Responsibility", "Love", "Caring"],
  },
  7: {
    name: "The Seeker",
    description: "Spiritual, analytical, and introspective. You seek truth and wisdom.",
    stones: ["Amethyst", "Lapis Lazuli", "Sodalite", "Labradorite", "Clear Quartz"],
    color: "from-indigo-600 to-purple-500",
    traits: ["Spirituality", "Wisdom", "Intuition", "Analysis"],
  },
  8: {
    name: "The Achiever",
    description: "Ambitious, powerful, and goal-oriented. You're driven to succeed.",
    stones: ["Citrine", "Pyrite", "Golden Topaz", "Garnet", "Ruby"],
    color: "from-red-600 to-gold-500",
    traits: ["Ambition", "Power", "Success", "Confidence"],
  },
  9: {
    name: "The Humanitarian",
    description: "Compassionate, universal, and generous. You're here to serve humanity.",
    stones: ["Smoky Quartz", "Amazonite", "Lepidolite", "Prehnite", "Aquamarine"],
    color: "from-purple-500 to-blue-500",
    traits: ["Compassion", "Idealism", "Generosity", "Wisdom"],
  },
};

const DiscoverYourCrystals = () => {
  const [searchParams] = useSearchParams();
  const destiny = parseInt(searchParams.get("destiny") || "1");
  const dob = searchParams.get("dob");

  const destinyInfo = destinyNumbers[destiny as keyof typeof destinyNumbers] || destinyNumbers[1];
  const allProducts = getAllProducts();

  const filteredProducts = allProducts.filter((p) =>
    destinyInfo.stones.some((s) => p.name.toLowerCase().includes(s.toLowerCase()))
  );

  const seen = new Set<string>();
  const uniqueProducts = filteredProducts.filter((p) => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Destiny Number Hero */}
      <section className={`py-16 sm:py-20 md:py-24 bg-gradient-to-r ${destinyInfo.color}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Zap className="w-8 h-8 text-white animate-pulse" />
              <span className="text-sm sm:text-base font-bold tracking-[0.3em] uppercase text-white/90">Your Destiny Number</span>
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>

            <div className="mb-8 inline-block">
              <div className="text-8xl sm:text-9xl font-bold text-white drop-shadow-lg">{destiny}</div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 text-white">
              {destinyInfo.name}
            </h1>

            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
              {destinyInfo.description}
            </p>

            {dob && (
              <p className="text-sm sm:text-base text-white/70 mt-6">
                ✨ Based on your birth date: {new Date(dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Traits Section */}
      <section className="py-12 sm:py-16 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinyInfo.traits.map((trait, index) => (
              <motion.div
                key={trait}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
              >
                <p className="text-white/70 text-sm font-medium">{trait}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Crystals */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Your Power Crystals
              </h2>
            </div>

            <p className="text-white/60 mb-12 max-w-2xl">
              These crystals resonate with your destiny number and will amplify your natural talents and strengths.
            </p>

            {uniqueProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {uniqueProducts.slice(0, 12).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-white/60 text-lg">
                  We're preparing your crystal recommendations. Please check back soon!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 sm:py-20 border-t border-white/10 bg-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-6 text-white">
              How Destiny Numbers Work
            </h3>
            <p className="text-white/70 mb-6">
              Your destiny number is calculated from your birth date and reveals your life's purpose and natural talents. 
              The crystals recommended above align with your energetic vibration and can support you on your spiritual journey.
            </p>
            <p className="text-white/60 text-sm">
              💎 Each crystal carries unique frequencies that resonate with different destiny numbers, 
              helping to amplify your natural gifts and support your personal growth.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DiscoverYourCrystals;
