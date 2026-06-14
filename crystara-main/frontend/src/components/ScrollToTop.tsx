import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantly on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    // Fallback for when content loads asynchronously causing layout shifts
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
