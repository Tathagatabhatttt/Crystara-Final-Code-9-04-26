import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Samir Raha",
    location: "Kalyani, India",
    rating: 5,
    text: "I could feel the positive energy actuallly.The quality exceeded my expectations.Also the gifts just took my heart.",
    product: "Rose Quartz Bracelet",
  },
  {
    id: 2,
    name: "Rahul Singha",
    location: "Dakhshineshwar, Kolkata",
    rating: 4,
    text: "Citrine pyramid ta dekhte khub sundor r eta sotti i possitive energy attract korche. Thank You Crystara.",
    product: "Citrine Pyramid",
  },
  {
    id: 3,
    name: "Anwesha Biswas",
    location: "Kolkata, India",
    rating: 5,
    text: "I've purchased from many crystal shops, but Crystara stands out for their authentic, high-quality crystals and beautiful packaging. Highly recommend!",
    product: "Money Magnet Bracelet",
  },
  {
    id: 4,
    name: "Rittik Das ",
    location: "Howrah, West Bengal",
    rating: 4,
    text: "Very nice love it but box can be more good",
    product: "Seven Chakra Bracelet",
  },
  {
    id: 5,
    name: "Sanjib Das",
    location: "Bally, West Bengal",
    rating: 5,
    text: "Very Good quality and beautiful craftsmanship. My Tiger Eye ring has gave me confidence and clarity in my decisions.",
    product: "Tiger Eye Ring",
  },
  {
    id: 6,
    name: "Aisha Dutta",
    location: "Barasat, West Bengal",
    rating: 5,
    text: "The crystal locket I ordered is absolutely gorgeous! Also got some free gifts Thank you Crystara.",
    product: "Crystal Locket",
  },
  {
    id: 7,
    name: "Sunita Paul",
    location: "Bally, Kolkata",
    rating: 5,
    text: "Bought raw amethyst cluster and it's exactly as described — natural and energetically powerful. Crystara's team helped me choose the right crystal for my needs. Amazing service!",
    product: "Raw Amethyst Cluster",
  },
  {
    id: 8,
    name: "Vikram Chauhan",
    location: "Bally, Kolkata",
    rating: 5,
    text: "The Black Tourmaline pyramid I ordered is magnificent! My home feels so much more protected and peaceful. Quality is top-notch, will definitely order again.",
    product: "Black Tourmaline Pyramid",
  },
  {
    id: 9,
    name: "Meera Krishnan",
    location: "Hoogly, Hoogly",
    rating: 4,
    text: "Ordered a crystal tree for my living room and it looks absolutely beautiful. Good quality, authentic crystals, and excellent packaging. Would have given 5 stars if delivery was faster.",
    product: "Crystal Tree",
  },
  {
    id: 10,
    name: "Ritu Das",
    location: "Kolkata, West Bengal",
    rating: 5,
    text: "The chip bracelet set is stunning! Each bracelet has a beautiful energy and the colours are vibrant. Crystara truly sources the finest crystals. My favourite online crystal store!",
    product: "Chip Bracelet Set",
  },
  {
    id: 11,
    name: "Sanju Maity",
    location: "Bongaon, North 24 PGS",
    rating: 3,
    text: "The product quality is decent but I expected slightly more variety in the stone colours. Customer support was helpful though and resolved my query promptly.",
    product: "Beaded Bracelet",
  },
  {
    id: 12,
    name: "Pooja Tiwari",
    location: "Bhopal, Madhya Pradesh",
    rating: 5,
    text: "Absolutely love my Selenite wand! It's large, pristine, and beautifully energised. Crystara's attention to detail and quality is unmatched. Fast shipping to Bhopal too!",
    product: "Selenite Wand",
  },
  {
    id: 13,
    name: "Nikhil Bose",
    location: "Giridih, Jharkhand",
    rating: 4,
    text: "Great products and authentic crystals. The lapis lazuli pendant I ordered is stunning and the quality is far better than what I've found locally. Very satisfied overall.",
    product: "Lapis Lazuli Pendant",
  },
  {
    id: 14,
    name: "Fathma Kausar",
    location: "Sector V, Kolkata",
    rating: 5,
    text: "Gifted my mother a rose quartz figurine and she absolutely loves it! Beautiful craftsmanship, wonderful energy, and it arrived in the most gorgeous gift packaging. Thank you Crystara!",
    product: "Rose Quartz Figurine",
  },
  {
    id: 15,
    name: "Amit Verma",
    location: "Guwahati, Assam",
    rating: 5,
    text: "Ordered multiple items for our healing centre and every single product was perfect. Crystara is our go-to supplier for authentic, high-quality healing crystals. Highly recommended!",
    product: "Healing Crystal Set",
  },
  {
    id: 16,
    name: "Laxmi Devi",
    location: "Birati, Kolkata",
    rating: 4,
    text: "The obsidian pyramid is powerful and authentic. I can feel the protective energy immediately. Packaging was secure and the product arrived in perfect condition. Very happy!",
    product: "Obsidian Pyramid",
  },
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5 mb-2 sm:mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 sm:w-5 sm:h-5 ${i <= rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
        />
      ))}
      <span className="ml-1 text-[10px] sm:text-xs text-muted-foreground font-medium">{rating}.0</span>
    </div>
  );

  return (
    <section className="py-8 sm:py-16 md:py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-12"
        >
          <h2 className="text-lg sm:text-3xl md:text-4xl font-serif font-bold mb-1 sm:mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy customers across India who've experienced the magic of our healing crystals
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto px-6 sm:px-12 md:px-16">
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>

          <div className="relative" style={{ minHeight: "200px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <div className="bg-card p-3.5 sm:p-7 md:p-10 rounded-xl sm:rounded-2xl shadow-crystal border border-border relative">
                  <Quote className="absolute top-3 right-3 sm:top-6 sm:right-6 w-6 h-6 sm:w-12 sm:h-12 text-primary/10" />

                  {renderStars(testimonials[currentIndex].rating)}

                  <p className="text-xs sm:text-base md:text-lg text-foreground/90 mb-3 sm:mb-6 italic leading-relaxed line-clamp-4 sm:line-clamp-none">
                    "{testimonials[currentIndex].text}"
                  </p>

                  <div className="pt-2.5 sm:pt-6 border-t border-border flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground text-xs sm:text-base md:text-lg">
                        {testimonials[currentIndex].name}
                      </p>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        {testimonials[currentIndex].location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] sm:text-sm text-primary font-medium">
                        {testimonials[currentIndex].product}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-1 sm:gap-1.5 mt-4 sm:mt-8 flex-wrap">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-4 sm:w-6 bg-primary" : "w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
            {currentIndex + 1} / {testimonials.length} reviews
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
