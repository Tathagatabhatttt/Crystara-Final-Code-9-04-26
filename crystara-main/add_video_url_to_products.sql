-- Run this in your Supabase SQL Editor to add short video support to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
