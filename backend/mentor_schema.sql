-- Adds mentor-specific columns to the existing profiles table without deleting existing data
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS current_role text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS rating numeric(3, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_mentees integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_cohorts integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_status boolean DEFAULT false;

-- Create the cohorts table
CREATE TABLE IF NOT EXISTS public.cohorts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    domain text NOT NULL,
    duration_weeks integer NOT NULL DEFAULT 4,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    session_frequency text DEFAULT 'Weekly',
    max_students integer DEFAULT 30,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now()
);

-- Create the cohort students junction table
CREATE TABLE IF NOT EXISTS public.cohort_students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'active',
    joined_at timestamp with time zone DEFAULT now(),
    UNIQUE(cohort_id, student_id)
);

-- Create the mentorship requests table for incoming student requests or mentor invites
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text,
    status text DEFAULT 'pending', -- pending, accepted, declined
    created_at timestamp with time zone DEFAULT now()
);

-- Create the mentor sessions table
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE,
    mentor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    topic text,
    session_type text DEFAULT 'lecture',
    scheduled_for timestamp with time zone,
    duration_mins integer DEFAULT 60,
    status text DEFAULT 'upcoming', -- upcoming, live, completed
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Assuming existing policies might cover profiles, but we need basic ones for new tables)
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

-- Disable RLS strictly for ease of development for now (can be tightened later)
CREATE POLICY "Allow all operations for cohorts" ON public.cohorts FOR ALL USING (true);
CREATE POLICY "Allow all operations for cohort_students" ON public.cohort_students FOR ALL USING (true);
CREATE POLICY "Allow all operations for mentorship_requests" ON public.mentorship_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations for mentor_sessions" ON public.mentor_sessions FOR ALL USING (true);
