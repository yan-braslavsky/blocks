/**
 * Integration Test: Deterministic Data Loading Behavior
 * 
 * Tests that the app loads consistent data within a day and varies across days
 * as specified in FR-008: Data Generation Determinism
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Deterministic Mock Data Loading', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (will be available once endpoints are implemented)
    await page.goto('/dashboard');
  });

  test('should load consistent recommendations within the same day', async ({ page }) => {
    // This test will validate once the recommendations endpoint is implemented
    
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    // Get the first recommendation title
    const firstRecommendationTitle = await page.locator('[data-testid="recommendation-stub"]').first().locator('[data-testid="recommendation-title"]').textContent();
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    // Check that the first recommendation is the same
    const reloadedFirstRecommendationTitle = await page.locator('[data-testid="recommendation-stub"]').first().locator('[data-testid="recommendation-title"]').textContent();
    
    expect(firstRecommendationTitle).toBe(reloadedFirstRecommendationTitle);
  });

  test('should load at least 5 recommendations as per spec', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    // Count recommendation stubs
    const recommendationCount = await page.locator('[data-testid="recommendation-stub"]').count();
    
    expect(recommendationCount).toBeGreaterThanOrEqual(5);
  });

  test('should display unique recommendation IDs (no duplicates)', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    // Get all recommendation IDs
    const recommendationIds = await page.locator('[data-testid="recommendation-stub"]').evaluateAll(
      elements => elements.map(el => el.getAttribute('data-recommendation-id')).filter(id => id)
    );
    
    // Check that all IDs are unique
    const uniqueIds = new Set(recommendationIds);
    expect(uniqueIds.size).toBe(recommendationIds.length);
    expect(recommendationIds.length).toBeGreaterThanOrEqual(5);
  });

  test('should load consistent timeline blocks within the same day', async ({ page }) => {
    // This test will validate once the timelines endpoint is implemented
    
    // Wait for timeline blocks to load
    await page.waitForSelector('[data-testid="timeline-block"]', { timeout: 10000 });
    
    // Get the first timeline block title
    const firstTimelineTitle = await page.locator('[data-testid="timeline-block"]').first().locator('[data-testid="timeline-title"]').textContent();
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="timeline-block"]', { timeout: 10000 });
    
    // Check that the first timeline block is the same
    const reloadedFirstTimelineTitle = await page.locator('[data-testid="timeline-block"]').first().locator('[data-testid="timeline-title"]').textContent();
    
    expect(firstTimelineTitle).toBe(reloadedFirstTimelineTitle);
  });

  test('should load at least 3 timeline blocks as per spec', async ({ page }) => {
    // Wait for timeline blocks to load
    await page.waitForSelector('[data-testid="timeline-block"]', { timeout: 10000 });
    
    // Count timeline blocks
    const timelineCount = await page.locator('[data-testid="timeline-block"]').count();
    
    expect(timelineCount).toBeGreaterThanOrEqual(3);
  });

  test('should display unique timeline block IDs (no duplicates)', async ({ page }) => {
    // Wait for timeline blocks to load
    await page.waitForSelector('[data-testid="timeline-block"]', { timeout: 10000 });
    
    // Get all timeline block IDs
    const timelineIds = await page.locator('[data-testid="timeline-block"]').evaluateAll(
      elements => elements.map(el => el.getAttribute('data-timeline-id')).filter(id => id)
    );
    
    // Check that all IDs are unique
    const uniqueIds = new Set(timelineIds);
    expect(uniqueIds.size).toBe(timelineIds.length);
    expect(timelineIds.length).toBeGreaterThanOrEqual(3);
  });

  test('should show mock disclaimer indicators throughout the interface', async ({ page }) => {
    // Check for mock disclaimer indicators as per spec
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="recommendation-stub"], [data-testid="timeline-block"]', { timeout: 10000 });
    
    // Look for mock disclaimer indicators (could be badges, text, or styling)
    const mockDisclaimers = await page.locator('[data-testid="mock-disclaimer"], .mock-disclaimer, [data-mock="true"]');
    const disclaimerCount = await mockDisclaimers.count();
    
    // Should have at least one disclaimer indicator visible
    expect(disclaimerCount).toBeGreaterThan(0);
  });

  test('should maintain data consistency across multiple page interactions', async ({ page }) => {
    // Test that deterministic behavior persists through user interactions
    
    // Wait for initial load
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    // Get initial state
    const initialRecommendations = await page.locator('[data-testid="recommendation-stub"]').count();
    const initialTimelines = await page.locator('[data-testid="timeline-block"]').count();
    
    // Perform some interactions (click, navigate, etc.)
    // Note: These interactions will be added as UI components are implemented
    
    // Reload and verify consistency
    await page.reload();
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    const reloadedRecommendations = await page.locator('[data-testid="recommendation-stub"]').count();
    const reloadedTimelines = await page.locator('[data-testid="timeline-block"]').count();
    
    expect(reloadedRecommendations).toBe(initialRecommendations);
    expect(reloadedTimelines).toBe(initialTimelines);
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Test loading behavior and error states
    
    // Check for loading indicators during initial load
    const hasLoadingState = await page.locator('[data-testid="loading-skeleton"], .loading, [aria-busy="true"]').count();
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="recommendation-stub"], [data-testid="timeline-block"]', { timeout: 10000 });
    
    // Verify content loaded successfully
    const recommendations = await page.locator('[data-testid="recommendation-stub"]').count();
    const timelines = await page.locator('[data-testid="timeline-block"]').count();
    
    expect(recommendations).toBeGreaterThanOrEqual(5);
    expect(timelines).toBeGreaterThanOrEqual(3);
  });

  // Note: The following test would validate different data on different days
  // but is challenging to test in practice due to date dependencies
  test.skip('should potentially show different data on different days', async ({ page }) => {
    // This would require date mocking or multi-day test runs
    // Kept as documentation of the intended behavior
    
    // Mock a different date
    await page.addInitScript(() => {
      const mockDate = new Date('2024-12-31');
      Date.now = () => mockDate.getTime();
      // Note: Full date mocking would require more comprehensive setup
    });
    
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    // This test would verify that different dates produce different mock data
    // Implementation depends on how date seeding is handled in the frontend
  });

  test('should display recommendations with proper metadata', async ({ page }) => {
    // Test that recommendations have all required fields displayed
    
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
    
    const firstRecommendation = page.locator('[data-testid="recommendation-stub"]').first();
    
    // Check for required elements
    await expect(firstRecommendation.locator('[data-testid="recommendation-title"]')).toBeVisible();
    await expect(firstRecommendation.locator('[data-testid="recommendation-description"]')).toBeVisible();
    await expect(firstRecommendation.locator('[data-testid="recommendation-impact"]')).toBeVisible();
    await expect(firstRecommendation.locator('[data-testid="recommendation-status"]')).toBeVisible();
    
    // Verify content is not empty
    const title = await firstRecommendation.locator('[data-testid="recommendation-title"]').textContent();
    const description = await firstRecommendation.locator('[data-testid="recommendation-description"]').textContent();
    
    expect(title?.trim().length).toBeGreaterThan(0);
    expect(description?.trim().length).toBeGreaterThan(0);
  });

  test('should display timeline blocks with proper structure', async ({ page }) => {
    // Test that timeline blocks have all required elements
    
    await page.waitForSelector('[data-testid="timeline-block"]', { timeout: 10000 });
    
    const firstTimeline = page.locator('[data-testid="timeline-block"]').first();
    
    // Check for required elements
    await expect(firstTimeline.locator('[data-testid="timeline-title"]')).toBeVisible();
    await expect(firstTimeline.locator('[data-testid="timeline-chart"]')).toBeVisible();
    await expect(firstTimeline.locator('[data-testid="timeline-timerange"]')).toBeVisible();
    
    // Verify content is not empty
    const title = await firstTimeline.locator('[data-testid="timeline-title"]').textContent();
    const timeRange = await firstTimeline.locator('[data-testid="timeline-timerange"]').textContent();
    
    expect(title?.trim().length).toBeGreaterThan(0);
    expect(timeRange?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('CTA Button Behavior', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="recommendation-stub"]', { timeout: 10000 });
  });

  test('should display CTA buttons for recommendations', async ({ page }) => {
    // Test CTA button presence as per FR-002: CTA Enable/Purchase Buttons
    
    const recommendations = page.locator('[data-testid="recommendation-stub"]');
    const firstRecommendation = recommendations.first();
    
    // Look for CTA button
    const ctaButton = firstRecommendation.locator('[data-testid="recommendation-cta"], [data-testid="enable-button"], [data-testid="purchase-button"]');
    await expect(ctaButton).toBeVisible();
    
    // Verify button has proper text
    const buttonText = await ctaButton.textContent();
    expect(buttonText?.trim().length).toBeGreaterThan(0);
  });

  test('should show appropriate CTA text based on recommendation status', async ({ page }) => {
    // Test that CTA buttons show contextual text
    
    const recommendations = page.locator('[data-testid="recommendation-stub"]');
    const count = await recommendations.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const recommendation = recommendations.nth(i);
      const status = await recommendation.locator('[data-testid="recommendation-status"]').textContent();
      const ctaButton = recommendation.locator('[data-testid="recommendation-cta"], [data-testid="enable-button"], [data-testid="purchase-button"]');
      
      if (await ctaButton.isVisible()) {
        const buttonText = await ctaButton.textContent();
        
        // CTA text should be contextual to status
        if (status?.includes('Prototype')) {
          expect(buttonText).toMatch(/Enable|Try|Activate/i);
        } else if (status?.includes('ComingSoon')) {
          expect(buttonText).toMatch(/Notify|Interest|Soon/i);
        } else if (status?.includes('Future')) {
          expect(buttonText).toMatch(/Future|Roadmap|Later/i);
        }
      }
    }
  });

  test('should handle CTA button clicks appropriately', async ({ page }) => {
    // Test CTA button interactions
    
    const firstRecommendation = page.locator('[data-testid="recommendation-stub"]').first();
    const ctaButton = firstRecommendation.locator('[data-testid="recommendation-cta"], [data-testid="enable-button"], [data-testid="purchase-button"]');
    
    // Click the CTA button
    await ctaButton.click();
    
    // Should show some feedback (modal, toast, navigation, etc.)
    // The exact behavior will depend on implementation
    const hasModal = await page.locator('[data-testid="modal"], [role="dialog"]').count() > 0;
    const hasToast = await page.locator('[data-testid="toast"], [data-testid="notification"]').count() > 0;
    const urlChanged = page.url() !== '/dashboard';
    
    // At least one of these should be true
    expect(hasModal || hasToast || urlChanged).toBe(true);
  });
});