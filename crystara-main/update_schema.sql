-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to add the missing columns to the user_profiles table and establish the correct relationships.

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address_pincode TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS saved_addresses JSONB DEFAULT '[]';

CREATE TABLE IF NOT EXISTS public.customer_carts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customer_carts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'customer_carts'
      AND policyname = 'Service role has full access on customer_carts'
  ) THEN
    CREATE POLICY "Service role has full access on customer_carts"
      ON public.customer_carts
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Verify the relationship constraint exists between orders and user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_user_id_user_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_user_id_user_profiles_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.user_profiles(user_id)
      ON DELETE CASCADE;
  END IF;
END
$$;

-- Notify PostgREST to reload the schema cache immediately
NOTIFY pgrst, 'reload schema';
