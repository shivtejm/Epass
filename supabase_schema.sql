-- ===================================================================
-- EPass Database Schema (UPI + UTR Auto-Verification)
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Drop old tables if they exist (for a clean migration)
DROP TABLE IF EXISTS public.payment_verifications CASCADE;
DROP TABLE IF EXISTS public.passes CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the tables

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('organizer', 'attendee')) DEFAULT 'attendee',
  upi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  event_code TEXT UNIQUE NOT NULL,
  upi_id TEXT, -- UPI ID for paid events (null for free events)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.passes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) NOT NULL,
  attendee_id UUID REFERENCES public.profiles(id),
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,
  pass_number TEXT UNIQUE NOT NULL,
  utr_number TEXT, -- UPI Transaction Reference entered by attendee
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  qr_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store verified UTRs received from Gmail webhook
CREATE TABLE public.payment_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  utr_number TEXT NOT NULL,
  amount NUMERIC(10, 2),
  sender_info TEXT, -- From bank email (e.g. VPA or name)
  matched_pass_id UUID REFERENCES public.passes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Setup Row Level Security (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Events
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizers can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

-- Passes
CREATE POLICY "Anyone can insert passes" ON public.passes FOR INSERT WITH CHECK (true);
CREATE POLICY "Attendees can view their own passes" ON public.passes FOR SELECT USING (auth.uid() = attendee_id);
CREATE POLICY "Organizers can view passes for their events" ON public.passes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = passes.event_id AND events.organizer_id = auth.uid()));
CREATE POLICY "Organizers can update passes for their events" ON public.passes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = passes.event_id AND events.organizer_id = auth.uid()));

-- Payment Verifications (service role only — no public access)
CREATE POLICY "Service role only" ON public.payment_verifications FOR ALL USING (false);

-- 4. Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role) VALUES (new.id, 'attendee');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
