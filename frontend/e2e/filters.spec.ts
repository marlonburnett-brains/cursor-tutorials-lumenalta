import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask, dragTaskToColumn } from './helpers/actions';

/**
 * Column Filtering E2E Tests
 * Tests Kanban column organization and task distribution
 * 
 * Note: This app uses a Kanban board with columns rather than traditional filters.
 * Tests verify that tasks are properly organized by status (todo, in-progress, completed).
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('Kanban Column Organization', () => {
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

  test('should display all three columns (To Do, In Progress, Completed)', async ({ page }) => {
    // Assert: All three columns are visible
    const todoColumn = page.getByTestId('task-column-todo');
    const inProgressColumn = page.getByTestId('task-column-in-progress');
    const completedColumn = page.getByTestId('task-column-completed');

    await expect(todoColumn).toBeVisible();
    await expect(inProgressColumn).toBeVisible();
    await expect(completedColumn).toBeVisible();

    // Verify column titles
    await expect(todoColumn).toContainText('To Do');
    await expect(inProgressColumn).toContainText('In Progress');
    await expect(completedColumn).toContainText('Completed');
  });

  test('should show correct task counts in each column', async ({ page }) => {
    // Arrange: Create tasks in different columns
    await addTask(page, 'Todo task 1');
    await page.waitForTimeout(500);
    await addTask(page, 'Todo task 2');
    await page.waitForTimeout(1000);

    // Get first task and move it to in-progress
    const tasks = page.locator('[data-testid^="task-item-"]');
    const firstTaskId = (await tasks.first().getAttribute('data-testid'))?.replace('task-item-', '') || '';
    await dragTaskToColumn(page, firstTaskId, 'in-progress');
    await page.waitForTimeout(1000);

    // Assert: Task counts are correct
    const todoCount = page.getByTestId('task-count-todo');
    const inProgressCount = page.getByTestId('task-count-in-progress');
    const completedCount = page.getByTestId('task-count-completed');

    await expect(todoCount).toContainText('1');
    await expect(inProgressCount).toContainText('1');
    await expect(completedCount).toContainText('0');
  });

  test('should show only todo tasks in To Do column', async ({ page }) => {
    // Arrange: Create multiple tasks and move them to different columns
    await addTask(page, 'Todo task');
    await page.waitForTimeout(500);
    await addTask(page, 'In progress task');
    await page.waitForTimeout(500);
    await addTask(page, 'Completed task');
    await page.waitForTimeout(1000);

    // Move tasks to appropriate columns
    const allTasks = page.locator('[data-testid^="task-item-"]');
    const secondTaskId = (await allTasks.nth(1).getAttribute('data-testid'))?.replace('task-item-', '') || '';
    const thirdTaskId = (await allTasks.nth(2).getAttribute('data-testid'))?.replace('task-item-', '') || '';

    await dragTaskToColumn(page, secondTaskId, 'in-progress');
    await page.waitForTimeout(500);
    await dragTaskToColumn(page, thirdTaskId, 'completed');
    await page.waitForTimeout(1000);

    // Assert: To Do column shows only todo tasks
    const todoColumn = page.getByTestId('task-column-todo');
    const todoTasks = todoColumn.locator('[data-testid^="task-item-"]');
    await expect(todoTasks).toHaveCount(1);
    await expect(todoTasks.first()).toContainText('Todo task');
  });

  test('should show only in-progress tasks in In Progress column', async ({ page }) => {
    // Arrange: Create tasks and move one to in-progress
    await addTask(page, 'Todo task');
    await page.waitForTimeout(500);
    await addTask(page, 'In progress task');
    await page.waitForTimeout(1000);

    // Move second task to in-progress
    const allTasks = page.locator('[data-testid^="task-item-"]');
    const taskId = (await allTasks.first().getAttribute('data-testid'))?.replace('task-item-', '') || '';
    await dragTaskToColumn(page, taskId, 'in-progress');
    await page.waitForTimeout(1000);

    // Assert: In Progress column shows only in-progress tasks
    const inProgressColumn = page.getByTestId('task-column-in-progress');
    const inProgressTasks = inProgressColumn.locator('[data-testid^="task-item-"]');
    await expect(inProgressTasks).toHaveCount(1);
    await expect(inProgressTasks.first()).toContainText('In progress task');
  });

  test('should show only completed tasks in Completed column', async ({ page }) => {
    // Arrange: Create tasks and move one to completed
    await addTask(page, 'Todo task');
    await page.waitForTimeout(500);
    await addTask(page, 'Completed task');
    await page.waitForTimeout(1000);

    // Move first task to completed
    const allTasks = page.locator('[data-testid^="task-item-"]');
    const taskId = (await allTasks.first().getAttribute('data-testid'))?.replace('task-item-', '') || '';
    await dragTaskToColumn(page, taskId, 'completed');
    await page.waitForTimeout(1000);

    // Assert: Completed column shows only completed tasks
    const completedColumn = page.getByTestId('task-column-completed');
    const completedTasks = completedColumn.locator('[data-testid^="task-item-"]');
    await expect(completedTasks).toHaveCount(1);
    await expect(completedTasks.first()).toContainText('Completed task');
  });

  test('should update task counts when moving tasks between columns', async ({ page }) => {
    // Arrange: Create tasks
    await addTask(page, 'Task 1');
    await page.waitForTimeout(500);
    await addTask(page, 'Task 2');
    await page.waitForTimeout(500);
    await addTask(page, 'Task 3');
    await page.waitForTimeout(1000);

    // Initial counts
    let todoCount = page.getByTestId('task-count-todo');
    await expect(todoCount).toContainText('3');

    // Act: Move one task to in-progress
    const allTasks = page.locator('[data-testid^="task-item-"]');
    const taskId = (await allTasks.first().getAttribute('data-testid'))?.replace('task-item-', '') || '';
    await dragTaskToColumn(page, taskId, 'in-progress');
    await page.waitForTimeout(1000);

    // Assert: Counts updated
    todoCount = page.getByTestId('task-count-todo');
    const inProgressCount = page.getByTestId('task-count-in-progress');
    await expect(todoCount).toContainText('2');
    await expect(inProgressCount).toContainText('1');

    // Act: Move task to completed
    await dragTaskToColumn(page, taskId, 'completed');
    await page.waitForTimeout(1000);

    // Assert: Counts updated again
    const completedCount = page.getByTestId('task-count-completed');
    await expect(inProgressCount).toContainText('0');
    await expect(completedCount).toContainText('1');
  });

  test('should show empty state when column has no tasks', async ({ page }) => {
    // Arrange: Start with no tasks
    // All columns should show empty state

    // Assert: Empty states are visible
    const todoColumn = page.getByTestId('task-column-todo');
    const inProgressColumn = page.getByTestId('task-column-in-progress');
    const completedColumn = page.getByTestId('task-column-completed');

    const emptyStates = page.locator('[data-testid="empty-state"]');
    await expect(emptyStates).toHaveCount(3); // One per column (excluding the one in todo with new task button)

    // Verify empty state messages are appropriate
    await expect(inProgressColumn).toContainText('Drag tasks here');
    await expect(completedColumn).toContainText('Completed tasks');
  });

  test('should maintain column organization after operations', async ({ page }) => {
    // Arrange: Create and organize tasks
    await addTask(page, 'Todo 1');
    await page.waitForTimeout(500);
    await addTask(page, 'Todo 2');
    await page.waitForTimeout(1000);

    const allTasks = page.locator('[data-testid^="task-item-"]');
    const firstTaskId = (await allTasks.first().getAttribute('data-testid'))?.replace('task-item-', '') || '';
    
    // Move to in-progress
    await dragTaskToColumn(page, firstTaskId, 'in-progress');
    await page.waitForTimeout(500);

    // Act: Add another task
    await addTask(page, 'Todo 3');
    await page.waitForTimeout(1000);

    // Assert: Organization is maintained
    const todoColumn = page.getByTestId('task-column-todo');
    const todoTasks = todoColumn.locator('[data-testid^="task-item-"]');
    await expect(todoTasks).toHaveCount(2);

    const inProgressColumn = page.getByTestId('task-column-in-progress');
    const inProgressTasks = inProgressColumn.locator('[data-testid^="task-item-"]');
    await expect(inProgressTasks).toHaveCount(1);
  });

  test('should display task board container', async ({ page }) => {
    // Assert: Task board container is visible
    const taskBoard = page.getByTestId('task-board');
    await expect(taskBoard).toBeVisible();

    // Verify all columns are within the board
    const todoColumn = taskBoard.getByTestId('task-column-todo');
    const inProgressColumn = taskBoard.getByTestId('task-column-in-progress');
    const completedColumn = taskBoard.getByTestId('task-column-completed');

    await expect(todoColumn).toBeVisible();
    await expect(inProgressColumn).toBeVisible();
    await expect(completedColumn).toBeVisible();
  });
});

