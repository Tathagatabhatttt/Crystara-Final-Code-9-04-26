import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, User, Heart, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import SearchModal from "@/components/SearchModal";
import { productCatalog } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import AnnouncementMarquee from "@/components/AnnouncementMarquee";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setIsCategoriesOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementMarquee />
        <div className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="relative flex items-center justify-between h-12 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 z-20"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                if (isMenuOpen) {
                  setIsMobileCategoriesOpen(false);
                  setActiveMobileCategory(null);
                }
              }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex-shrink-0 text-center z-10">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gradient-mystic leading-tight">
                Crystara
              </h1>
              <p className="text-[9px] md:text-[10px] tracking-widest text-muted-foreground -mt-0.5">
                Crafted for Energy. Designed for You.
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}

              {/* All Categories Dropdown - Horizontal */}
              <div
                className="relative"
                ref={categoriesRef}
              >
                <button
                  className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setIsCategoriesOpen((prev) => {
                    const next = !prev;
                    if (!next) setActiveCategory(null);
                    return next;
                  })}
                >
                  All Categories
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="fixed left-0 right-0 top-[80px] z-50 bg-card border-b border-border shadow-lg"
                    >
                      <div className="container mx-auto px-4 py-6">
                        <div className="flex gap-8 overflow-x-auto">
                          {productCatalog.map((category) => (
                            <div key={category.id} className="flex-shrink-0 min-w-[160px]">
                              <button
                                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                                className="font-serif font-semibold text-primary hover:text-primary/80 transition-colors mb-3 flex items-center gap-1.5 text-sm w-full text-left bg-transparent border-0 p-0 focus:outline-none"
                              >
                                <span>{category.name}</span>
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform duration-200 ${
                                    activeCategory === category.id ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                              <AnimatePresence initial={false}>
                                {activeCategory === category.id && (
                                  <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-1.5 overflow-hidden"
                                  >
                                    <li key="view-all">
                                      <Link
                                        to={`/category/${category.slug}`}
                                        className="text-xs text-primary hover:text-primary/80 font-medium block py-0.5 whitespace-nowrap"
                                        onClick={() => {
                                          setIsCategoriesOpen(false);
                                          setActiveCategory(null);
                                        }}
                                      >
                                        View All {category.name} →
                                      </Link>
                                    </li>
                                    {category.subCategories.map((sub) => (
                                      <li key={sub.id}>
                                        <Link
                                          to={`/category/${category.slug}/${sub.slug}`}
                                          className="text-xs text-muted-foreground hover:text-foreground transition-colors block py-0.5 whitespace-nowrap"
                                          onClick={() => {
                                            setIsCategoriesOpen(false);
                                            setActiveCategory(null);
                                          }}
                                        >
                                          {sub.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </motion.ul>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsSearchOpen(true)}>
                <Search size={20} />
              </Button>
              {/* Mobile: search icon */}
              <Button variant="ghost" size="icon" className="md:hidden w-8 h-8" onClick={() => setIsSearchOpen(true)}>
                <Search size={18} />
              </Button>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="hidden md:flex text-primary">
                    <ShieldCheck size={20} />
                  </Button>
                </Link>
              )}
              <Link to={user ? "/profile" : "/auth"}>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User size={20} />
                </Button>
              </Link>
              {!isAdmin && (
                <>
                  <Link to="/wishlist">
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <Heart size={20} />
                    </Button>
                  </Link>
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="relative w-8 h-8 md:w-10 md:h-10">
                      <ShoppingBag size={18} className="md:w-5 md:h-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 bg-accent text-accent-foreground text-[9px] md:text-xs rounded-full flex items-center justify-center font-bold">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Navigation — rendered OUTSIDE the fixed header so it pushes content down */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden sticky top-20 z-40 bg-background border-b border-border overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} className="text-sm font-medium py-2 hover:text-primary transition-colors" onClick={() => { setIsMenuOpen(false); setIsMobileCategoriesOpen(false); setActiveMobileCategory(null); }}>
                  {link.name}
                </Link>
              ))}

              {/* Mobile Categories */}
              <div className="border-t border-border pt-2 mt-1">
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="flex items-center justify-between w-full font-serif font-semibold text-primary mb-2 text-xs text-left"
                >
                  <span>All Categories</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isMobileCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-1 pl-1"
                    >
                      {productCatalog.map((category) => (
                        <div key={category.id} className="border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                          <button
                            onClick={() => setActiveMobileCategory(activeMobileCategory === category.id ? null : category.id)}
                            className={`flex items-center justify-between w-full text-xs transition-colors text-left py-1 ${
                              activeMobileCategory === category.id
                                ? "text-primary font-serif font-semibold"
                                : "text-foreground font-sans hover:text-primary"
                            }`}
                          >
                            <span>{category.name}</span>
                            <ChevronDown size={12} className={`transition-transform duration-200 ${activeMobileCategory === category.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {activeMobileCategory === category.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-3 pt-1 flex flex-col gap-1"
                              >
                                <Link
                                  to={`/category/${category.slug}`}
                                  className="text-[11px] text-primary hover:text-primary/80 font-medium py-0.5"
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsMobileCategoriesOpen(false);
                                    setActiveMobileCategory(null);
                                  }}
                                >
                                  View All {category.name} →
                                </Link>
                                {category.subCategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={`/category/${category.slug}/${sub.slug}`}
                                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setIsMobileCategoriesOpen(false);
                                      setActiveMobileCategory(null);
                                    }}
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {isAdmin && (
                  <Link to="/admin" onClick={() => { setIsMenuOpen(false); setIsMobileCategoriesOpen(false); setActiveMobileCategory(null); }}>
                    <Button variant="ghost" size="sm" className="text-xs h-8 text-primary">
                      <ShieldCheck size={14} className="mr-1" /> Admin
                    </Button>
                  </Link>
                )}
                <Link to={user ? "/profile" : "/auth"} onClick={() => { setIsMenuOpen(false); setIsMobileCategoriesOpen(false); setActiveMobileCategory(null); }}>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    <User size={14} className="mr-1" /> {user ? "Account" : "Sign In"}
                  </Button>
                </Link>
                {!isAdmin && (
                  <Link to="/wishlist" onClick={() => { setIsMenuOpen(false); setIsMobileCategoriesOpen(false); setActiveMobileCategory(null); }}>
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      <Heart size={14} className="mr-1" /> Wishlist
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
