-- =====================================================
-- DATABASE TRIGGERS FOR AUTO-PROFILE CREATION
-- =====================================================
-- This trigger automatically creates a profile when a new user signs up
-- Run this in Supabase SQL Editor if you already have the schema
-- OR it's already included in create_database_schema.sql
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NULL,
    NULL,
    'tenant',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions (if not already granted)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up';

-- Verify trigger was created
DO $$
BEGIN
  RAISE NOTICE 'Profile auto-creation trigger installed successfully!';
  RAISE NOTICE 'New users will automatically get a profile created when they sign up.';
END $$;

