import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent! ✨",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Contact Us</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                We're here to help. Reach out to us and we'll respond within 24 hours.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-6 sm:mb-8">Get In Touch</h2>
                <div className="space-y-4 sm:space-y-6">
                  {[
                    { icon: Mail, title: "Email", detail: "support@crystara.in", sub: "We respond within 24 hours" },
                    { icon: Phone, title: "Phone", detail: "+91 7980133886", sub: "Mon–Sat, 10 AM – 6 PM IST" },
                    { icon: MapPin, title: "Address", detail: "Howrah, West Bengal", sub: "India 711227" },
                    { icon: Clock, title: "Business Hours", detail: "Monday – Saturday", sub: "10:00 AM – 6:00 PM IST" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-foreground">{item.title}</p>
                        <p className="text-sm sm:text-base text-foreground/80">{item.detail}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-5 sm:p-7"
              >
                <h2 className="text-lg sm:text-xl font-serif font-bold mb-4 sm:mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Full Name</label>
                      <Input
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Phone</label>
                      <Input
                        type="tel"
                        placeholder="Your phone number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">Message</label>
                    <textarea
                      placeholder="Tell us more about your query..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full group">
                    Send Message
                    <Send className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
