-- Alter the table default for hero_slides to be NULL (no override)
ALTER TABLE public.site_settings ALTER COLUMN hero_slides DROP DEFAULT;
ALTER TABLE public.site_settings ALTER COLUMN hero_slides SET DEFAULT NULL;

-- Update existing row to set hero_slides to NULL if it is currently '[]'::jsonb (unconfigured)
UPDATE public.site_settings
SET hero_slides = NULL
WHERE id = 'current' AND hero_slides = '[]'::jsonb;
