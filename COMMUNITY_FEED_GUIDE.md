# SkillGenome Community Feed Implementation Guide

## Overview
This guide explains the complete implementation of the Community Feed module following the SkillGenome OS Specifications v1.0.

## Database Setup

### 1. Run Supabase Migrations
Execute all SQL queries in `/backend/supabase_migrations.sql` in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard
# Go to SQL Editor
# Create new query
# Paste contents of supabase_migrations.sql
# Run all queries
```

**Tables Created:**
- `post_likes` - User reactions on posts
- `post_comments` - Comments and threaded replies
- `notifications` - Community notifications
- `saved_posts` - Bookmarked posts
- `story_posts` - Ephemeral 24-hour stories
- `post_hashtags` - Hashtag tracking
- `post_mentions` - @Mention tracking

### 2. Enable Real-Time Subscriptions
The migrations automatically enable real-time for:
- post_likes
- post_comments
- notifications

## Implementation Status

### ✅ Fully Implemented Features

**Community Feed (Screen 23)**
- Post feed with 4 tabs: For You, Following, Groups, Trending
- Skill-based filtering
- Smart ranking algorithm (35% skill overlap, 15% recency, 20% engagement, 10% role, 20% group bonus)
- Left sidebar: Suggested connections & study groups
- Right sidebar: Genome rank, trending skills, daily tips
- Story carousel
- Genome match notifications

**Messaging (Screen 32)**
- Conversation list
- Real-time message sync
- Unread badges

**Chat (Screen 33)**
- Message bubbles
- Typing indicators
- Real-time polling (3s refresh)

**Connections (Screen 31)**
- 5 connection tabs with match scoring
- Mentorship workflow

**Study Groups (Screen 25)**
- Group chat
- Invite system
- Member management

**Post Interactions**
- Like/Unlike with DB persistence
- Comments with threading
- Comment deletion
- Engagement metrics (likes_count, comments_count)
- Notifications for likes/comments/mentions

### ⚠️ Partially Implemented (Need Completion)

**Stories**
- Carousel shown ✅
- Upload/view UI needed ❌
- 24-hour expiration ❌

**Post Search**
- Only message search exists
- Need post/hashtag search

**User Profiles**
- No public profile screen
- Clicking author should open profile

**Notifications**
- System implemented ✅
- UI screen needed ❌

### ❌ Not Yet Implemented (For Phase 2)

- Post editing/deletion (except admin)
- Saved posts UI
- Hashtag/mention autocomplete
- Social sharing preview
- Reaction details modal
- Media filters

## Usage Examples

### Adding Posts

```javascript
// From CommunityFeed.js, users can create posts via:
// 1. Text posts (thoughts, updates, questions)
// 2. Image posts (photos + captions)
// 3. Code snippets (syntax highlighted)
// 4. Resource shares (links with previews)
// 5. Achievement posts (genome badges, milestones)

// Handler: handleSaveCommunityPost() in App.js
// Route: Screen 28 → onSave → Screen 23
```

### Liking Posts

```javascript
// In CommunityFeed.js, users tap heart icon
// Calls: onLikePost(postId)
// 
// Handler: handleLikePost() in App.js
// - Persists to post_likes table
// - Updates likes_count in posts table
// - Creates notification for post author
// - Optimistic UI updates immediately
```

### Adding Comments

```javascript
// Click comment button on post
// Routes to Screen 29 (PostDetailScreen)
// 
// Handler: handleAddComment(postId, text, parentId?)
// - Supports threaded replies via parentId
// - Creates comment in post_comments table
// - Increments comments_count
// - Notifies post author
```

### Friend Recommendations

```javascript
// Algorithm scores candidates on:
// - Skill overlap (40%): shared skills ÷ union of skills
// - Genome proximity (30%): similar genome scores
// - Role alignment (15%): same/related career roles
// - Mutual connections (10%): shared friends
// - Location match (5%): same city/country

// Minimum threshold: 2 shared skills required
// Score formula: match_score >= 75 to display
// Show top 10 per feed load

// Triggered on:
// - Resume upload (skills change)
// - Genome score change (≥5 points)
// - New connection
// - Weekly refresh (7 days)
```

### Creating Study Groups

```javascript
// From CommunityFeed.js left panel
// Handler: onCreateStudyGroup() in App.js
//
// Workflow:
// 1. User enters group name + skill tags
// 2. App suggests connections to invite (sorted by skill match)
// 3. Group created with member count = 1
// 4. Auto-invite messages sent
// 5. Routes to StudyGroupScreen (Screen 36)
//
// Group visibility: Open (anyone) or Invite-only
// Max members: 5/10/20/50/Unlimited
```

## Real-Time Subscriptions

All community data uses real-time subscriptions for live updates:

```javascript
// From communityHelpers.js
subscribeToPostUpdates(payload => {
  // New posts, edits, deletions
});

subscribeToPostLikes(postId, payload => {
  // Live like count updates
});

subscribeToPostComments(postId, payload => {
  // New comments in real-time
});

subscribeToNotifications(userId, payload => {
  // Instant notification delivery
});
```

## Common Issues & Fixes

### Issue: Likes not persisting
**Solution:** Ensure `post_likes` table exists (run migrations)

### Issue: Comments not loading
**Solution:** Check `post_comments` table + verify user auth
**Debug:** Console.log in fetchPostComments()

### Issue: Notifications not showing
**Solution:** Create NotificationsScreen (missing UI)

### Issue: Recommendations not appearing
**Solution:** Run `get_user_recommendations()` RPC + verify skill data

### Issue: Real-time updates not working
**Solution:** Enable real-time in Supabase → Replication → post_likes, post_comments, notifications

## Files Modified/Created

**New Files:**
- `/utils/communityHelpers.js` - Reusable community utilities
- `/backend/supabase_migrations.sql` - Database schema

**Modified Files:**
- `/App.js` - Added handlers, imports, subscriptions
- `/screens/CommunityFeed.js` - Already fully implemented
- `/screens/Screen29.js` - Comment thread viewer (already implemented)

**Still Needed:**
- NotificationsScreen (new)
- UserProfileScreen (new)
- GroupsDiscoveryScreen (new)
- PostCreateScreen (dedicated flow, currently inline)
- SearchScreen enhancement (posts + hashtags)

## Testing Checklist

- [ ] Create a test post
- [ ] Like the post (check post_likes table)
- [ ] Add a comment (check post_comments table)
- [ ] Verify like count updates in real-time
- [ ] Verify comment count updates
- [ ] Check notification created for post author
- [ ] Test reply to comment (threaded)
- [ ] Test with 2+ connected users
- [ ] Verify genome recommendations show
- [ ] Test study group creation + invites

## Next Steps (Phase 2)

1. **Notifications Screen** - Display all notifications with action buttons
2. **User Profiles** - Clickable author profiles with full genome data
3. **Post Search** - Full-text search with hashtag filtering
4. **Stories** - Upload/view 24-hour ephemeral content
5. **Saved Posts** - Bookmark management screen
6. **Post Creation Modal** - Dedicated screen for rich post creation
7. **Advanced Analytics** - Trending skills, engagement metrics
8. **Mention System** - @Autocomplete with mention notifications

## Support

For issues or questions about the community feed implementation:
1. Check console logs for errors
2. Verify Supabase tables exist
3. Check real-time subscriptions enabled
4. Review user authentication state
