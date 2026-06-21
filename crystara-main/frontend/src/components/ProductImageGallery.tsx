import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
}

const ProductImageGallery = ({ images, productName, videoUrl }: ProductImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalItems = videoUrl ? images.length + 1 : images.length;
  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));

  const isVideoSelected = videoUrl && currentIndex === images.length;

  return (
    <div className="space-y-4">
      {/* Main Area */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card shadow-crystal">
        {isVideoSelected ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              autoPlay
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        )}

        {/* Navigation Arrows */}
        {totalItems > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background w-10 h-10 z-10"
              onClick={goToPrev}
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background w-10 h-10 z-10"
              onClick={goToNext}
            >
              <ChevronRight size={20} />
            </Button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 rounded-full px-3 py-1 text-xs font-medium z-10 shadow-sm border border-border/40">
          {isVideoSelected ? "Video Preview" : `${currentIndex + 1} / ${images.length}`}
        </div>
      </div>

      {/* Thumbnails */}
      {totalItems > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex && !isVideoSelected ? "border-primary shadow-crystal" : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
          
          {videoUrl && (
            <button
              onClick={() => setCurrentIndex(images.length)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all relative bg-black ${
                isVideoSelected ? "border-primary shadow-crystal" : "border-border opacity-80 hover:opacity-100"
              }`}
            >
              {images[0] && (
                <img src={images[0]} alt="Video thumbnail" className="w-full h-full object-cover opacity-40 blur-[0.5px]" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/90 text-white p-1.5 rounded-full shadow-lg">
                  <Play size={16} fill="white" className="ml-0.5" />
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
