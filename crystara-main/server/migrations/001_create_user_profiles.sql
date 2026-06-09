-- Migration 001: Create user_profiles table
-- Stores user profile data collected during onboarding and updated via settings

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_pincode TEXT,
  saved_addresses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow the service role full access
CREATE POLICY "Service role has full access on user_profiles" 
  ON public.user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
