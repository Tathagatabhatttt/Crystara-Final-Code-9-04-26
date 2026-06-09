import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { User, Package, MapPin, Settings, LogOut, Heart, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut, loading, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const customerMenuItems = [
    { icon: Package, label: "My Orders", href: "/orders", description: "Track your orders" },
    { icon: Heart, label: "Wishlist", href: "/wishlist", description: "Your saved items" },
    { icon: ShoppingBag, label: "Cart", href: "/cart", description: "Items in cart" },
    { icon: MapPin, label: "Addresses", href: "/addresses", description: "Manage addresses" },
    { icon: Settings, label: "Settings", href: "/settings", description: "Account settings" },
  ];

  const adminMenuItems = [
    {
      icon: ShieldCheck,
      label: "Admin Panel",
      href: "/admin",
      description: "Manage orders, customers, and site analytics",
    },
    { icon: Settings, label: "Settings", href: "/settings", description: "Account settings" },
  ];

  const menuItems = profile?.role === "admin" ? adminMenuItems : customerMenuItems;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="container mx-auto px-4 py-8 md:py-16">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-center mb-3">
            My <span className="text-gradient-mystic">Account</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8 md:mb-12 text-sm md:text-base">
            Manage your profile, orders, and preferences
          </p>

          {!user ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
              <Card className="bg-card border-border">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardTitle className="font-serif">Welcome to Crystara</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground text-sm">Sign in to access your orders, wishlist, and recommendations</p>
                  <div className="space-y-3">
                    <Link to="/auth"><Button className="w-full">Sign In</Button></Link>
                    <Link to="/auth"><Button variant="outline" className="w-full">Create Account</Button></Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border mb-6">
                <CardContent className="flex items-center gap-4 p-4 md:p-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-serif font-semibold truncate">
                      {profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                    </h2>
                    <p className="text-sm text-muted-foreground">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {menuItems.map((item, index) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Link to={item.href}>
                      <Card className="bg-card border-border hover:border-primary/30 hover:shadow-crystal transition-all cursor-pointer">
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{item.label}</h3>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" className="mt-6 gap-2 text-destructive hover:text-destructive text-sm" onClick={handleSignOut}>
                <LogOut size={16} /> Sign Out
              </Button>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
