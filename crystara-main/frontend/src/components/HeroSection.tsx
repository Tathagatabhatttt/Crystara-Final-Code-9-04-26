import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { CrystalButton } from "./CrystalButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHeroSlides } from "@/lib/sanityImage";

const HeroSection = () => {
  const { data: siteSettings } = useSiteSettings();
  const slides = useMemo(
    () => resolveHeroSlides(siteSettings?.heroSlides),
    [siteSettings?.heroSlides],
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeSlide = slides[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-black flex items-center justify-center pt-24 md:pt-28"
      style={{ minHeight: isMobile ? "82svh" : "100svh" }}
    >
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.url}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${activeSlide.url})`,
              backgroundSize: "cover",
              backgroundPosition: isMobile ? "center top" : "center",
              backgroundRepeat: "no-repeat",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            role="img"
            aria-label={activeSlide.alt || `Hero slide ${currentSlide + 1}`}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/42" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-background/80" />
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={`${slide.url}-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 sm:h-1.5 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-6 sm:w-8"
                    : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Text content — bottom-aligned on mobile, center on desktop */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-5 pb-24 pt-4 sm:px-6 sm:pb-28 md:px-8 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.28em] sm:tracking-[0.32em] uppercase text-white/85 mb-3 sm:mb-5"
        >
          Handpicked · Natural · Energized
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl min-[390px]:text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold leading-tight mb-4 sm:mb-5 text-white drop-shadow-lg"
        >
          Discover the{" "}
          <span className="text-gradient-mystic">Magic</span> of{" "}
          <br className="hidden sm:block" />
          Healing Crystals
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm min-[390px]:text-base sm:text-lg md:text-xl text-white/85 mb-6 sm:mb-8 max-w-[21rem] sm:max-w-2xl mx-auto leading-relaxed drop-shadow"
        >
          Discover our curated collection of healing crystals, designed to bring balance and positive energy into your life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-3 sm:gap-4 items-center"
        >
          <Link to="/customize-your-own" className="w-full sm:w-auto">
            <CrystalButton
              className="w-full sm:w-auto max-w-[28rem] min-w-0 sm:min-w-[30rem] px-8 sm:px-14 py-4 sm:py-5 text-xs min-[390px]:text-sm sm:text-base font-semibold uppercase tracking-widest text-white"
              style={{ overflow: "visible" }}
            >
              <span className="flex items-center justify-center gap-2.5 relative z-10">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                Customize Your Own
              </span>
            </CrystalButton>
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
