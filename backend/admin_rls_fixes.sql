-- admin_rls_fixes.sql
-- These policies grant the Omniscient Admin the right to delete ANY post, comment, like, or cohort, bypassing the normal restrictions that only allow authors to delete their own content.

-- 1. Posts Table
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "Admins can delete any post" 
ON public.posts 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- 2. Likes Table
DROP POLICY IF EXISTS "Admins can delete any like" ON public.post_likes;
CREATE POLICY "Admins can delete any like" 
ON public.post_likes 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- 3. Comments Table
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;
CREATE POLICY "Admins can delete any comment" 
ON public.comments 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- 4. Cohorts Table (for updating is_active)
DROP POLICY IF EXISTS "Admins can update any cohort" ON public.cohorts;
CREATE POLICY "Admins can update any cohort" 
ON public.cohorts 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- 5. Profiles Table (for updating shadowbans and bans)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);
