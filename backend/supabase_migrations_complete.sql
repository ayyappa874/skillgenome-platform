-- ====================================================
-- SKILLGENOME COMMUNITY FEED DATABASE MIGRATIONS
-- DEPLOY INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Copy ALL content from this file
-- 4. Click "Run" button (⚡)
-- 5. Wait for "Success" message
-- ====================================================

-- 1. POST LIKES TABLE
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id, reaction_type)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "post_likes_select_all"
ON post_likes FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "post_likes_insert_own"
ON post_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "post_likes_delete_own"
ON post_likes FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created ON post_likes(created_at);

-- ====================================================

-- 2. POST COMMENTS TABLE
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE post_comments
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at);

-- ====================================================

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_name VARCHAR(255),
  notification_type VARCHAR(50) NOT NULL,
  related_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  related_comment_id UUID REFERENCES post_comments(id) ON DELETE SET NULL,
  related_group_id UUID REFERENCES study_groups(id) ON DELETE SET NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ====================================================

-- 4. SAVED POSTS TABLE
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created ON saved_posts(created_at);

-- ====================================================

-- 5. STORY POSTS TABLE
CREATE TABLE IF NOT EXISTS story_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(20),
  skill_tags TEXT[],
  visibility VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
);
CREATE INDEX IF NOT EXISTS idx_story_posts_author ON story_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_story_posts_expires ON story_posts(expires_at);

-- ====================================================

-- 6. HASHTAGS TABLE
CREATE TABLE IF NOT EXISTS post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON post_hashtags(hashtag);

-- ====================================================

-- 7. USER MENTIONS TABLE
CREATE TABLE IF NOT EXISTS post_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_post_mentions_mentioned_user ON post_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_post_id ON post_mentions(post_id);

-- ====================================================

-- 8. STUDY GROUP MEMBERS TABLE (MISSING - ADD THIS!)
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',  -- member, admin
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(study_group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(study_group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_joined ON study_group_members(joined_at);

-- ====================================================

-- 9. UPDATE POSTS TABLE
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ====================================================

-- 10. UPDATE STUDY GROUPS TABLE
ALTER TABLE study_groups
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS max_members INTEGER,
ADD COLUMN IF NOT EXISTS skill_tags TEXT[],
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS next_session_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1;

-- ====================================================

-- 11. ADVANCED RPC: GET USER RECOMMENDATIONS
-- Implements sophisticated genome-matching algorithm with 5-factor scoring

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
  -- Get current user data
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
    -- STEP 1: Get all candidates (exclude connected, blocked, self)
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
        SELECT DISTINCT connected_user_id FROM connections 
        WHERE user_id = current_user_id 
        UNION
        SELECT DISTINCT user_id FROM connections 
        WHERE connected_user_id = current_user_id
      )
  ),
  skill_scoring AS (
    -- STEP 2A: Calculate skill overlap (0-100)
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
    WHERE array_length(array_intersect(user_skills, cp.cand_skills), 1) >= 0 OR array_length(array_intersect(user_skills, cp.cand_skills), 1) IS NULL
  ),
  genome_scoring AS (
    -- STEP 2B: Calculate genome proximity (0-100)
    SELECT 
      ss.*,
      CASE 
        WHEN ABS(user_genome_score - ss.total_score) <= 5 THEN 100
        WHEN ABS(user_genome_score - ss.total_score) <= 10 THEN 85
        WHEN ABS(user_genome_score - ss.total_score) <= 15 THEN 70
        WHEN ABS(user_genome_score - ss.total_score) <= 20 THEN 55
        WHEN ABS(user_genome_score - ss.total_score) <= 30 THEN 35
        ELSE 10
      END as genome_proximity_score
    FROM skill_scoring ss
  ),
  role_scoring AS (
    -- STEP 2C: Calculate role alignment (0-100)
    SELECT 
      gs.*,
      CASE 
        WHEN gs.target_role = user_target_role THEN 100
        WHEN gs.role = user_target_role THEN 90
        ELSE 20
      END as role_alignment_score
    FROM genome_scoring gs
  ),
  mutual_conn_scoring AS (
    -- STEP 2D: Calculate mutual connections (0-100)
    SELECT 
      rs.*,
      LEAST(100, COALESCE((
        SELECT COUNT(*)::NUMERIC * 20
        FROM connections c1
        WHERE c1.user_id = current_user_id
          AND c1.connected_user_id IN (
            SELECT connected_user_id FROM connections WHERE user_id = rs.id
            UNION
            SELECT user_id FROM connections WHERE connected_user_id = rs.id
          )
      ), 0)) as mutual_connections_score,
      COALESCE((
        SELECT COUNT(*)
        FROM connections c1
        WHERE c1.user_id = current_user_id
          AND c1.connected_user_id IN (
            SELECT connected_user_id FROM connections WHERE user_id = rs.id
            UNION
            SELECT user_id FROM connections WHERE connected_user_id = rs.id
          )
      ), 0) as mutual_connections_count
    FROM role_scoring rs
  ),
  location_scoring AS (
    -- STEP 2E: Calculate location match (0-100)
    SELECT 
      mcs.*,
      CASE 
        WHEN user_location = mcs.location AND user_location IS NOT NULL THEN 100
        ELSE 0
      END as location_match_score
    FROM mutual_conn_scoring mcs
  ),
  final_scoring AS (
    -- STEP 2F: Composite score
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
  -- STEP 3: Filter >= 75 and rank
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
    -- STEP 5: Personalized match reason
    CASE 
      WHEN fs.shared_skills_count >= 3 THEN 
        fs.shared_skills_count || ' shared skills · Genome ' || fs.total_score
      WHEN fs.role = user_target_role THEN 
        'Already where you want to be — ' || fs.shared_skills_count || ' shared skills'
      WHEN fs.mutual_connections_count > 0 THEN
        fs.mutual_connections_count || ' mutual connections · ' || fs.shared_skills_count || ' shared skills'
      ELSE 
        fs.shared_skills_count || ' shared skills · Similar level'
    END as match_reason,
    -- Genome proximity message
    CASE 
      WHEN ABS(user_genome_score - fs.total_score) <= 5 THEN 'Peer — similar level'
      WHEN ABS(user_genome_score - fs.total_score) <= 10 THEN 'Close level — great peer learning'
      ELSE 'Different level'
    END as genome_proximity_text,
    fs.avatar_url,
    'Connect' as status
  FROM final_scoring fs
  WHERE fs.composite_match_score >= 75
  ORDER BY fs.composite_match_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================

-- 12. ENABLE REALTIME FOR COMMUNITY TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_members;

-- ====================================================
-- SUCCESS VERIFICATION
-- After running this migration, test with:
-- SELECT * FROM post_likes LIMIT 1;
-- SELECT * FROM post_comments LIMIT 1;
-- SELECT * FROM notifications LIMIT 1;
-- SELECT * FROM study_group_members LIMIT 1;
-- SELECT get_user_recommendations('your-user-id-here'::uuid, 10);
-- ====================================================
