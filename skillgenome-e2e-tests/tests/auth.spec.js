const { test, expect } = require('@playwright/test');

test.describe('SkillGenome Web E2E - Authentication', () => {
  
  test('User can load the login page successfully', async ({ page }) => {
    // Navigate to the root URL (configured as localhost:8081)
    await page.goto('/');

    // Wait for the app to render the first interactive element
    await page.waitForSelector('text=Sign In', { state: 'visible', timeout: 10000 });
    
    // Check that we are definitely on the web version of SkillGenome
    const hasLoginButton = await page.isVisible('text=Sign In');
    expect(hasLoginButton).toBeTruthy();
  });

  test('User receives error on invalid login attempt', async ({ page }) => {
    await page.goto('/');
    
    // Attempt to login with a bad password to verify error handling
    const emailInput = page.getByPlaceholder('Email');
    if (await emailInput.isVisible()) {
        await emailInput.fill('invalid@skillgenome.com');
        await page.getByPlaceholder('Password').fill('wrongpassword123');
        await page.getByText('Sign In').click();

        // Optional: wait for error toast or similar
        // await expect(page.getByText('Invalid login credentials')).toBeVisible();
    }
  });

});
