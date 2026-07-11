import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import type { ProductSubCategory, ProductVariant } from "@/data/products";
import { getAllProducts as getStaticProducts, type ProductCategory } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

// GROQ query to fetch all products with their referenced category and sub-category
const ALL_PRODUCTS_QUERY = `*[_type == "product"]{
  "id": slug.current,
  name,
  stone,
  price,
  originalPrice,
  featured,
  "image": Image.asset->url,
  "galleryImages": galleryImages[].asset->url,
  benefit,
  "category": category->name,
  "categorySlug": category->slug.current,
  "subCategory": subCategory->name,
  "subCategorySlug": subCategory->slug.current
}`;

const CATEGORIES_QUERY = `*[_type == "productCategory"] | order(name asc) {
  "id": slug.current,
  name,
  "slug": slug.current,
  "subCategories": *[_type == "productSubCategory" && category._ref == ^._id] | order(name asc) {
    "id": slug.current,
    name,
    "slug": slug.current,
    "variants": *[_type == "product" && subCategory._ref == ^._id] | order(name asc) {
      "id": slug.current,
      name,
      stone,
      price,
      originalPrice,
      "image": Image.asset->url,
      "galleryImages": galleryImages[].asset->url,
      benefit
    }
  }
}`;

export type FlatProduct = ProductVariant & {
    galleryImages?: string[];
    featured?: boolean;
    category: string;
    categorySlug: string;
    subCategory: string;
    subCategorySlug: string;
    isDeleted?: boolean;
    isFromSanity?: boolean;
    stock?: number;
    videoUrl?: string;
    alignedNumbers?: number[];
    rulingNumbers?: number[];
    destinyNumbers?: number[];
};

const timeoutPromise = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            console.warn(`Sanity query timed out after ${ms}ms. Returning fallback.`);
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

async function fetchProductCatalog(): Promise<ProductCategory[]> {
    try {
        const fetchPromise = sanityClient.fetch<ProductCategory[]>(CATEGORIES_QUERY);
        return await timeoutPromise(fetchPromise, 5000, [] as ProductCategory[]);
    } catch (err) {
        console.error("Error fetching product catalog:", err);
        return [];
    }
}

async function fetchAllProducts(): Promise<FlatProduct[]> {
    const sanityPromise = sanityClient.fetch<FlatProduct[]>(ALL_PRODUCTS_QUERY)
        .catch((err) => {
            console.error("Sanity fetch failed:", err);
            return [] as FlatProduct[];
        });

    const supabasePromise = supabase
        .from("products")
        .select("*")
        .then(({ data, error }) => {
            if (error) throw error;
            if (!data) return [] as FlatProduct[];
            return data.map((row: any) => ({
                id: row.id,
                name: row.name || "",
                stone: row.stone || "",
                price: Number(row.price || 0),
                originalPrice: row.original_price ? Number(row.original_price) : undefined,
                benefit: row.benefit || "",
                image: row.image || "",
                galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
                featured: row.featured || false,
                category: row.category || "",
                categorySlug: row.category_slug || "",
                subCategory: row.sub_category || "",
                subCategorySlug: row.sub_category_slug || "",
                isDeleted: row.is_deleted || false,
                stock: row.stock !== undefined && row.stock !== null ? Number(row.stock) : undefined,
                videoUrl: row.video_url || "",
                alignedNumbers: Array.isArray(row.aligned_numbers) ? row.aligned_numbers.map(Number) : [],
                rulingNumbers: Array.isArray(row.ruling_numbers) ? row.ruling_numbers.map(Number) : [],
                destinyNumbers: Array.isArray(row.destiny_numbers) ? row.destiny_numbers.map(Number) : [],
            })) as FlatProduct[];
        })
        .catch((err) => {
            console.error("Supabase products fetch failed:", err);
            return [] as FlatProduct[];
        });

    // Run fetches in parallel, with a 5-second timeout on the Sanity query
    const [sanityProducts, supabaseProducts] = await Promise.all([
        timeoutPromise(sanityPromise, 5000, [] as FlatProduct[]),
        supabasePromise
    ]);

    const staticProducts = getStaticProducts().map(p => ({
        ...p,
        isFromSanity: false,
        featured: p.featured || false,
    })) as FlatProduct[];

    const merged = [...staticProducts];

    // 1. Merge Sanity products (predefined products, they take precedence over static)
    sanityProducts.forEach((p) => {
        const idx = merged.findIndex((m) => m.id === p.id);
        if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...p, isFromSanity: true };
        } else {
            merged.push({ ...p, isFromSanity: true });
        }
    });

    // 2. Merge Supabase products (overrides and custom database products)
    supabaseProducts.forEach((sp) => {
        if (!sp.id) return;
        const idx = merged.findIndex((m) => m.id === sp.id);
        if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...sp };
        } else {
            merged.push({ ...sp, isFromSanity: false });
        }
    });

    // Filter out any product marked as deleted
    return merged.filter((p) => !p.isDeleted);
}

export function useProductCatalog() {
    return useQuery<ProductCategory[]>({
        queryKey: ["sanity-product-catalog"],
        queryFn: fetchProductCatalog,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useAllProducts() {
    return useQuery<FlatProduct[]>({
        queryKey: ["sanity-all-products"],
        queryFn: fetchAllProducts,
        staleTime: 0,              // Always consider data stale so refetch runs on mount
        gcTime: 1000 * 60 * 30,   // Keep in memory for 30 min but always revalidate
        refetchOnWindowFocus: true, // Refetch when admin returns to the tab after editing
    });
}

export function useFeaturedProducts(count = 8) {
    const { data: allProducts, ...rest } = useAllProducts();
    const featured = allProducts
        ? [...allProducts].sort(() => 0.5 - Math.random()).slice(0, count)
        : [];
    return { data: featured, ...rest };
}

export function useProductsByCategory(categorySlug: string | undefined) {
    const { data: allProducts, ...rest } = useAllProducts();
    const filtered = allProducts && categorySlug
        ? allProducts.filter((p) => p.categorySlug === categorySlug)
        : [];
    return { data: filtered, ...rest };
}

export function useProductsBySubCategory(
    categorySlug: string | undefined,
    subCategorySlug: string | undefined
) {
    const { data: allProducts, ...rest } = useAllProducts();
    const filtered =
        allProducts && categorySlug && subCategorySlug
            ? allProducts.filter(
                (p) =>
                    p.categorySlug === categorySlug &&
                    p.subCategorySlug === subCategorySlug
            )
            : [];
    return { data: filtered, ...rest };
}

export function useProductById(productId: string | undefined) {
    const { data: allProducts, ...rest } = useAllProducts();
    const product = allProducts
        ? allProducts.find((p) => p.id === productId)
        : undefined;
    return { data: product, ...rest };
}

export function useSearchProducts(query: string) {
    const { data: allProducts, ...rest } = useAllProducts();
    const q = query.toLowerCase();
    const results =
        allProducts && q.length >= 2
            ? allProducts.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.subCategory.toLowerCase().includes(q) ||
                    p.benefit.toLowerCase().includes(q)
            )
            : [];
    return { data: results, ...rest };
}
