import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ChevronLeft, ChevronRight, Play, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ProductImageGallery = ({ images, productName, videoUrl }: ProductImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState({ w: 140, h: 140 });
  const [imageBox, setImageBox] = useState({ w: 1, h: 1 });
  const [isDesktop, setIsDesktop] = useState(false);

  // Fullscreen mobile/desktop modal zoom state
  const [modalScale, setModalScale] = useState(1);
  const [modalOffset, setModalOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const lastTapRef = useRef(0);

  const totalItems = videoUrl ? images.length + 1 : images.length;
  const isVideoSelected = Boolean(videoUrl && currentIndex === images.length);
  const currentImage = images[currentIndex];

  // Amazon/Flipkart style: lens shows ~2.5x of the hovered area
  const ZOOM_FACTOR = 2.5;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!zoomOpen) {
      setModalScale(1);
      setModalOffset({ x: 0, y: 0 });
      setIsPanning(false);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomOpen]);

  useEffect(() => {
    setHoverZoom(false);
  }, [currentIndex]);

  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));

  const handleMainScroll = () => {
    if (!scrollContainerRef.current || totalItems <= 1) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);
    }
  };

  const slideTo = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({ left: idx * width, behavior: "smooth" });
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: currentIndex * scrollContainerRef.current.clientWidth,
      });
    }
  }, [currentIndex]);

  const updateLensFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const box = mainImageRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const lensW = Math.min(180, w / ZOOM_FACTOR);
      const lensH = Math.min(180, h / ZOOM_FACTOR);
      const x = clamp(clientX - rect.left - lensW / 2, 0, w - lensW);
      const y = clamp(clientY - rect.top - lensH / 2, 0, h - lensH);
      setImageBox({ w, h });
      setLensSize({ w: lensW, h: lensH });
      setLensPos({ x, y });
    },
    [],
  );

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || isVideoSelected) return;
    setHoverZoom(true);
    updateLensFromPoint(e.clientX, e.clientY);
  };

  const openFullscreenZoom = () => {
    if (isVideoSelected || !currentImage) return;
    setModalScale(1);
    setModalOffset({ x: 0, y: 0 });
    setZoomOpen(true);
  };

  const handleMainClick = () => {
    // Desktop uses hover lens; click opens fullscreen for a closer look
    openFullscreenZoom();
  };

  const touchDistance = (touches: TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleModalPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Double-tap / double-click to toggle zoom
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      if (modalScale > 1) {
        setModalScale(1);
        setModalOffset({ x: 0, y: 0 });
      } else {
        setModalScale(2.5);
      }
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (modalScale <= 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: modalOffset.x,
      oy: modalOffset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleModalPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isPanning || modalScale <= 1) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setModalOffset({
      x: panStartRef.current.ox + dx,
      y: panStartRef.current.oy + dy,
    });
  };

  const handleModalPointerUp = () => setIsPanning(false);

  const handleModalTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      pinchStartRef.current = {
        distance: touchDistance(e.touches),
        scale: modalScale,
      };
      setIsPanning(false);
    }
  };

  const handleModalTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const distance = touchDistance(e.touches);
      const next = clamp(
        (pinchStartRef.current.scale * distance) / pinchStartRef.current.distance,
        1,
        4.5,
      );
      setModalScale(next);
      if (next <= 1) setModalOffset({ x: 0, y: 0 });
    }
  };

  const handleModalTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) pinchStartRef.current = null;
  };

  const handleModalWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setModalScale((prev) => {
      const next = clamp(Number((prev + delta).toFixed(2)), 1, 4.5);
      if (next <= 1) setModalOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const bgPosX = imageBox.w > lensSize.w ? (lensPos.x / (imageBox.w - lensSize.w)) * 100 : 50;
  const bgPosY = imageBox.h > lensSize.h ? (lensPos.y / (imageBox.h - lensSize.h)) * 100 : 50;

  return (
    <div className="space-y-4">
      <div className="relative lg:flex lg:gap-4 lg:items-start">
        <div
          ref={mainImageRef}
          className="relative aspect-square w-full rounded-2xl overflow-hidden bg-card shadow-crystal"
          onMouseMove={handleImageMouseMove}
          onMouseLeave={() => setHoverZoom(false)}
        >
          {isVideoSelected ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay />
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onScroll={handleMainScroll}
              className={`h-full w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide ${
                isDesktop ? "overflow-hidden" : "touch-pan-x"
              }`}
            >
              {images.map((image, idx) => (
                <button
                  key={image + idx}
                  type="button"
                  className={`relative w-full h-full flex-shrink-0 snap-start bg-black ${
                    isDesktop ? "cursor-crosshair" : "cursor-zoom-in"
                  }`}
                  onClick={handleMainClick}
                >
                  <img
                    src={image}
                    alt={`${productName} - Image ${idx + 1}`}
                    className="w-full h-full object-contain p-3 sm:p-4 select-none pointer-events-none"
                    loading="eager"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Flipkart/Amazon style hover lens */}
          {isDesktop && hoverZoom && !isVideoSelected && currentImage && (
            <div
              className="pointer-events-none absolute z-20 border-2 border-primary/70 bg-primary/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]"
              style={{
                left: lensPos.x,
                top: lensPos.y,
                width: lensSize.w,
                height: lensSize.h,
              }}
            />
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
              onClick={openFullscreenZoom}
              title="Zoom image"
            >
              <ZoomIn size={18} />
            </Button>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 rounded-full px-3 py-1 text-xs font-medium z-10 shadow-sm border border-border/40">
            {isVideoSelected
              ? "Video Preview"
              : isDesktop
                ? "Hover to zoom · Click for fullscreen"
                : `${currentIndex + 1} / ${images.length} · Tap to zoom`}
          </div>
        </div>

        {/* Side zoom pane (desktop, Amazon/Flipkart style) */}
        {isDesktop && hoverZoom && !isVideoSelected && currentImage && (
          <div
            className="hidden lg:block absolute left-[calc(100%+1rem)] top-0 z-30 h-full aspect-square w-full max-w-[min(100%,520px)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden pointer-events-none"
            aria-hidden
          >
            <div
              className="h-full w-full bg-no-repeat"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: `${ZOOM_FACTOR * 100}%`,
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              }}
            />
          </div>
        )}
      </div>

      {totalItems > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => slideTo(idx)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex && !isVideoSelected
                  ? "border-primary shadow-crystal"
                  : "border-border opacity-60 hover:opacity-100"
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
                <img
                  src={images[0]}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-40 blur-[0.5px]"
                />
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

      {/* Fullscreen zoom: pinch / scroll / double-tap / drag */}
      {zoomOpen && currentImage && !isVideoSelected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative z-20 flex items-center justify-between px-4 py-3 text-white">
            <p className="text-xs sm:text-sm text-white/80">
              {modalScale > 1
                ? "Drag to pan · Pinch or scroll to zoom · Double-tap to reset"
                : "Pinch, scroll, or double-tap to zoom"}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setZoomOpen(false);
              }}
            >
              <X size={18} />
            </Button>
          </div>

          <div
            className="relative flex-1 overflow-hidden touch-none"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handleModalPointerDown}
            onPointerMove={handleModalPointerMove}
            onPointerUp={handleModalPointerUp}
            onPointerCancel={handleModalPointerUp}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            onWheel={handleModalWheel}
            style={{
              cursor: modalScale > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
            }}
          >
            <img
              src={currentImage}
              alt={`${productName} zoomed image`}
              className="absolute left-1/2 top-1/2 max-h-full max-w-full select-none object-contain will-change-transform"
              style={{
                transform: `translate(-50%, -50%) translate(${modalOffset.x}px, ${modalOffset.y}px) scale(${modalScale})`,
                transition: isPanning ? "none" : "transform 120ms ease-out",
              }}
              draggable={false}
            />
          </div>

          {images.length > 1 && (
            <div
              className="relative z-20 flex gap-2 overflow-x-auto px-4 py-3 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={`zoom-thumb-${idx}`}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setModalScale(1);
                    setModalOffset({ x: 0, y: 0 });
                  }}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    idx === currentIndex ? "border-primary" : "border-white/20 opacity-70"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
