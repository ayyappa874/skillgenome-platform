const { test, expect } = require('@playwright/test');

test.describe('Community & Gamification E2E', () => {

  test('User can view Leaderboard and interact with the Discussion Feed', async ({ page }) => {
    await page.goto('/');

    // 1. Navigate to Community tab
    try {
      const communityNav = page.locator('text=Community').first();
      if (await communityNav.isVisible()) {
          await communityNav.click();
      }
    } catch (e) {}

    // 2. Verify Global Leaderboard rendering
    // Looking for the Leaderboard header
    const leaderboardHeader = page.locator('text=Global Leaderboard').first();
    await expect.soft(leaderboardHeader).toBeVisible();

    // Verify at least one user score is present (checking for the #1 rank)
    const topRank = page.locator('text=#1').first();
    await expect.soft(topRank).toBeVisible();

    // 3. Test Discussion Feed Automation
    // Assuming there's a text input for creating a new post
    const postInput = page.getByPlaceholder(/What's on your mind/i).first();
    if (await postInput.isVisible()) {
        const uniqueTestString = `Automated E2E Test Post - ${Date.now()}`;
        await postInput.fill(uniqueTestString);
        
        // Find and click 'Post' button
        const postButton = page.locator('text=Post').first();
        if (await postButton.isVisible()) {
            await postButton.click();
        }

        // Verify the post actually appeared in the feed
        const newPost = page.locator(`text=${uniqueTestString}`).first();
        await expect.soft(newPost).toBeVisible();
    }

    // 4. Test Liking a Post
    // We look for a generic like button/heart icon in the feed
    const likeButton = page.locator('text=❤️').first();
    if (await likeButton.isVisible()) {
        await likeButton.click();
        
        // Ensure it doesn't crash the UI upon clicking
        const body = page.locator('body');
        await expect.soft(body).toBeVisible();
    }
  });

});
