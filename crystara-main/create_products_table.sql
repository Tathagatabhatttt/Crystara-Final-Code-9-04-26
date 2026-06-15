-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to create the products table and configure Row Level Security (RLS) policies.

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stone TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  benefit TEXT,
  image TEXT,
  gallery_images JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  sub_category TEXT,
  sub_category_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. Policy to allow everyone (public and authenticated) to read products
CREATE POLICY "Allow public read access to products" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- 2. Policy to allow only admin users to insert new products
CREATE POLICY "Allow admin insert access to products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
  );

-- 3. Policy to allow only admin users to update products
CREATE POLICY "Allow admin update access to products" 
  ON public.products 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
  );

-- 4. Policy to allow only admin users to delete products
CREATE POLICY "Allow admin delete access to products" 
  ON public.products 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
  );

-- Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
