-- ==============================================================================
-- ⚠️ SKILLGENOME ROLLBACK SCRIPT (THE "UNDO" BUTTON)
-- ==============================================================================
-- INSTRUCTIONS: Run this if the master_security_audit.sql causes ANY issues.
-- It will instantly restore your database to a wide-open permissive state.
-- ==============================================================================

-- 1. Purge all strict policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own genome" ON public.genome;
DROP POLICY IF EXISTS "Mentors can read connected student genomes" ON public.genome;
DROP POLICY IF EXISTS "Users can insert their own genome" ON public.genome;
DROP POLICY IF EXISTS "Users can update their own genome" ON public.genome;
DROP POLICY IF EXISTS "Users can view their own mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Students can create mentorship requests" ON public.mentorship_requests;
DROP POLICY IF EXISTS "Mentors can update mentorship requests" ON public.mentorship_requests;

-- 2. Create wide-open permissive policies for the UI to function without blocks
CREATE POLICY "Permissive read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permissive write all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permissive read all genome" ON public.genome FOR SELECT USING (true);
CREATE POLICY "Permissive write all genome" ON public.genome FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permissive read all requests" ON public.mentorship_requests FOR SELECT USING (true);
CREATE POLICY "Permissive write all requests" ON public.mentorship_requests FOR ALL USING (true) WITH CHECK (true);

-- Done. Your database is now completely open again, restoring full data flow.
