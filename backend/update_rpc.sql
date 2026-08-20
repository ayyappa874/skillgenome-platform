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
    COALESCE(p.skills, ARRAY[]::VARCHAR[]),
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
      COALESCE(p.skills, ARRAY[]::VARCHAR[]) as cand_skills,
      p.target_role,
      p.location
    FROM profiles p
    WHERE p.id != current_user_id
      AND p.id NOT IN (
        SELECT DISTINCT connected_user_id FROM connections WHERE user_id = current_user_id 
        UNION
        SELECT DISTINCT user_id FROM connections WHERE connected_user_id = current_user_id
        UNION
        SELECT DISTINCT mentor_id FROM mentorship_requests WHERE student_id = current_user_id
        UNION
        SELECT DISTINCT student_id FROM mentorship_requests WHERE mentor_id = current_user_id
      )
  ),
  skill_scoring AS (
    SELECT 
      cp.*,
      CASE 
        WHEN array_length(array_intersect(user_skills, cp.cand_skills), 1) IS NULL THEN 0
        ELSE LEAST(100, (array_length(array_intersect(user_skills, cp.cand_skills), 1)::NUMERIC / 
                 NULLIF(array_length(array_cat(user_skills, cp.cand_skills), 1), 0)::NUMERIC * 100))
      END as skill_overlap_score,
      array_length(array_intersect(user_skills, cp.cand_skills), 1) as shared_skills_count,
      array_intersect(user_skills, cp.cand_skills) as matched_skills_array
    FROM candidate_pool cp
  ),
  genome_scoring AS (
    SELECT 
      ss.*,
      CASE 
        WHEN ABS(user_genome_score - ss.total_score) <= 5 THEN 100
        WHEN ABS(user_genome_score - ss.total_score) <= 15 THEN 75
        WHEN ABS(user_genome_score - ss.total_score) <= 30 THEN 50
        ELSE 25
      END as genome_proximity_score
    FROM skill_scoring ss
  ),
  role_scoring AS (
    SELECT 
      gs.*,
      CASE 
        WHEN gs.role = user_target_role AND user_target_role IS NOT NULL THEN 100
        ELSE 0
      END as role_alignment_score
    FROM genome_scoring gs
  ),
  mutual_conn_scoring AS (
    SELECT 
      rs.*,
      COALESCE((
        SELECT COUNT(*) FROM connections c1
        WHERE c1.user_id = current_user_id
          AND c1.connected_user_id IN (
            SELECT connected_user_id FROM connections WHERE user_id = rs.id
            UNION
            SELECT user_id FROM connections WHERE connected_user_id = rs.id
          )
      ), 0) as mutual_connections_count,
      CASE WHEN COALESCE((
        SELECT COUNT(*) FROM connections c1
        WHERE c1.user_id = current_user_id
          AND c1.connected_user_id IN (
            SELECT connected_user_id FROM connections WHERE user_id = rs.id
            UNION
            SELECT user_id FROM connections WHERE connected_user_id = rs.id
          )
      ), 0) > 0 THEN 100 ELSE 0 END as mutual_connections_score
    FROM role_scoring rs
  ),
  location_scoring AS (
    SELECT 
      mcs.*,
      CASE 
        WHEN user_location = mcs.location AND user_location IS NOT NULL THEN 100
        ELSE 0
      END as location_match_score
    FROM mutual_conn_scoring mcs
  ),
  final_scoring AS (
    SELECT 
      ls.*,
      (
        (ls.skill_overlap_score * 0.40) +
        (ls.genome_proximity_score * 0.30) +
        (ls.role_alignment_score * 0.15) +
        (ls.mutual_connections_score * 0.10) +
        (ls.location_match_score * 0.05)
      )::NUMERIC as composite_match_score
    FROM location_scoring ls
  )
  SELECT 
    fs.id,
    fs.name,
    fs.role as current_role,
    fs.total_score as genome_score,
    fs.composite_match_score,
    fs.matched_skills_array,
    (array_length(array_cat(user_skills, fs.cand_skills), 1))::INTEGER,
    fs.shared_skills_count::INTEGER,
    fs.mutual_connections_count::INTEGER,
    CASE 
      WHEN fs.shared_skills_count >= 3 THEN 
        fs.shared_skills_count || ' shared skills · Genome ' || fs.total_score
      WHEN fs.role = user_target_role THEN 
        'Already where you want to be — ' || fs.shared_skills_count || ' shared skills'
      WHEN fs.mutual_connections_count > 0 THEN
        fs.mutual_connections_count || ' mutual connections · ' || fs.shared_skills_count || ' shared skills'
      ELSE 
        COALESCE(fs.shared_skills_count, 0) || ' shared skills · Similar level'
    END as match_reason,
    CASE 
      WHEN ABS(user_genome_score - fs.total_score) <= 5 THEN 'Peer — similar level'
      WHEN ABS(user_genome_score - fs.total_score) <= 10 THEN 'Close level — great peer learning'
      ELSE 'Different level'
    END as genome_proximity_text,
    fs.avatar_url,
    'Connect'::VARCHAR as status
  FROM final_scoring fs
  -- Removed the >= 75 filter to show more suggestions, just order by score
  ORDER BY fs.composite_match_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
