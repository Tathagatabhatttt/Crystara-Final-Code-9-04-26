import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import {
  DEFAULT_BENEFIT_CARDS,
  DEFAULT_HOMEPAGE_CATEGORIES,
  DEFAULT_PRODUCT_FEATURES,
  withBenefitStyles,
  withProductFeatureIcons,
  type BenefitCard,
  type HomepageCategory,
  type ProductFeature,
} from "@/lib/cmsDefaults";

export type HeroSlide = {
  url: string;
  alt?: string;
};

export type SiteSettings = {
  heroSlides?: HeroSlide[];
  customizePageBackground?: string;
  homepageCategories?: Array<{
    name: string;
    description?: string;
    image?: string;
    link?: string;
  }>;
  benefitCards?: Array<{
    title: string;
    description: string;
    iconUrl?: string;
  }>;
  productFeatures?: Array<{
    text: string;
    iconUrl?: string;
  }>;
};

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  heroSlides[]{
    "url": image.asset->url,
    alt
  },
  "customizePageBackground": customizePageBackground.asset->url,
  homepageCategories[]{
    name,
    description,
    "image": image.asset->url,
    link
  },
  benefitCards[]{
    title,
    description,
    "iconUrl": icon.asset->url
  },
  productFeatures[]{
    text,
    "iconUrl": icon.asset->url
  }
}`;

const timeoutPromise = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`Site settings query timed out after ${ms}ms. Returning fallback.`);
      resolve(fallback);
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        console.error("Promise rejected:", err);
        resolve(fallback);
      }
    );
  });
};

async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const fetchPromise = sanityClient.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
    return await timeoutPromise(fetchPromise, 5000, null);
  } catch (error) {
    console.error("Failed to fetch site settings from Sanity:", error);
    return null;
  }
}

export function useSiteSettings() {
  return useQuery<SiteSettings | null>({
    queryKey: ["sanity-site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });
}

export function useHomepageCategories(): HomepageCategory[] {
  const { data } = useSiteSettings();

  return useMemo(() => {
    const fromCms = (data?.homepageCategories ?? [])
      .filter((item) => item.name && item.image && item.link)
      .map((item) => ({
        name: item.name,
        description: item.description || "",
        image: item.image!,
        href: item.link!,
      }));

    return fromCms.length > 0 ? fromCms : DEFAULT_HOMEPAGE_CATEGORIES;
  }, [data?.homepageCategories]);
}

export function useBenefitCards(): BenefitCard[] {
  const { data } = useSiteSettings();

  return useMemo(() => {
    const fromCms = (data?.benefitCards ?? []).filter(
      (item) => item.title && item.description,
    );

    if (fromCms.length === 0) return DEFAULT_BENEFIT_CARDS;
    return withBenefitStyles(fromCms);
  }, [data?.benefitCards]);
}

export function useProductFeatures(): ProductFeature[] {
  const { data } = useSiteSettings();

  return useMemo(() => {
    const fromCms = (data?.productFeatures ?? []).filter((item) => item.text);
    if (fromCms.length === 0) return DEFAULT_PRODUCT_FEATURES;
    return withProductFeatureIcons(fromCms);
  }, [data?.productFeatures]);
}
