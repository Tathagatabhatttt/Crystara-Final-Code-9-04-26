// Product images sourced from maitriexport.com CDN, mapped by category

const cdn = "https://www.maitriexport.com/cdn/shop/files";

// Category-level images for product cards
export const categoryImages: Record<string, string[]> = {
  "chip-bracelet": [
    `${cdn}/4mm-crystal-round-beads-stretchable-bracelet-895439_d62ff6da-dc6c-4417-bbd0-c2be338e8048.jpg?v=1712657083&width=800`,
    `${cdn}/4mm-crystal-round-beads-stretchable-bracelet-126907_a7c5f123-1d4a-494a-9ab3-f216d4deaee9.jpg?v=1712657083&width=800`,
    `${cdn}/3_786dd41e-5c1c-4726-b104-0d0cee8c590c.png?v=1734678946&width=800`,
    `${cdn}/4_d65c7564-50ba-460e-8bf7-3097c04d9ea9.png?v=1734678948&width=800`,
  ],
  "beads-bracelet": [
    `${cdn}/7-chakra-with-clear-quartz-stretchable-8mm-crystal-bracelet-944445.jpg?v=1712657044&width=800`,
    `${cdn}/10mm-round-beads-stretchable-bracelet-979669.jpg?v=1712657034&width=800`,
    `${cdn}/7-chakra-bracelet-344348.jpg?v=1712656994&width=800`,
    `${cdn}/triple-main.jpg?v=1699444759&width=800`,
    `${cdn}/2.jpg?v=1699444354&width=800`,
    `${cdn}/7-chakra-bracelet-with-evil-eye-851097_f6eb364f-ced1-433d-b666-d3c758ca2e8f.jpg?v=1712657047&width=800`,
  ],
  "ring": [
    `${cdn}/1-109.jpg?v=1699449319&width=800`,
    `${cdn}/1-100.jpg?v=1699449319&width=800`,
    `${cdn}/1_308057d3-4129-45e8-ab10-1c314c4240a3.png?v=1723792481&width=800`,
    `${cdn}/1_4fba65bb-1f0a-41f0-a5a7-45402fee3f64.png?v=1709876459&width=800`,
  ],
  "pendant": [
    `${cdn}/2-9_a7cb4b62-9086-49bf-a114-50a855cf324f.jpg?v=1699446728&width=800`,
    `${cdn}/1-10_4e6874da-7ec5-41fd-8bf1-181e8fb39825.jpg?v=1699446728&width=800`,
    `${cdn}/mix-1.jpg?v=1699446935&width=800`,
    `${cdn}/1-29_369a016c-775c-415a-b608-b823018c16fc.jpg?v=1699446935&width=800`,
    `${cdn}/Untitled-design-2022-01-26T103138.058.jpg?v=1699448275&width=800`,
    `${cdn}/81coa0ubGTL.jpg?v=1699448275&width=800`,
    `${cdn}/1_773e9223-f10e-48db-a49d-9b0f6adea9c4.jpg?v=1715233598&width=800`,
    `${cdn}/Untitled-design-2022-01-26T105523.559.jpg?v=1699446682&width=800`,
  ],
  "pyramid": [
    `${cdn}/Engraved-symbols.png?v=1707995749&width=800`,
    `${cdn}/1_b85c84cf-aa70-4632-ae6e-c3b2df964393.png?v=1709897642&width=800`,
  ],
  "frame": [
    `${cdn}/638e817b4e0601340c2cef92-8-pieces-hexagonal-pointed-quartz.jpg?v=1709897472&width=800`,
  ],
};

// Get images for a product based on its category
export const getProductImages = (categorySlug: string, subCategorySlug: string, _index: number = 0): string[] => {
  // Map subcategory to image category
  let imageKey = subCategorySlug;
  
  if (categorySlug === "rings") imageKey = "ring";
  if (categorySlug === "lockets") imageKey = "pendant";
  if (categorySlug === "pyramids") imageKey = "pyramid";
  if (categorySlug === "frames") imageKey = "frame";
  
  const images = categoryImages[imageKey] || categoryImages["beads-bracelet"];
  
  // Return a rotating set of images for variety
  const startIdx = _index % images.length;
  const result: string[] = [];
  for (let i = 0; i < Math.min(5, images.length); i++) {
    result.push(images[(startIdx + i) % images.length]);
  }
  return result;
};

// Get a single thumbnail for product cards
export const getProductThumbnail = (categorySlug: string, subCategorySlug: string, index: number = 0): string => {
  const images = getProductImages(categorySlug, subCategorySlug, index);
  return images[0] || "/placeholder.svg";
};
