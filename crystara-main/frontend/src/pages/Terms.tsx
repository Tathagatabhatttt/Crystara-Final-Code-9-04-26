import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Terms = () => {
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Terms of Service</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Last updated: February 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-6 sm:space-y-8">
            {[
              {
                title: "Acceptance of Terms",
                content: "By accessing and using the Crystara website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.",
              },
              {
                title: "Products and Pricing",
                content: "All product descriptions, images, and prices on our website are accurate to the best of our knowledge. We reserve the right to modify prices and product availability at any time. Crystal properties described are based on traditional beliefs and are not guaranteed medical claims.",
              },
              {
                title: "Orders and Payment",
                content: "By placing an order, you confirm that you are at least 18 years old and that the information provided is accurate. We accept major credit/debit cards, UPI, net banking, and cash on delivery (select pin codes). Orders are confirmed only after successful payment.",
              },
              {
                title: "Intellectual Property",
                content: "All content on this website including images, text, logos, and design is the intellectual property of Crystara. You may not reproduce, distribute, or use any content without our written permission.",
              },
              {
                title: "Disclaimer",
                content: "Crystal healing is complementary to, not a replacement for, professional medical advice. Crystara makes no medical claims about any of our products. Please consult a healthcare professional for medical concerns.",
              },
              {
                title: "Limitation of Liability",
                content: "Crystara shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability is limited to the purchase price of the product in question.",
              },
              {
                title: "Governing Law",
                content: "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Howrah, West Bengal, India.",
              },
            ].map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 sm:p-7"
              >
                <h2 className="text-base sm:text-lg font-serif font-bold mb-2 sm:mb-3 text-primary">{section.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
