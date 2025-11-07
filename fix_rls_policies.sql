-- =====================================================
-- FIX RLS POLICIES FOR PROFILES
-- =====================================================
-- This ensures RLS policies allow users to read their own profiles
-- Run this if you're still getting 401 errors
-- =====================================================

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles';
  
  RAISE NOTICE '✅ RLS Policies for profiles:';
  RAISE NOTICE '   Number of policies: %', policy_count;
  
  IF policy_count >= 3 THEN
    RAISE NOTICE '✅ All policies are in place!';
  ELSE
    RAISE NOTICE '⚠️  Some policies might be missing.';
  END IF;
END $$;

