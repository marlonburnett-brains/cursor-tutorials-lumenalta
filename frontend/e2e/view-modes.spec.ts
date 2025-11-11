import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask } from './helpers/actions';

/**
 * View Modes E2E Tests
 * Tests complete mode switching workflow and preference persistence
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('View Modes', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
  });

  test('should toggle between Kanban and Compact modes', async ({ page }) => {
    // Initially should be in Kanban mode (default)
    const taskBoard = page.getByTestId('task-board');
    await expect(taskBoard).toHaveClass(/task-board--kanban/);
    
    // Should see three columns
    await expect(page.getByTestId('task-column-todo')).toBeVisible();
    await expect(page.getByTestId('task-column-in-progress')).toBeVisible();
    await expect(page.getByTestId('task-column-completed')).toBeVisible();
    
    // Click view mode toggle
    const viewModeToggle = page.getByTestId('view-mode-toggle');
    await viewModeToggle.click();
    
    // Should switch to Compact mode
    await expect(taskBoard).toHaveClass(/task-board--compact/);
    
    // Should see StatusTabs instead of columns
    await expect(page.getByTestId('status-tabs')).toBeVisible();
    await expect(page.getByTestId('status-tab-todo')).toBeVisible();
    
    // Toggle back to Kanban
    await viewModeToggle.click();
    await expect(taskBoard).toHaveClass(/task-board--kanban/);
  });

  test('should persist view mode preference across page refreshes', async ({ page }) => {
    // Switch to Compact mode
    const viewModeToggle = page.getByTestId('view-mode-toggle');
    await viewModeToggle.click();
    
    // Verify Compact mode is active
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be in Compact mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Switch back to Kanban
    await viewModeToggle.click();
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--kanban/);
    
    // Reload again
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be in Kanban mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--kanban/);
  });

  test('should show correct task counts in both modes', async ({ page }) => {
    // Add some tasks
    await addTask(page, 'Task 1');
    await addTask(page, 'Task 2');
    await page.waitForTimeout(1000);
    
    // In Kanban mode, check column counts
    const todoCountKanban = page.getByTestId('task-count-todo');
    await expect(todoCountKanban).toContainText('(2)');
    
    // Switch to Compact mode
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Check tab counts
    const todoTab = page.getByTestId('status-tab-todo');
    await expect(todoTab).toContainText('(2)');
    
    // Switch back to Kanban
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Counts should still be correct
    await expect(todoCountKanban).toContainText('(2)');
  });

  test('should maintain task visibility when switching modes', async ({ page }) => {
    // Add a task in Kanban mode
    await addTask(page, 'Test Task');
    await page.waitForTimeout(1000);
    
    // Verify task is visible in Kanban
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    await expect(tasks.first()).toContainText('Test Task');
    
    // Switch to Compact mode
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Task should still be visible
    const tasksCompact = page.locator('[data-testid^="task-item-"]');
    await expect(tasksCompact).toHaveCount(1);
    await expect(tasksCompact.first()).toContainText('Test Task');
    
    // Switch back to Kanban
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Task should still be visible
    await expect(tasks).toHaveCount(1);
    await expect(tasks.first()).toContainText('Test Task');
  });

  test('should disable toggle on mobile viewport', async ({ page }) => {
    // Set mobile viewport (<640px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should be forced into Compact mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Toggle should be disabled
    const viewModeToggle = page.getByTestId('view-mode-toggle');
    await expect(viewModeToggle).toBeDisabled();
    await expect(viewModeToggle).toHaveAttribute('aria-disabled', 'true');
    
    // Resize to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Toggle should be enabled
    await expect(viewModeToggle).toBeEnabled();
  });

  test('should remain usable at 150% browser zoom', async ({ page }) => {
    // Set zoom to 150%
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript(() => {
      // Simulate zoom by scaling viewport
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => 1.5,
      });
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // All interactive elements should be visible and clickable
    const viewModeToggle = page.getByTestId('view-mode-toggle');
    await expect(viewModeToggle).toBeVisible();
    await expect(viewModeToggle).toBeEnabled();
    
    // Add a task to verify functionality
    await addTask(page, 'Zoom test task');
    await page.waitForTimeout(1000);
    
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    
    // Switch modes
    await viewModeToggle.click();
    await page.waitForTimeout(500);
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Tabs should be visible and clickable
    const todoTab = page.getByTestId('status-tab-todo');
    await expect(todoTab).toBeVisible();
    await expect(todoTab).toBeEnabled();
  });

  test('should remain usable at 200% browser zoom', async ({ page }) => {
    // Set zoom to 200%
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript(() => {
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => 2.0,
      });
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // All elements should still be functional
    const viewModeToggle = page.getByTestId('view-mode-toggle');
    await expect(viewModeToggle).toBeVisible();
    
    // Verify task creation works
    await addTask(page, 'High zoom test');
    await page.waitForTimeout(1000);
    
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    
    // Verify mode switching works
    await viewModeToggle.click();
    await page.waitForTimeout(500);
    await expect(page.getByTestId('status-tabs')).toBeVisible();
    
    // Verify tabs are clickable
    const tabs = page.locator('[data-testid^="status-tab-"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
    
    // Click each tab to verify they work
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toBeVisible();
      await tab.click();
      await page.waitForTimeout(300);
    }
  });
});

