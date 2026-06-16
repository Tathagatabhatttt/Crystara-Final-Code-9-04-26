-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to add the is_deleted column to the products table.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;

-- Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
