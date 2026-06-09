import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { WELCOME_DISCOUNT_PERCENT } from "@/lib/welcomeOffer";

const MESSAGES = [
  { text: `${WELCOME_DISCOUNT_PERCENT}% Off On First Signup`, href: "/auth?mode=signup&offer=welcome10", link: true },
  { text: "Free Shipping Above ₹999", link: false },
  { text: "100% Natural Crystals", link: false },
  { text: "COD Available Pan India", link: false },
  { text: "Crafted for Energy. Designed for You.", link: false },
] as const;

const MarqueeTrack = () => (
  <div className="announcement-marquee-track flex shrink-0 items-center">
    {MESSAGES.map((message, index) => (
      <span key={`${message.text}-${index}`} className="flex items-center px-6 sm:px-10">
        {message.link ? (
          <Link
            to={message.href!}
            className="transition-opacity hover:opacity-80"
            onClick={(event) => event.stopPropagation()}
          >
            {message.text}
          </Link>
        ) : (
          <span>{message.text}</span>
        )}
        <Heart className="mx-4 h-3 w-3 fill-current opacity-90" aria-hidden />
      </span>
    ))}
  </div>
);

const AnnouncementMarquee = () => {
  return (
    <div
      className="announcement-marquee relative z-50 h-8 overflow-hidden bg-black text-white"
      aria-label="Store announcements"
    >
      <div className="announcement-marquee-inner flex w-max items-center py-2 text-[11px] font-medium uppercase tracking-[0.18em] sm:text-xs">
        <MarqueeTrack />
        <div aria-hidden>
          <MarqueeTrack />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementMarquee;
