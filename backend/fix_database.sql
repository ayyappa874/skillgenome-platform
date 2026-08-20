-- 1. Reset mentorship_requests table to clear out the buggy 'accepted' rows from previous tests.
-- This will ensure your test accounts start fresh with no existing connections.
DELETE FROM mentorship_requests;

-- 2. Clear out the connections table just in case any rows made it in previously.
-- The app no longer relies on this table for connection status, but it's good to keep it clean.
DELETE FROM connections;

-- 3. Update the get_user_recommendations RPC to ensure it excludes people
-- you already have a pending or accepted connection with in the mentorship_requests table.
-- Without this, they will keep showing up in "Suggested Connections".
DROP FUNCTION IF EXISTS get_user_recommendations(uuid, integer);

CREATE OR REPLACE FUNCTION get_user_recommendations(current_user_id UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  "current_role" VARCHAR,
  genome_score INTEGER,
  match_score NUMERIC,
  matched_skills TEXT[],
  total_skills INTEGER,
  shared_skill_count INTEGER,
  mutual_connections INTEGER,
  match_reason TEXT,
  genome_proximity TEXT,
  avatar_url TEXT,
  status VARCHAR
) AS $$
DECLARE
  user_genome_score INTEGER;
  user_target_role VARCHAR;
  user_skills TEXT[];
  user_location VARCHAR;
BEGIN
  SELECT 
    50,
    p.target_role,
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(p.skills, '[]'::jsonb))),
    p.location
  INTO user_genome_score, user_target_role, user_skills, user_location
  FROM profiles p
  WHERE p.id = current_user_id;

  RETURN QUERY
  WITH candidate_pool AS (
    SELECT 
      p.id,
      p.name,
      p.role,
      50 as total_score,
      p.avatar_url,
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p.skills, '[]'::jsonb))) as cand_skills,
      p.target_role,
      p.location
    FROM 
      profiles p
    WHERE 
      p.id != current_user_id
      -- EXCLUDE ANYONE WE ALREADY HAVE A ROW WITH IN MENTORSHIP_REQUESTS
      AND p.id NOT IN (
        SELECT student_id FROM mentorship_requests WHERE mentor_id = current_user_id
        UNION
        SELECT mentor_id FROM mentorship_requests WHERE student_id = current_user_id
      )
  )
  SELECT 
    cp.id,
    cp.name::VARCHAR,
    cp.role::VARCHAR as current_role,
    cp.total_score as genome_score,
    (
      (
        CASE WHEN array_length(user_skills, 1) > 0 THEN 
          (SELECT COUNT(*) FROM unnest(cp.cand_skills) s WHERE s = ANY(user_skills))::NUMERIC / array_length(user_skills, 1)::NUMERIC 
        ELSE 0 END * 40
      ) +
      (CASE WHEN ABS(cp.total_score - user_genome_score) <= 5 THEN 100 
            WHEN ABS(cp.total_score - user_genome_score) <= 10 THEN 85
            WHEN ABS(cp.total_score - user_genome_score) <= 15 THEN 70
            ELSE 50 END * 0.30) +
      (CASE WHEN LOWER(cp.role) = LOWER(user_target_role) THEN 100 ELSE 20 END * 0.15) +
      10 + 
      (CASE WHEN LOWER(cp.location) = LOWER(user_location) THEN 30 ELSE 0 END * 0.05)
    ) as match_score,
    ARRAY(SELECT * FROM unnest(cp.cand_skills) INTERSECT SELECT * FROM unnest(user_skills)) as matched_skills,
    COALESCE(array_length(cp.cand_skills, 1), 0) as total_skills,
    (SELECT COUNT(*) FROM unnest(cp.cand_skills) s WHERE s = ANY(user_skills))::INTEGER as shared_skill_count,
    0 as mutual_connections,
    'Great match based on skills and goals!'::TEXT as match_reason,
    CASE 
      WHEN ABS(cp.total_score - user_genome_score) <= 10 THEN 'Peer learner'::TEXT
      WHEN cp.total_score > user_genome_score THEN 'Potential Mentor'::TEXT
      ELSE 'Potential Mentee'::TEXT
    END as genome_proximity,
    cp.avatar_url::TEXT,
    'Connect'::VARCHAR as status
  FROM candidate_pool cp
  ORDER BY match_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix RLS Policies for mentorship_requests to allow accepting and declining
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_requests_select" ON mentorship_requests;
CREATE POLICY "mentorship_requests_select" 
ON mentorship_requests FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() = mentor_id);

DROP POLICY IF EXISTS "mentorship_requests_insert" ON mentorship_requests;
CREATE POLICY "mentorship_requests_insert" 
ON mentorship_requests FOR INSERT 
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "mentorship_requests_update" ON mentorship_requests;
CREATE POLICY "mentorship_requests_update" 
ON mentorship_requests FOR UPDATE 
USING (auth.uid() = mentor_id)
WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "mentorship_requests_delete" ON mentorship_requests;
CREATE POLICY "mentorship_requests_delete" 
ON mentorship_requests FOR DELETE 
USING (auth.uid() = student_id OR auth.uid() = mentor_id);
