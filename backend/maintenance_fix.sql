-- maintenance_fix.sql
-- This creates the missing settings table so the Maintenance toggle actually works.

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id INT PRIMARY KEY,
    maintenance_mode BOOLEAN DEFAULT false
);

-- Insert the default configuration row (id = 1)
INSERT INTO public.platform_settings (id, maintenance_mode) 
VALUES (1, false) 
ON CONFLICT (id) DO NOTHING;

-- Grant Admins the right to update settings
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" 
ON public.platform_settings 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);
