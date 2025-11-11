import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask } from './helpers/actions';

/**
 * Compact Mode E2E Tests
 * Tests mobile experience and responsive transitions
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('Compact Mode', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
  });

  test('should automatically switch to Compact mode on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should be in Compact mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    await expect(page.getByTestId('status-tabs')).toBeVisible();
    
    // Should not see Kanban columns
    await expect(page.getByTestId('task-column-todo')).not.toBeVisible();
  });

  test('should restore user preference when resizing from mobile to desktop', async ({ page }) => {
    // Start on desktop, switch to Compact mode
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('view-mode-toggle').click();
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Should still be in Compact mode (forced)
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Should restore Compact mode preference
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
  });

  test('should filter tasks by status tab in Compact mode', async ({ page }) => {
    // Switch to Compact mode
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Add tasks with different statuses
    await addTask(page, 'Todo Task');
    await page.waitForTimeout(1000);
    
    // Verify task appears in Todo tab
    await expect(page.getByTestId('status-tab-todo')).toContainText('(1)');
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    
    // Switch to In Progress tab
    await page.getByTestId('status-tab-in-progress').click();
    await page.waitForTimeout(500);
    
    // Should show empty state (no in-progress tasks)
    await expect(page.getByTestId('empty-state')).toBeVisible();
    
    // Switch to Completed tab
    await page.getByTestId('status-tab-completed').click();
    await page.waitForTimeout(500);
    
    // Should show empty state
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('should allow status changes via buttons in Compact mode', async ({ page }) => {
    // Switch to Compact mode
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Add a task
    await addTask(page, 'Test Task');
    await page.waitForTimeout(1000);
    
    // Find the task and click Start button
    const taskCard = page.locator('[data-testid^="task-item-"]').first();
    const startButton = taskCard.getByTestId('status-change-in-progress');
    await startButton.click();
    await page.waitForTimeout(1000);
    
    // Task should move to In Progress tab
    await page.getByTestId('status-tab-in-progress').click();
    await page.waitForTimeout(500);
    
    // Task should be visible in In Progress tab
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    
    // Click Complete button
    const completeButton = taskCard.getByTestId('status-change-completed');
    await completeButton.click();
    await page.waitForTimeout(1000);
    
    // Task should move to Completed tab
    await page.getByTestId('status-tab-completed').click();
    await page.waitForTimeout(500);
    
    // Task should be visible in Completed tab
    await expect(tasks).toHaveCount(1);
  });

  test('should handle responsive transitions smoothly', async ({ page }) => {
    // Start on desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should be in Kanban mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--kanban/);
    
    // Gradually resize to mobile
    const sizes = [
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 640, height: 960 },
      { width: 375, height: 667 },
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300);
    }
    
    // Should transition to Compact mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
  });

  test('should maintain task operations in Compact mode', async ({ page }) => {
    // Switch to Compact mode
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Create task
    await addTask(page, 'New Task');
    await page.waitForTimeout(1000);
    
    // Edit task
    const taskCard = page.locator('[data-testid^="task-item-"]').first();
    await taskCard.click();
    await page.waitForTimeout(500);
    
    const editInput = page.getByTestId(/^edit-task-/);
    await editInput.fill('Edited Task');
    await editInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Verify edit
    await expect(taskCard).toContainText('Edited Task');
    
    // Delete task
    const deleteButton = taskCard.getByTestId(/^delete-task-/);
    await deleteButton.click();
    await page.waitForTimeout(500);
    
    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    await confirmButton.click();
    await page.waitForTimeout(1000);
    
    // Task should be gone
    await expect(taskCard).not.toBeVisible();
  });
});

