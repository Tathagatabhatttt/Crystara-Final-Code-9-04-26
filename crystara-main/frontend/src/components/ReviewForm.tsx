import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

const ReviewForm = ({ productId, onReviewAdded }: ReviewFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }
    const newPhotos = [...photos, ...files].slice(0, 3);
    setPhotos(newPhotos);
    const previews = newPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map((f) => URL.createObjectURL(f)));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const photo of photos) {
      const fileName = `${user!.id}/${productId}/${Date.now()}-${photo.name}`;
      const { error } = await supabase.storage.from("review-photos").upload(fileName, photo);
      if (!error) {
        const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(fileName);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first to submit your review");
      navigate("/auth");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write your review");
      return;
    }
    setSubmitting(true);
    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        user_name: user.email?.split("@")[0] || "Customer",
        rating,
        comment,
        photos: photoUrls,
      } as any);
      if (error) throw error;
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      setPhotos([]);
      setPhotoPreviews([]);
      onReviewAdded();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 bg-card rounded-xl border border-border mt-6"
    >
      <h3 className="font-serif font-semibold text-base md:text-lg mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
              >
                <Star
                  size={24}
                  className={`transition-colors ${
                    s <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Share your experience with this crystal..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={3}
        />

        {/* Photo Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Add Photos (optional, max 3)</label>
          <div className="flex items-center gap-3 flex-wrap">
            {photoPreviews.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={src} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-lg p-0.5">
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera size={20} className="text-muted-foreground" />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {!user && (
          <p className="text-xs text-muted-foreground italic">💡 Sign in to submit your review</p>
        )}

        <Button type="submit" disabled={submitting} className="gap-2">
          <Send size={16} />
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
