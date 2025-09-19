import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow a user to log in and see the dashboard', async ({ page }) => {
    console.log('Starting test: should allow a user to log in and see the dashboard');

    // Navigate to the app
    console.log('Navigating to /');
    await page.goto('/');
    console.log('Navigation to / complete');

    // The app should redirect to the login page
    console.log('Expecting URL to be /auth/login');
    await expect(page).toHaveURL('/auth/login');
    console.log('URL is /auth/login');

    // Use the auto-fill button for test credentials
    const autoFillButton = page.getByRole('button', { name: 'Use Test Credentials' });

    // Check if the auto-fill button exists and click it
    console.log('Checking for auto-fill button');
    if (await autoFillButton.isVisible()) {
      console.log('Auto-fill button is visible, clicking it');
      await autoFillButton.click();
      console.log('Auto-fill button clicked');
    } else {
      // Fallback to manual entry if the button is not present
      console.log('Auto-fill button not visible, filling form manually');
      await page.getByPlaceholder('your.email@example.com').fill('demo@foremanos.com');
      await page.getByPlaceholder('••••••••').fill('TestDemo2024!');
      console.log('Form filled manually');
    }

    // Click the sign-in button
    console.log('Clicking sign-in button');
    await page.getByRole('button', { name: 'Sign In' }).click();
    console.log('Sign-in button clicked');

    // Wait for navigation to the dashboard
    console.log('Waiting for URL to be /app');
    await page.waitForURL('/app');
    console.log('URL is /app');

    // Assert that the dashboard is visible
    await expect(page).toHaveURL('/app');

    // Check for a key element on the dashboard to confirm successful login
    console.log('Checking for welcome message');
    const welcomeMessage = page.getByRole('heading', { name: /Welcome back/i });
    await expect(welcomeMessage).toBeVisible({ timeout: 10000 });
    console.log('Welcome message is visible');
  });
});
