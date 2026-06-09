import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { CrystalButton } from "./CrystalButton";

const CustomizeYourOwn = () => {
  const [birthDate, setBirthDate] = useState("");
  const navigate = useNavigate();

  const calculateDestinyNumber = (dateStr: string): number => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const day = date.getDate();
    if (isNaN(day) || day < 1 || day > 31) return 0;
    let sum = day;
    while (sum > 9) {
      sum = String(sum).split("").reduce((a, b) => a + parseInt(b), 0);
    }
    return sum;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destiny = calculateDestinyNumber(birthDate);
    if (destiny > 0) {
      navigate(`/customize-your-own?destiny=${destiny}`);
    }
  };

  return (
    <section className="py-8 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full mb-3 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            <span className="text-[10px] sm:text-sm font-medium">Personalized Crystal Healing</span>
          </div>

          <h2 className="text-lg sm:text-3xl md:text-4xl font-serif font-bold mb-1.5 sm:mb-4">
            Customize <span className="text-gradient-mystic">Your Own</span>
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-8">
            Enter your date of birth to discover your Destiny Number and find the perfect crystals aligned with your energy.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 max-w-xs mx-auto">
            <div className="w-full">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 block">
                Date of Birth
              </label>
              <Input
                type="date"
                placeholder="Select your date of birth"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="text-center text-lg h-12 bg-background"
                required
              />
            </div>

            <CrystalButton
              type="submit"
              className="w-full px-10 py-5 text-base sm:text-lg font-bold"
            >
              <Sparkles className="mr-2 h-5 w-5 text-white" />
              Discover Your Crystals
            </CrystalButton>
          </form>

          {birthDate && calculateDestinyNumber(birthDate) > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-primary font-medium"
            >
              Your Destiny Number: {calculateDestinyNumber(birthDate)}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CustomizeYourOwn;
