-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to add the is_admin_customized column to the products table.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_admin_customized BOOLEAN DEFAULT false;

-- Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
