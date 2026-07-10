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

  if (!activeSlide) {
    return (
      <section className="relative w-full h-[100svh] overflow-hidden bg-black flex items-center justify-center">
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between py-8 px-6 text-center">
          <div className="pt-8 sm:pt-12 md:pt-16 max-w-5xl mx-auto px-5">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/85 sm:text-xs">
              Handpicked · Natural · Energized
            </p>
            <h1 className="text-3xl font-serif font-bold text-white min-[390px]:text-4xl sm:text-5xl md:text-6xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)]">
              Welcome to <span className="text-gradient-mystic">Crystara</span>
            </h1>
          </div>
          <div className="mx-auto w-full max-w-[34rem] pointer-events-auto px-5 pb-6 sm:pb-8">
            <Link to="/customize-your-own" className="block">
              <CrystalButton className="w-full px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white sm:text-base">
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-white sm:h-5 sm:w-5" />
                  Customize Your Own
                </span>
              </CrystalButton>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.url}
            className="absolute inset-0 w-full h-full scale-105"
            style={{
              backgroundImage: `url(${activeSlide.url})`,
              backgroundSize: "cover",
              backgroundPosition: isMobile ? "center 48%" : "center center",
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

          <div className="absolute bottom-5 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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

      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between py-6 md:py-10">
        {/* Headline — pinned toward top */}
        <div className="pointer-events-auto mx-auto w-full max-w-5xl px-5 pt-4 text-center sm:px-6 sm:pt-6 md:px-8 md:pt-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-1 text-[10px] font-medium uppercase tracking-[0.28em] text-white/85 sm:mb-2 sm:text-xs sm:tracking-[0.32em] md:text-sm"
          >
            Handpicked · Natural · Energized
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl font-serif font-bold leading-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] min-[390px]:text-3xl sm:text-4xl md:text-5xl xl:text-6xl"
          >
            Discover the{" "}
            <span className="text-gradient-mystic">Magic</span> of{" "}
            <br className="hidden sm:block" />
            Healing Crystals
          </motion.h1>
        </div>

        {/* CTA — pinned toward bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pointer-events-auto mx-auto w-full max-w-5xl px-5 pb-2 sm:px-6 sm:pb-4 md:px-8 md:pb-6"
        >
          <Link to="/customize-your-own" className="mx-auto block w-full max-w-[34rem]">
            <CrystalButton
              className="w-full px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white min-[390px]:text-sm sm:px-14 sm:py-5 sm:text-base"
              style={{ overflow: "visible" }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                <Sparkles className="h-4 w-4 flex-shrink-0 text-white sm:h-5 sm:w-5" />
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
