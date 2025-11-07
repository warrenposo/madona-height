# Database Setup Guide

This document explains how to set up your Supabase database for the Madona Heights Rentals application.

## Overview

The application has been updated to use Supabase as the database instead of static data. All data (profiles, bookings, messages, payments, rooms, testimonials, and blogs) is now fetched from Supabase.

## Database Tables Required

The following tables need to be created in your Supabase database:

1. **profiles** - User profile information
2. **rooms** - Room listings
3. **bookings** - User room bookings
4. **payments** - Payment records
5. **messages** - Support chat messages
6. **testimonials** - Tenant testimonials
7. **blogs** - Blog posts

## Setup Instructions

### Step 1: Run the SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_schema.sql`
4. Run the SQL script

This will create all necessary tables, indexes, triggers, and Row Level Security (RLS) policies.

### Step 2: Set Up Storage (Optional)

If you want to upload room images:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `room-images`
3. Set it to public (or configure appropriate policies)

### Step 3: Verify Tables

After running the SQL script, verify that all tables were created:

- `profiles`
- `rooms`
- `bookings`
- `payments`
- `messages`
- `testimonials`
- `blogs`

## What Changed in the Code

### 1. Testimonials Page (`src/pages/Testimonials.tsx`)
- Now fetches testimonials from the `testimonials` table
- Displays loading and error states
- Automatically generates initials if not provided

### 2. User Dashboard (`src/pages/UserDashboard.tsx`)
- Fetches user profile from `profiles` table
- Fetches active booking from `bookings` table
- Fetches room information for the booking
- Fetches payment history from `payments` table
- All data is now dynamic and user-specific

### 3. Sign Up Page (`src/pages/SignUp.tsx`)
- Automatically creates a profile entry in the `profiles` table when a user signs up
- Links the profile to the authenticated user

### 4. Admin Dashboard (`src/pages/AdminDashboard.tsx`)
- Updated to use proper Supabase joins instead of RPC functions
- Fetches bookings with room and user information

## Data Flow

### User Registration Flow
1. User signs up → `supabase.auth.signUp()`
2. Profile created → Insert into `profiles` table
3. User can now book rooms and access dashboard

### Booking Flow
1. User selects a room → Creates entry in `bookings` table
2. Admin approves → Updates booking status
3. User makes payment → Creates entry in `payments` table
4. Dashboard displays → Fetches booking and payment data

### Messaging Flow
1. User sends message → Insert into `messages` table
2. Real-time updates → Supabase real-time subscriptions
3. Admin responds → Insert into `messages` table

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **profiles**: Users can only view/update their own profile
- **bookings**: Users can only view their own bookings
- **payments**: Users can only view payments for their bookings
- **messages**: Users can only view messages they sent or received
- **rooms**: Everyone can view, authenticated users can manage
- **testimonials**: Everyone can view, authenticated users can create
- **blogs**: Everyone can view, authenticated users can manage

## Testing

After setting up the database:

1. **Test User Registration**
   - Sign up a new user
   - Verify profile is created in `profiles` table

2. **Test Room Booking**
   - Log in as a user
   - Book a room
   - Verify booking appears in `bookings` table

3. **Test Dashboard**
   - Log in as a user with a booking
   - Verify dashboard shows booking and room information

4. **Test Testimonials**
   - Add a testimonial via SQL or admin panel
   - Verify it appears on the testimonials page

## Troubleshooting

### "Table does not exist" errors
- Make sure you ran the `database_schema.sql` script
- Verify tables exist in your Supabase dashboard

### "Permission denied" errors
- Check RLS policies are set up correctly
- Verify user is authenticated
- Check that policies allow the operation you're trying to perform

### Profile not created on signup
- Check browser console for errors
- Verify `profiles` table exists and has correct structure
- Check that RLS policy allows users to insert their own profile

## Next Steps

1. Run the SQL schema in Supabase
2. Test user registration
3. Add some sample data (rooms, testimonials, blogs)
4. Test the full booking and payment flow

For questions or issues, check the Supabase documentation or review the code comments in the updated files.

