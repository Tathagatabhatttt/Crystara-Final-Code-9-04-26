import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Crown, Sparkles, Stars, WandSparkles, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCatalogProducts } from "@/hooks/useCatalog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateDestinyNumber, calculateMulank } from "@/lib/numerology";
import { CrystalButton } from "@/components/CrystalButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHeroSlides } from "@/lib/sanityImage";
import { saveDateOfBirth } from "@/lib/dateOfBirth";

const destinyData: Record<
  number,
  { description: string; personality: string; loveAdvice: string; careerAdvice: string; peaceAdvice: string; stones: string[] }
> = {
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

const rulingStoneData: Record<number, { planet: string; stones: string[] }> = {
  1: { planet: "Sun (Surya)", stones: ["Tiger Eye", "Carnelian", "Pyrite", "Citrine", "Sunstone"] },
  2: { planet: "Moon (Chandra)", stones: ["Moonstone", "Rainbow Moon Stone", "Rose Quartz", "Clear Quartz", "Jade", "Amethyst"] },
  3: { planet: "Jupiter (Guru)", stones: ["Citrine", "Amethyst", "Yellow Quartz", "Lapis", "Sunstone"] },
  4: { planet: "Rahu", stones: ["Hematite", "Black Tourmaline", "Tiger Eye", "Sodalite", "Green Aventurine"] },
  5: { planet: "Mercury (Budha)", stones: ["Green Aventurine", "Amazonite", "Citrine", "Sodalite", "Sunstone"] },
  6: { planet: "Venus (Shukra)", stones: ["Rose Quartz", "Green Jade", "Clear Quartz", "Lapis", "Tiger Eye"] },
  7: { planet: "Ketu", stones: ["Amethyst", "Lapis", "Moonstone", "Clear Quartz", "Rainbow Moonstone"] },
  8: { planet: "Saturn (Shani)", stones: ["Amethyst", "Black Tourmaline", "Hematite", "Pyrite", "Tiger Eye"] },
  9: { planet: "Mars (Mangal)", stones: ["Carnelian", "Rose Quartz", "Hematite", "Amethyst", "Clear Quartz"] },
};

const normalize = (value: string | undefined | null) => value?.toLowerCase().trim() || "";

const hasStoneMatch = (product: { name: string; stone?: string }, stones: string[]) =>
  stones.some(
    (stone) =>
      normalize(product.name).includes(normalize(stone)) ||
      normalize(product.stone).includes(normalize(stone)),
  );

const CustomizeYourOwnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, profile, loading: authLoading } = useAuth();
  const { data: siteSettings } = useSiteSettings();

  // Search parameters for results view
  const dob = searchParams.get("dob");
  const hasValidParams = !!dob;

  // Local state for birthdate form
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [formError, setFormError] = useState("");
  const savedDobRef = useRef<string | null>(null);

  const backgroundImage =
    siteSettings?.customizePageBackground ||
    resolveHeroSlides(siteSettings?.heroSlides)[0]?.url;

  // Calculate destiny and mulank
  const destiny = dob ? calculateDestinyNumber(dob) : 1;
  const mulank = dob ? calculateMulank(dob) : 1;

  // Prefill DOB from the saved profile when available
  useEffect(() => {
    const savedDob =
      typeof profile?.date_of_birth === "string"
        ? profile.date_of_birth.slice(0, 10)
        : "";
    if (savedDob && !dateOfBirth) {
      setDateOfBirth(savedDob);
    }
  }, [profile?.date_of_birth, dateOfBirth]);

  // Sign in check for displaying reports
  useEffect(() => {
    if (!authLoading && hasValidParams && !user) {
      toast.error("Please sign in first to customize your bracelet");
      const returnUrl = `${location.pathname}${location.search}`;
      navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [authLoading, user, navigate, hasValidParams, location.pathname, location.search]);

  // Persist DOB whenever a signed-in customer reaches customize results
  useEffect(() => {
    if (!hasValidParams || !dob || !session?.access_token) return;
    if (savedDobRef.current === dob) return;
    savedDobRef.current = dob;
    void saveDateOfBirth(session.access_token, dob);
  }, [hasValidParams, dob, session?.access_token]);

  const { data: allProducts } = useCatalogProducts();

  const data = destinyData[destiny] || destinyData[1];
  const rulingInfo = rulingStoneData[mulank] || rulingStoneData[1];

  const topPicks = useMemo(() => {
    const products = allProducts || [];

    const ranking = (kind: "destiny" | "ruling", number: number, stones: string[], excludeIds: Set<string>) =>
      [...products]
        .filter((product) => !excludeIds.has(product.id))
        .map((product) => {
          const numbers = kind === "ruling"
            ? (Array.isArray(product.rulingNumbers) && product.rulingNumbers.length > 0
                ? product.rulingNumbers
                : Array.isArray(product.alignedNumbers) ? product.alignedNumbers : [])
            : (Array.isArray(product.destinyNumbers) && product.destinyNumbers.length > 0
                ? product.destinyNumbers
                : Array.isArray(product.alignedNumbers) ? product.alignedNumbers : []);

          const score =
            numbers.length > 0
              ? (numbers.includes(number) ? 100 : 0)
              : (hasStoneMatch(product, stones) ? 60 : 0);

          return {
            product,
            score,
            // On equal numerology relevance, prefer the current database
            // product over an older built-in/Sanity catalog entry.
            sourcePriority: product.isFromSupabase ? 1 : 0,
          };
        })
        .sort((a, b) => b.score - a.score || b.sourcePriority - a.sourcePriority)
        .find((entry) => entry.score > 0)?.product;

    const chosenIds = new Set<string>();
    const destinyMatch = ranking("destiny", destiny, data.stones, chosenIds);
    if (destinyMatch) chosenIds.add(destinyMatch.id);
    const rulingMatch = ranking("ruling", mulank, rulingInfo.stones, chosenIds);
    if (rulingMatch) chosenIds.add(rulingMatch.id);

    // The spotlight is opt-in: only a product explicitly selected by an admin
    // may appear here. It intentionally has no automatic fallback.
    const adminPick = products.find((product) => product.isAdminCustomized);

    return { destinyMatch, rulingMatch, adminPick };
  }, [allProducts, data.stones, destiny, mulank, rulingInfo.stones]);

  const handleDiscoverCrystals = () => {
    if (!dateOfBirth) {
      setFormError("Please enter your date of birth");
      return;
    }

    if (session?.access_token) {
      void saveDateOfBirth(session.access_token, dateOfBirth);
      savedDobRef.current = dateOfBirth;
    }

    const destinyNumber = calculateDestinyNumber(dateOfBirth);
    const mulankNumber = calculateMulank(dateOfBirth);
    navigate(`?destiny=${destinyNumber}&mulank=${mulankNumber}&dob=${dateOfBirth}`);
  };

  const formatProductName = (product: { name: string; subCategory?: string }) =>
    product.subCategory ? `${product.name} ${product.subCategory}` : product.name;

  const highlightCardClass =
    "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

  // VIEW 1: Input birthdate form if query parameters are missing
  if (!hasValidParams) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-black text-foreground font-sans">
        {backgroundImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backgroundImage})` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/65" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-background/90" aria-hidden />
          </>
        )}

        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />

          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-32 sm:pt-40 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-2xl text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 border border-accent/30 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">Personalized Crystal Healing</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 text-white"
              >
                Customize <span className="text-gradient-mystic">Your Own</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base sm:text-lg text-white/70 mb-12 max-w-xl mx-auto leading-relaxed"
              >
                Enter your date of birth to discover your Destiny Number and find the perfect crystals aligned with your energy.
              </motion.p>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="space-y-6 max-w-[320px] mx-auto w-full"
              >
                <label className="block text-white/60 text-sm font-semibold tracking-wide">
                  Date of Birth
                </label>

                <div className="relative">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      setFormError("");
                    }}
                    className="w-full h-12 px-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:border-accent transition-all duration-300 text-center"
                    style={{
                      colorScheme: "dark",
                      color: dateOfBirth ? "white" : "transparent",
                    }}
                  />
                  {!dateOfBirth && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/40 text-sm rounded-lg">
                      Select Date of Birth
                    </span>
                  )}
                </div>

                {formError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm"
                  >
                    {formError}
                  </motion.p>
                )}

                <CrystalButton
                  onClick={handleDiscoverCrystals}
                  className="w-full px-8 py-3.5 text-sm sm:text-base font-semibold text-white"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    Discover Your Crystals
                  </span>
                </CrystalButton>
              </motion.div>
            </motion.div>
          </main>

          <Footer />
        </div>
      </div>
    );
  }

  // Wait for Supabase to restore the persisted session before deciding
  // whether this protected results view should redirect.
  if (authLoading || !user) return null;

  // VIEW 2: Cosmic report and recommendations
  return (
    <div className="min-h-screen bg-[#07050a] text-foreground font-sans selection:bg-purple-500/30 selection:text-white">
      <Header />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-gradient-to-b from-purple-950/20 via-black to-[#07050a] border-b border-purple-950/20">
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
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-purple-950/30 border border-purple-900/30">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs font-semibold text-white/90 tracking-widest uppercase">Numerology Personal Report</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
              Your <span className="text-gradient-mystic">Cosmic Energy</span> Alignment
            </h1>

            {dob && (
              <div className="flex flex-col items-center gap-3 mb-12">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Derived for birthdate: <span className="text-white font-medium">{dob}</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate("/customize-your-own");
                  }}
                  className="rounded-full border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Calculate Another Date
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-primary/20 rounded-2xl p-6 sm:p-8 transition-all duration-300"
                style={{ boxShadow: "inset 0 1px 1px 0 rgba(255,255,255,0.05), 0 8px 32px 0 rgba(255, 215, 0, 0.12)" }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 opacity-10 rounded-bl-full" />
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="text-7xl sm:text-8xl font-serif font-bold bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent leading-none select-none">
                    {mulank}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Stars className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Ruling Number</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-white mb-0.5">Ruling Match</h2>
                    <span className="inline-block text-[10px] font-bold tracking-wider text-accent uppercase mb-3">Planet: {rulingInfo.planet}</span>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      This pick follows your ruling number and favors crystals that support your daily energy, habits, and instinctive nature.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-accent/20 rounded-2xl p-6 sm:p-8 transition-all duration-300"
                style={{ boxShadow: "inset 0 1px 1px 0 rgba(255,255,255,0.05), 0 8px 32px 0 rgba(168, 85, 247, 0.12)" }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 opacity-10 rounded-bl-full" />
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="text-7xl sm:text-8xl font-serif font-bold bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 bg-clip-text text-transparent leading-none select-none">
                    {destiny}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Destiny Number</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-white mb-0.5">Destiny Match</h2>
                    <span className="inline-block text-[10px] font-bold tracking-wider text-accent uppercase mb-3">Aligned with your life path</span>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Your destiny pick reflects your long-term purpose, aspirations, and the crystals that help you move in that direction with clarity.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-widest mb-4">
              <WandSparkles className="w-3.5 h-3.5" />
              Three Featured Picks
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
              Destiny, Ruling, and Admin Curated
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We surface one crystal for your destiny number, one for your ruling number, and one piece explicitly selected by the admin.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={highlightCardClass}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-300 mb-1">Destiny Match</p>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">Best for your destiny number</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-fuchsia-200">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Number {destiny}
                  </span>
                </div>

                {topPicks.destinyMatch ? (
                  <div className="grid gap-4 md:grid-cols-[180px_1fr] items-center">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <img
                        src={topPicks.destinyMatch.image}
                        alt={topPicks.destinyMatch.name}
                        className="h-full w-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{formatProductName(topPicks.destinyMatch)}</p>
                        <p className="text-sm sm:text-base text-white/80">{topPicks.destinyMatch.benefit}</p>
                      </div>
                      <Button asChild className="w-full sm:w-auto">
                        <Link to={`/product/${topPicks.destinyMatch.id}`}>View destiny match</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
                    We could not find an exact destiny match yet, so the main crystal grid will help you explore other options.
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className={highlightCardClass}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 pointer-events-none" />
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300 mb-1">Ruling Match</p>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">Best for your ruling number</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                    <Stars className="w-3.5 h-3.5" />
                    Number {mulank}
                  </span>
                </div>

                {topPicks.rulingMatch ? (
                  <div className="grid gap-4 md:grid-cols-[180px_1fr] items-center">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      <img
                        src={topPicks.rulingMatch.image}
                        alt={topPicks.rulingMatch.name}
                        className="h-full w-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{formatProductName(topPicks.rulingMatch)}</p>
                        <p className="text-sm sm:text-base text-white/80">{topPicks.rulingMatch.benefit}</p>
                      </div>
                      <Button asChild className="w-full sm:w-auto">
                        <Link to={`/product/${topPicks.rulingMatch.id}`}>View ruling match</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
                    We could not find a direct ruling match yet, so the crystal grid will still show supportive options.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 via-white/[0.02] to-amber-500/10 p-5 sm:p-6 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_30%)] pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row gap-5 lg:items-center justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-accent mb-2">Admin Spotlight</p>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                  Curated by the admin and shown as a premium feature
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This spotlight appears only when the admin explicitly selects a product from the dashboard.
                </p>
              </div>

              {topPicks.adminPick ? (
                <div className="lg:w-[420px] w-full">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
                        <Crown className="w-3.5 h-3.5" />
                        Admin Pick
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Special Display
                      </span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-3 items-center">
                      <div className="overflow-hidden rounded-xl border border-white/10">
                        <img
                          src={topPicks.adminPick.image}
                          alt={topPicks.adminPick.name}
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h4 className="font-serif font-semibold text-white text-base sm:text-lg mb-1">{formatProductName(topPicks.adminPick)}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{topPicks.adminPick.benefit}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                            <WandSparkles className="inline-block w-3 h-3 mr-1" />
                            Admin Curated
                          </span>
                          {topPicks.adminPick.featured && (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-200">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild className="w-full">
                        <Link to={`/product/${topPicks.adminPick.id}`}>Open admin choice</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:w-[420px] w-full rounded-2xl border border-dashed border-white/10 p-5 text-sm text-muted-foreground">
                  No admin-curated product is selected yet. The admin can choose any product from the product dashboard.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-5 rounded-xl border border-border col-span-full"
            >
              <h3 className="font-serif font-bold text-lg text-primary mb-2">Your Personality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.personality}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-5 rounded-xl border border-primary/20"
            >
              <h3 className="font-serif font-bold text-base text-pink-500 mb-2">Love Life</h3>
              <p className="text-sm text-muted-foreground">{data.loveAdvice}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-5 rounded-xl border border-primary/20"
            >
              <h3 className="font-serif font-bold text-base text-blue-500 mb-2">Career & Wealth</h3>
              <p className="text-sm text-muted-foreground">{data.careerAdvice}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card p-5 rounded-xl border border-primary/20 col-span-full md:col-span-2"
            >
              <h3 className="font-serif font-bold text-base text-green-500 mb-2">Peace & Healing</h3>
              <p className="text-sm text-muted-foreground">{data.peaceAdvice}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomizeYourOwnPage;
