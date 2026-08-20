-- ======================================================================================
-- MENTOR OS - PHASE 5 SUPABASE MIGRATION
-- Run this script in your Supabase SQL Editor to create the necessary tables 
-- and dummy data for the Mentor Dashboard real-time integration.
-- ======================================================================================

-- 1. Create cohorts table
CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    duration_weeks INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create cohort_students table (Mapping students to cohorts)
CREATE TABLE IF NOT EXISTS public.cohort_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cohort_id, student_id)
);

-- 3. Create mentor_sessions table
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_mins INTEGER DEFAULT 60,
    status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Live', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create session_attendance table
CREATE TABLE IF NOT EXISTS public.session_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    present BOOLEAN DEFAULT FALSE,
    UNIQUE(session_id, student_id)
);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;

-- Allow completely public access for this hackathon/MVP to avoid RLS blockages
CREATE POLICY "Enable read access for all users" ON public.cohorts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cohorts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cohorts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cohorts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.cohort_students FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cohort_students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cohort_students FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cohort_students FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.mentor_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.mentor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.mentor_sessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.mentor_sessions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.session_attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.session_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.session_attendance FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.session_attendance FOR DELETE USING (true);
