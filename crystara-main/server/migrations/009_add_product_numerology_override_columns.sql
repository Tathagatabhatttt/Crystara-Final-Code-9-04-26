-- Add separate override fields so admins can curate ruling and destiny
-- recommendations independently, while keeping the legacy aligned_numbers
-- column available as a fallback.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ruling_numbers integer[] DEFAULT '{}'::integer[],
  ADD COLUMN IF NOT EXISTS destiny_numbers integer[] DEFAULT '{}'::integer[];

-- Backfill legacy manual alignments into both override fields when the new
-- columns are empty, so existing curated products keep their current behavior.
UPDATE public.products
SET
  ruling_numbers = COALESCE(NULLIF(ruling_numbers, '{}'::integer[]), aligned_numbers, '{}'::integer[]),
  destiny_numbers = COALESCE(NULLIF(destiny_numbers, '{}'::integer[]), aligned_numbers, '{}'::integer[])
WHERE
  (ruling_numbers IS NULL OR ruling_numbers = '{}'::integer[])
  OR (destiny_numbers IS NULL OR destiny_numbers = '{}'::integer[]);
