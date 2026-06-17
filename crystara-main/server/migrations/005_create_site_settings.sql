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

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies conditionally
DO $$
BEGIN
  -- 1. Policy to allow everyone (public and authenticated) to read settings
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

  -- 2. Policy to allow only admin users to perform write operations (ALL) on site_settings
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
