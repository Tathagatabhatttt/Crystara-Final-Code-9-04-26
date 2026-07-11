-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to add the aligned_numbers column to the products table.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS aligned_numbers JSONB DEFAULT '[]'::jsonb;

-- Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
