import { useMemo } from "react";
import {
  productCatalog as staticCatalog,
  getAllProducts as getStaticProducts,
  getFeaturedProducts as getStaticFeaturedProducts,
  getProductsByCategory as getStaticProductsByCategory,
  getProductsBySubCategory as getStaticProductsBySubCategory,
  getProductById as getStaticProductById,
  searchProducts as searchStaticProducts,
  type ProductCategory,
} from "@/data/products";
import { useAllProducts, useProductCatalog, type FlatProduct } from "@/hooks/useProducts";

/**
 * Primary hook for all storefront product data.
 *
 * `useAllProducts` (from useProducts.ts) already merges:
 *   static hardcoded products  ←  Sanity CMS overrides  ←  Supabase overrides
 * and filters out any product with `isDeleted === true`.
 *
 * We fall back to the raw static list ONLY while the query is still loading
 * for the very first time, so the page isn't empty during that brief moment.
 */
export function useCatalogProducts() {
  const query = useAllProducts();
  const staticFallback = useMemo(() => getStaticProducts(), []);

  const data = useMemo(() => {
    // Once the query has resolved at least once, always use its result.
    // query.data is already fully merged and deletion-filtered.
    if (query.data) return query.data;
    // While still loading for the first time, show the static catalog.
    return staticFallback;
  }, [query.data, staticFallback]);

  return { ...query, data };
}

export function useCatalogStructure() {
  const query = useProductCatalog();
  const data = useMemo(() => {
    const cmsCategories = query.data || [];
    const merged = [...staticCatalog];
    
    cmsCategories.forEach((cc) => {
      const idx = merged.findIndex((m) => m.slug === cc.slug || m.id === cc.id);
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...cc };
      } else {
        merged.push(cc);
      }
    });
    return merged;
  }, [query.data]);

  return { ...query, data };
}

export function useCatalogFeaturedProducts(count = 8) {
  const { data: products, ...rest } = useCatalogProducts();
  const featured = useMemo(() => {
    const curated = products.filter((product) => product.featured);
    if (curated.length > 0) {
      return curated.slice(0, count);
    }

    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [products, count]);

  return { data: featured, ...rest };
}

export function useCatalogProductsByCategory(categorySlug: string | undefined) {
  const { data: products, ...rest } = useCatalogProducts();
  const filtered = useMemo(
    () =>
      categorySlug
        ? products.filter((product) => product.categorySlug === categorySlug)
        : [],
    [products, categorySlug],
  );
  return { data: filtered, ...rest };
}

export function useCatalogProductsBySubCategory(
  categorySlug: string | undefined,
  subCategorySlug: string | undefined,
) {
  const { data: products, ...rest } = useCatalogProducts();
  const filtered = useMemo(
    () =>
      categorySlug && subCategorySlug
        ? products.filter(
            (product) =>
              product.categorySlug === categorySlug &&
              product.subCategorySlug === subCategorySlug,
          )
        : [],
    [products, categorySlug, subCategorySlug],
  );
  return { data: filtered, ...rest };
}

export function useCatalogProductById(productId: string | undefined) {
  const { data: products, ...rest } = useCatalogProducts();
  const product = useMemo(
    () => (productId ? products.find((item) => item.id === productId) : undefined),
    [products, productId],
  );
  return { data: product, ...rest };
}

export function useCatalogSearchProducts(query: string) {
  const { data: products, ...rest } = useCatalogProducts();
  const q = query.toLowerCase();
  const results = useMemo(
    () =>
      q.length >= 2
        ? products.filter(
            (product) =>
              product.name.toLowerCase().includes(q) ||
              product.category.toLowerCase().includes(q) ||
              product.subCategory.toLowerCase().includes(q) ||
              product.benefit.toLowerCase().includes(q),
          )
        : [],
    [products, q],
  );
  return { data: results, ...rest };
}

export function getProductGalleryImages(
  product: FlatProduct,
  fallbackImages: string[] = [],
): string[] {
  if (Array.isArray(product.galleryImages)) {
    if (product.image && !product.galleryImages.includes(product.image)) {
      return [product.image, ...product.galleryImages];
    }
    return product.galleryImages;
  }
  if (product.image) {
    return [product.image, ...fallbackImages.filter((url) => url !== product.image)].slice(0, 5);
  }
  return fallbackImages;
}

// Re-export types for convenience
export type { ProductCategory, FlatProduct };
