-- =====================================================
-- FIX CHAT AND EMAIL ISSUES
-- =====================================================
-- This script fixes RLS policies to allow chat functionality
-- and ensures email verification works
-- =====================================================

-- =====================================================
-- 1. FIX RLS POLICIES FOR CHAT FUNCTIONALITY
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can find admin for chat" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow authenticated users to find admin by role (for chat)
-- This allows any authenticated user to find the admin user
CREATE POLICY "Users can find admin for chat" ON profiles
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND 
    role = 'admin' AND 
    is_active = true
  );

-- Verify messages policies exist
-- (These should already be in place, but let's make sure)
DO $$
BEGIN
  -- Check if message policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can view own messages'
  ) THEN
    CREATE POLICY "Users can view own messages" ON messages
      FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages" ON messages
      FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can update received messages'
  ) THEN
    CREATE POLICY "Users can update received messages" ON messages
      FOR UPDATE USING (auth.uid() = receiver_id);
  END IF;
END $$;

-- =====================================================
-- 2. VERIFY ADMIN USER EXISTS
-- =====================================================

-- Ensure admin user has correct role
UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE email = 'warrenokumu98@gmail.com';

-- Show admin status
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE email = 'warrenokumu98@gmail.com' 
    AND role = 'admin' 
    AND is_active = true
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE '✅ Admin user found and active';
  ELSE
    RAISE NOTICE '⚠️  Admin user not found. Make sure warrenokumu98@gmail.com has signed up.';
  END IF;
END $$;

-- =====================================================
-- 3. SHOW CURRENT POLICIES
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'messages')
ORDER BY tablename, policyname;

