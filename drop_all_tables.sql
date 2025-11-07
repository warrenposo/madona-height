-- =====================================================
-- DROP ALL TABLES AND RELATED OBJECTS
-- =====================================================
-- WARNING: This will delete ALL data in your database!
-- Run this script in Supabase SQL Editor to completely reset your database
-- =====================================================

-- Drop all views first
DROP VIEW IF EXISTS admin_bookings_view CASCADE;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (in reverse order of dependencies)
-- Drop tables that have foreign keys first
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all policies (they should be dropped with tables, but just in case)
-- Note: Policies are automatically dropped when tables are dropped, but we list them for clarity

-- Verify all objects are dropped
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check for remaining tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        RAISE NOTICE 'Remaining table: %', r.tablename;
    END LOOP;
END $$;

