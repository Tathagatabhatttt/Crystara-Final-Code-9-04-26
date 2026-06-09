import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Privacy = () => {
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Privacy Policy</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Last updated: February 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-6 sm:space-y-8">
            {[
              {
                title: "Information We Collect",
                content: "We collect information you provide directly to us, such as your name, email address, phone number, shipping address, and payment information when you place an order or create an account. We also collect browsing data and usage information to improve your experience.",
              },
              {
                title: "How We Use Your Information",
                content: "Your information is used to process orders, send order confirmations and shipping updates, provide customer support, send promotional communications (with your consent), improve our website and services, and comply with legal obligations.",
              },
              {
                title: "Information Sharing",
                content: "We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers (payment processors, shipping partners) who assist us in operating our business, subject to strict confidentiality agreements.",
              },
              {
                title: "Data Security",
                content: "We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information. However, no method of internet transmission is 100% secure.",
              },
              {
                title: "Cookies",
                content: "We use cookies to enhance your browsing experience, remember your preferences, and analyse website traffic. You can disable cookies in your browser settings, but this may affect some website functionality.",
              },
              {
                title: "Your Rights",
                content: "You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing communications. To exercise these rights, contact us at support@crystara.in.",
              },
              {
                title: "Contact Us",
                content: "If you have questions about this Privacy Policy, please contact us at support@crystara.in or call +91 62919 51629. Our address is Howrah, West Bengal, India 711227.",
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

export default Privacy;
