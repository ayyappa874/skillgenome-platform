# 🚀 SUPABASE DEPLOYMENT GUIDE - CRITICAL! DO THIS FIRST

## ⚠️ YOU MUST DO THIS TO FIX ALL ERRORS

All errors are happening because **Supabase database tables are missing**. The code is ready, but the database isn't.

---

## STEP 1: Go to Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Click on your **SkillGenome** project
3. In the left sidebar, click **"SQL Editor"**

---

## STEP 2: Run the Migration

1. In SQL Editor, click **"New Query"** (top right)
2. **Delete any existing code** in the editor
3. Open this file: `/backend/supabase_migrations_complete.sql`
4. **Copy ALL the code** (Ctrl+A, Ctrl+C)
5. **Paste into the SQL Editor** in Supabase (Ctrl+V)
6. Click the **"Run"** button (⚡ button on the right)
7. Wait 30-60 seconds...
8. You should see: **"Success!"** message at the top

---

## STEP 3: Verify Tables Were Created

Run these quick checks in SQL Editor to confirm:

```sql
-- Check Post Likes
SELECT COUNT(*) as post_likes_count FROM post_likes;

-- Check Post Comments  
SELECT COUNT(*) as comments_count FROM post_comments;

-- Check Notifications
SELECT COUNT(*) as notifications_count FROM notifications;

-- Check Study Group Members
SELECT COUNT(*) as members_count FROM study_group_members;

-- Test Recommendation Function
SELECT * FROM get_user_recommendations(
  (SELECT id FROM profiles LIMIT 1)::uuid, 
  10
);
```

If all return results without errors → ✅ **Migration successful!**

---

## STEP 4: Enable Realtime (IMPORTANT!)

1. In Supabase Dashboard, go to **Replication** (left sidebar)
2. Under "Replication Settings", toggle **ON** for:
   - ✅ post_likes
   - ✅ post_comments
   - ✅ notifications
   - ✅ study_group_members
3. Click **Save**

---

## STEP 5: Hot Reload Your App

1. Go back to your mobile app
2. Close the app completely
3. Wait 10 seconds
4. Reopen the app
5. Force refresh: Press `R` twice in the Metro/Expo terminal

---

## ✅ SUCCESS CHECKLIST

After deployment, test these:

- [ ] Click on "Community Feed" → No more "table not found" errors
- [ ] Click "Following" tab → Works without errors
- [ ] Click "Groups" tab → Works without errors  
- [ ] Click "Trending" tab → Works without errors
- [ ] Like a post → Shows ❤️ indicator + persists
- [ ] Click author name → Opens their profile
- [ ] Profile shows "Connect" button → Can click to connect
- [ ] Suggested Connections shows people → Can click "Connect"
- [ ] Click "👥" button → Opens Groups Discovery
- [ ] Click "🔔" button → Opens Notifications

---

## 🆘 IF ERRORS STILL APPEAR

**Error: "Could not find table 'public.post_likes'"**
→ Migration didn't run. Go back to SQL Editor and run the migration again.

**Error: "Function get_user_recommendations does not exist"**
→ The RPC function creation failed. Check for syntax errors in migration output.

**Error: "UNIQUE constraint violated"**
→ This is OK and expected - means some data already exists.

---

## 📱 What This Fixes

✅ Like/reaction buttons now persist  
✅ Comments will save with threading  
✅ Notifications system activates  
✅ Study group membership works  
✅ Suggested connections algorithm runs  
✅ User profiles load properly  
✅ Group discovery works  

---

## 🔄 AFTER DEPLOYMENT

Once database is set up:

1. **Connections appear** → Recommendation algorithm calculates matches
2. **Like posts** → Updates database instantly
3. **Comment** → Threaded comments work
4. **Join groups** → Admin gets notification
5. **Notifications flow** → Real-time updates via subscriptions

---

**Estimated time: 2-3 minutes**

Questions? Check `COMMUNITY_FEED_GUIDE.md` for detailed algorithm info.
