-- ====================================================
-- SKILLGENOME COMMUNITY FEED DATABASE MIGRATIONS
-- Run these queries in Supabase SQL Editor
-- ====================================================

-- 1. POST LIKES TABLE
-- Tracks user reactions/likes on posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like',  -- like, love, insightful, celebrate, support
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

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created ON post_likes(created_at);

-- ====================================================

-- 2. POST COMMENTS TABLE
-- Tracks comments and threaded replies on posts
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

-- Indices
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at);

-- ====================================================

-- 3. NOTIFICATIONS TABLE
-- Tracks all community notifications (likes, comments, follows, etc)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,  -- like, comment, mention, connection_request, group_invite, post_shared
  related_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  related_comment_id UUID REFERENCES post_comments(id) ON DELETE SET NULL,
  related_group_id UUID REFERENCES study_groups(id) ON DELETE SET NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ====================================================

-- 4. SAVED POSTS TABLE
-- Tracks bookmarked/saved posts by users
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created ON saved_posts(created_at);

-- ====================================================

-- 5. STORY POSTS TABLE
-- Tracks ephemeral 24-hour stories
CREATE TABLE IF NOT EXISTS story_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(20),  -- image, video, text
  skill_tags TEXT[],
  visibility VARCHAR(20) DEFAULT 'public',  -- public, connected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
);

-- Index
CREATE INDEX IF NOT EXISTS idx_story_posts_author ON story_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_story_posts_expires ON story_posts(expires_at);

-- Auto-delete expired stories (run this as a scheduled job)
-- DELETE FROM story_posts WHERE expires_at < CURRENT_TIMESTAMP;

-- ====================================================

-- 6. HASHTAGS/MENTIONS TABLE
-- Track hashtags for discoverability
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
-- Track @mentions for notifications
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

-- 8. UPDATE POSTS TABLE
-- Add missing columns for engagement metrics
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ====================================================

-- 9. UPDATE STUDY GROUPS TABLE
-- Add missing columns for group info
ALTER TABLE study_groups
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS max_members INTEGER,
ADD COLUMN IF NOT EXISTS skill_tags TEXT[],
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS next_session_at TIMESTAMP WITH TIME ZONE;

-- ====================================================

-- 10. RPC FUNCTION - Get User Recommendations
-- Calculate genome-matched friend recommendations
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
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_skills AS (
    SELECT COALESCE(resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(profile_skills, ARRAY[]::VARCHAR[]) as all_skills
    FROM profiles WHERE id = current_user_id
  ),
  candidates AS (
    SELECT 
      p.id,
      p.name,
      p.role,
      p.genome_score,
      p.avatar_url,
      p.resume_skills,
      p.profile_skills,
      p.target_role,
      p.location
    FROM profiles p
    WHERE p.id != current_user_id
      AND p.id NOT IN (SELECT connected_user_id FROM connections WHERE user_id = current_user_id)
      AND p.id NOT IN (SELECT blocked_user_id FROM blocked_users WHERE user_id = current_user_id)
  )
  SELECT 
    c.id,
    c.name,
    c.role as role,
    c.genome_score,
    (
      (array_length(array_intersect(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])), 1)::NUMERIC / 
       NULLIF(array_length(array_union(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])), 1), 0)::NUMERIC) * 100) * 0.40 +
      CASE 
        WHEN ABS((SELECT genome_score FROM profiles WHERE id = current_user_id) - c.genome_score) <= 5 THEN 100
        WHEN ABS((SELECT genome_score FROM profiles WHERE id = current_user_id) - c.genome_score) <= 10 THEN 85
        WHEN ABS((SELECT genome_score FROM profiles WHERE id = current_user_id) - c.genome_score) <= 15 THEN 70
        ELSE 10
      END * 0.30 +
      CASE 
        WHEN c.target_role = (SELECT target_role FROM profiles WHERE id = current_user_id) THEN 100 * 0.15
        ELSE 20 * 0.15
      END
    )::NUMERIC as match_score,
    array_intersect(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])) as matched_skills,
    array_length(array_union(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])), 1) as total_skills,
    array_length(array_intersect(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])), 1) as shared_skill_count,
    (SELECT COUNT(*) FROM connections WHERE user_id = current_user_id AND connected_user_id IN (SELECT connected_user_id FROM connections WHERE user_id = c.id))::INTEGER as mutual_connections,
    array_length(array_intersect(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])), 1) || ' shared skills · Genome ' || c.genome_score as match_reason,
    'Peer learner at your level' as genome_proximity,
    c.avatar_url
  FROM candidates c, user_skills us
  WHERE array_length(array_intersect(us.all_skills, COALESCE(c.resume_skills, ARRAY[]::VARCHAR[]) || COALESCE(c.profile_skills, ARRAY[]::VARCHAR[])), 1) >= 2
  ORDER BY match_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================

-- 11. ENABLE REALTIME FOR COMMUNITY TABLES
-- Run these to enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ====================================================
-- END OF MIGRATIONS
-- ====================================================
