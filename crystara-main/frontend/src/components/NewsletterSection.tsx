import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Welcome to Crystara! ✨",
        description: "You've been added to our community. Check your inbox for a special discount!",
      });
      setEmail("");
      setPhone("");
    }
  };

  return (
    <section className="py-8 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary to-accent/10" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full mb-3 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            <span className="text-[10px] sm:text-sm font-medium">Get 10% Off Your First Order</span>
          </div>

          <h2 className="text-lg sm:text-3xl md:text-4xl font-serif font-bold mb-1.5 sm:mb-4">
            Join Our Crystal Community
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-8">
            Subscribe to receive exclusive offers, crystal healing tips, and be the first to know about new arrivals.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background text-xs sm:text-base h-9 sm:h-10"
              required
            />
            <Input
              type="tel"
              placeholder="Enter your phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-background text-xs sm:text-base h-9 sm:h-10"
              pattern="[0-9]{10}"
              maxLength={10}
            />
            <Button type="submit" className="group w-full sm:w-auto sm:self-center px-6 sm:px-8 h-9 sm:h-10 text-xs sm:text-sm">
              Subscribe
              <Send className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
            By subscribing, you agree to receive marketing communications. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
