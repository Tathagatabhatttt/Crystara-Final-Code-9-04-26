import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const location = useLocation();
  const hiddenPaths = ["/cart", "/checkout"];
  
  if (hiddenPaths.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <motion.a
      href="https://wa.me/916291951629?text=Hi%20Crystara!%20I%20have%20a%20question."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.924 15.924 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.313 22.596c-.39 1.1-1.932 2.014-3.178 2.28-.852.18-1.964.324-5.708-1.228-4.792-1.986-7.876-6.852-8.114-7.17-.228-.318-1.916-2.55-1.916-4.862s1.212-3.45 1.644-3.924c.39-.432.912-.576 1.188-.576.144 0 .288.006.41.012.39.018.588.042.846.654.324.768 1.116 2.718 1.212 2.916.096.198.192.462.06.732-.12.276-.228.396-.426.624-.198.228-.384.402-.582.648-.18.216-.384.45-.162.87.222.414.984 1.62 2.112 2.628 1.452 1.296 2.676 1.698 3.054 1.884.378.186.6.156.822-.096.228-.258.972-1.128 1.23-1.518.252-.39.51-.324.858-.192.354.126 2.244 1.056 2.628 1.248.384.192.642.288.738.45.096.162.096.93-.294 2.028z"/>
      </svg>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#25D366]"
        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
      />
    </motion.a>
  );
};

export default WhatsAppButton;
