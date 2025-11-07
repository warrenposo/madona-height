-- =====================================================
-- MADONA HEIGHTS RENTALS - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This script creates a well-structured database for the rental management system
-- Run this in Supabase SQL Editor after running drop_all_tables.sql
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Stores user profile information linked to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'tenant' CHECK (role IN ('tenant', 'admin', 'manager')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase auth users';
COMMENT ON COLUMN profiles.role IS 'User role: tenant, admin, or manager';

-- =====================================================
-- 2. ROOMS TABLE
-- =====================================================
-- Stores available room listings
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance', 'Reserved')),
  room_number TEXT UNIQUE,
  floor_number INTEGER,
  square_feet INTEGER,
  max_occupancy INTEGER DEFAULT 1 CHECK (max_occupancy > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE rooms IS 'Room listings with details and availability';
COMMENT ON COLUMN rooms.status IS 'Room availability status';
COMMENT ON COLUMN rooms.features IS 'Array of room features/amenities';

-- =====================================================
-- 3. BOOKINGS TABLE
-- =====================================================
-- Stores user room booking requests and status
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'cancelled', 'completed')),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE bookings IS 'User room booking requests and their status';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending, approved, rejected, paid, cancelled, completed';

-- =====================================================
-- 4. PAYMENTS TABLE
-- =====================================================
-- Stores payment records for bookings
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_date DATE NOT NULL,
  due_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'mpesa', 'bank_transfer', 'card', 'other')),
  transaction_id TEXT UNIQUE,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE payments IS 'Payment records for room bookings';
COMMENT ON COLUMN payments.payment_method IS 'Method of payment used';

-- =====================================================
-- 5. MESSAGES TABLE
-- =====================================================
-- Stores support chat messages between users and admin
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT different_sender_receiver CHECK (sender_id != receiver_id)
);

COMMENT ON TABLE messages IS 'Support chat messages between users and admin';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by the receiver';

-- =====================================================
-- 6. TESTIMONIALS TABLE
-- =====================================================
-- Stores tenant testimonials/reviews
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  initials TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE testimonials IS 'Tenant testimonials and reviews';
COMMENT ON COLUMN testimonials.is_approved IS 'Whether the testimonial is approved for public display';

-- =====================================================
-- 7. BLOGS TABLE
-- =====================================================
-- Stores blog posts/articles
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  date DATE DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE blogs IS 'Blog posts and articles';
COMMENT ON COLUMN blogs.published IS 'Whether the blog post is published and visible';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Rooms indexes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_price ON rooms(price);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Payments indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Testimonials indexes
CREATE INDEX idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at);
CREATE INDEX idx_testimonials_approved ON testimonials(is_approved, created_at);

-- Blogs indexes
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_published ON blogs(published, published_at);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_date ON blogs(date);
CREATE INDEX idx_blogs_slug ON blogs(slug);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column when a row is updated';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
  BEFORE UPDATE ON rooms
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at 
  BEFORE UPDATE ON testimonials
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at 
  BEFORE UPDATE ON blogs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can find admin for chat (allows authenticated users to find admin)
CREATE POLICY "Users can find admin for chat" ON profiles
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND 
    role = 'admin' AND 
    is_active = true
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- ROOMS POLICIES
-- =====================================================

-- Everyone can view rooms
CREATE POLICY "Anyone can view rooms" ON rooms
  FOR SELECT USING (true);

-- Authenticated users can manage rooms (admin only in practice)
CREATE POLICY "Authenticated users can manage rooms" ON rooms
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (limited - status changes may be restricted)
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Users can view payments for their bookings
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = payments.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Users can create payments for their bookings
CREATE POLICY "Users can create own payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = payments.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- =====================================================
-- TESTIMONIALS POLICIES
-- =====================================================

-- Everyone can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials" ON testimonials
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

-- Authenticated users can create testimonials
CREATE POLICY "Authenticated users can create testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own testimonials
CREATE POLICY "Users can update own testimonials" ON testimonials
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- BLOGS POLICIES
-- =====================================================

-- Everyone can view published blogs
CREATE POLICY "Anyone can view published blogs" ON blogs
  FOR SELECT USING (published = true);

-- Authenticated users can manage blogs (admin only in practice)
CREATE POLICY "Authenticated users can manage blogs" ON blogs
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Admin bookings view with joined data
CREATE OR REPLACE VIEW admin_bookings_view AS
SELECT 
  b.id,
  b.room_id,
  b.user_id,
  b.price,
  b.status,
  b.start_date,
  b.end_date,
  b.created_at,
  r.type as room_type,
  r.room_number,
  r.status as room_status,
  p.full_name,
  p.email,
  p.phone
FROM bookings b
LEFT JOIN rooms r ON b.room_id = r.id
LEFT JOIN profiles p ON b.user_id = p.id
ORDER BY b.created_at DESC;

COMMENT ON VIEW admin_bookings_view IS 'Joined view of bookings with room and user information for admin dashboard';

-- Grant access to the view
GRANT SELECT ON admin_bookings_view TO authenticated;

-- =====================================================
-- AUTO-PROFILE CREATION TRIGGER
-- =====================================================

-- Function to automatically create profile when user signs up
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

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: profiles, rooms, bookings, payments, messages, testimonials, blogs';
  RAISE NOTICE 'All indexes, triggers, and RLS policies have been set up.';
  RAISE NOTICE 'Auto-profile creation trigger has been installed.';
END $$;

