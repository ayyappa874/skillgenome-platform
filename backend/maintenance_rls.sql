-- maintenance_rls.sql

-- 1. Ensure RLS is enabled
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 2. Allow absolutely anyone (even logged out users) to read the maintenance status
DROP POLICY IF EXISTS "Public can read platform settings" ON public.platform_settings;
CREATE POLICY "Public can read platform settings" 
ON public.platform_settings 
FOR SELECT 
USING (true);

-- 3. Allow Admins to insert (required for 'upsert' to work)
DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings" 
ON public.platform_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- 4. Allow Admins to update (required for toggling)
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" 
ON public.platform_settings 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

-- 5. Guarantee the row exists
INSERT INTO public.platform_settings (id, maintenance_mode) 
VALUES (1, false) 
ON CONFLICT (id) DO UPDATE SET id = 1;
