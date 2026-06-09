import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const crystalGuides = [
  {
    name: "Amethyst",
    color: "bg-purple-100 dark:bg-purple-900/30",
    emoji: "💜",
    description: "The stone of calm and clarity. Amethyst promotes tranquillity, reduces stress, and enhances intuition. Place near your bed for restful sleep.",
    benefits: ["Reduces anxiety", "Enhances intuition", "Promotes restful sleep", "Protects from negative energy"],
  },
  {
    name: "Rose Quartz",
    color: "bg-pink-100 dark:bg-pink-900/30",
    emoji: "🌸",
    description: "The stone of unconditional love. Rose Quartz opens the heart chakra, attracting love, self-love, and harmonious relationships.",
    benefits: ["Attracts love", "Promotes self-love", "Heals emotional wounds", "Enhances relationships"],
  },
  {
    name: "Citrine",
    color: "bg-yellow-100 dark:bg-yellow-900/30",
    emoji: "🌟",
    description: "The merchant's stone. Citrine radiates positivity, attracts abundance, and ignites creativity. Perfect for your workspace.",
    benefits: ["Attracts abundance", "Boosts creativity", "Enhances confidence", "Promotes positivity"],
  },
  {
    name: "Black Tourmaline",
    color: "bg-gray-100 dark:bg-gray-800/50",
    emoji: "🖤",
    description: "The ultimate protection stone. Black Tourmaline creates a powerful energetic shield, repelling negativity and electromagnetic radiation.",
    benefits: ["Powerful protection", "Grounds energy", "Repels negativity", "Reduces EMF"],
  },
  {
    name: "Tiger Eye",
    color: "bg-amber-100 dark:bg-amber-900/30",
    emoji: "🐯",
    description: "The stone of courage and confidence. Tiger Eye enhances willpower, focus, and decision-making. Excellent for business and career goals.",
    benefits: ["Boosts confidence", "Enhances focus", "Attracts prosperity", "Strengthens willpower"],
  },
  {
    name: "Lapis Lazuli",
    color: "bg-blue-100 dark:bg-blue-900/30",
    emoji: "💙",
    description: "The stone of wisdom and truth. Lapis Lazuli stimulates intellectual ability, enhances communication, and awakens spiritual consciousness.",
    benefits: ["Enhances wisdom", "Improves communication", "Stimulates creativity", "Awakens consciousness"],
  },
  {
    name: "Green Aventurine",
    color: "bg-green-100 dark:bg-green-900/30",
    emoji: "💚",
    description: "The stone of opportunity. Green Aventurine is known as the luckiest crystal, attracting wealth, opportunity, and success in all areas of life.",
    benefits: ["Attracts luck", "Brings prosperity", "Promotes optimism", "Supports heart health"],
  },
  {
    name: "Selenite",
    color: "bg-slate-100 dark:bg-slate-800/50",
    emoji: "🤍",
    description: "The purifying stone. Selenite cleanses your aura and other crystals, connects you to higher realms, and fills spaces with high vibration energy.",
    benefits: ["Cleanses aura", "Charges other crystals", "Enhances clarity", "Connects to higher self"],
  },
];

const LearnAboutCrystals = () => {
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
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
                Learn About Crystals
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Discover the ancient wisdom and healing properties of crystals. Your journey to crystal healing begins here.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-10 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-5 sm:p-8 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-serif font-bold mb-3 sm:mb-4">What Are Healing Crystals?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Healing crystals are natural gemstones formed deep within the Earth over millions of years. Each crystal carries its own unique vibrational energy and healing properties. Used for thousands of years across ancient civilisations, crystals are believed to interact with the body's energy fields, promoting physical, emotional, and spiritual well-being.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Crystal Guides */}
        <section className="pb-12 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-8 sm:mb-10">
              Crystal Healing Guide
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {crystalGuides.map((crystal, i) => (
                <motion.div
                  key={crystal.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={`${crystal.color} rounded-2xl p-4 sm:p-5 border border-border`}
                >
                  <div className="text-3xl sm:text-4xl mb-3">{crystal.emoji}</div>
                  <h3 className="text-base sm:text-lg font-serif font-bold mb-2">{crystal.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">{crystal.description}</p>
                  <ul className="space-y-1">
                    {crystal.benefits.map((b) => (
                      <li key={b} className="text-xs text-foreground/70 flex items-center gap-1.5">
                        <span className="text-primary">✦</span> {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="py-10 sm:py-12 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-8 sm:mb-10">
              How to Use Your Crystals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                { emoji: "🧘", title: "Meditation", desc: "Hold your crystal during meditation to deepen focus and enhance spiritual connection." },
                { emoji: "🏠", title: "Home Placement", desc: "Place crystals in key areas of your home to cleanse energy and attract positive vibrations." },
                { emoji: "💍", title: "Jewellery", desc: "Wear crystals as bracelets, rings, or pendants to carry their healing energy throughout the day." },
                { emoji: "💤", title: "Sleep", desc: "Keep crystals like Amethyst or Moonstone near your bed to promote restful, peaceful sleep." },
                { emoji: "💼", title: "Workspace", desc: "Place Citrine or Tiger Eye on your desk to boost focus, creativity, and productivity." },
                { emoji: "🌊", title: "Cleansing", desc: "Regularly cleanse your crystals using moonlight, sage, or sound to restore their energy." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-5"
                >
                  <div className="text-2xl sm:text-3xl mb-2">{item.emoji}</div>
                  <h3 className="font-serif font-semibold text-sm sm:text-base mb-1.5">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LearnAboutCrystals;
