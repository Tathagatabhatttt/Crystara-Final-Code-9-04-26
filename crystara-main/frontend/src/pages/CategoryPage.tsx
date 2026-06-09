import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import {
  useCatalogStructure,
  useCatalogProductsByCategory,
  useCatalogProductsBySubCategory,
} from "@/hooks/useCatalog";

const CategoryPage = () => {
  const { categorySlug, subCategorySlug } = useParams<{ 
    categorySlug: string; 
    subCategorySlug?: string 
  }>();

  const { data: productCatalog } = useCatalogStructure();
  const { data: categoryProducts } = useCatalogProductsByCategory(categorySlug);
  const { data: subCategoryProducts } = useCatalogProductsBySubCategory(
    categorySlug,
    subCategorySlug,
  );

  const category = productCatalog.find((c) => c.slug === categorySlug);
  const subCategory = category?.subCategories.find((s) => s.slug === subCategorySlug);

  const products = subCategorySlug && categorySlug
    ? subCategoryProducts
    : categoryProducts;

  const title = subCategory?.name || category?.name || "Products";
  const description = subCategory
    ? `Explore our collection of ${subCategory.name} crystals`
    : category
    ? `Discover all ${category.name} in our collection`
    : "Browse our crystal collection";

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The category you're looking for doesn't exist.
            </p>
            <Link to="/shop">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
                Back to Shop
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-16"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            {subCategory ? (
              <>
                <Link 
                  to={`/category/${categorySlug}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
                <span className="text-foreground">{subCategory.name}</span>
              </>
            ) : (
              <span className="text-foreground">{category.name}</span>
            )}
          </nav>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">
            {title.split(' ')[0]} <span className="text-gradient-mystic">{title.split(' ').slice(1).join(' ') || ''}</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            {description}
          </p>

          {/* Sub-category filters (if showing main category) */}
          {!subCategorySlug && category.subCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Link
                to={`/category/${categorySlug}`}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors"
              >
                All {category.name}
              </Link>
              {category.subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/category/${categorySlug}/${sub.slug}`}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={{
                  id: index,
                  name: `${product.name} ${product.subCategory}`,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.image,
                  category: product.category,
                  benefit: product.benefit,
                }}
                index={index}
                linkTo={`/product/${product.id}`}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
