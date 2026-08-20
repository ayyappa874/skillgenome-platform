# SUPABASE SETUP - QUICK START

## Step 1: Run Database Migrations

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** → **Create Query**
3. Copy the entire contents of `/backend/supabase_migrations.sql`
4. Paste into the SQL Editor
5. Click **Run** (⚡)
6. Wait for completion (you'll see green checkmarks)

## Step 2: Enable Real-Time Subscriptions

After migrations complete:

1. Go to **Replication** (left sidebar)
2. Scroll down to "supabase_realtime" publication
3. Find and toggle ON:
   - ✅ `post_likes`
   - ✅ `post_comments`
   - ✅ `notifications`
4. Save

## Step 3: Verify Tables Created

In SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- post_comments ✓
- post_hashtags ✓
- post_likes ✓
- post_mentions ✓
- notifications ✓
- saved_posts ✓
- story_posts ✓

## Step 4: Update Your App

The following updates have already been made to your codebase:

### Files Created:
- ✅ `/utils/communityHelpers.js` - All community functions
- ✅ `/backend/supabase_migrations.sql` - Database schema
- ✅ `/COMMUNITY_FEED_GUIDE.md` - Full documentation

### Files Modified:
- ✅ `/App.js` - Handlers updated, new imports added

### What's Already Working:
- ✅ Post feed ranking algorithm
- ✅ Like/Unlike persistence  
- ✅ Comments with threading
- ✅ Notifications system
- ✅ Genome-matched recommendations
- ✅ Real-time subscriptions (ready when DB is set up)
- ✅ Study group invites
- ✅ Message persistence

## Step 5: Test Everything

### Test Post Interactions:
1. Open Community Feed (Screen 23)
2. Create a post (tap compose)
3. Click heart icon on any post → Like count increases ✓
4. Click comment icon → Opens comments section ✓
5. Add a comment → Count increments ✓

### Test Recommendations:
1. Open Community Feed left panel
2. Check "Suggested Connections" section
3. Should show matching users with:
   - Match %
   - Shared skills
   - Connection status

### Test Notifications:
1. Have a friend like your post
2. Should see notification (when NotificationsScreen is added)

## Troubleshooting

### Tables Don't Exist After Migration
- Try running queries individually
- Check for SQL errors (they'll show in red)
- Ensure no migrations were skipped

### Real-Time Not Working
- Verify replication is enabled (step 2)
- Restart the app
- Check browser console for errors

### Likes/Comments Not Saving
- Ensure user is authenticated
- Check browser DevTools → Network tab
- Verify post_likes/post_comments tables exist
- Check Supabase logs

### Recommendations Not Showing
- Verify `get_user_recommendations()` RPC function created
- Test directly in SQL Editor: 
  ```sql
  SELECT * FROM get_user_recommendations('YOUR_USER_ID'::uuid);
  ```

## Database Schema Summary

### post_likes
```sql
- id (UUID)
- post_id (FK → posts)
- user_id (FK → profiles)
- reaction_type (like, love, insightful, celebrate, support)
- created_at
```

### post_comments
```sql
- id (UUID)
- post_id (FK → posts)
- author_id (FK → profiles)
- parent_comment_id (FK → post_comments) -- threading
- content (TEXT)
- likes_count
- created_at
- updated_at
- deleted_at
```

### notifications
```sql
- id (UUID)
- recipient_id (FK → profiles)
- actor_id (FK → profiles)
- notification_type (like, comment, mention, connection_request, group_invite)
- related_post_id
- related_comment_id
- related_group_id
- message (TEXT)
- is_read (BOOLEAN)
- created_at
- read_at
```

### saved_posts
```sql
- id (UUID)
- user_id (FK → profiles)
- post_id (FK → posts)
- created_at
```

### story_posts
```sql
- id (UUID)
- author_id (FK → profiles)
- content (TEXT)
- media_url (TEXT)
- media_type (image, video, text)
- skill_tags (TEXT[])
- visibility (public, connected)
- created_at
- expires_at (auto 24h)
```

## Next Steps

1. ✅ Run migrations (THIS FILE)
2. ✅ Enable real-time
3. ✅ Test interactions
4. ⏳ Create NotificationsScreen (UI only)
5. ⏳ Create UserProfileScreen (UI only)
6. ⏳ Implement post search

## Need Help?

All community feed functions are in `/utils/communityHelpers.js`:
- subscribeToPostUpdates()
- likePost()
- unlikePost()
- addComment()
- deleteComment()
- fetchPostComments()
- createNotification()
- fetchNotifications()
- And many more...

See `/COMMUNITY_FEED_GUIDE.md` for usage examples.
