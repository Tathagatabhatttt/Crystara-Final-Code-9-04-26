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
    <section className="relative w-full h-[100svh] min-h-[100svh] overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.url}
            className="absolute inset-0 w-full h-full scale-105"
            style={{
              backgroundImage: `url(${activeSlide.url})`,
              backgroundSize: "cover",
              backgroundPosition: isMobile ? "center 42%" : "center center",
              backgroundRepeat: "no-repeat",
            }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.7 }}
            role="img"
            aria-label={activeSlide.alt || `Hero slide ${currentSlide + 1}`}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
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

      <div className="relative z-10 flex h-full w-full max-w-5xl mx-auto flex-col items-center justify-center px-5 pb-24 pt-24 text-center sm:px-6 sm:pb-28 md:px-8 md:pb-32">
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
          className="text-3xl min-[390px]:text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold leading-tight mb-3 sm:mb-4 text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]"
        >
          Discover the{" "}
          <span className="text-gradient-mystic">Magic</span> of{" "}
          <br className="hidden sm:block" />
          Healing Crystals
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 flex w-full justify-center sm:mt-6"
        >
          <Link to="/customize-your-own" className="block w-full max-w-[34rem]">
            <CrystalButton
              className="w-full px-8 sm:px-14 py-4 sm:py-5 text-xs min-[390px]:text-sm sm:text-base font-semibold uppercase tracking-widest text-white"
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

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent sm:h-28" />
    </section>
  );
};

export default HeroSection;
