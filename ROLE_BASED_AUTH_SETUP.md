# Role-Based Authentication Setup

## Overview

The system now uses **role-based authentication** instead of email checking:
- **Admin**: Only `warrenokumu98@gmail.com` (password: `Twenty37`)
- **Tenant**: All other users

## What Changed

### 1. Database Trigger
- Automatically sets `role = 'admin'` for `warrenokumu98@gmail.com`
- Sets `role = 'tenant'` for all other users
- Works when users sign up

### 2. Login System
- Now checks `role` from `profiles` table instead of email
- Admin users → redirected to `/admin`
- Tenant users → redirected to `/dashboard`

### 3. Components Updated
- `Login.tsx` - Checks role from profile
- `UserDashboard.tsx` - Finds admin by role
- `SupportChatWidget.tsx` - Finds admin by role
- `AdminDashboard.tsx` - Removed email constant

## SQL Scripts to Run

### Step 1: Update the Trigger (Required)

Run this in Supabase SQL Editor to update the trigger with role-based logic:

```sql
-- =====================================================
-- UPDATE AUTO-PROFILE CREATION TRIGGER (ROLE-BASED)
-- =====================================================

-- Function to handle new user signup with role assignment
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile with role: admin for warrenokumu98@gmail.com, tenant for others';

DO $$
BEGIN
  RAISE NOTICE '✅ Role-based trigger updated successfully!';
  RAISE NOTICE '👤 Admin: warrenokumu98@gmail.com → role: admin';
  RAISE NOTICE '👥 Others → role: tenant';
END $$;
```

### Step 2: Update Existing Admin User (If Already Signed Up)

If `warrenokumu98@gmail.com` already has an account, run this to update their role:

```sql
-- =====================================================
-- UPDATE EXISTING ADMIN USER
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
```

## How It Works

### Sign Up Flow
1. User signs up with email and password
2. Database trigger fires automatically
3. If email = `warrenokumu98@gmail.com` → `role = 'admin'`
4. Otherwise → `role = 'tenant'`
5. Profile created with correct role

### Login Flow
1. User enters email and password
2. Supabase authenticates the user
3. System fetches user's profile from `profiles` table
4. Checks `role` field:
   - If `role = 'admin'` → redirect to `/admin`
   - If `role = 'tenant'` → redirect to `/dashboard`

## Testing

### Test Admin Login
1. Sign up or log in with: `warrenokumu98@gmail.com` / `Twenty37`
2. Should redirect to `/admin` dashboard
3. Check `profiles` table - role should be `admin`

### Test Tenant Login
1. Sign up with any other email
2. Should redirect to `/dashboard`
3. Check `profiles` table - role should be `tenant`

## Security Notes

- ✅ Only `warrenokumu98@gmail.com` can be admin
- ✅ Role is set automatically by database trigger (can't be bypassed)
- ✅ Login checks role from database, not hardcoded email
- ✅ All other users are automatically tenants

## Troubleshooting

### Admin can't access admin dashboard?
1. Check if profile exists: `SELECT * FROM profiles WHERE email = 'warrenokumu98@gmail.com';`
2. Check role: Should be `admin`
3. If role is `tenant`, run Step 2 SQL script above

### New users not getting roles?
1. Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Re-run Step 1 SQL script

### Login redirects to wrong page?
1. Check browser console for errors
2. Verify profile exists and has correct role
3. Check network tab to see profile fetch response

