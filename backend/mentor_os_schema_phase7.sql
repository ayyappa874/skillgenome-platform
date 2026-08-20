-- ======================================================================================
-- MENTOR OS - PHASE 7 SUPABASE MIGRATION (MENTORSHIP REQUESTS)
-- Run this script in your Supabase SQL Editor.
-- ======================================================================================

-- 1. Create mentorship_requests table
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, student_id)
);

-- Enable RLS
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Allow public access for this MVP
CREATE POLICY "Enable read access for all users" ON public.mentorship_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.mentorship_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.mentorship_requests FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.mentorship_requests FOR DELETE USING (true);
