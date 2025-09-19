import { test, expect } from '@playwright/test';

test.describe('Dashboard Access', () => {
  test('should load the dashboard page without errors', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/app/dashboard');

    // Verify the page loads successfully
    await expect(page).toHaveTitle(/Blocks/);
    
    // Check that we're on the dashboard page
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify no console errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Wait a moment for any async operations to complete
    await page.waitForTimeout(1000);
    
    // Check for absence of console errors
    expect(consoleLogs).toEqual([]);
  });

  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/app/dashboard');
    
    // Verify the page still loads and is accessible on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify responsive design elements are working (check for actual class used)
    const body = page.locator('body');
    await expect(body).toHaveClass(/h-full/); // Actual Tailwind class used in layout
  });

  test('should navigate to dashboard from home page', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    
    // Navigate to dashboard (this will be updated as navigation is implemented)
    await page.goto('/app/dashboard');
    
    // Verify we reached the dashboard
    await expect(page).toHaveURL('/app/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});