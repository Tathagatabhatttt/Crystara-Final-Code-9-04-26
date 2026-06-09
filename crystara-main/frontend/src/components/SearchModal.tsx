import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCatalogSearchProducts } from "@/hooks/useCatalog";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const { data: searchResults } = useCatalogSearchProducts(query);
  const results = query.length >= 2 ? searchResults.slice(0, 8) : [];

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end mb-8">
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X size={24} />
              </Button>
            </div>
            
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
                <Input
                  type="text"
                  placeholder="Search for crystals, bracelets, pyramids..."
                  className="w-full pl-14 pr-4 py-6 text-lg bg-card border-border rounded-full"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
              
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} results for "{query}"
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={handleClose}
                        className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {product.name} {product.subCategory}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                          <p className="text-primary font-semibold">
                            ₹{product.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {query.length >= 2 && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center text-muted-foreground"
                >
                  <p>No products found for "{query}"</p>
                  <p className="text-sm mt-2">Try searching for "amethyst", "bracelet", or "pyramid"</p>
                </motion.div>
              )}

              {query.length < 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12 text-center"
                >
                  <p className="text-muted-foreground mb-6">Popular Searches</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {["Amethyst", "Rose Quartz", "Tiger Eye", "7 Chakra", "Pyrite", "Citrine"].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setQuery(term)}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
