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

function mergeProducts(
  staticProducts: FlatProduct[],
  sanityProducts: FlatProduct[],
): FlatProduct[] {
  const sanityMap = new Map(sanityProducts.map((product) => [product.id, product]));

  const merged = staticProducts.map((product) => {
    const fromSanity = sanityMap.get(product.id);
    if (!fromSanity) return product;

    return {
      ...product,
      name: fromSanity.name || product.name,
      stone: fromSanity.stone || product.stone,
      price: fromSanity.price ?? product.price,
      originalPrice: fromSanity.originalPrice ?? product.originalPrice,
      benefit: fromSanity.benefit || product.benefit,
      image: fromSanity.image || product.image,
      galleryImages: Array.isArray(fromSanity.galleryImages)
        ? fromSanity.galleryImages
        : product.galleryImages,
      featured: fromSanity.featured ?? product.featured,
      stock: fromSanity.stock,
      isDeleted: fromSanity.isDeleted,
      isFromSanity: fromSanity.isFromSanity,
      videoUrl: fromSanity.videoUrl || product.videoUrl,
    };
  });

  const staticIds = new Set(staticProducts.map(p => p.id));
  sanityProducts.forEach((sp) => {
    if (!staticIds.has(sp.id)) {
      merged.push(sp);
    }
  });

  return merged.filter((p) => !p.isDeleted);
}

export function useCatalogProducts() {
  const query = useAllProducts();
  const staticProducts = useMemo(() => getStaticProducts(), []);

  const data = useMemo(() => {
    if (!query.data?.length) return staticProducts;
    return mergeProducts(staticProducts, query.data);
  }, [query.data, staticProducts]);

  return { ...query, data };
}

export function useCatalogStructure() {
  const query = useProductCatalog();
  const data = query.data?.length ? query.data : staticCatalog;
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
