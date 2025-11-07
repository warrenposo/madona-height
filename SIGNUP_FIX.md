# Sign Up and Email Verification Fix

## Issues Fixed

1. **Profile not being created** - Fixed by adding a database trigger that automatically creates profiles
2. **Email verification not working** - Fixed by properly configuring email redirect and handling

## What Was Changed

### 1. Database Trigger (`create_database_schema.sql`)
- Added `handle_new_user()` function that automatically creates a profile when a user signs up
- Trigger runs on `auth.users` INSERT, so it works even before email verification
- Uses `SECURITY DEFINER` to bypass RLS policies during profile creation

### 2. Sign Up Component (`src/pages/SignUp.tsx`)
- Added proper email redirect URL configuration
- Improved error handling
- Better user feedback for email verification flow
- Removed manual profile creation (now handled by trigger)

## Setup Instructions

### Step 1: Update Database Schema

If you haven't run the updated schema yet:

1. Go to Supabase SQL Editor
2. Run the updated `create_database_schema.sql` (it now includes the trigger)

OR if you already have the schema:

1. Go to Supabase SQL Editor
2. Run `database_triggers.sql` to add just the trigger

### Step 2: Configure Email Settings in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, make sure:
   - ✅ **Enable email confirmations** is checked (if you want email verification)
   - ✅ **Enable email signup** is checked
4. Under **Email Templates**, configure:
   - **Confirm signup** template
   - Set the redirect URL to: `https://your-domain.com/login` (or your app URL)
5. Under **Site URL**, set your app's URL (e.g., `http://localhost:5173` for dev)

### Step 3: Test Sign Up

1. Try signing up with a new email
2. Check your email for verification link
3. Click the link to verify
4. Check the `profiles` table in Supabase - you should see the new profile

## How It Works Now

1. **User signs up** → `supabase.auth.signUp()` is called
2. **User created in auth.users** → Database trigger fires automatically
3. **Profile created** → Trigger inserts into `profiles` table
4. **Email sent** → Supabase sends verification email (if enabled)
5. **User verifies** → Clicks link in email, gets redirected to login
6. **User logs in** → Can now access dashboard

## Troubleshooting

### Profile still not created?

1. Check if the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Check trigger function:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. Manually test the trigger:
   ```sql
   -- Check if a user exists in auth.users
   SELECT id, email FROM auth.users;
   
   -- Check if profile exists
   SELECT id, email FROM profiles;
   ```

### Email not being sent?

1. Check Supabase email settings (Authentication → Settings)
2. Check if email confirmation is enabled
3. Check spam folder
4. For development, you can disable email confirmation temporarily:
   - Go to Authentication → Settings
   - Uncheck "Enable email confirmations"
   - Users will be able to log in immediately

### Email verification link not working?

1. Make sure Site URL is set correctly in Supabase settings
2. Check the redirect URL in the email template
3. Make sure your app is running on the correct URL

## Alternative: Disable Email Verification (Development Only)

If you want to skip email verification for development:

1. Go to Supabase Dashboard → Authentication → Settings
2. Uncheck **"Enable email confirmations"**
3. Users will be able to log in immediately after signup

⚠️ **Warning**: Only do this in development. Always enable email verification in production!

