import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "Are your crystals 100% natural and authentic?",
    a: "Yes! Every crystal we sell is 100% natural, genuine, and ethically sourced from trusted mines worldwide. We provide certificates of authenticity upon request.",
  },
  {
    q: "How are the crystals energised and cleansed?",
    a: "All our crystals are cleansed using moonlight, sage smudging, and sound healing before being shipped. They are also blessed with positive intentions by our experienced crystal healers.",
  },
  {
    q: "How do I know which crystal is right for me?",
    a: "Visit our 'Learn About Crystals' page for detailed guides, or contact our crystal healing experts at support@crystara.in. We're happy to help you choose the perfect crystal for your needs.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 7-day return policy for all unused products in original packaging. Please see our Returns Policy page for full details.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes, we ship to all pin codes across India. We also offer international shipping to select countries. Orders above ₹2,000 qualify for free shipping within India.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 5-7 business days. Express delivery (2-3 business days) is available for major cities at an additional charge.",
  },
  {
    q: "How should I care for my crystals?",
    a: "Cleanse your crystals regularly using moonlight, sunlight (avoid for fading stones), or sage. Keep them away from direct water unless they are water-safe. Store in a dry, clean space.",
  },
  {
    q: "Can I customise my order as a gift?",
    a: "Absolutely! We offer gift packaging and personalised notes for all orders. Simply mention your requirements in the order notes at checkout.",
  },
  {
    q: "Do you offer bulk or wholesale pricing?",
    a: "Yes, we offer special pricing for bulk orders. Please contact us at support@crystara.in with your requirements and we'll get back to you within 24 hours.",
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Find answers to the most common questions about our products and services.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-4"
                  >
                    <span className="font-serif font-semibold text-sm sm:text-base text-foreground">{faq.q}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
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

export default FAQs;
