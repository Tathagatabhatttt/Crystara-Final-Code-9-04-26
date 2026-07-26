-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to enable the single admin-curated spotlight product.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_admin_customized BOOLEAN NOT NULL DEFAULT false;

-- If older data selected several products, keep one and clear the others.
WITH selected_products AS (
  SELECT
    ctid,
    row_number() OVER (ORDER BY id) AS selection_number
  FROM public.products
  WHERE is_admin_customized = true
)
UPDATE public.products AS product
SET is_admin_customized = false
FROM selected_products AS selected
WHERE product.ctid = selected.ctid
  AND selected.selection_number > 1;

-- Enforce one spotlight choice at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS products_single_admin_spotlight
ON public.products (is_admin_customized)
WHERE is_admin_customized = true;

-- Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
