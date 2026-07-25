import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Play, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
}

const ProductImageGallery = ({ images, productName, videoUrl }: ProductImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2.2);
  const [zoomPoint, setZoomPoint] = useState({ x: 50, y: 50 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalItems = videoUrl ? images.length + 1 : images.length;
  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));

  const isVideoSelected = videoUrl && currentIndex === images.length;
  const currentImage = images[currentIndex];

  useEffect(() => {
    if (!zoomOpen) {
      setZoomLevel(2.2);
      setZoomPoint({ x: 50, y: 50 });
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomOpen]);

  const handleMainScroll = () => {
    if (!scrollContainerRef.current || totalItems <= 1) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const slideTo = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({ left: idx * width, behavior: "smooth" });
    setCurrentIndex(idx);
  };

  const openZoom = () => {
    if (!isVideoSelected) {
      setZoomPoint({ x: 50, y: 50 });
      setZoomOpen(true);
    }
  };

  const handleZoomMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!zoomOpen || isVideoSelected) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPoint({
      x: Math.max(0, Math.min(100, Number(x.toFixed(2)))),
      y: Math.max(0, Math.min(100, Number(y.toFixed(2)))),
    });
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: currentIndex * scrollContainerRef.current.clientWidth });
    }
  }, [currentIndex]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card shadow-crystal">
        {isVideoSelected ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay />
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleMainScroll}
            className="h-full w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide touch-pan-x"
          >
            {images.map((image, idx) => (
              <button
                key={image + idx}
                type="button"
                className="relative w-full h-full flex-shrink-0 snap-start cursor-zoom-in bg-black"
                onClick={openZoom}
              >
                <img
                  src={image}
                  alt={`${productName} - Image ${idx + 1}`}
                  className={`w-full h-full object-contain p-3 sm:p-4 select-none transition-transform duration-300 ${
                    idx === currentIndex ? "scale-100" : "scale-[0.995]"
                  }`}
                  loading="eager"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

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

        {!isVideoSelected && currentImage && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3 rounded-full bg-background/80 hover:bg-background w-10 h-10 z-10"
            onClick={openZoom}
            title="Zoom image"
          >
            <ZoomIn size={18} />
          </Button>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 rounded-full px-3 py-1 text-xs font-medium z-10 shadow-sm border border-border/40">
          {isVideoSelected ? "Video Preview" : `${currentIndex + 1} / ${images.length}`}
        </div>
      </div>

      {totalItems > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => slideTo(idx)}
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

      {zoomOpen && currentImage && !isVideoSelected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative w-[min(96vw,1100px)] h-[min(86vh,760px)] overflow-hidden rounded-3xl border border-white/10 bg-[#090909] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-3 z-20 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={() => setZoomOpen(false)}
            >
              <X size={18} />
            </Button>

            <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={() => setZoomLevel((prev) => Math.max(1.4, Number((prev - 0.2).toFixed(2))))}
                disabled={zoomLevel <= 1.4}
              >
                <ZoomOut size={18} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={() => setZoomLevel((prev) => Math.min(4, Number((prev + 0.2).toFixed(2))))}
                disabled={zoomLevel >= 4}
              >
                <ZoomIn size={18} />
              </Button>
            </div>

            <div
              className="absolute inset-0 cursor-zoom-out"
              onPointerMove={handleZoomMove}
              onPointerDown={handleZoomMove}
            >
              <img
                src={currentImage}
                alt={`${productName} zoomed image`}
                className="h-full w-full select-none object-contain p-4 sm:p-6"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${zoomPoint.x}% ${zoomPoint.y}%`,
                  transition: "transform 120ms ease-out",
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
