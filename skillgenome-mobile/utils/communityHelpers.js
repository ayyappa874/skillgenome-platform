import { supabase } from './supabase';

/**
 * Community Feed Helpers and Real-Time Subscriptions
 */

// ====================================================
// REAL-TIME SUBSCRIPTIONS
// ====================================================

export const subscribeToPostUpdates = (onUpdate) => {
  return supabase
    .channel('public:posts')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        if (onUpdate) onUpdate(payload);
      }
    )
    .subscribe();
};

export const subscribeToPostLikes = (postId, onUpdate) => {
  return supabase
    .channel(`post:${postId}:likes`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'post_likes', filter: `post_id=eq.${postId}` },
      (payload) => {
        if (onUpdate) onUpdate(payload);
      }
    )
    .subscribe();
};

export const subscribeToPostComments = (postId, onUpdate) => {
  return supabase
    .channel(`post:${postId}:comments`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
      (payload) => {
        if (onUpdate) onUpdate(payload);
      }
    )
    .subscribe();
};

export const subscribeToNotifications = (userId, onUpdate) => {
  return supabase
    .channel(`user:${userId}:notifications`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
      (payload) => {
        if (onUpdate) onUpdate(payload);
      }
    )
    .subscribe();
};

// ====================================================
// LIKE/REACTION HELPERS
// ====================================================

export const likePost = async (postId, userId, reactionType = 'like') => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .upsert({ post_id: postId, user_id: userId, reaction_type: reactionType })
      .select();

    if (error) throw error;

    // Update post likes_count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    const currentCount = post?.likes_count || 0;
    await supabase
      .from('posts')
      .update({ likes_count: currentCount + 1 })
      .eq('id', postId);

    return { success: true, data };
  } catch (e) {
    console.error('Error liking post:', e.message);
    return { success: false, error: e };
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    // Decrement post likes_count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    const currentCount = Math.max(0, (post?.likes_count || 1) - 1);
    await supabase
      .from('posts')
      .update({ likes_count: currentCount })
      .eq('id', postId);

    return { success: true };
  } catch (e) {
    console.error('Error unliking post:', e.message);
    return { success: false, error: e };
  }
};

export const hasUserLikedPost = async (postId, userId) => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (e) {
    console.error('Error checking if user liked post:', e.message);
    return false;
  }
};

// ====================================================
// COMMENT HELPERS
// ====================================================

export const addComment = async (postId, userId, content, parentCommentId = null) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: userId,
        content: content,
        parent_comment_id: parentCommentId
      })
      .select(`
        id,
        content,
        created_at,
        author_id,
        parent_comment_id,
        profiles (
          id,
          name,
          avatar_url
        )
      `);

    if (error) throw error;

    // Increment post comments_count
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    const currentCount = post?.comments_count || 0;
    await supabase
      .from('posts')
      .update({ comments_count: currentCount + 1 })
      .eq('id', postId);

    // Create notification for post author
    const { data: postData } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (postData && postData.author_id !== userId) {
      await supabase
        .from('notifications')
        .insert({
          recipient_id: postData.author_id,
          actor_id: userId,
          notification_type: 'comment',
          related_post_id: postId,
          related_comment_id: data?.[0]?.id,
          message: 'commented on your post'
        });
    }

    return { success: true, data: data?.[0] };
  } catch (e) {
    console.error('Error adding comment:', e.message);
    return { success: false, error: e };
  }
};

export const deleteComment = async (commentId, postId) => {
  try {
    const { error } = await supabase
      .from('post_comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error && error.code !== '42703') throw error;

    // If the column is absent in the DB, fall back to deleting the record instead.
    if (error && error.code === '42703') {
      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);
      if (deleteError) throw deleteError;
    }

    // Decrement post comments_count
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    const currentCount = Math.max(0, (post?.comments_count || 1) - 1);
    await supabase
      .from('posts')
      .update({ comments_count: currentCount })
      .eq('id', postId);

    return { success: true };
  } catch (e) {
    console.error('Error deleting comment:', e.message);
    return { success: false, error: e };
  }
};

export const fetchPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id,
        author_id,
        content,
        created_at,
        parent_comment_id,
        deleted_at,
        profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42703') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('post_comments')
          .select(`
            id,
            author_id,
            content,
            created_at,
            parent_comment_id,
            profiles (
              id,
              name,
              avatar_url
            )
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      throw error;
    }

    return (data || []).filter(comment => !comment.deleted_at);
  } catch (e) {
    console.error('Error fetching comments:', e.message);
    return [];
  }
};

// ====================================================
// RECOMMENDATION ENGINE
// ====================================================

export const getGenomeMatchScore = (user1Skills, user2Skills, user1GenomeScore, user2GenomeScore, user1Role, user2Role, user1Location, user2Location, mutualConnections = 0) => {
  // Skill overlap (40%)
  const user1AllSkills = (user1Skills || []).map(s => s.toLowerCase().trim());
  const user2AllSkills = (user2Skills || []).map(s => s.toLowerCase().trim());
  const shared = user1AllSkills.filter(s => user2AllSkills.includes(s));
  const union = Array.from(new Set([...user1AllSkills, ...user2AllSkills]));
  const skillOverlapScore = union.length > 0 ? Math.min(100, (shared.length / union.length) * 100) : 0;
  let skillBonus = 0;
  if (shared.length >= 3) skillBonus = 10; // Bonus if 3+ skills match

  // Genome proximity (30%)
  const diff = Math.abs(user1GenomeScore - user2GenomeScore);
  let genomeProximityScore = 10;
  if (diff <= 5) genomeProximityScore = 100;
  else if (diff <= 10) genomeProximityScore = 85;
  else if (diff <= 15) genomeProximityScore = 70;
  else if (diff <= 20) genomeProximityScore = 55;
  else if (diff <= 30) genomeProximityScore = 35;

  // Role alignment (15%)
  let roleAlignmentScore = 20;
  if (user1Role && user2Role) {
    if (user1Role.toLowerCase() === user2Role.toLowerCase()) roleAlignmentScore = 100;
    else if (user1Role.toLowerCase().includes(user2Role.toLowerCase()) || user2Role.toLowerCase().includes(user1Role.toLowerCase())) roleAlignmentScore = 60;
  }

  // Mutual connections (10%)
  const mutualScore = Math.min(100, (mutualConnections * 20));

  // Location match (5%)
  let locationScore = 0;
  if (user1Location && user2Location) {
    if (user1Location.toLowerCase() === user2Location.toLowerCase()) locationScore = 100; // Same city
    else locationScore = 30; // Different location
  }

  const totalScore =
    (skillOverlapScore * 0.40) +
    (genomeProximityScore * 0.30) +
    (roleAlignmentScore * 0.15) +
    (mutualScore * 0.10) +
    (locationScore * 0.05) +
    skillBonus;

  return Math.round(Math.min(100, totalScore));
};

// ====================================================
// NOTIFICATION HELPERS
// ====================================================

export const createNotification = async (recipientId, actorId, notificationType, relatedPostId = null, relatedCommentId = null, relatedGroupId = null, message = null) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId,
        notification_type: notificationType,
        related_post_id: relatedPostId,
        related_comment_id: relatedCommentId,
        related_group_id: relatedGroupId,
        message: message
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('Error creating notification:', e.message);
    return { success: false, error: e };
  }
};

export const fetchNotifications = async (userId, unreadOnly = false) => {
  try {
    let query = supabase
      .from('notifications')
      .select(`
        id,
        actor_id,
        actor_name,
        notification_type,
        message,
        is_read,
        created_at,
        related_post_id,
        related_group_id
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (e) {
    console.error('Error fetching notifications:', e.message);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error('Error marking notification as read:', e.message);
    return { success: false, error: e };
  }
};

// ====================================================
// SAVED POSTS HELPERS
// ====================================================

export const savePost = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .insert({ user_id: userId, post_id: postId })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('Error saving post:', e.message);
    return { success: false, error: e };
  }
};

export const unsavePost = async (userId, postId) => {
  try {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error('Error unsaving post:', e.message);
    return { success: false, error: e };
  }
};

export const fetchSavedPosts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        id,
        post_id,
        posts (
          *,
          profiles (
            id,
            name,
            avatar_url,
            title
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching saved posts:', e.message);
    return [];
  }
};
