import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask } from './helpers/actions';

/**
 * Cross-Mode Task Management E2E Tests
 * Tests task operations across both Kanban and Compact modes
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('Cross-Mode Task Management', () => {
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

  test('should create task in Kanban, switch to Compact, verify visibility, change status, and switch back', async ({ page }) => {
    // Step 1: Create task in Kanban mode
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--kanban/);
    await addTask(page, 'Cross-mode test task');
    await page.waitForTimeout(1000);
    
    // Verify task is visible in Kanban
    const tasksKanban = page.locator('[data-testid^="task-item-"]');
    await expect(tasksKanban).toHaveCount(1);
    await expect(tasksKanban.first()).toContainText('Cross-mode test task');
    
    // Verify task is in To Do column
    const todoColumn = page.getByTestId('task-column-todo');
    const taskInColumn = todoColumn.locator('[data-testid^="task-item-"]');
    await expect(taskInColumn).toHaveCount(1);
    
    // Step 2: Switch to Compact mode
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--compact/);
    
    // Step 3: Verify task is visible in Compact mode
    const tasksCompact = page.locator('[data-testid^="task-item-"]');
    await expect(tasksCompact).toHaveCount(1);
    await expect(tasksCompact.first()).toContainText('Cross-mode test task');
    
    // Should be in Todo tab
    await expect(page.getByTestId('status-tab-todo')).toContainText('(1)');
    
    // Step 4: Change status in Compact mode
    const taskCard = tasksCompact.first();
    const startButton = taskCard.getByTestId('status-change-in-progress');
    await startButton.click();
    await page.waitForTimeout(1000);
    
    // Task should move to In Progress tab
    await page.getByTestId('status-tab-in-progress').click();
    await page.waitForTimeout(500);
    
    await expect(tasksCompact).toHaveCount(1);
    await expect(page.getByTestId('status-tab-in-progress')).toContainText('(1)');
    
    // Step 5: Switch back to Kanban
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    await expect(page.getByTestId('task-board')).toHaveClass(/task-board--kanban/);
    
    // Step 6: Verify task is in In Progress column
    const inProgressColumn = page.getByTestId('task-column-in-progress');
    const taskInProgress = inProgressColumn.locator('[data-testid^="task-item-"]');
    await expect(taskInProgress).toHaveCount(1);
    await expect(taskInProgress.first()).toContainText('Cross-mode test task');
    
    // Todo column should be empty
    const todoColumnAfter = page.getByTestId('task-column-todo');
    const tasksInTodo = todoColumnAfter.locator('[data-testid^="task-item-"]');
    await expect(tasksInTodo).toHaveCount(0);
  });

  test('should maintain task edits across mode switches', async ({ page }) => {
    // Create and edit task in Kanban
    await addTask(page, 'Original task');
    await page.waitForTimeout(1000);
    
    const taskCard = page.locator('[data-testid^="task-item-"]').first();
    await taskCard.click();
    await page.waitForTimeout(500);
    
    const editInput = page.getByTestId(/^edit-task-/);
    await editInput.fill('Edited in Kanban');
    await editInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // Switch to Compact
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Verify edit persists
    const taskCompact = page.locator('[data-testid^="task-item-"]').first();
    await expect(taskCompact).toContainText('Edited in Kanban');
    
    // Edit again in Compact
    await taskCompact.click();
    await page.waitForTimeout(500);
    
    const editInputCompact = page.getByTestId(/^edit-task-/);
    await editInputCompact.fill('Edited in Compact');
    await editInputCompact.press('Enter');
    await page.waitForTimeout(1000);
    
    // Switch back to Kanban
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Verify edit persists
    const taskKanban = page.locator('[data-testid^="task-item-"]').first();
    await expect(taskKanban).toContainText('Edited in Compact');
  });

  test('should handle multiple tasks across mode switches', async ({ page }) => {
    // Create multiple tasks in Kanban
    await addTask(page, 'Task 1');
    await page.waitForTimeout(500);
    await addTask(page, 'Task 2');
    await page.waitForTimeout(500);
    await addTask(page, 'Task 3');
    await page.waitForTimeout(1000);
    
    // Verify all tasks visible
    const tasksKanban = page.locator('[data-testid^="task-item-"]');
    await expect(tasksKanban).toHaveCount(3);
    
    // Switch to Compact
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // All tasks should be visible
    const tasksCompact = page.locator('[data-testid^="task-item-"]');
    await expect(tasksCompact).toHaveCount(3);
    await expect(page.getByTestId('status-tab-todo')).toContainText('(3)');
    
    // Change status of one task
    const firstTask = tasksCompact.first();
    await firstTask.getByTestId('status-change-in-progress').click();
    await page.waitForTimeout(1000);
    
    // Switch back to Kanban
    await page.getByTestId('view-mode-toggle').click();
    await page.waitForTimeout(500);
    
    // Counts should be correct
    await expect(page.getByTestId('task-count-todo')).toContainText('(2)');
    await expect(page.getByTestId('task-count-in-progress')).toContainText('(1)');
  });
});

