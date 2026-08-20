ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shadowbanned BOOLEAN DEFAULT false;
