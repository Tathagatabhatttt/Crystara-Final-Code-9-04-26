-- Run this in Supabase SQL Editor to store DOB from Customize Your Own.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

NOTIFY pgrst, 'reload schema';
