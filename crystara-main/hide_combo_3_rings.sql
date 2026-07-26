-- Hide all built-in "Combo 3" ring products from the storefront.
-- Run once in Supabase SQL Editor if they still appear after being deleted.
-- Soft-delete only: they remain restorable from Admin.

INSERT INTO public.products (
  id,
  name,
  stone,
  price,
  original_price,
  benefit,
  category,
  category_slug,
  sub_category,
  sub_category_slug,
  featured,
  is_deleted
)
VALUES
  ('rings-combo-3-tiger-eye', 'Tiger Eye', 'Tiger Eye', 1299, 3000, 'Courage & confidence', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-lapis', 'Lapis', 'Lapis', 1299, 3000, 'Wisdom & truth', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-amethyst', 'Amethyst', 'Amethyst', 1299, 3000, 'Peace & intuition', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-citrine', 'Citrine', 'Citrine', 1299, 3000, 'Success & creativity', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-rose-quartz', 'Rose Quartz', 'Rose Quartz', 1299, 3000, 'Love & emotional healing', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-green-jade', 'Green Jade', 'Green Jade', 1299, 3000, 'Harmony & balance', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-pyrite', 'Pyrite', 'Pyrite', 1299, 3000, 'Confidence & manifestation', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-rainbow-moon-stone', 'Rainbow Moon Stone', 'Rainbow Moon Stone', 1299, 3000, 'Intuition & new beginnings', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true),
  ('rings-combo-3-turquoise', 'Turquoise', 'Turquoise', 1299, 3000, 'Protection & healing', 'Rings', 'rings', 'Combo 3', 'combo-3', false, true)
ON CONFLICT (id) DO UPDATE
SET
  is_deleted = true,
  featured = false;

NOTIFY pgrst, 'reload schema';
