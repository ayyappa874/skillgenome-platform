-- admin_fixes.sql
-- These updates fix the Admin Portal data connection issues

-- 1. Add shadowbanned column to profiles for moderation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shadowbanned BOOLEAN DEFAULT false;

-- 2. Create the approved_skills table for Intelligence AI dictionary injection
CREATE TABLE IF NOT EXISTS public.approved_skills (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Allow admins to insert into approved_skills (if RLS is enabled, uncomment these)
-- ALTER TABLE public.approved_skills ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON public.approved_skills FOR SELECT USING (true);
-- CREATE POLICY "Allow admin insert" ON public.approved_skills FOR ALL USING (
--   EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
-- );

-- 3. Add is_active column to cohorts to support disband/un-disband functionality
ALTER TABLE public.cohorts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
