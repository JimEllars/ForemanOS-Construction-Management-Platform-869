import { test, expect } from '@playwright/test';

test.describe('Simple Test', () => {
  test('should navigate to Google and check the title', async ({ page }) => {
    console.log('Starting simple test');
    await page.goto('https://www.google.com');
    console.log('Navigated to Google');
    await expect(page).toHaveTitle(/Google/);
    console.log('Title is correct');
  });
});
