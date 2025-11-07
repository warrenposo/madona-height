-- =====================================================
-- ADD AUTO-PROFILE CREATION TRIGGER
-- =====================================================
-- This script adds the trigger to automatically create profiles
-- when new users sign up. Safe to run on existing database.
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Set role based on email - only warrenokumu98@gmail.com is admin
  IF NEW.email = 'warrenokumu98@gmail.com' THEN
    user_role := 'admin';
  ELSE
    user_role := 'tenant';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NULL,
    NULL,
    user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = NEW.email, role = user_role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile auto-creation trigger installed successfully!';
  RAISE NOTICE '📝 New users will automatically get a profile created when they sign up.';
  RAISE NOTICE '🔍 You can test by signing up a new user and checking the profiles table.';
END $$;

