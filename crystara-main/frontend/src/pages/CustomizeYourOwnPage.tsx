import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import { CrystalButton } from "@/components/CrystalButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHeroSlides } from "@/lib/sanityImage";
import { calculateDestinyNumber, calculateMulank } from "@/lib/numerology";

const CustomizeYourOwnPage = () => {
  const { data: siteSettings } = useSiteSettings();
  const backgroundImage =
    siteSettings?.customizePageBackground ||
    resolveHeroSlides(siteSettings?.heroSlides)[0]?.url;
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");

  const handleDiscoverCrystals = () => {
    if (!dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }

    const destinyNumber = calculateDestinyNumber(dateOfBirth);
    const mulankNumber = calculateMulank(dateOfBirth);
    navigate(`/discover-your-crystals?destiny=${destinyNumber}&mulank=${mulankNumber}&dob=${dateOfBirth}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-black">
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

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-28 pb-12">
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
              {/* Date Label */}
              <label className="block text-white/60 text-sm font-semibold tracking-wide">
                Date of Birth
              </label>

              {/* Date Input — always type="date" so iOS Safari shows the native picker */}
              <div className="relative">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    setError("");
                  }}
                  className="w-full h-12 px-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg focus:outline-none focus:border-accent transition-all duration-300 text-center"
                  style={{
                    colorScheme: "dark",
                    color: dateOfBirth ? "white" : "transparent",
                  }}
                />
                {/* Placeholder overlay — covers native dd-mm-yyyy text when empty */}
                {!dateOfBirth && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/40 text-sm rounded-lg">
                    Select Date of Birth
                  </span>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {error}
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
};

export default CustomizeYourOwnPage;
