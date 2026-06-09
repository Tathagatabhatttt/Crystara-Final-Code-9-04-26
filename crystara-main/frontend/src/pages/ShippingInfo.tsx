import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const ShippingInfo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 sm:pt-24">
        <section className="py-12 sm:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Shipping Information</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Everything you need to know about our shipping policies and delivery timelines.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-12">
              {[
                { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹2,000 within India" },
                { icon: Clock, title: "Standard Delivery", desc: "5–7 business days across India" },
                { icon: MapPin, title: "Pan-India Delivery", desc: "We deliver to all pin codes in India" },
                { icon: Package, title: "Safe Packaging", desc: "Crystal-safe, eco-friendly packaging" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 sm:p-6 flex gap-4 items-start"
                >
                  <item.icon className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif font-semibold text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-6 sm:space-y-8">
              {[
                {
                  title: "Shipping Charges",
                  content: [
                    "Orders above ₹2,000: FREE shipping",
                    "Orders below ₹2,000: ₹99 flat shipping fee",
                    "Express delivery (2–3 days): ₹199 additional charge",
                    "International shipping: Calculated at checkout based on destination",
                  ],
                },
                {
                  title: "Delivery Timelines",
                  content: [
                    "Metro cities (Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad): 3–5 business days",
                    "Tier 2 & Tier 3 cities: 5–7 business days",
                    "Remote areas: 7–10 business days",
                    "International orders: 10–21 business days",
                  ],
                },
                {
                  title: "Order Processing",
                  content: [
                    "Orders placed before 2 PM IST are processed the same day",
                    "Orders placed after 2 PM IST are processed the next business day",
                    "Orders are not processed on Sundays and public holidays",
                    "You will receive a confirmation email with tracking details once your order is shipped",
                  ],
                },
                {
                  title: "Packaging",
                  content: [
                    "All crystals are individually wrapped to prevent damage during transit",
                    "We use eco-friendly, biodegradable packaging materials",
                    "Gift packaging is available at ₹49 extra — mention in order notes",
                    "Fragile items like crystal trees and figurines are secured with extra bubble wrap",
                  ],
                },
              ].map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="bg-card border border-border rounded-xl p-5 sm:p-7"
                >
                  <h2 className="text-lg sm:text-xl font-serif font-bold mb-4 text-primary">{section.title}</h2>
                  <ul className="space-y-2">
                    {section.content.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingInfo;
