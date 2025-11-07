# Fix Chat and Email Issues

## Problems Fixed

1. ✅ **Chat not working** - 401/406 errors when trying to send messages
2. ✅ **Email verification not sending** - Users not receiving verification emails

## Solution

### Step 1: Fix RLS Policies (REQUIRED)

Run this SQL script in Supabase SQL Editor:

```sql
-- =====================================================
-- FIX CHAT AND EMAIL ISSUES
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can find admin for chat" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow authenticated users to find admin by role (for chat)
CREATE POLICY "Users can find admin for chat" ON profiles
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND 
    role = 'admin' AND 
    is_active = true
  );

-- Ensure admin user exists and has correct role
UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE email = 'warrenokumu98@gmail.com';

-- Verify admin exists
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
```

### Step 2: Configure Email Settings

1. **Go to Supabase Dashboard** → **Authentication** → **Settings**

2. **Email Auth Settings:**
   - ✅ Enable **"Enable email signup"**
   - Choose one:
     - ✅ **Enable "Enable email confirmations"** (users must verify email)
     - OR
     - ❌ **Disable "Enable email confirmations"** (users can log in immediately)

3. **Site URL:**
   - Set to: `http://localhost:5173` (for development)
   - Or your production URL

4. **Redirect URLs:**
   - Add: `http://localhost:5173/verify-email`
   - Add: `http://localhost:5173/login`

5. **Email Templates:**
   - Go to **Authentication** → **Email Templates**
   - Edit **"Confirm signup"** template
   - Set redirect URL to: `{{ .SiteURL }}/verify-email`

## What Was Fixed in Code

### 1. SupportChatWidget.tsx
- Added error handling for admin lookup
- Added fallback to find admin by email if role query fails
- Better error messages

### 2. UserDashboard.tsx
- Added error handling for admin lookup
- Added fallback mechanism

### 3. Login.tsx
- Already fixed to create profile if missing

## Testing

### Test Chat:
1. Log in as a normal user
2. Click the chat widget (bottom right)
3. Type a message and send
4. Should work now! ✅

### Test Email Verification:
1. Sign up with a new email
2. Check your email inbox (and spam folder)
3. Click the verification link
4. Should redirect to `/verify-email` and then `/login`

## Troubleshooting

### Chat still not working?

1. **Check if admin exists:**
   ```sql
   SELECT * FROM profiles WHERE role = 'admin';
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Check browser console** for specific error messages

### Email still not sending?

1. **Check Supabase email settings** (see Step 2 above)
2. **Check spam folder**
3. **For development**, you can disable email confirmation:
   - Go to Authentication → Settings
   - Uncheck "Enable email confirmations"
   - Users can log in immediately

### Still getting 401 errors?

Run the SQL script from Step 1 again to ensure policies are correct.

## Quick Test

After running the SQL script:

1. **Refresh your browser**
2. **Log in as a normal user**
3. **Try sending a chat message**
4. **Should work!** ✅

If it still doesn't work, check the browser console for the specific error and let me know!

