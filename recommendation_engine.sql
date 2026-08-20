-- recommendation_engine.sql
-- Function to calculate user recommendations based on Skill Genome algorithm

CREATE OR REPLACE FUNCTION get_user_recommendations(current_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  role TEXT,
  match_score INTEGER,
  skill_overlap_score INTEGER,
  genome_score_proximity INTEGER,
  role_alignment_score INTEGER,
  mutual_connections INTEGER,
  location_match INTEGER,
  match_reason TEXT,
  matched_skills TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH current_user_data AS (
    SELECT 
      u.id, 
      u.role, 
      u.genome_score, 
      u.location,
      (SELECT array_agg(skill) FROM unnest(u.skills) as skill) as skills
    FROM profiles u
    WHERE u.id = current_user_id
  ),
  -- Exclude blocked users, connected users, and self
  excluded_users AS (
    SELECT current_user_id AS exclude_id
    UNION
    SELECT mentor_id FROM mentorship_requests WHERE student_id = current_user_id
    UNION
    SELECT student_id FROM mentorship_requests WHERE mentor_id = current_user_id
  ),
  candidates AS (
    SELECT 
      p.id,
      p.name,
      p.role,
      p.genome_score,
      p.location,
      p.skills as candidate_skills
    FROM profiles p
    WHERE p.id NOT IN (SELECT exclude_id FROM excluded_users)
  ),
  scored_candidates AS (
    SELECT 
      c.id,
      c.name,
      c.role,
      -- 1. Skill Overlap Score (Max 40 points)
      -- Calculate percentage of candidate skills that match user skills
      (
        SELECT COALESCE(
          (COUNT(DISTINCT s1) * 100.0 / NULLIF(array_length(cu.skills, 1), 0)) * 0.40,
          0
        )
        FROM unnest(c.candidate_skills) s1
        JOIN unnest(cu.skills) s2 ON s1 = s2
      )::INTEGER as calc_skill_overlap,
      
      -- 2. Genome Score Proximity (Max 30 points)
      -- Calculate difference in genome scores (closer = better)
      (
        GREATEST(0, 30 - ABS(COALESCE(c.genome_score, 50) - COALESCE(cu.genome_score, 50)) * 0.6)
      )::INTEGER as calc_genome_prox,
      
      -- 3. Role Alignment Score (Max 15 points)
      (
        CASE 
          WHEN c.role = cu.role THEN 15 
          WHEN c.role = 'mentor' AND cu.role = 'student' THEN 15
          WHEN c.role = 'student' AND cu.role = 'mentor' THEN 15
          ELSE 5 
        END
      )::INTEGER as calc_role_align,
      
      -- 4. Mutual Connections (Max 10 points)
      (
        SELECT LEAST(10, COUNT(*) * 2) 
        FROM mentorship_requests mr1
        JOIN mentorship_requests mr2 ON (mr1.mentor_id = mr2.mentor_id OR mr1.student_id = mr2.student_id)
        WHERE (mr1.student_id = current_user_id OR mr1.mentor_id = current_user_id)
        AND (mr2.student_id = c.id OR mr2.mentor_id = c.id)
        AND mr1.status = 'accepted' AND mr2.status = 'accepted'
      )::INTEGER as calc_mutual,
      
      -- 5. Location Match (Max 5 points)
      (
        CASE 
          WHEN c.location = cu.location AND c.location IS NOT NULL THEN 5 
          ELSE 0 
        END
      )::INTEGER as calc_location,
      
      -- Matched skills list
      ARRAY(
        SELECT s1 
        FROM unnest(c.candidate_skills) s1
        JOIN unnest(cu.skills) s2 ON s1 = s2
      ) as shared_skills
    FROM candidates c
    CROSS JOIN current_user_data cu
  )
  SELECT 
    sc.id,
    sc.name,
    sc.role,
    (sc.calc_skill_overlap + sc.calc_genome_prox + sc.calc_role_align + sc.calc_mutual + sc.calc_location) as match_score,
    sc.calc_skill_overlap,
    sc.calc_genome_prox,
    sc.calc_role_align,
    sc.calc_mutual,
    sc.calc_location,
    CASE 
      WHEN (sc.calc_skill_overlap + sc.calc_genome_prox + sc.calc_role_align + sc.calc_mutual + sc.calc_location) >= 90 THEN 'Exceptional match! You share multiple core skills and have similar Genome Scores.'
      WHEN (sc.calc_skill_overlap + sc.calc_genome_prox + sc.calc_role_align + sc.calc_mutual + sc.calc_location) >= 80 THEN 'Great potential connection based on your skill overlap and role.'
      ELSE 'Good candidate to expand your network in similar areas.'
    END as match_reason,
    sc.shared_skills as matched_skills
  FROM scored_candidates sc
  WHERE (sc.calc_skill_overlap + sc.calc_genome_prox + sc.calc_role_align + sc.calc_mutual + sc.calc_location) >= 75
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$;
