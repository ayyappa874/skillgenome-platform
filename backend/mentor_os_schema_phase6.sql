-- ======================================================================================
-- MENTOR OS - PHASE 6 SUPABASE MIGRATION
-- Run this script in your Supabase SQL Editor to create the remaining tables 
-- for the Mentor Dashboard real-time integration.
-- ======================================================================================

-- 1. Create mentor_resources table (For Library Tab)
CREATE TABLE IF NOT EXISTS public.mentor_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Link' CHECK (type IN ('PDF', 'Link', 'Video')),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create mentor_messages table (For Messages Tab)
CREATE TABLE IF NOT EXISTS public.mentor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type TEXT CHECK (sender_type IN ('mentor', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create mentor_availability table (For Availability Tab)
CREATE TABLE IF NOT EXISTS public.mentor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(mentor_id, day_of_week, start_time)
);

-- 4. Create mentor_bookings table (For Upcoming 1-on-1s)
CREATE TABLE IF NOT EXISTS public.mentor_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mentor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_bookings ENABLE ROW LEVEL SECURITY;

-- Allow completely public access for this MVP
CREATE POLICY "Enable read access for all users" ON public.mentor_resources FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.mentor_resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.mentor_resources FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.mentor_resources FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.mentor_messages FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.mentor_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.mentor_messages FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.mentor_messages FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.mentor_availability FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.mentor_availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.mentor_availability FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.mentor_availability FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.mentor_bookings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.mentor_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.mentor_bookings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.mentor_bookings FOR DELETE USING (true);
