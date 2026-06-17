-- COPY AND RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR 
-- (Supabase Dashboard > SQL Editor > New Query)

-- 1. Add missing columns to the products table (if they don't already exist)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;

-- 2. Create the site_settings table (for Homepage Slideshow and Combo picture management)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  hero_slides JSONB DEFAULT '[]'::jsonb,
  customize_page_background TEXT,
  homepage_categories JSONB DEFAULT '[]'::jsonb,
  benefit_cards JSONB DEFAULT '[]'::jsonb,
  product_features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies conditionally for site_settings
DO $$
BEGIN
  -- Policy to allow everyone (public and authenticated) to read settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'site_settings' 
      AND policyname = 'Allow public read access to site_settings'
  ) THEN
    CREATE POLICY "Allow public read access to site_settings" 
      ON public.site_settings 
      FOR SELECT 
      USING (true);
  END IF;

  -- Policy to allow only admin users to perform write operations (ALL) on site_settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'site_settings' 
      AND policyname = 'Allow admin full access to site_settings'
  ) THEN
    CREATE POLICY "Allow admin full access to site_settings" 
      ON public.site_settings 
      FOR ALL
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
  END IF;
END
$$;

-- Insert default row so there is always a settings configuration row to query and update
INSERT INTO public.site_settings (id, hero_slides, homepage_categories)
VALUES ('current', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
