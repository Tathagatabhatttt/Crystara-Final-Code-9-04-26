import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, Video, PackageX, ShieldAlert, Phone } from "lucide-react";

const ReturnsPolicy = () => {
  const sections = [
    {
      title: "Replacement Eligibility",
      icon: PackageX,
      content: "Replacements are ONLY accepted under the following conditions:\n• The product is physically damaged or broken upon delivery.\n• The product received is completely different from what was ordered.\n• The seal/packaging of the product is already opened upon receipt.\n\nNo replacements will be provided if the product is used, altered, or damaged by the customer after delivery.",
    },
    {
      title: "⚠️ Mandatory Unboxing Video",
      icon: Video,
      content: "Customers are STRONGLY advised to record a complete unboxing video when receiving their package. This video serves as proof in case of any dispute.\n\n• Start recording BEFORE opening the outer packaging.\n• Clearly show the sealed condition of the package.\n• Record until the product is fully visible.\n\nWithout an unboxing video, replacement claims may be denied.",
    },
    {
      title: "Do NOT Accept If Seal Is Open",
      icon: ShieldAlert,
      content: "If you notice that the delivery package seal is already broken, torn, or tampered with:\n\n• DO NOT accept the delivery.\n• Refuse the package immediately and inform the delivery person.\n• Contact us within 24 hours with photos/video of the tampered package.\n\nAccepting an already-opened package will void your replacement eligibility.",
    },
    {
      title: "Replacement Window",
      icon: RefreshCw,
      content: "You may request a replacement within 7 days of delivery. After 7 days, no replacement requests will be entertained.\n\nTo initiate a replacement:\n1. Email us at support@crystara.in with your order number.\n2. Attach the unboxing video and clear photos of the damage.\n3. Our team will review and respond within 24-48 hours.",
    },
    {
      title: "Non-Replaceable Items",
      icon: AlertTriangle,
      content: "The following items cannot be replaced:\n• Customised or personalised crystal bracelets.\n• Items marked as 'Final Sale' or 'Non-returnable'.\n• Products damaged due to misuse, negligence, or improper handling by the customer.\n• Gift items once opened (unless damaged).",
    },
    {
      title: "Contact for Issues",
      icon: Phone,
      content: "For any replacement-related queries, contact us:\n• Email: support@crystara.in\n• WhatsApp: +91 6291951629\n• Response time: Within 24-48 hours\n\nWe reserve the right to deny replacement if the above conditions are not met.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 sm:pt-24">
        <section className="py-12 sm:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
              <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Replacement Policy</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Please read our replacement policy carefully before placing your order.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-6 sm:space-y-8">
            {sections.map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-5 sm:p-7">
                <h2 className="text-base sm:text-lg font-serif font-bold mb-2 sm:mb-3 text-primary flex items-center gap-2">
                  <section.icon size={18} /> {section.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsPolicy;
