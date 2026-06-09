import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";
import type { HeroSlide } from "@/hooks/useSiteSettings";

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { url: heroSlide1, alt: "Crystara hero slide 1" },
  { url: heroSlide2, alt: "Crystara hero slide 2" },
  { url: heroSlide3, alt: "Crystara hero slide 3" },
  { url: heroSlide4, alt: "Crystara hero slide 4" },
  { url: heroSlide5, alt: "Crystara hero slide 5" },
];

export function resolveHeroSlides(cmsSlides?: HeroSlide[] | null): HeroSlide[] {
  const validSlides = (cmsSlides ?? []).filter((slide) => Boolean(slide?.url));
  return validSlides.length > 0 ? validSlides : DEFAULT_HERO_SLIDES;
}
