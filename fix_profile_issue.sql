-- =====================================================
-- FIX PROFILE ISSUE - CREATE MISSING PROFILES
-- =====================================================
-- This script creates profiles for users that don't have one
-- Run this in Supabase SQL Editor to fix the 401 error
-- =====================================================

-- Create profiles for all auth.users that don't have a profile
INSERT INTO public.profiles (id, email, full_name, phone, role, is_active)
SELECT 
  au.id,
  au.email,
  NULL,
  NULL,
  CASE 
    WHEN au.email = 'warrenokumu98@gmail.com' THEN 'admin'
    ELSE 'tenant'
  END,
  true
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify profiles exist
DO $$
DECLARE
  missing_count INTEGER;
  total_users INTEGER;
  total_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  SELECT COUNT(*) INTO missing_count
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
  
  RAISE NOTICE '📊 Profile Status:';
  RAISE NOTICE '   Total users: %', total_users;
  RAISE NOTICE '   Total profiles: %', total_profiles;
  RAISE NOTICE '   Missing profiles: %', missing_count;
  
  IF missing_count = 0 THEN
    RAISE NOTICE '✅ All users have profiles!';
  ELSE
    RAISE NOTICE '⚠️  Some users are missing profiles. Run the INSERT above again.';
  END IF;
END $$;

-- Show all users and their profiles
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  p.role,
  p.is_active,
  CASE WHEN p.id IS NULL THEN '❌ Missing' ELSE '✅ Exists' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

