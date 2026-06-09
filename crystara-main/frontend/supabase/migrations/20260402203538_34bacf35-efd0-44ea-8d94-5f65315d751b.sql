-- Insert admin roles for the specified admin emails when they sign up
-- This function will be triggered when a new user signs up to check if they should be admin
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.email IN ('anketandi@gmail.com', 'baniksaheb34@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
CREATE TRIGGER assign_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_role();

-- Also assign admin to existing users with these emails (if they already exist)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email IN ('anketandi@gmail.com', 'baniksaheb34@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;