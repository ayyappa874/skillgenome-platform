# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> SkillGenome Web E2E - Authentication >> User receives error on invalid login attempt
- Location: e2e\auth.spec.ts:18:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8081/
Call log:
  - navigating to "http://localhost:8081/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('SkillGenome Web E2E - Authentication', () => {
  4  |   
  5  |   test('User can load the login page successfully', async ({ page }) => {
  6  |     // Navigate to the root URL (configured in playwright.config.ts)
  7  |     await page.goto('/');
  8  | 
  9  |     // Verify the page title or core login header is visible
  10 |     // Wait for the app to render the first interactive element
  11 |     await page.waitForSelector('text=Login', { state: 'visible', timeout: 10000 });
  12 |     
  13 |     // Check that we are definitely on the web version of SkillGenome
  14 |     const hasLoginButton = await page.isVisible('text=Login');
  15 |     expect(hasLoginButton).toBeTruthy();
  16 |   });
  17 | 
  18 |   test('User receives error on invalid login attempt', async ({ page }) => {
> 19 |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8081/
  20 |     
  21 |     // We will attempt to login with a bad password to verify error toasts
  22 |     // This assumes there's an input for Email and Password
  23 |     const emailInput = page.getByPlaceholder('Email');
  24 |     if (await emailInput.isVisible()) {
  25 |         await emailInput.fill('invalid@skillgenome.com');
  26 |         await page.getByPlaceholder('Password').fill('wrongpassword123');
  27 |         await page.getByText('Login').click();
  28 | 
  29 |         // We expect a toast or error message to appear
  30 |         // await expect(page.getByText('Invalid login credentials')).toBeVisible();
  31 |     }
  32 |   });
  33 | 
  34 | });
  35 | 
```