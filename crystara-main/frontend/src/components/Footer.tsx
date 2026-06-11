import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, ArrowRight, ChevronDown, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const discoverLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
  ];

  const supportLinks = [
    { label: "Shipping", href: "/shipping-info" },
    { label: "Returns", href: "/returns-policy" },
    { label: "FAQ", href: "/faqs" },
    { label: "Contact Us", href: "/contact-us" },
  ];

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-2xl font-serif font-bold text-gradient-mystic">Crystara</h2>
            </Link>
            <p className="text-sm text-foreground/80 mb-6 max-w-[250px] leading-relaxed">
              Elevating the metaphysical experience through modern luxury and curated vibrational tools.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/crystara_official_06?igsh=emZ1ZjVtbmt6aWw4&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all">
                <Instagram size={14} />
              </a>
              <a href="mailto:support@crystara.in" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all">
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-primary mb-6 uppercase">Discover</h3>
            <ul className="space-y-4">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-foreground/80 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-primary mb-6 uppercase">Support</h3>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-foreground/80 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The Circle (Newsletter) */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-foreground mb-6 uppercase">The Circle</h3>
            <p className="text-sm text-foreground/80 mb-4">
              Join our newsletter for weekly rituals and crystal insights.
            </p>
            <form className="relative mt-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-transparent border-b border-border/50 pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
              <button type="submit" className="absolute right-0 top-0 text-foreground hover:text-primary transition-colors">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className="sm:hidden mb-10">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="inline-block mb-3">
              <h2 className="text-3xl font-serif font-bold text-gradient-mystic">Crystara</h2>
            </Link>
            <p className="text-[10px] tracking-widest text-muted-foreground -mt-2 mb-6">
              Crafted for Energy. Designed for You.
            </p>
            <div className="flex gap-6 justify-center">
              <a href="https://www.instagram.com/crystara_official_06?igsh=emZ1ZjVtbmt6aWw4&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="mailto:support@crystara.in" className="text-foreground hover:text-primary transition-colors">
                <Mail size={18} />
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div className="border-t border-border/50 pt-2">
            {[
              {
                title: "Quick Links",
                content: (
                  <ul className="pb-4 pt-1 space-y-3 pl-1">
                    <li>
                      <Link to="/" className="text-xs text-foreground/80 hover:text-primary transition-colors">Home</Link>
                    </li>
                    <li>
                      <Link to="/shop" className="text-xs text-foreground/80 hover:text-primary transition-colors">Shop</Link>
                    </li>
                    <li>
                      <Link to="/about" className="text-xs text-foreground/80 hover:text-primary transition-colors">About</Link>
                    </li>
                  </ul>
                ),
              },
              {
                title: "Help & Info",
                content: (
                  <ul className="pb-4 pt-1 space-y-3 pl-1">
                    <li>
                      <Link to="/about" className="text-xs text-foreground/80 hover:text-primary transition-colors">About Us</Link>
                    </li>
                    <li>
                      <Link to="/contact-us" className="text-xs text-foreground/80 hover:text-primary transition-colors">Contact Us</Link>
                    </li>
                    <li>
                      <Link to="/faqs" className="text-xs text-foreground/80 hover:text-primary transition-colors">FAQs</Link>
                    </li>
                    <li>
                      <Link to="/shipping-info" className="text-xs text-foreground/80 hover:text-primary transition-colors">Shipping Info</Link>
                    </li>
                    <li>
                      <Link to="/returns-policy" className="text-xs text-foreground/80 hover:text-primary transition-colors">Returns Policy</Link>
                    </li>
                    <li>
                      <Link to="/track-order" className="text-xs text-foreground/80 hover:text-primary transition-colors">Track Order</Link>
                    </li>
                  </ul>
                ),
              },
              {
                title: "Contact Us",
                content: (
                  <ul className="pb-4 pt-1 space-y-3 pl-1">
                    <li className="flex items-center gap-2 text-xs text-foreground/80">
                      <Mail size={14} className="text-primary flex-shrink-0" />
                      <a href="mailto:support@crystara.in" className="hover:text-primary transition-colors">support@crystara.in</a>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-foreground/80">
                      <Phone size={14} className="text-primary flex-shrink-0" />
                      <a href="tel:+917980133886" className="hover:text-primary transition-colors">+91 79801 33886</a>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/80">
                      <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Howrah, West Bengal, India 711227</span>
                    </li>
                  </ul>
                ),
              },
            ].map((section) => (
              <div key={section.title} className="border-b border-border/50 py-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`flex items-center justify-between w-full py-3 text-sm font-serif font-semibold transition-colors ${
                    openSection === section.title ? "text-primary" : "text-foreground"
                  }`}
                >
                  {section.title}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openSection === section.title ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSection === section.title && section.content}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center border-t border-border/30 flex flex-col items-center justify-center gap-2">
          <p className="text-[10px] text-muted-foreground">
            © {currentYear} Crystara. All rights reserved.
          </p>
          <div className="flex gap-4 text-[10px] text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
