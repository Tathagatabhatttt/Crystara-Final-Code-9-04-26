import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import SignupOfferPopup from "@/components/SignupOfferPopup";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FAQs from "./pages/FAQs";
import ShippingInfo from "./pages/ShippingInfo";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import TrackOrder from "./pages/TrackOrder";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import ContactUs from "./pages/ContactUs";
import ShopCollections from "./pages/ShopCollections";
import LearnAboutCrystals from "./pages/LearnAboutCrystals";
import CustomizeYourOwnPage from "./pages/CustomizeYourOwnPage";
import DiscoverYourCrystals from "./pages/DiscoverYourCrystals";
import ResetPassword from "./pages/ResetPassword";
import Checkout from "./pages/Checkout";
import AdminPanel from "./pages/AdminPanel";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <WhatsAppButton />
                <AnalyticsTracker />
                <SignupOfferPopup />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop-collections" element={<ShopCollections />} />
                  <Route path="/learn-about-crystals" element={<LearnAboutCrystals />} />
                  <Route path="/category/:categorySlug" element={<CategoryPage />} />
                  <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryPage />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/shipping-info" element={<ShippingInfo />} />
                  <Route path="/returns-policy" element={<ReturnsPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/customize-your-own" element={<CustomizeYourOwnPage />} />
                  <Route path="/discover-your-crystals" element={<DiscoverYourCrystals />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
