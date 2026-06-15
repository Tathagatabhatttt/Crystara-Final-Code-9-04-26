import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import type { ProductCategory, ProductSubCategory, ProductVariant } from "@/data/products";
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
};

async function fetchProductCatalog(): Promise<ProductCategory[]> {
    const data = await sanityClient.fetch<ProductCategory[]>(CATEGORIES_QUERY);
    return data;
}

async function fetchAllProducts(): Promise<FlatProduct[]> {
    let sanityProducts: FlatProduct[] = [];
    try {
        sanityProducts = await sanityClient.fetch<FlatProduct[]>(ALL_PRODUCTS_QUERY);
    } catch (err) {
        console.error("Sanity fetch failed:", err);
    }

    let supabaseProducts: FlatProduct[] = [];
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*");
        
        if (error) throw error;
        
        if (data) {
            supabaseProducts = data.map((row: any) => ({
                id: row.id,
                name: row.name,
                stone: row.stone || "",
                price: Number(row.price),
                originalPrice: row.original_price ? Number(row.original_price) : undefined,
                benefit: row.benefit || "",
                image: row.image || "",
                galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
                featured: row.featured || false,
                category: row.category,
                categorySlug: row.category_slug,
                subCategory: row.sub_category || "",
                subCategorySlug: row.sub_category_slug || "",
            }));
        }
    } catch (err) {
        console.error("Supabase products fetch failed:", err);
    }

    // Merge or concatenate both catalogs
    // If they have the same ID, Supabase products take precedence so the client can override them!
    const merged = [...sanityProducts];
    supabaseProducts.forEach((sp) => {
        const idx = merged.findIndex((p) => p.id === sp.id);
        if (idx !== -1) {
            merged[idx] = sp;
        } else {
            merged.push(sp);
        }
    });

    return merged;
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
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
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
