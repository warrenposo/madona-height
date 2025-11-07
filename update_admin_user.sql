-- =====================================================
-- UPDATE EXISTING ADMIN USER
-- =====================================================
-- This script updates the admin user (warrenokumu98@gmail.com)
-- to have the 'admin' role. Run this if the admin user already exists.
-- =====================================================

-- Update the admin user's role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'warrenokumu98@gmail.com';

-- Verify the update
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles
  WHERE email = 'warrenokumu98@gmail.com' AND role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE NOTICE '✅ Admin user updated successfully!';
    RAISE NOTICE '📧 Email: warrenokumu98@gmail.com';
    RAISE NOTICE '👤 Role: admin';
  ELSE
    RAISE NOTICE '⚠️  Admin user not found. Make sure the user has signed up first.';
  END IF;
END $$;

-- Show all users and their roles
SELECT 
  email,
  role,
  is_active,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

