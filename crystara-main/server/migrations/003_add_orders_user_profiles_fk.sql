-- Migration 003: Add explicit FK for orders -> user_profiles relationship
-- Needed for PostgREST/Supabase relational select: user_profiles(...)

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

-- Ask PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
