import type { LucideIcon } from "lucide-react";

type CmsIconProps = {
  iconUrl?: string;
  fallbackIcon: LucideIcon;
  className?: string;
  imageClassName?: string;
  alt?: string;
};

const CmsIcon = ({
  iconUrl,
  fallbackIcon: FallbackIcon,
  className = "w-4 h-4",
  imageClassName,
  alt = "",
}: CmsIconProps) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={alt}
        className={imageClassName || className}
      />
    );
  }

  return <FallbackIcon className={className} />;
};

export default CmsIcon;
