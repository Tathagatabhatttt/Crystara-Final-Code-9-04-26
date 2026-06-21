-- Add video_url column to the products table to support product short videos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
