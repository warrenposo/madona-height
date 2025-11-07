# Database Reset and Setup Guide

This guide explains how to completely reset and recreate your Supabase database.

## ⚠️ WARNING
**Running these scripts will DELETE ALL DATA in your database!** Make sure you have backups if needed.

## Step-by-Step Instructions

### Step 1: Delete All Tables
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `drop_all_tables.sql`
4. Click **Run** to execute
5. This will delete all tables, views, triggers, functions, and policies

### Step 2: Create New Database Schema
1. Still in the **SQL Editor**
2. Copy and paste the contents of `create_database_schema.sql`
3. Click **Run** to execute
4. This will create all tables with proper structure, indexes, triggers, and RLS policies

## What Gets Created

### Tables Created:
1. **profiles** - User profiles with roles (tenant, admin, manager)
2. **rooms** - Room listings with features, images, and status
3. **bookings** - Booking requests with status tracking
4. **payments** - Payment records with transaction tracking
5. **messages** - Support chat messages with read status
6. **testimonials** - Tenant testimonials with approval system
7. **blogs** - Blog posts with publishing system

### Features Included:
- ✅ Comprehensive indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Auto-updating timestamps (triggers)
- ✅ Data validation (CHECK constraints)
- ✅ Foreign key relationships
- ✅ Admin view for bookings
- ✅ Comments on all tables and columns

## Quick Commands

### Delete Everything:
```sql
-- Run drop_all_tables.sql in Supabase SQL Editor
```

### Create Everything:
```sql
-- Run create_database_schema.sql in Supabase SQL Editor
```

## Verification

After running both scripts, verify the setup:

1. Check that all 7 tables exist in the **Table Editor**
2. Check that RLS is enabled on all tables
3. Test creating a profile by signing up a new user
4. Test creating a room in the admin dashboard

## Troubleshooting

### Error: "relation already exists"
- Make sure you ran `drop_all_tables.sql` first
- Check if there are any remaining tables and drop them manually

### Error: "permission denied"
- Make sure you're running as the database owner
- Check Supabase project settings

### Tables created but RLS not working
- Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check that policies were created successfully

## Next Steps

After setting up the database:

1. **Add Sample Data:**
   - Create some rooms via admin dashboard
   - Add sample testimonials
   - Create blog posts

2. **Test User Flow:**
   - Sign up a new user
   - Book a room
   - Send a message
   - View dashboard

3. **Test Admin Flow:**
   - Log in as admin
   - View bookings
   - Approve/reject bookings
   - Manage rooms

## File Descriptions

- **drop_all_tables.sql** - Deletes all database objects
- **create_database_schema.sql** - Creates complete database structure
- **database_schema.sql** - Original schema (can be used as reference)

