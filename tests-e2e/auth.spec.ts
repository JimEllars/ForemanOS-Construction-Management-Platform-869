import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow a user to log in and see the dashboard', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // The app should redirect to the login page
    await expect(page).toHaveURL('/auth/login');

    // Use the auto-fill button for test credentials
    const autoFillButton = page.getByRole('button', { name: 'Use Test Credentials' });

    // Check if the auto-fill button exists and click it
    if (await autoFillButton.isVisible()) {
      await autoFillButton.click();
    } else {
      // Fallback to manual entry if the button is not present
      await page.getByPlaceholder('your.email@example.com').fill('demo@foremanos.com');
      await page.getByPlaceholder('••••••••').fill('TestDemo2024!');
    }

    // Click the sign-in button
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to the dashboard
    await page.waitForURL('/app');

    // Assert that the dashboard is visible
    await expect(page).toHaveURL('/app');

    // Check for a key element on the dashboard to confirm successful login
    const welcomeMessage = page.getByRole('heading', { name: /Welcome back/i });
    await expect(welcomeMessage).toBeVisible({ timeout: 10000 });
  });
});
