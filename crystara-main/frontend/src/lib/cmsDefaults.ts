import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Sparkles,
  RefreshCw,
  Award,
  Heart,
  Truck,
  RotateCcw,
  Users,
} from "lucide-react";
import categoryChipBracelet from "@/assets/category-chip-bracelet.jpg";
import categoryBeadsBracelet from "@/assets/category-beads-bracelet.jpg";
import categoryRing from "@/assets/category-ring.jpg";
import categoryLocket from "@/assets/category-locket.jpg";

export type HomepageCategory = {
  name: string;
  description: string;
  image: string;
  href: string;
};

export type BenefitCard = {
  title: string;
  description: string;
  iconUrl?: string;
  fallbackIcon: LucideIcon;
  gradient: string;
  iconColor: string;
};

export type ProductFeature = {
  text: string;
  iconUrl?: string;
  fallbackIcon: LucideIcon;
};

export const DEFAULT_HOMEPAGE_CATEGORIES: HomepageCategory[] = [
  {
    name: "Chip Bracelet",
    description: "Natural crystal chips",
    image: categoryChipBracelet,
    href: "/category/bracelets/chip-bracelet",
  },
  {
    name: "Beads Bracelet",
    description: "Polished healing beads",
    image: categoryBeadsBracelet,
    href: "/category/bracelets/beads-bracelet",
  },
  {
    name: "Ring",
    description: "Crystal energy rings",
    image: categoryRing,
    href: "/category/rings",
  },
  {
    name: "Locket",
    description: "Healing pendants",
    image: categoryLocket,
    href: "/category/lockets",
  },
];

const BENEFIT_STYLES = [
  { gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-400", fallbackIcon: Shield },
  { gradient: "from-amber-500/20 to-yellow-500/20", iconColor: "text-amber-400", fallbackIcon: Sparkles },
  { gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400", fallbackIcon: RefreshCw },
  { gradient: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-400", fallbackIcon: Award },
  { gradient: "from-rose-500/20 to-pink-500/20", iconColor: "text-rose-400", fallbackIcon: Heart },
  { gradient: "from-fuchsia-500/20 to-purple-500/20", iconColor: "text-fuchsia-400", fallbackIcon: Truck },
] as const;

export const DEFAULT_BENEFIT_CARDS: BenefitCard[] = [
  {
    title: "Authenticity Certified",
    description:
      "Every stone is lab-tested and certified for geological authenticity and energetic vibration.",
    ...BENEFIT_STYLES[0],
  },
  {
    title: "Ethically Mined",
    description:
      "We partner exclusively with small-scale artisan mines that prioritize worker safety and earth conservation.",
    ...BENEFIT_STYLES[1],
  },
  {
    title: "Vibrational Cleansing",
    description:
      "All crystals undergo a proprietary sound cleansing and singing bowl ritual before shipping to you.",
    ...BENEFIT_STYLES[2],
  },
  {
    title: "Rare Luxury Packing",
    description:
      "Sustainably sourced unwrapping that maintains the aesthetic elegance of a luxury boutique.",
    ...BENEFIT_STYLES[3],
  },
  {
    title: "Expert Guidance",
    description:
      "Access our digital library of rituals and meditation guides curated for your specific piece.",
    ...BENEFIT_STYLES[4],
  },
  {
    title: "Global Community",
    description:
      "Join over 5,000 light-workers in our exclusive digital sanctuary and crystal exchange.",
    ...BENEFIT_STYLES[5],
  },
];

const PRODUCT_FEATURE_ICONS = [Sparkles, Shield, Truck, RotateCcw, Award, Users] as const;

export const DEFAULT_PRODUCT_FEATURES: ProductFeature[] = [
  { text: "100% Natural Crystal", fallbackIcon: PRODUCT_FEATURE_ICONS[0] },
  { text: "Energetically Cleansed", fallbackIcon: PRODUCT_FEATURE_ICONS[1] },
  { text: "Free Delivery above ₹999", fallbackIcon: PRODUCT_FEATURE_ICONS[2] },
  { text: "7 Days Easy Returns", fallbackIcon: PRODUCT_FEATURE_ICONS[3] },
  { text: "Authenticity Certificate", fallbackIcon: PRODUCT_FEATURE_ICONS[4] },
  { text: "1200+ Happy Customers", fallbackIcon: PRODUCT_FEATURE_ICONS[5] },
];

export function withBenefitStyles<T extends { title: string; description: string; iconUrl?: string }>(
  items: T[],
): BenefitCard[] {
  return items.map((item, index) => {
    const style = BENEFIT_STYLES[index % BENEFIT_STYLES.length];
    return {
      ...item,
      ...style,
    };
  });
}

export function withProductFeatureIcons<T extends { text: string; iconUrl?: string }>(
  items: T[],
): ProductFeature[] {
  return items.map((item, index) => ({
    ...item,
    fallbackIcon: PRODUCT_FEATURE_ICONS[index % PRODUCT_FEATURE_ICONS.length],
  }));
}
