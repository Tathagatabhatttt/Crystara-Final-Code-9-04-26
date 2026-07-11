import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCatalogProducts } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const destinyData: Record<number, { description: string; personality: string; loveAdvice: string; careerAdvice: string; peaceAdvice: string; stones: string[] }> = {
  1: {
    description: "Ambitious, confident, and born to lead. Ruled by the energy of the Sun.",
    personality: "As a Destiny 1, you are ambitious, confident, and born to lead. Ruled by the energy of the Sun, you naturally want to stand out and create your own path. You are independent, determined, and strong-willed, but at times you may become impatient or too hard on yourself. Tiger Eye and Carnelian help strengthen your confidence and personal power.",
    loveAdvice: "You want a relationship where you are respected, understood, and free to be yourself. Because of the strong influence of the Sun, you are loyal and protective but sometimes may struggle to show vulnerability. Rose Quartz helps you open your heart, while Tiger Eye brings balance and trust.",
    careerAdvice: "You are naturally suited for leadership, business, and careers where you can take charge. The energy of the Sun gives you strong drive and the desire to achieve great things. Pyrite attracts abundance and confidence, while Citrine supports financial growth.",
    peaceAdvice: "Because you carry so much responsibility, you need moments of calm. Amethyst helps quiet your mind, while Sunstone restores your energy and confidence.",
    stones: ["Tiger Eye", "Carnelian", "Pyrite", "Citrine", "Amethyst", "Sunstone", "Rose Quartz"],
  },
  2: {
    description: "Sensitive, caring, and emotionally intelligent. Ruled by the Moon.",
    personality: "As a Destiny 2, you are sensitive, caring, and emotionally intelligent. Ruled by the Moon, you are naturally intuitive and have a gift for creating peace and harmony. You are patient, gentle, and understanding, though sometimes you may overthink or become too emotional. Moonstone and Aquamarine support your gentle nature.",
    loveAdvice: "You are deeply romantic and value emotional connection more than anything. The influence of the Moon makes you loyal, caring, and supportive in relationships. Rose Quartz attracts deeper love, while Moonstone brings balance and understanding.",
    careerAdvice: "You do best in careers where you can help, support, or work closely with others. The energy of the Moon gives you creativity and emotional intelligence. Green Aventurine helps attract new opportunities, while Citrine boosts self-belief.",
    peaceAdvice: "Because you absorb the emotions of others, protecting your energy is important. Amethyst helps reduce stress, while Selenite clears negative energy.",
    stones: ["Rainbow Moon Stone", "Aquamarine", "Rose Quartz", "Green Aventurine", "Citrine", "Amethyst"],
  },
  3: {
    description: "Creative, expressive, and full of life. Ruled by Jupiter.",
    personality: "As a Destiny 3, you are creative, expressive, and full of life. Ruled by Jupiter, you have a natural talent for inspiring others through your words, ideas, and personality. You are optimistic and fun-loving, though you may sometimes lose focus. Citrine and Carnelian help keep your energy strong.",
    loveAdvice: "You want a relationship filled with excitement, joy, and emotional connection. The influence of Jupiter makes you playful, loving, and expressive. Rose Quartz helps you build deeper emotional bonds, while Moonstone brings stability.",
    careerAdvice: "You shine in creative careers, communication, media, business, or anything that allows self-expression. The energy of Jupiter helps you attract opportunities. Tiger Eye keeps you grounded, while Pyrite supports abundance.",
    peaceAdvice: "Because your mind is always active, you need time to slow down. Amethyst calms overthinking, while Sunstone restores your happiness.",
    stones: ["Citrine", "Carnelian", "Rose Quartz", "Tiger Eye", "Pyrite", "Amethyst", "Sunstone"],
  },
  4: {
    description: "Practical, hardworking, and dependable. Ruled by Rahu.",
    personality: "As a Destiny 4, you are practical, hardworking, and dependable. Ruled by Rahu, you are determined to build a secure and stable life. You are responsible, patient, and reliable, though sometimes you may become stubborn. Tiger Eye and Smoky Quartz help keep you balanced.",
    loveAdvice: "You want loyalty, honesty, and long-term commitment. The influence of Venus helps soften your serious side and brings emotional warmth. Rose Quartz and Moonstone support your relationships.",
    careerAdvice: "You are naturally disciplined and work best in structured careers. The energy of Saturn gives you patience and determination. Pyrite and Green Aventurine help attract prosperity.",
    peaceAdvice: "You often carry too much responsibility. Amethyst helps ease your mind, while Black Tourmaline protects your energy.",
    stones: ["Tiger Eye", "Rose Quartz", "Pyrite", "Green Aventurine", "Amethyst", "Black Tourmaline"],
  },
  5: {
    description: "Adventurous, curious, and energetic. Ruled by Mercury.",
    personality: "As a Destiny 5, you are adventurous, curious, and energetic. Ruled by Mercury, you love freedom, change, and exploring new ideas. You are quick-minded and adaptable, though sometimes you may become restless. Citrine and Lapis Lazuli help balance your energy.",
    loveAdvice: "You need excitement and freedom in love. The influence of Mercury makes you charming and expressive. Rose Quartz helps you build deeper relationships, while Aquamarine improves understanding.",
    careerAdvice: "You do best in careers that involve travel, communication, media, business, or creativity. The energy of Mercury gives you quick thinking and adaptability. Pyrite attracts opportunities, while Citrine supports wealth.",
    peaceAdvice: "Because you are always on the move, you need grounding energy. Smoky Quartz helps you feel calm, while Amethyst reduces stress.",
    stones: ["Citrine", "Lapis", "Rose Quartz", "Aquamarine", "Pyrite", "Amethyst"],
  },
  6: {
    description: "Loving, nurturing, and responsible. Ruled by Venus.",
    personality: "As a Destiny 6, you are loving, nurturing, and responsible. Ruled by Venus, you are naturally drawn to family, relationships, and creating a peaceful environment. Rose Quartz and Emerald support your caring nature.",
    loveAdvice: "You are deeply romantic and loyal. The influence of Venus makes you affectionate and devoted. Rose Quartz strengthens your relationships, while Moonstone brings harmony.",
    careerAdvice: "You do best in careers involving care, beauty, teaching, healing, or creativity. The energy of Venus helps you attract abundance. Green Aventurine and Citrine support your success.",
    peaceAdvice: "Because you care so much for others, you often forget yourself. Amethyst helps you recharge, while Selenite clears heavy emotions.",
    stones: ["Rose Quartz", "Rainbow Moon Stone", "Green Aventurine", "Citrine", "Amethyst"],
  },
  7: {
    description: "Spiritual, thoughtful, and deeply intuitive. Ruled by Ketu.",
    personality: "As a Destiny 7, you are spiritual, thoughtful, and deeply intuitive. Ruled by Ketu, you are drawn to mystery, knowledge, and self-discovery. You often enjoy solitude and deep conversations. Amethyst and Labradorite strengthen your inner wisdom.",
    loveAdvice: "You seek a deep emotional and spiritual connection. The influence of Moon makes you sensitive and caring, even if you do not always show it. Rose Quartz and Moonstone help you trust love.",
    careerAdvice: "You do best in careers involving research, spirituality, writing, healing, or teaching. The energy of Ketu gives you insight and originality. Pyrite and Lapis Lazuli help you succeed.",
    peaceAdvice: "You need time alone to recharge your energy. Amethyst calms your mind, while Selenite clears negativity.",
    stones: ["Amethyst", "Lapis", "Rose Quartz", "Rainbow Moon Stone", "Pyrite", "Clear Quartz"],
  },
  8: {
    description: "Powerful, ambitious, and determined. Ruled by Saturn.",
    personality: "As a Destiny 8, you are powerful, ambitious, and determined. Ruled by Saturn, you have strong leadership qualities and the ability to achieve great things through hard work. Pyrite and Black Tourmaline strengthen your energy.",
    loveAdvice: "You are loyal and protective, but sometimes you hide your emotions. The influence of Saturn makes you serious about relationships. Rose Quartz helps you open your heart, while Moonstone brings harmony.",
    careerAdvice: "You are naturally gifted in business, leadership, and finance. The energy of Saturn helps you build lasting wealth. Pyrite and Citrine attract opportunities.",
    peaceAdvice: "Because you work so hard, you may become stressed or emotionally tired. Amethyst helps reduce stress, while Black Tourmaline protects your energy.",
    stones: ["Pyrite", "Black Tourmaline", "Rose Quartz", "Citrine", "Amethyst", "Tiger Eye"],
  },
  9: {
    description: "Compassionate, brave, and deeply emotional. Ruled by Mars.",
    personality: "As a Destiny 9, you are compassionate, brave, and deeply emotional. Ruled by Mars, you are a natural fighter with a strong heart. You are generous, idealistic, and always want to help others. Red Jasper and Rose Quartz balance your energy.",
    loveAdvice: "You love deeply and passionately. The influence of Mars makes you protective and loyal, though sometimes you may become emotional or impulsive. Rose Quartz helps soften your heart, while Moonstone brings harmony.",
    careerAdvice: "You do best in careers where you can inspire, protect, or help others. The energy of Mars gives you strength and determination. Pyrite helps attract abundance, while Carnelian supports your goals.",
    peaceAdvice: "Because you give so much to others, you need emotional healing and rest. Amethyst helps quiet your emotions, while Selenite restores balance.",
    stones: ["Rose Quartz", "Amethyst", "Pyrite", "Carnelian", "Blood Stone", "Serpentine"],
  },
};

const categories = ["All", "Love", "Career", "Peace"];

const categoryStoneMap: Record<string, string[]> = {
  Love: ["Rose Quartz", "Pink Onyx", "Amethyst", "Rainbow Moon Stone", "Opalite", "Rainbow Moonstone", "Moonstone", "Aquamarine"],
  Career: ["Tiger Eye", "Lapis", "Citrine", "Pyrite", "Hematite", "Sun Stone", "Sunstone", "Black Tourmaline", "Green Aventurine", "Golden Pyrite", "Money Magnet"],
  Peace: ["Amethyst", "Clear Quartz", "Rose Quartz", "Aquamarine", "Sodalite", "Green Jade", "Larvikite", "Opalite", "Serpentine"],
};

const CustomizeYourOwnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const destiny = parseInt(searchParams.get("destiny") || "1");
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in first to customize your bracelet");
      navigate("/auth");
    }
  }, [user, navigate]);

  const data = destinyData[destiny] || destinyData[1];
  const { data: allProducts } = useCatalogProducts();

  const getFilteredProducts = () => {
    if (activeCategory === "All") {
      return allProducts.filter((p) =>
        data.stones.some((s) => p.name.toLowerCase().includes(s.toLowerCase()) || p.stone?.toLowerCase().includes(s.toLowerCase()))
      );
    }
    const catStones = categoryStoneMap[activeCategory] || [];
    const relevantStones = data.stones.filter((s) => catStones.some((cs) => cs.toLowerCase() === s.toLowerCase()));
    const targetStones = relevantStones.length > 0 ? relevantStones : catStones;
    return allProducts.filter((p) =>
      targetStones.some((s) => p.name.toLowerCase().includes(s.toLowerCase()) || p.stone?.toLowerCase().includes(s.toLowerCase()))
    );
  };

  const filtered = getFilteredProducts();
  const seen = new Set<string>();
  const unique = filtered.filter((p) => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 sm:pt-24">
        {/* Destiny Number Hero */}
        <section className="py-10 sm:py-16 bg-secondary/30 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Big Destiny Number with RGB Glow */}
              <motion.div
                className="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-6 text-6xl sm:text-8xl font-bold font-serif relative shrink-0"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(255,0,0,0.5), 0 0 60px rgba(255,0,0,0.3)",
                    "0 0 30px rgba(0,255,0,0.5), 0 0 60px rgba(0,255,0,0.3)",
                    "0 0 30px rgba(0,100,255,0.5), 0 0 60px rgba(0,100,255,0.3)",
                    "0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(255,0,255,0.3)",
                    "0 0 30px rgba(255,165,0,0.5), 0 0 60px rgba(255,165,0,0.3)",
                    "0 0 30px rgba(255,0,0,0.5), 0 0 60px rgba(255,0,0,0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-green-500 via-blue-500 via-purple-500 to-red-500 animate-rgb-border opacity-60" />
                <span className="relative z-10 bg-background rounded-full w-[calc(100%-6px)] h-[calc(100%-6px)] flex items-center justify-center leading-none tabular-nums text-white drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]">
                  {destiny}
                </span>
              </motion.div>

              <h1 className="text-2xl sm:text-4xl font-serif font-bold mb-2">
                Destiny Number <span className="text-gradient-mystic">{destiny}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6">{data.description}</p>
            </motion.div>
          </div>
        </section>

        {/* Personality & Advice */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="grid gap-4 md:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="bg-card p-5 rounded-xl border border-border col-span-full">
                <h3 className="font-serif font-bold text-lg text-primary mb-2">💎 Your Personality</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.personality}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-card p-5 rounded-xl border border-primary/20">
                <h3 className="font-serif font-bold text-base text-pink-500 mb-2">💕 Love Life</h3>
                <p className="text-sm text-muted-foreground">{data.loveAdvice}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="bg-card p-5 rounded-xl border border-primary/20">
                <h3 className="font-serif font-bold text-base text-blue-500 mb-2">💼 Career & Wealth</h3>
                <p className="text-sm text-muted-foreground">{data.careerAdvice}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="bg-card p-5 rounded-xl border border-primary/20 col-span-full md:col-span-2">
                <h3 className="font-serif font-bold text-base text-green-500 mb-2">🕊️ Peace & Healing</h3>
                <p className="text-sm text-muted-foreground">{data.peaceAdvice}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Crystal Recommendations */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-center mb-6">Your Recommended Crystals</h2>
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {categories.map((cat) => (
                <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)} className="text-xs sm:text-sm">
                  {cat}
                </Button>
              ))}
            </div>

            {unique.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {unique.slice(0, 16).map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={{ id: product.id, name: `${product.name} ${product.subCategory}`, price: product.price, originalPrice: product.originalPrice, image: product.image, category: product.category, benefit: product.benefit }}
                    index={i}
                    linkTo={`/product/${product.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found for this category. Try "All" to see all recommendations.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CustomizeYourOwnPage;
