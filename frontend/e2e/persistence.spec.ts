import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask, dragTaskToColumn } from './helpers/actions';

/**
 * Data Persistence E2E Tests
 * Tests that task data persists correctly after page reload
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('Data Persistence', () => {
  // Clean up test data before each test
  test.beforeEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Clean up after each test
  test.afterEach(async ({ page }) => {
    await cleanupTestData(page, API_BASE_URL);
  });

  test('should persist tasks after page reload', async ({ page }) => {
    // Arrange: Create some tasks
    await addTask(page, 'Persistent task 1');
    await page.waitForTimeout(500);
    await addTask(page, 'Persistent task 2');
    await page.waitForTimeout(500);
    await addTask(page, 'Persistent task 3');
    await page.waitForTimeout(1000);

    // Verify tasks exist
    let tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(3);

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Tasks still exist
    tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(3);
    await expect(tasks.nth(0)).toContainText('Persistent task 3');
    await expect(tasks.nth(1)).toContainText('Persistent task 2');
    await expect(tasks.nth(2)).toContainText('Persistent task 1');
  });

  test('should persist task order after page reload (newest first)', async ({ page }) => {
    // Arrange: Create tasks in specific order
    await addTask(page, 'First created');
    await page.waitForTimeout(500);
    await addTask(page, 'Second created');
    await page.waitForTimeout(500);
    await addTask(page, 'Third created');
    await page.waitForTimeout(1000);

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Order is maintained (newest first)
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks.nth(0)).toContainText('Third created');
    await expect(tasks.nth(1)).toContainText('Second created');
    await expect(tasks.nth(2)).toContainText('First created');
  });

  test('should persist task status after page reload', async ({ page }) => {
    // Arrange: Create tasks and move them to different columns
    await addTask(page, 'Todo task');
    await page.waitForTimeout(500);
    await addTask(page, 'In progress task');
    await page.waitForTimeout(500);
    await addTask(page, 'Completed task');
    await page.waitForTimeout(1000);

    // Move tasks to different columns
    const allTasks = page.locator('[data-testid^="task-item-"]');
    
    // Get task IDs
    const task1Id = (await allTasks.nth(1).getAttribute('data-testid'))?.replace('task-item-', '') || '';
    const task2Id = (await allTasks.nth(2).getAttribute('data-testid'))?.replace('task-item-', '') || '';

    // Move tasks
    await dragTaskToColumn(page, task1Id, 'in-progress');
    await page.waitForTimeout(500);
    await dragTaskToColumn(page, task2Id, 'completed');
    await page.waitForTimeout(1000);

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Tasks are in correct columns
    const todoColumn = page.getByTestId('task-column-todo');
    const inProgressColumn = page.getByTestId('task-column-in-progress');
    const completedColumn = page.getByTestId('task-column-completed');

    const todoTasks = todoColumn.locator('[data-testid^="task-item-"]');
    const inProgressTasks = inProgressColumn.locator('[data-testid^="task-item-"]');
    const completedTasks = completedColumn.locator('[data-testid^="task-item-"]');

    await expect(todoTasks).toHaveCount(1);
    await expect(inProgressTasks).toHaveCount(1);
    await expect(completedTasks).toHaveCount(1);

    await expect(todoTasks.first()).toContainText('Todo task');
    await expect(inProgressTasks.first()).toContainText('In progress task');
    await expect(completedTasks.first()).toContainText('Completed task');
  });

  test('should persist edited task content after page reload', async ({ page }) => {
    // Arrange: Create a task
    const originalContent = 'Original content';
    await addTask(page, originalContent);
    await page.waitForTimeout(1000);

    // Edit the task
    const taskElement = page.locator('[data-testid^="task-item-"]').first();
    const taskId = (await taskElement.getAttribute('data-testid'))?.replace('task-item-', '') || '';
    
    await taskElement.click();
    await page.waitForTimeout(500);

    const updatedContent = 'Updated persisted content';
    const editTextarea = page.getByTestId(`edit-task-${taskId}`);
    await editTextarea.clear();
    await editTextarea.fill(updatedContent);
    await editTextarea.press('Enter');
    await page.waitForTimeout(1000);

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Updated content persists
    const reloadedTask = page.locator('[data-testid^="task-item-"]').first();
    await expect(reloadedTask).toContainText(updatedContent);
    await expect(reloadedTask).not.toContainText(originalContent);
  });

  test('should persist task deletion after page reload', async ({ page }) => {
    // Arrange: Create tasks
    await addTask(page, 'Task to keep');
    await page.waitForTimeout(500);
    await addTask(page, 'Task to delete');
    await page.waitForTimeout(1000);

    // Delete one task
    const allTasks = page.locator('[data-testid^="task-item-"]');
    const taskToDelete = allTasks.first();
    const taskId = (await taskToDelete.getAttribute('data-testid'))?.replace('task-item-', '') || '';

    await taskToDelete.hover();
    const deleteButton = page.getByTestId(`delete-task-${taskId}`);
    await deleteButton.click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|delete|yes/i }).click();
    await page.waitForTimeout(1000);

    // Verify task was deleted
    let tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Deletion persists
    tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    await expect(tasks.first()).toContainText('Task to keep');
    await expect(tasks.first()).not.toContainText('Task to delete');
  });

  test('should persist task counts after page reload', async ({ page }) => {
    // Arrange: Create and organize tasks
    await addTask(page, 'Todo 1');
    await page.waitForTimeout(500);
    await addTask(page, 'Todo 2');
    await page.waitForTimeout(500);
    await addTask(page, 'In Progress 1');
    await page.waitForTimeout(1000);

    // Move one task to in-progress
    const allTasks = page.locator('[data-testid^="task-item-"]');
    const taskId = (await allTasks.first().getAttribute('data-testid'))?.replace('task-item-', '') || '';
    await dragTaskToColumn(page, taskId, 'in-progress');
    await page.waitForTimeout(1000);

    // Check counts before reload
    let todoCount = page.getByTestId('task-count-todo');
    let inProgressCount = page.getByTestId('task-count-in-progress');
    await expect(todoCount).toContainText('2');
    await expect(inProgressCount).toContainText('1');

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Counts persist correctly
    todoCount = page.getByTestId('task-count-todo');
    inProgressCount = page.getByTestId('task-count-in-progress');
    const completedCount = page.getByTestId('task-count-completed');

    await expect(todoCount).toContainText('2');
    await expect(inProgressCount).toContainText('1');
    await expect(completedCount).toContainText('0');
  });

  test('should handle multiple reloads without data loss', async ({ page }) => {
    // Arrange: Create tasks
    await addTask(page, 'Persistent task');
    await page.waitForTimeout(1000);

    // Act: Reload multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Assert: Task still exists
      const tasks = page.locator('[data-testid^="task-item-"]');
      await expect(tasks).toHaveCount(1);
      await expect(tasks.first()).toContainText('Persistent task');
    }
  });

  test('should persist complex task content with formatting', async ({ page }) => {
    // Arrange: Create a task with multi-line content
    const complexContent = `Task Title\nWith multiple lines\nAnd special chars: @#$%`;
    await addTask(page, complexContent);
    await page.waitForTimeout(1000);

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Complex content persists
    const task = page.locator('[data-testid^="task-item-"]').first();
    await expect(task).toContainText('Task Title');
    await expect(task).toContainText('multiple lines');
    await expect(task).toContainText('special chars');
  });

  test('should persist empty columns after reload', async ({ page }) => {
    // Arrange: Start with no tasks (all columns empty)
    // No tasks created

    // Act: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert: Columns are still visible and empty
    const todoCount = page.getByTestId('task-count-todo');
    const inProgressCount = page.getByTestId('task-count-in-progress');
    const completedCount = page.getByTestId('task-count-completed');

    await expect(todoCount).toContainText('0');
    await expect(inProgressCount).toContainText('0');
    await expect(completedCount).toContainText('0');

    // Empty states should be visible
    const emptyStates = page.locator('[data-testid="empty-state"]');
    await expect(emptyStates.first()).toBeVisible();
  });
});

