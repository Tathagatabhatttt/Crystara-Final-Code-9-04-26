import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const RefundPolicy = () => {
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Refund Policy</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Last updated: February 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-6 sm:space-y-8">
            {[
              {
                title: "Refund Eligibility",
                content: "Refunds are available for items returned within 7 days of delivery. The product must be in its original, unused condition with all original packaging intact.",
              },
              {
                title: "Refund Timeline",
                content: "Once your return is received and inspected, we will notify you via email. Approved refunds are processed within 5–7 business days. The amount will be credited to your original payment method.",
              },
              {
                title: "Refund Methods",
                content: "Refunds are issued to the original payment method: credit/debit card refunds take 5–7 business days, UPI refunds take 1–3 business days, and net banking refunds take 3–5 business days.",
              },
              {
                title: "Damaged or Wrong Items",
                content: "If you receive a damaged or incorrect product, contact us within 48 hours at support@crystara.in with photos. We will arrange a full refund or free replacement with priority shipping.",
              },
              {
                title: "Non-Refundable Items",
                content: "Customised or engraved items, items marked 'Final Sale', gift cards, and items that have been used or damaged by the customer are not eligible for refunds.",
              },
              {
                title: "Cancellation Refunds",
                content: "Orders cancelled within 2 hours of placement will receive a full refund. After 2 hours, cancellations may not be possible as orders are processed quickly. Contact us immediately at +91 62919 51629.",
              },
              {
                title: "Contact for Refunds",
                content: "To initiate a refund, email support@crystara.in with your order number and reason. You can also call us at +91 62919 51629 between 10 AM – 6 PM IST, Monday to Saturday.",
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

export default RefundPolicy;
