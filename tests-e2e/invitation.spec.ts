import { test, expect } from '@playwright/test';

test.describe('Invitation Flow', () => {
  test('should display an error if no token is provided', async ({ page }) => {
    await page.goto('/#/auth/accept-invitation');

    // Wait for the error message to appear
    const errorMessage = page.locator('text=No invitation token provided');
    await errorMessage.waitFor();

    await expect(errorMessage).toBeVisible();
  });
});
