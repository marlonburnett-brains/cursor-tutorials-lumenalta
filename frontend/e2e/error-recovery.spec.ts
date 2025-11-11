import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask } from './helpers/actions';

/**
 * Error Recovery E2E Tests
 * 
 * Tests cover:
 * - Error display when backend is offline
 * - Retry functionality
 * - Graceful error recovery
 * - Optimistic update rollback on failure
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('Error Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
  });

  test('should show error notification when backend is offline during initial load', async ({ page, context }) => {
    // Block API requests to simulate offline backend
    await context.route('**/tasks', route => route.abort());
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });
    await expect(errorNotification).toContainText(/unable to connect|network|server/i);
  });

  test('should show retry button in error notification', async ({ page, context }) => {
    // Block API requests to simulate offline backend
    await context.route('**/tasks', route => route.abort());
    
    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Verify retry button exists
    const retryButton = errorNotification.locator('button', { hasText: /retry/i });
    await expect(retryButton).toBeVisible();
  });

  test('should retry and succeed when backend comes back online', async ({ page, context }) => {
    // First, block API requests to simulate offline backend
    let blockRequests = true;
    await context.route('**/tasks', route => {
      if (blockRequests) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Simulate backend coming back online
    blockRequests = false;

    // Click retry button
    const retryButton = errorNotification.locator('button', { hasText: /retry/i });
    await retryButton.click();

    // Error notification should disappear
    await expect(errorNotification).not.toBeVisible({ timeout: 5000 });

    // Task board should be visible
    const taskBoard = page.getByTestId('task-board');
    await expect(taskBoard).toBeVisible();
  });

  test('should show error when creating task with backend offline', async ({ page, context }) => {
    // Create initial setup
    await page.waitForTimeout(1000);

    // Block POST requests to simulate backend failure
    await context.route('**/tasks', route => {
      if (route.request().method() === 'POST') {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Try to create a task
    const addButton = page.locator('.new-task-button-add');
    await addButton.click();

    const input = page.getByTestId('new-task-input');
    await input.fill('This task will fail');

    const createButton = page.getByTestId('add-task-button');
    await createButton.click();

    // Should show error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });
    await expect(errorNotification).toContainText(/unable to connect|network|server/i);
  });

  test('should rollback optimistic update when API call fails', async ({ page, context }) => {
    // First create a task successfully
    await addTask(page, 'Initial task');
    await page.waitForTimeout(1000);

    // Get initial task count
    const initialTasks = page.locator('[data-testid^="task-item-"]');
    const initialCount = await initialTasks.count();

    // Block POST requests for next operation
    await context.route('**/tasks', route => {
      if (route.request().method() === 'POST') {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Try to create another task (should fail)
    const addButton = page.locator('.new-task-button-add');
    await addButton.click();

    const input = page.getByTestId('new-task-input');
    await input.fill('This will be rolled back');

    const createButton = page.getByTestId('add-task-button');
    await createButton.click();

    // Wait for error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Wait a bit for any UI updates
    await page.waitForTimeout(1500);

    // Verify task count hasn't changed (rollback happened)
    const finalTasks = page.locator('[data-testid^="task-item-"]');
    const finalCount = await finalTasks.count();
    expect(finalCount).toBe(initialCount);
  });

  test('should show error when deleting task with backend offline', async ({ page, context }) => {
    // Create a task first
    await addTask(page, 'Task to delete');
    await page.waitForTimeout(1000);

    // Block DELETE requests
    await context.route('**/tasks/*', route => {
      if (route.request().method() === 'DELETE') {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Try to delete the task
    const task = page.locator('[data-testid^="task-item-"]').first();
    await task.hover();
    
    const deleteButton = task.locator('[data-testid^="delete-task-"]');
    await deleteButton.click();

    // Confirm deletion in dialog
    const confirmButton = page.getByRole('button', { name: /confirm|delete|yes/i });
    await confirmButton.click();

    // Should show error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });
  });

  test('should dismiss error notification when clicking X button', async ({ page, context }) => {
    // Block API requests to trigger error
    await context.route('**/tasks', route => route.abort());
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Click dismiss button
    const dismissButton = errorNotification.locator('button[aria-label*="Dismiss"]');
    await dismissButton.click();

    // Error notification should disappear
    await expect(errorNotification).not.toBeVisible({ timeout: 1000 });
  });

  test('should auto-dismiss error notification after timeout', async ({ page, context }) => {
    // Block API requests to trigger error
    await context.route('**/tasks', route => route.abort());
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Wait for auto-dismiss (5 seconds + buffer)
    await expect(errorNotification).not.toBeVisible({ timeout: 6000 });
  });

  test('should show loading state while retrying', async ({ page, context }) => {
    // Block initial request
    let requestCount = 0;
    await context.route('**/tasks', route => {
      requestCount++;
      if (requestCount === 1) {
        route.abort();
      } else {
        // Delay the second request to see loading state
        setTimeout(() => route.continue(), 1000);
      }
    });
    
    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for error notification
    const errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Click retry
    const retryButton = errorNotification.locator('button', { hasText: /retry/i });
    await retryButton.click();

    // Should show loading state briefly
    const loadingIndicator = page.getByTestId('task-board-loading');
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
  });

  test('should handle multiple consecutive errors gracefully', async ({ page, context }) => {
    // Block all requests initially
    let allowRequests = false;
    await context.route('**/tasks', route => {
      if (allowRequests) {
        route.continue();
      } else {
        route.abort();
      }
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // First error
    let errorNotification = page.locator('.error-notification');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Retry (still fails)
    let retryButton = errorNotification.locator('button', { hasText: /retry/i });
    await retryButton.click();
    await page.waitForTimeout(1000);

    // Should show error again
    await expect(errorNotification).toBeVisible({ timeout: 10000 });

    // Now allow requests
    allowRequests = true;

    // Retry again (should succeed)
    retryButton = errorNotification.locator('button', { hasText: /retry/i });
    await retryButton.click();

    // Error should disappear
    await expect(errorNotification).not.toBeVisible({ timeout: 5000 });

    // Task board should be visible
    const taskBoard = page.getByTestId('task-board');
    await expect(taskBoard).toBeVisible();
  });
});

