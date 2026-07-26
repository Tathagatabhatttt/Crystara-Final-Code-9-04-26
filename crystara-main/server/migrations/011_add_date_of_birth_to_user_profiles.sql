-- Store customer date of birth from the Customize Your Own flow.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

NOTIFY pgrst, 'reload schema';
