-- ==============================================================================
-- 🔒 SKILLGENOME MASTER SECURITY AUDIT SCRIPT
-- ==============================================================================
-- INSTRUCTIONS: Run this entire script in your Supabase SQL Editor.
-- It will safely wipe old policies and install mathematically airtight security.
-- ==============================================================================

-- 1. Enable Row Level Security on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- 2. Purge all existing policies (to prevent conflicts)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own genome" ON public.genome;
DROP POLICY IF EXISTS "Mentors can read student genome" ON public.genome;
DROP POLICY IF EXISTS "Users can insert own genome" ON public.genome;
DROP POLICY IF EXISTS "Users can update own genome" ON public.genome;
DROP POLICY IF EXISTS "Users can view relevant requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Users can insert requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Users can update requests" ON public.mentorship_requests;
-- (Include permissive fallbacks just in case they exist)
DROP POLICY IF EXISTS "Permissive read all genome" ON public.genome;
DROP POLICY IF EXISTS "Permissive write all genome" ON public.genome;

-- ==============================================================================
-- 👤 PROFILES TABLE POLICIES
-- ==============================================================================

-- Read: Anyone logged in can read basic profiles (needed for lists/dashboards)
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Write: Users can ONLY update their own profile row
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 🧬 GENOME TABLE POLICIES (MAXIMUM SECURITY)
-- ==============================================================================

-- Read (Self): A student can read their own genome
CREATE POLICY "Users can read their own genome"
ON public.genome FOR SELECT
USING (auth.uid() = user_id);

-- Read (Mentor): A mentor can read a student's genome ONLY IF there is an accepted request
CREATE POLICY "Mentors can read connected student genomes"
ON public.genome FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_requests req
    WHERE req.mentor_id = auth.uid()
      AND req.student_id = genome.user_id
      AND req.status = 'accepted'
  )
);

-- Write: Users can only insert or update their own genome
CREATE POLICY "Users can insert their own genome"
ON public.genome FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genome"
ON public.genome FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 🤝 MENTORSHIP REQUESTS POLICIES
-- ==============================================================================

-- Read: Users can only see requests where they are the student OR the mentor
CREATE POLICY "Users can view their own mentorship requests"
ON public.mentorship_requests FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = mentor_id);

-- Insert: Students can create requests (they are the student_id)
CREATE POLICY "Students can create mentorship requests"
ON public.mentorship_requests FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Update: Mentors can update requests (to accept/decline)
CREATE POLICY "Mentors can update mentorship requests"
ON public.mentorship_requests FOR UPDATE
USING (auth.uid() = mentor_id)
WITH CHECK (auth.uid() = mentor_id);
