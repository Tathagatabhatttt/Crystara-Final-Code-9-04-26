import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCatalogProducts } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Zap, Award, Star, Compass, ShieldCheck } from "lucide-react";

// Professional Vedic Numerology database with Ruling Planets, description, traits, and crystal alignment
const numerologyData = {
  1: {
    name: "The Pioneer & Leader",
    planet: "Sun (Surya)",
    description: "Independent, ambitious, pioneering, and strong-willed. Your life path centers on individuality, self-confidence, and paving new roads for others to follow.",
    stones: ["Tiger Eye", "Carnelian", "Pyrite", "Citrine", "Sunstone"],
    color: "from-amber-400 via-orange-500 to-red-600",
    glowColor: "rgba(245, 158, 11, 0.2)",
    traits: ["Leadership", "Independence", "Innovation", "Courage"],
  },
  2: {
    name: "The Diplomat & Mediator",
    planet: "Moon (Chandra)",
    description: "Sensitive, intuitive, co-operative, and patient. Your path is about seeking harmony, balance, emotional healing, and working in partnership to unite energies.",
    stones: ["Moonstone", "Rose Quartz", "Clear Quartz", "Jade", "Amethyst"],
    color: "from-cyan-400 via-blue-500 to-indigo-600",
    glowColor: "rgba(34, 211, 238, 0.2)",
    traits: ["Harmony", "Intuition", "Cooperation", "Empathy"],
  },
  3: {
    name: "The Creative Communicator",
    planet: "Jupiter (Guru)",
    description: "Optimistic, social, creative, and highly expressive. You are designed to spread joy, communicate grand ideas, and inspire others through art, speech, and wisdom.",
    stones: ["Citrine", "Amethyst", "Yellow Quartz", "Lapis", "Sunstone"],
    color: "from-yellow-400 via-amber-500 to-pink-500",
    glowColor: "rgba(251, 191, 36, 0.2)",
    traits: ["Creativity", "Expression", "Optimism", "Wisdom"],
  },
  4: {
    name: "The Architect & Builder",
    planet: "Rahu",
    description: "Practical, methodical, disciplined, and reliable. You excel at building strong structures, organizing chaos, and creating lasting foundations in life.",
    stones: ["Hematite", "Black Tourmaline", "Tiger Eye", "Sodalite", "Green Aventurine"],
    color: "from-slate-500 via-zinc-600 to-neutral-800",
    glowColor: "rgba(100, 116, 139, 0.2)",
    traits: ["Stability", "Discipline", "Practicality", "Reliability"],
  },
  5: {
    name: "The Adventurer & Visionary",
    planet: "Mercury (Budha)",
    description: "Dynamic, versatile, curious, and adaptable. You thrive on change, travel, communication, and learning from life's diverse, free-flowing experiences.",
    stones: ["Green Aventurine", "Amazonite", "Citrine", "Sodalite", "Sunstone"],
    color: "from-teal-400 via-emerald-500 to-blue-600",
    glowColor: "rgba(20, 184, 166, 0.2)",
    traits: ["Freedom", "Versatility", "Curiosity", "Adaptability"],
  },
  6: {
    name: "The Harmonizer & Nurturer",
    planet: "Venus (Shukra)",
    description: "Loving, artistic, responsible, and compassionate. Your path is dedicated to beauty, family harmony, luxury, healing others, and nurturing aesthetic environments.",
    stones: ["Rose Quartz", "Green Jade", "Clear Quartz", "Lapis", "Tiger Eye"],
    color: "from-rose-400 via-pink-500 to-purple-600",
    glowColor: "rgba(244, 63, 94, 0.2)",
    traits: ["Compassion", "Artistry", "Aesthetic", "Nurturing"],
  },
  7: {
    name: "The Mystic Seeker",
    planet: "Ketu",
    description: "Spiritual, introspective, analytical, and truth-seeking. You are here to explore life's mysteries, acquire knowledge, and seek spiritual realization.",
    stones: ["Amethyst", "Lapis", "Moonstone", "Clear Quartz", "Rainbow Moonstone"],
    color: "from-indigo-500 via-violet-600 to-purple-800",
    glowColor: "rgba(99, 102, 241, 0.2)",
    traits: ["Spirituality", "Intuition", "Knowledge", "Introspection"],
  },
  8: {
    name: "The Achiever & Powerhouse",
    planet: "Saturn (Shani)",
    description: "Ambitious, resilient, business-minded, and powerful. Your path focuses on mastering authority, material wealth, organization, and spiritual balance.",
    stones: ["Amethyst", "Black Tourmaline", "Hematite", "Pyrite", "Tiger Eye"],
    color: "from-neutral-600 via-neutral-800 to-neutral-950",
    glowColor: "rgba(64, 64, 64, 0.2)",
    traits: ["Authority", "Resilience", "Abundance", "Karma"],
  },
  9: {
    name: "The Humanitarian Warrior",
    planet: "Mars (Mangal)",
    description: "Compassionate, courageous, universal, and highly artistic. You possess deep integrity and are here to serve humanity with courage and creative vision.",
    stones: ["Carnelian", "Rose Quartz", "Hematite", "Amethyst", "Clear Quartz"],
    color: "from-red-500 via-orange-600 to-rose-700",
    glowColor: "rgba(239, 68, 68, 0.2)",
    traits: ["Compassion", "Courage", "Universalism", "Integrity"],
  },
};

// Relationship logic based on Vedic Planetary Friendship
const getPlanetaryHarmony = (m: number, d: number) => {
  if (m === d) return { level: "Intense Harmony", desc: "Your Ruling and Destiny numbers are identical. This creates an extremely focused, double-strength vibrational alignment, magnifying your natural traits and cosmic purpose." };
  
  const friendlyPairs = [
    [1, 2], [1, 3], [1, 9],
    [2, 3], [2, 5],
    [3, 9], [3, 5],
    [4, 5], [4, 6], [4, 7], [4, 8],
    [5, 6], [5, 8],
    [6, 7], [6, 8],
    [7, 8]
  ];

  const friendly = friendlyPairs.some(
    ([a, b]) => (a === m && b === d) || (a === d && b === m)
  );

  if (friendly) {
    return {
      level: "Natural Synergy",
      desc: "Your birth energies are friendly and supportive. Your inner personality (Ruling Number) flows easily into your external actions and life purpose (Destiny Number)."
    };
  }
  
  return {
    level: "Dynamic Balance",
    desc: "Your Ruling and Destiny numbers represent complementary planetary forces. Your path offers rich growth as you learn to balance these unique energies together."
  };
};

const DiscoverYourCrystals = () => {
  const [searchParams] = useSearchParams();
  const destiny = parseInt(searchParams.get("destiny") || "1");
  const mulank = parseInt(searchParams.get("mulank") || "1");
  const dob = searchParams.get("dob");

  const [activeTab, setActiveTab] = useState<"all" | "ruling" | "destiny" | "dual">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Connecting with your auric vibration...",
    "Calculating Psychic Number (Mulank)...",
    "Calculating Destiny Number (Bhagyank)...",
    "Aligning cosmic planets and energy fields...",
    "Curating your personalized crystals..."
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 600);

    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(loadTimeout);
    };
  }, []);

  const destinyInfo = numerologyData[destiny as keyof typeof numerologyData] || numerologyData[1];
  const mulankInfo = numerologyData[mulank as keyof typeof numerologyData] || numerologyData[1];
  const harmony = getPlanetaryHarmony(mulank, destiny);

  const { data: allProducts } = useCatalogProducts();

  // Evaluate matching alignments for products
  const productsWithAlignment = useMemo(() => {
    return allProducts.map((p) => {
      const matchesMulank = mulankInfo.stones.some((s) => 
        p.name.toLowerCase().includes(s.toLowerCase()) || p.stone.toLowerCase().includes(s.toLowerCase())
      );
      const matchesDestiny = destinyInfo.stones.some((s) => 
        p.name.toLowerCase().includes(s.toLowerCase()) || p.stone.toLowerCase().includes(s.toLowerCase())
      );

      let alignmentTag = "";
      if (matchesMulank && matchesDestiny) {
        alignmentTag = "Dual Power";
      } else if (matchesMulank) {
        alignmentTag = "Ruling Energy";
      } else if (matchesDestiny) {
        alignmentTag = "Destiny Path";
      }

      return {
        ...p,
        matchesMulank,
        matchesDestiny,
        isAligned: matchesMulank || matchesDestiny,
        tag: alignmentTag,
      };
    }).filter((p) => p.isAligned);
  }, [allProducts, mulankInfo, destinyInfo]);

  // Remove duplicates and apply active tab filter
  const filteredProducts = useMemo(() => {
    const seen = new Set<string>();
    const unique = productsWithAlignment.filter((p) => {
      const key = p.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (activeTab === "ruling") return unique.filter(p => p.matchesMulank && !p.matchesDestiny);
    if (activeTab === "destiny") return unique.filter(p => p.matchesDestiny && !p.matchesMulank);
    if (activeTab === "dual") return unique.filter(p => p.matchesMulank && p.matchesDestiny);
    return unique;
  }, [productsWithAlignment, activeTab]);

  const dualCount = productsWithAlignment.filter(p => p.matchesMulank && p.matchesDestiny).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07050b] flex flex-col items-center justify-center p-4 relative overflow-hidden text-foreground font-sans">
        {/* Glow Ambient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-60 h-60 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

        {/* Central Mandala / Ring Loader */}
        <div className="relative mb-12">
          {/* Outer glowing pulsing aura */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          
          {/* Spinner Ring 1 (Clockwise) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-dashed border-primary/40 flex items-center justify-center p-2"
          >
            {/* Spinner Ring 2 (Counter-Clockwise) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-full h-full rounded-full border border-double border-accent/30 flex items-center justify-center"
            >
              <Compass className="w-8 h-8 text-accent animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Sparkles floating around */}
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-accent animate-bounce" />
        </div>

        {/* Dynamic Loading Message with AnimatePresence */}
        <div className="h-10 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-sm sm:text-base md:text-lg text-white/80 font-medium tracking-wide text-center"
            >
              {loadingMessages[loadingStep]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${(loadingStep + 1) * 20}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07050a] text-foreground font-sans selection:bg-purple-500/30 selection:text-white">
      <Header />

      {/* Cosmic Dashboard Hero */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-gradient-to-b from-purple-950/20 via-black to-[#07050a] border-b border-purple-950/20">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-12 left-12 w-48 h-48 rounded-full bg-primary/10 blur-[60px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full bg-accent/10 blur-[60px] pointer-events-none animate-pulse-slow" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-purple-950/30 border border-purple-900/30">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs font-semibold text-white/90 tracking-widest uppercase">Numerology Personal Report</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
              Your <span className="text-gradient-mystic">Cosmic Energy</span> Alignment
            </h1>

            {dob && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-12">
                Derived for birthdate: <span className="text-white font-medium">{new Date(dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </p>
            )}

            {/* Numbers Display Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-4">
              {/* Mulank Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-primary/20 rounded-2xl p-6 sm:p-8 transition-all duration-300"
                style={{ boxShadow: `inset 0 1px 1px 0 rgba(255,255,255,0.05), 0 8px 32px 0 ${mulankInfo.glowColor}` }}
              >
                {/* Accent glow on top-right */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${mulankInfo.color} opacity-10 rounded-bl-full`} />
                
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className={`text-7xl sm:text-8xl font-serif font-bold bg-gradient-to-br ${mulankInfo.color} bg-clip-text text-transparent leading-none select-none`}>
                    {mulank}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Ruling Number</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-white mb-0.5">{mulankInfo.name}</h2>
                    <span className="inline-block text-[10px] font-bold tracking-wider text-accent uppercase mb-3">Planet: {mulankInfo.planet}</span>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{mulankInfo.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-6 pt-5 border-t border-white/5">
                  {mulankInfo.traits.map((t) => (
                    <span key={t} className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Destiny Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-accent/20 rounded-2xl p-6 sm:p-8 transition-all duration-300"
                style={{ boxShadow: `inset 0 1px 1px 0 rgba(255,255,255,0.05), 0 8px 32px 0 ${destinyInfo.glowColor}` }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${destinyInfo.color} opacity-10 rounded-bl-full`} />

                <div className="flex items-start gap-4 sm:gap-6">
                  <div className={`text-7xl sm:text-8xl font-serif font-bold bg-gradient-to-br ${destinyInfo.color} bg-clip-text text-transparent leading-none select-none`}>
                    {destiny}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Destiny Number</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-white mb-0.5">{destinyInfo.name}</h2>
                    <span className="inline-block text-[10px] font-bold tracking-wider text-accent uppercase mb-3">Planet: {destinyInfo.planet}</span>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{destinyInfo.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-6 pt-5 border-t border-white/5">
                  {destinyInfo.traits.map((t) => (
                    <span key={t} className="text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Harmony Report Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                <Compass className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Vedic Harmony: <span className="text-accent">{harmony.level}</span>
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {harmony.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Recommended Crystals */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
              Your Customized Power Crystals
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Find items customized to your energy. These selections are mathematically aligned with your ruling and destiny planets to amplify your strengths.
            </p>
          </div>

          {/* Interactive Filters Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-xl mx-auto p-1 bg-white/5 border border-white/5 rounded-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "all" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              All Matches ({productsWithAlignment.length})
            </button>
            <button
              onClick={() => setActiveTab("ruling")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "ruling" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              Ruling Only
            </button>
            <button
              onClick={() => setActiveTab("destiny")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "destiny" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              Destiny Only
            </button>
            {dualCount > 0 && (
              <button
                onClick={() => setActiveTab("dual")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "dual" ? "bg-accent text-accent-foreground shadow" : "text-muted-foreground hover:text-accent"
                }`}
              >
                Dual Power ({dualCount})
              </button>
            )}
          </div>

          {/* Grid Render */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-xl">
                  <Compass className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3 animate-spin-slow" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No crystals in the shop currently match this specific subset. Try choosing another filter above.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Guide Section */}
      <section className="py-16 sm:py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-8">
              Vedic Science of Ruling & Destiny Numbers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-serif font-semibold text-white text-base mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Ruling Number (Mulank)
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Represents your conscious mind, basic temperament, core behaviors, and natural instincts. 
                  Determined by the **day of birth** (e.g. if born on 28th, $2+8=10 \rightarrow 1+0=1$). 
                  It governs your day-to-day actions and primary personality.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="font-serif font-semibold text-white text-base mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Destiny Number (Bhagyank)
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Represents your life path, your spiritual purpose, and the final destination of your journey. 
                  Calculated from your **complete birth date** (Day + Month + Year). It guides your overall growth and destiny.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DiscoverYourCrystals;