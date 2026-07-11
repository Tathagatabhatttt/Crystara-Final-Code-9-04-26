// Comprehensive product catalog for Crystara
import { getProductThumbnail } from "./productImages";

export interface ProductVariant {
  id: string;
  name: string;
  stone: string;
  price: number;
  originalPrice?: number;
  image: string;
  benefit: string;
}

export interface ProductSubCategory {
  id: string;
  name: string;
  slug: string;
  variants: ProductVariant[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  subCategories: ProductSubCategory[];
}

const generateId = (category: string, subCategory: string, stone: string) =>
  `${category}-${subCategory}-${stone}`.toLowerCase().replace(/\s+/g, '-');

const stoneBenefits: Record<string, string> = {
  "Money Magnet": "Attracts wealth & prosperity",
  "Green Aventurine": "Luck & opportunity",
  "Turquoise": "Protection & healing",
  "Lapis": "Wisdom & truth",
  "Amethyst": "Peace & intuition",
  "Citrine Natural": "Joy & abundance",
  "Citrine": "Success & creativity",
  "Clear Quartz": "Clarity & amplification",
  "Rose Quartz": "Love & emotional healing",
  "Sun Stone": "Vitality & leadership",
  "Sunstone": "Vitality & leadership",
  "Green Jade": "Harmony & balance",
  "Black Tourmaline": "Protection & grounding",
  "Pyrite": "Confidence & manifestation",
  "Golden Pyrite": "Abundance & willpower",
  "Opal": "Creativity & inspiration",
  "Opalite": "Transition & communication",
  "Hematite": "Grounding & focus",
  "Tiger Eye": "Courage & confidence",
  "7 Chakra": "Balance all chakras",
  "OM Money Multi Crystal": "Spiritual abundance",
  "OM Money Black": "Protection & prosperity",
  "Rainbow Moon Stone": "Intuition & new beginnings",
  "Rainbow Moonstone": "Intuition & new beginnings",
  "Blue Gold Stone": "Ambition & drive",
  "Larvikite": "Patience & grounding",
  "Sodalite": "Logic & truth",
  "Dalmatian": "Joy & playfulness",
  "Sulemani Hakik": "Protection & stability",
  "Orange": "Creativity & enthusiasm",
  "Pink Onyx": "Emotional balance",
  "Black Onyx": "Strength & protection",
  "Aquamarine": "Calm & clarity",
  "Ruby Matrix": "Passion & vitality",
  "Black Ocean Jasper": "Tranquility & wholeness",
  "Yellow Quartz": "Optimism & clarity",
  "Amazonite": "Truth & communication",
  "Blood Stone": "Courage & vitality",
  "Serpentine": "Kundalini awakening",
  "Laxmi Wealth": "Goddess blessings & prosperity",
  "Orgone Pyramid": "Energy harmonization",
  "Laxmi Orgone Pyramid with Pyrite Chips": "Divine wealth attraction",
  "7 Chakra Orgone": "Full chakra alignment",
  "Anahata Orgone": "Heart chakra healing",
  "Green Jade Zhu Orgone": "Luck & protection",
  "7 Horse Vastu": "Success & power",
  "Gayatri Mantra": "Spiritual wisdom",
  "Zhu Symbol": "Prosperity & luck",
  "Ganesh": "Obstacle removal",
  "7 Horse with Sun": "Vitality & success",
  "Tree of Life": "Growth & connection",
  "Shree Kuber Mantra": "Wealth attraction",
  "Shree Sampurna Kuber Laxmi Yantra": "Complete prosperity",
  "Saraswati Maa": "Knowledge & arts",
  "Ganesh Ji": "Blessings & wisdom",
  "Laxmi Mata": "Wealth & fortune",
  "Hanuman Ji": "Strength & devotion",
  "Ram Lala": "Divine grace",
  "Shiv Shakti": "Universal energy",
  "Radha Krishna": "Divine love",
  "Tirupati Balaji": "Blessings & fulfillment",
  "Hamsa with Buddha": "Protection & enlightenment",
};

// Pricing per user's specification
const categoryPricing: Record<string, { price: number; originalPrice: number }> = {
  "chip-bracelet": { price: 999, originalPrice: 2000 },
  "beads-bracelet": { price: 1199, originalPrice: 2200 },
  "ring": { price: 1299, originalPrice: 3000 },
  "pendant": { price: 599, originalPrice: 1500 },
  "pyramid": { price: 1199, originalPrice: 2200 },
  "frame": { price: 999, originalPrice: 2000 },
};

const getPricing = (categorySlug: string, subCategorySlug: string) => {
  if (categorySlug === "bracelets") {
    return subCategorySlug === "chip-bracelet" ? categoryPricing["chip-bracelet"] : categoryPricing["beads-bracelet"];
  }
  if (categorySlug === "rings") return categoryPricing["ring"];
  if (categorySlug === "lockets") return categoryPricing["pendant"];
  if (categorySlug === "pyramids") return categoryPricing["pyramid"];
  if (categorySlug === "frames") return categoryPricing["frame"];
  return { price: 999, originalPrice: 2000 };
};

// Stone lists
const chipBraceletStones = ["Money Magnet", "Green Aventurine", "Turquoise", "Lapis", "Amethyst", "Citrine Natural", "Clear Quartz", "Rose Quartz", "Sun Stone", "Green Jade", "Black Tourmaline", "Pyrite", "Opal", "Hematite"];
const beadsBraceletStones = ["Tiger Eye", "Money Magnet", "Green Aventurine", "Lapis", "Amethyst", "Citrine", "Citrine Natural", "Rose Quartz", "Sun Stone", "Green Jade", "Pyrite", "Hematite", "7 Chakra", "Golden Pyrite", "Sunstone", "OM Money Multi Crystal", "OM Money Black", "Opalite"];
const ringStones = ["Tiger Eye", "Lapis", "Amethyst", "Citrine", "Rose Quartz", "Green Jade", "Pyrite", "Rainbow Moon Stone", "Turquoise"];
const ringStyles = ["Diamond Cut Oval Faced", "Heart Shaped", "Moon Shaped"];
const silverCapStones = ["Tiger Eye", "Lapis", "Amethyst", "Black Tourmaline", "Clear Quartz", "Larvikite", "Sodalite", "Rose Quartz", "Dalmatian"];
const heartPendantStones = ["Tiger Eye", "Lapis", "Amethyst", "Blue Gold Stone", "Clear Quartz", "Rose Quartz", "Sunstone", "Green Jade"];
const tortoisePendantStones = ["Tiger Eye", "Lapis", "Amethyst", "Black Tourmaline", "Clear Quartz", "Opalite", "Green Aventurine", "Rose Quartz"];
const moonOwlStones = ["Tiger Eye", "Lapis", "Amethyst", "Rose Quartz", "Green Aventurine"];
const threadWrappedStones = ["Sulemani Hakik", "Orange", "Pink Onyx", "Amethyst", "Black Onyx", "Aquamarine", "Citrine", "Clear Quartz", "Green Aventurine", "Ruby Matrix", "Rainbow Moonstone"];
const silverWireWrappedStones = ["Tiger Eye", "7 Chakra", "Clear Quartz", "Rose Quartz"];
const rawStonePendantStones = ["Tiger Eye", "Lapis", "Amethyst", "Black Ocean Jasper", "Yellow Quartz", "Amazonite", "Blood Stone", "Clear Quartz", "Rainbow Moonstone", "Rose Quartz", "Serpentine"];
const orgonePyramidTypes = ["Laxmi Wealth", "Orgone Pyramid", "Money Magnet", "Laxmi Orgone Pyramid with Pyrite Chips", "7 Chakra Orgone", "Anahata Orgone", "Green Jade Zhu Orgone"];
const singleStonePyramidStones = ["Lapis", "Pyrite", "Citrine", "Amethyst", "Rose Quartz", "Green Jade", "Black Tourmaline"];
const pyriteFrameDesigns = ["7 Horse Vastu", "Gayatri Mantra", "Zhu Symbol", "Ganesh", "7 Horse with Sun", "Tree of Life", "Shree Kuber Mantra", "Shree Sampurna Kuber Laxmi Yantra"];
const pyriteMultiFrameDesigns = ["Saraswati Maa", "Ganesh Ji", "Laxmi Mata", "Hanuman Ji", "Ram Lala", "Shiv Shakti", "Radha Krishna", "Tirupati Balaji", "Hamsa with Buddha"];

const createVariants = (
  categorySlug: string,
  subCategorySlug: string,
  stones: string[],
): ProductVariant[] => {
  const pricing = getPricing(categorySlug, subCategorySlug);
  return stones.map((stone, index) => ({
    id: generateId(categorySlug, subCategorySlug, stone),
    name: stone,
    stone,
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    image: getProductThumbnail(categorySlug, subCategorySlug, index),
    benefit: stoneBenefits[stone] || "Healing & balance",
  }));
};

export const productCatalog: ProductCategory[] = [
  {
    id: "bracelets", name: "Bracelets", slug: "bracelets",
    subCategories: [
      { id: "chip-bracelet", name: "Chip Bracelet", slug: "chip-bracelet", variants: createVariants("bracelets", "chip-bracelet", chipBraceletStones) },
      { id: "beads-bracelet", name: "Beads Bracelet", slug: "beads-bracelet", variants: createVariants("bracelets", "beads-bracelet", beadsBraceletStones) },
    ],
  },
  {
    id: "rings", name: "Rings", slug: "rings",
    subCategories: ringStyles.map((style) => ({
      id: style.toLowerCase().replace(/\s+/g, '-'),
      name: style,
      slug: style.toLowerCase().replace(/\s+/g, '-'),
      variants: createVariants("rings", style.toLowerCase().replace(/\s+/g, '-'), ringStones),
    })),
  },
  {
    id: "lockets", name: "Lockets / Pendants", slug: "lockets",
    subCategories: [
      { id: "tortoise-shaped-pendant", name: "Tortoise Shaped Pendant", slug: "tortoise-shaped-pendant", variants: createVariants("lockets", "tortoise-shaped-pendant", tortoisePendantStones) },
      { id: "moon-owl-shaped-pendant", name: "Moon Owl Shaped Pendant", slug: "moon-owl-shaped-pendant", variants: createVariants("lockets", "moon-owl-shaped-pendant", moonOwlStones) },
      { id: "thread-wrapped-pendant", name: "Thread Wrapped Pendant", slug: "thread-wrapped-pendant", variants: createVariants("lockets", "thread-wrapped-pendant", threadWrappedStones) },
    ],
  },
  {
    id: "combos", name: "Combos", slug: "combos",
    subCategories: [
      {
        id: "combo-offers", name: "Combo Offers", slug: "combo-offers",
        variants: [
          {
            id: "combo-money-magnet-lava-healing",
            name: "Money Magnet + Lava Stone + Healing Stone Combo",
            stone: "Combo",
            price: 2499,
            originalPrice: 4197,
            image: getProductThumbnail("bracelets", "beads-bracelet", 1),
            benefit: "Ultimate wealth attraction, grounding energy & holistic healing — 3 powerful bracelets in 1 pack",
          },
        ],
      },
    ],
  },
];

// Flatten all products
export const getAllProducts = (): (ProductVariant & { category: string; categorySlug: string; subCategory: string; subCategorySlug: string })[] => {
  const allProducts: (ProductVariant & { category: string; categorySlug: string; subCategory: string; subCategorySlug: string })[] = [];
  productCatalog.forEach((cat) => {
    cat.subCategories.forEach((sub) => {
      sub.variants.forEach((v) => {
        allProducts.push({ ...v, category: cat.name, categorySlug: cat.slug, subCategory: sub.name, subCategorySlug: sub.slug });
      });
    });
  });
  return allProducts;
};

export const getFeaturedProducts = (count = 8) => {
  const all = getAllProducts();
  const shuffled = [...all].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getProductsByCategory = (categorySlug: string) => getAllProducts().filter((p) => p.categorySlug === categorySlug);
export const getProductsBySubCategory = (categorySlug: string, subCategorySlug: string) => getAllProducts().filter((p) => p.categorySlug === categorySlug && p.subCategorySlug === subCategorySlug);
export const getProductById = (productId: string) => getAllProducts().find((p) => p.id === productId);
export const searchProducts = (query: string) => {
  const q = query.toLowerCase();
  return getAllProducts().filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subCategory.toLowerCase().includes(q) || p.benefit.toLowerCase().includes(q));
};
