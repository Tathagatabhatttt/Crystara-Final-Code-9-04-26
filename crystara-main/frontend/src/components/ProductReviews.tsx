import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReviewForm from "./ReviewForm";
import { toast } from "sonner";

interface Review {
  id?: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  verified: boolean;
  isFromDb?: boolean;
  user_id?: string;
  photos?: string[];
}

const reviewerPool: Review[] = [
  { name: "Priya S.", location: "Mumbai, MH", rating: 5, date: "Jan 15, 2026", comment: "The energy of this crystal is amazing. I could feel the difference from day one. Packaging was excellent and delivery was fast.", helpful: 24, verified: true },
  { name: "Rahul M.", location: "Delhi, DL", rating: 5, date: "Jan 12, 2026", comment: "I've been ordering from Crystara for months now. The quality is consistently exceptional. This piece is no different.", helpful: 18, verified: true },
  { name: "Ananya K.", location: "Bangalore, KA", rating: 4, date: "Jan 8, 2026", comment: "The crystal looks exactly as shown. Beautiful color and texture. Took a couple of days to feel the energy but now I'm hooked.", helpful: 12, verified: true },
  { name: "Vikram T.", location: "Hyderabad, TS", rating: 5, date: "Jan 5, 2026", comment: "This is my third purchase and every time the quality impresses me. The crystals are genuine and powerful.", helpful: 31, verified: true },
  { name: "Sneha R.", location: "Pune, MH", rating: 5, date: "Dec 28, 2025", comment: "Since wearing this, I've noticed significant positive changes in my daily life. Thank you Crystara!", helpful: 42, verified: true },
  { name: "Arjun P.", location: "Chennai, TN", rating: 4, date: "Dec 22, 2025", comment: "Good quality crystal. The delivery was quick and packaging was secure. I meditate with it every morning.", helpful: 8, verified: true },
  { name: "Meera D.", location: "Jaipur, RJ", rating: 5, date: "Dec 18, 2025", comment: "Bought this as a gift for my mother. She absolutely loved it! The energy is so calming and peaceful.", helpful: 15, verified: true },
  { name: "Karthik N.", location: "Kochi, KL", rating: 5, date: "Dec 14, 2025", comment: "You can feel the authenticity of these crystals. Crystara delivers genuine products every single time.", helpful: 27, verified: true },
  { name: "Divya L.", location: "Ahmedabad, GJ", rating: 4, date: "Dec 10, 2025", comment: "Beautiful and well-polished. I use it during meditation and it helps me focus much better than before.", helpful: 9, verified: true },
  { name: "Sanjay G.", location: "Lucknow, UP", rating: 5, date: "Dec 5, 2025", comment: "I was skeptical at first but this crystal has genuinely improved my energy levels. Highly recommended!", helpful: 36, verified: true },
  { name: "Pooja B.", location: "Kolkata, WB", rating: 5, date: "Nov 30, 2025", comment: "Crystara never disappoints. The crystal is exactly as described with beautiful natural patterns.", helpful: 20, verified: true },
  { name: "Amit V.", location: "Indore, MP", rating: 3, date: "Nov 25, 2025", comment: "The crystal is decent. Expected it to be slightly bigger based on photos. Quality is fine though.", helpful: 5, verified: true },
  { name: "Neha T.", location: "Chandigarh, PB", rating: 5, date: "Nov 20, 2025", comment: "Absolutely stunning crystal! The craftsmanship is top-notch. I wear it every day and get so many compliments.", helpful: 33, verified: true },
  { name: "Rohit K.", location: "Bhopal, MP", rating: 4, date: "Nov 15, 2025", comment: "Very satisfied with my purchase. The crystal has a beautiful shine and feels very calming to hold.", helpful: 11, verified: true },
  { name: "Isha M.", location: "Nagpur, MH", rating: 5, date: "Nov 10, 2025", comment: "This is exactly what I was looking for! The energy is incredible and packaging was so elegant.", helpful: 29, verified: true },
  { name: "Deepak S.", location: "Patna, BR", rating: 5, date: "Nov 5, 2025", comment: "My third order from Crystara and I'm never going anywhere else. The authenticity certificate gives confidence.", helpful: 22, verified: true },
  { name: "Swati A.", location: "Guwahati, AS", rating: 4, date: "Oct 30, 2025", comment: "Good product with fast delivery. The crystal has a nice weight to it and feels genuine.", helpful: 7, verified: true },
  { name: "Manish R.", location: "Ranchi, JH", rating: 5, date: "Oct 25, 2025", comment: "The healing properties of this crystal are truly remarkable. I sleep so much better since keeping it near my bed.", helpful: 38, verified: true },
  { name: "Kavitha J.", location: "Mysore, KA", rating: 5, date: "Oct 20, 2025", comment: "Gorgeous crystal with beautiful natural inclusions. Crystara's attention to detail in packaging is unmatched.", helpful: 16, verified: true },
  { name: "Suresh P.", location: "Varanasi, UP", rating: 3, date: "Oct 15, 2025", comment: "Product is okay. Took a bit longer to deliver than expected. Crystal quality is good but not exceptional.", helpful: 4, verified: true },
  { name: "Ritu G.", location: "Dehradun, UK", rating: 5, date: "Oct 10, 2025", comment: "Ordered this for my yoga studio and all my students love the energy it brings. Absolutely beautiful!", helpful: 25, verified: true },
  { name: "Vivek C.", location: "Coimbatore, TN", rating: 5, date: "Oct 5, 2025", comment: "Outstanding quality! The crystal arrived in perfect condition with the authenticity certificate. Very professional.", helpful: 19, verified: true },
  { name: "Anjali D.", location: "Surat, GJ", rating: 4, date: "Sep 28, 2025", comment: "Nice crystal with good energy. The color is vibrant and the size is perfect for wearing daily.", helpful: 13, verified: true },
  { name: "Harsh M.", location: "Jodhpur, RJ", rating: 5, date: "Sep 22, 2025", comment: "Best crystal shop online! I've tried many sellers but Crystara stands out for quality and customer service.", helpful: 41, verified: true },
  { name: "Lakshmi V.", location: "Vizag, AP", rating: 5, date: "Sep 18, 2025", comment: "The crystal bracelet fits perfectly and the energy is palpable. My anxiety has reduced significantly.", helpful: 34, verified: true },
  { name: "Nitin B.", location: "Nashik, MH", rating: 4, date: "Sep 12, 2025", comment: "Good quality product. The crystal has beautiful natural formations. Shipping was well-packaged and timely.", helpful: 10, verified: true },
  { name: "Shruti K.", location: "Jamshedpur, JH", rating: 5, date: "Sep 8, 2025", comment: "This crystal has transformed my meditation practice. The energy is pure and powerful. Can't recommend enough!", helpful: 28, verified: true },
  { name: "Gaurav H.", location: "Udaipur, RJ", rating: 5, date: "Sep 2, 2025", comment: "Gifted this to my wife and she was thrilled! The crystal is genuinely beautiful and gift packaging was elegant.", helpful: 17, verified: true },
  { name: "Tanvi S.", location: "Thiruvananthapuram, KL", rating: 4, date: "Aug 28, 2025", comment: "Love the crystal! It has a soothing energy that I can feel immediately. Good value for money.", helpful: 14, verified: true },
  { name: "Aditya R.", location: "Bhubaneswar, OD", rating: 5, date: "Aug 22, 2025", comment: "Exceptional quality and authentic crystal. The team even sent me tips on how to cleanse and charge it!", helpful: 23, verified: true },
];

const getSeededReviews = (productId: string) => {
  let seed = 0;
  for (let i = 0; i < productId.length; i++) seed += productId.charCodeAt(i);
  const isMoneyMagnet = productId.toLowerCase().includes("money-magnet");
  const reviewCount = isMoneyMagnet ? 95 + (seed % 11) : 68 + (seed % 38);

  // Select unique reviews using seed-based offset
  const displayCount = 6 + (seed % 4);
  const selected: Review[] = [];
  const startIdx = seed % reviewerPool.length;
  for (let i = 0; i < displayCount && i < reviewerPool.length; i++) {
    selected.push(reviewerPool[(startIdx + i) % reviewerPool.length]);
  }

  // Proper distribution and weighted average
  const fiveCount = Math.round(reviewCount * (0.70 + (seed % 8) * 0.01));
  const fourCount = Math.round(reviewCount * (0.14 + (seed % 4) * 0.01));
  const threeCount = Math.round(reviewCount * (0.05 + (seed % 3) * 0.005));
  const twoCount = Math.round(reviewCount * 0.03);
  const oneCount = Math.max(1, reviewCount - fiveCount - fourCount - threeCount - twoCount);

  const distribution = { 5: fiveCount, 4: fourCount, 3: threeCount, 2: twoCount, 1: oneCount };
  const totalStars = 5 * fiveCount + 4 * fourCount + 3 * threeCount + 2 * twoCount + 1 * oneCount;
  const avgRating = Math.round((totalStars / reviewCount) * 10) / 10;

  return { reviews: selected, totalCount: reviewCount, avgRating, distribution };
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={14} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const [showAll, setShowAll] = useState(false);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const seeded = getSeededReviews(productId);

  const fetchDbReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (data) {
      setDbReviews(
        data.map((r: any) => ({
          id: r.id,
          name: r.user_name,
          location: "India",
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
          comment: r.comment,
          helpful: 0,
          verified: true,
          isFromDb: true,
          user_id: r.user_id,
          photos: r.photos || [],
        }))
      );
    }
  }, [productId]);

  useEffect(() => {
    fetchDbReviews();
  }, [fetchDbReviews]);

  useEffect(() => {
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
        setIsAdmin(!!data && data.length > 0);
      });
    }
  }, [user]);

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review deleted");
      fetchDbReviews();
    }
  };

  // Combine db reviews (with proper avg) and seeded reviews
  const allReviews = [...dbReviews, ...seeded.reviews];
  const totalDbRating = dbReviews.reduce((sum, r) => sum + r.rating, 0);
  const totalSeededStars = seeded.avgRating * seeded.totalCount;
  const totalCount = seeded.totalCount + dbReviews.length;
  const combinedAvg = dbReviews.length > 0
    ? Math.round(((totalDbRating + totalSeededStars) / totalCount) * 10) / 10
    : seeded.avgRating;

  const displayedReviews = showAll ? allReviews : allReviews.slice(0, 5);

  return (
    <section className="mt-12 md:mt-16">
      <h2 className="text-xl md:text-2xl font-serif font-bold mb-6">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8 p-4 md:p-6 bg-card rounded-xl border border-border">
        <div className="text-center sm:text-left">
          <div className="text-4xl font-bold text-primary">{combinedAvg}</div>
          <StarRating rating={Math.round(combinedAvg)} />
          <p className="text-sm text-muted-foreground mt-1">{totalCount} ratings</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = seeded.distribution[star as keyof typeof seeded.distribution];
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-right">{star}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(count / seeded.totalCount) * 100}%` }} />
                </div>
                <span className="w-8 text-muted-foreground text-xs">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm productId={productId} onReviewAdded={fetchDbReviews} />

      {/* Review Cards */}
      <div className="space-y-4 mt-6">
        {displayedReviews.map((review, i) => (
          <motion.div key={review.id || `seed-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.name}</span>
                  {review.verified && <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">Verified</span>}
                  {review.isFromDb && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">New</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{review.location} · {review.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                {isAdmin && review.isFromDb && review.id && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteReview(review.id!)}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            
            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.photos.map((photo, pi) => (
                  <a key={pi} href={photo} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={photo} alt={`Review photo ${pi + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            )}
            
            {review.helpful > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <ThumbsUp size={12} /> {review.helpful} found this helpful
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {allReviews.length > 5 && !showAll && (
        <Button variant="outline" className="w-full mt-4" onClick={() => setShowAll(true)}>
          <ChevronDown size={16} className="mr-1" /> Show All Reviews
        </Button>
      )}
    </section>
  );
};

export default ProductReviews;
