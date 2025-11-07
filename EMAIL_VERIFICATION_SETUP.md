# Email Verification Setup Guide

## Issue
Users are not receiving email verification notifications when signing up.

## Solution

### Step 1: Configure Supabase Email Settings

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**:
   - ✅ Check **"Enable email signup"**
   - ✅ Check **"Enable email confirmations"** (if you want email verification)
   - OR
   - ❌ Uncheck **"Enable email confirmations"** (if you want users to log in immediately)

### Step 2: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Make sure the redirect URL is set to:
   ```
   {{ .SiteURL }}/verify-email
   ```
4. Or if you want to redirect directly to login:
   ```
   {{ .SiteURL }}/login
   ```

### Step 3: Set Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL:
   - Development: `http://localhost:5173` (or your dev port)
   - Production: `https://your-domain.com`

### Step 4: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:5173/verify-email` (for development)
   - `https://your-domain.com/verify-email` (for production)
   - `http://localhost:5173/login` (for development)
   - `https://your-domain.com/login` (for production)

## Testing Email Verification

### Option 1: Enable Email Confirmation (Recommended for Production)

1. Enable email confirmations in Supabase
2. User signs up → receives email
3. User clicks link → redirected to `/verify-email`
4. User can then log in

### Option 2: Disable Email Confirmation (For Development)

1. Disable email confirmations in Supabase
2. User signs up → can log in immediately
3. No email sent

## Troubleshooting

### Emails not being sent?

1. **Check Supabase Email Settings**
   - Make sure email is enabled
   - Check if you're on the free tier (limited emails)

2. **Check Spam Folder**
   - Verification emails might go to spam

3. **Check Email Provider**
   - Supabase free tier uses their email service
   - For production, consider setting up custom SMTP

4. **Check Console Errors**
   - Look for email-related errors in browser console

### Email link not working?

1. **Check Redirect URLs**
   - Make sure your app URL is in the allowed redirect URLs

2. **Check Site URL**
   - Must match your app's domain

3. **Check Email Template**
   - Verify the redirect URL in the template

## Quick Fix: Disable Email Confirmation (Development)

If you just want users to be able to log in immediately:

1. Go to **Authentication** → **Settings**
2. Uncheck **"Enable email confirmations"**
3. Users can now log in immediately after signup

⚠️ **Note**: Only disable email confirmation in development. Always enable it in production for security.

