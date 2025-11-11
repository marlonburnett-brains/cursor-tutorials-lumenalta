import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';
import { addTask, deleteTask, dragTaskToColumn } from './helpers/actions';
import {
  verifyTaskExists,
  verifyTaskNotExists,
  verifyTaskInColumn,
  verifyTaskCount,
  verifyEmptyState,
} from './helpers/assertions';

/**
 * Task Workflow E2E Tests
 * Tests basic task creation, editing, status changes, and deletion
 */

const API_BASE_URL = 'http://localhost:3001';

test.describe('Task Workflow', () => {
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

  test('should add a new task and verify it appears in the To Do column', async ({ page }) => {
    // Arrange: Start with empty board
    await verifyEmptyState(page, true);

    // Act: Add a new task
    const taskTitle = 'Test Task 1';
    await addTask(page, taskTitle);

    // Assert: Task appears in To Do column
    await page.waitForTimeout(1000); // Wait for task to be created
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    await expect(tasks.first()).toContainText(taskTitle);

    // Verify it's in the todo column
    const todoColumn = page.getByTestId('task-column-todo');
    const taskInColumn = todoColumn.locator('[data-testid^="task-item-"]');
    await expect(taskInColumn).toHaveCount(1);
  });

  test('should drag task between columns to change status', async ({ page }) => {
    // Arrange: Create a task
    await addTask(page, 'Drag me around');
    await page.waitForTimeout(1000);

    // Get the task ID
    const taskElement = page.locator('[data-testid^="task-item-"]').first();
    const taskId = (await taskElement.getAttribute('data-testid'))?.replace('task-item-', '') || '';

    // Act: Drag task from To Do to In Progress
    await dragTaskToColumn(page, taskId, 'in-progress');

    // Assert: Task is in In Progress column
    await verifyTaskInColumn(page, taskId, 'in-progress');

    // Act: Drag task from In Progress to Completed
    await dragTaskToColumn(page, taskId, 'completed');

    // Assert: Task is in Completed column
    await verifyTaskInColumn(page, taskId, 'completed');
  });

  test('should edit task content and verify changes persist', async ({ page }) => {
    // Arrange: Create a task
    const originalContent = 'Original task content';
    await addTask(page, originalContent);
    await page.waitForTimeout(1000);

    // Get the task
    const taskElement = page.locator('[data-testid^="task-item-"]').first();
    const taskId = (await taskElement.getAttribute('data-testid'))?.replace('task-item-', '') || '';

    // Act: Click on task to enter edit mode
    await taskElement.click();
    await page.waitForTimeout(500);

    // Edit the content
    const updatedContent = 'Updated task content';
    const editTextarea = page.getByTestId(`edit-task-${taskId}`);
    await editTextarea.clear();
    await editTextarea.fill(updatedContent);
    await editTextarea.press('Enter');

    // Assert: Task shows updated content
    await page.waitForTimeout(1000);
    await expect(taskElement).toContainText(updatedContent);
    await expect(taskElement).not.toContainText(originalContent);
  });

  test('should delete a task and verify removal from list', async ({ page }) => {
    // Arrange: Create multiple tasks
    await addTask(page, 'Task to keep');
    await page.waitForTimeout(500);
    await addTask(page, 'Task to delete');
    await page.waitForTimeout(1000);

    // Get all tasks
    let tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(2);

    // Get the task to delete (first one, which is newest)
    const taskToDelete = tasks.first();
    const taskId = (await taskToDelete.getAttribute('data-testid'))?.replace('task-item-', '') || '';

    // Act: Delete the task (need to hover to see delete button)
    await taskToDelete.hover();
    const deleteButton = page.getByTestId(`delete-task-${taskId}`);
    await deleteButton.click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /confirm|delete|yes/i }).click();

    // Assert: Task is removed
    await page.waitForTimeout(1000);
    tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    await verifyTaskNotExists(page, taskId);
  });

  test('should show error when attempting to add empty task', async ({ page }) => {
    // Arrange: Open the new task form
    const addButton = page.locator('.new-task-button-add');
    await addButton.click();

    // Act: Try to submit empty task
    const createButton = page.getByTestId('add-task-button');
    await createButton.click();

    // Assert: Error message is shown
    await page.waitForTimeout(500);
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('should show error when attempting to add whitespace-only task', async ({ page }) => {
    // Arrange: Open the new task form
    const addButton = page.locator('.new-task-button-add');
    await addButton.click();

    // Act: Try to submit whitespace-only task
    const input = page.getByTestId('new-task-input');
    await input.fill('   ');
    const createButton = page.getByTestId('add-task-button');
    await createButton.click();

    // Assert: Error message is shown
    await page.waitForTimeout(500);
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle very long task content', async ({ page }) => {
    // Arrange: Create a very long task (but within limit)
    const longContent = 'A'.repeat(1500); // Well within 2000 char limit

    // Act: Add the long task
    await addTask(page, longContent);

    // Assert: Task is created successfully
    await page.waitForTimeout(1000);
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(1);
    await expect(tasks.first()).toContainText('AAA'); // Check it contains some As
  });

  test('should show character counter when creating task', async ({ page }) => {
    // Arrange: Open the new task form
    const addButton = page.locator('.new-task-button-add');
    await addButton.click();

    // Act: Type some content
    const input = page.getByTestId('new-task-input');
    await input.fill('Test content');

    // Assert: Character counter is visible
    const characterCount = page.locator('.character-count');
    await expect(characterCount).toBeVisible();
    await expect(characterCount).toContainText('/2000');
  });

  test('should cancel task creation when pressing Escape', async ({ page }) => {
    // Arrange: Open the new task form
    const addButton = page.locator('.new-task-button-add');
    await addButton.click();

    // Type some content
    const input = page.getByTestId('new-task-input');
    await input.fill('This should be cancelled');

    // Act: Press Escape
    await input.press('Escape');

    // Assert: Form is closed, no task was created
    await page.waitForTimeout(500);
    await expect(input).not.toBeVisible();
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(0);
  });

  test('should create multiple tasks and display them in order', async ({ page }) => {
    // Arrange & Act: Create multiple tasks
    await addTask(page, 'First task');
    await page.waitForTimeout(500);
    await addTask(page, 'Second task');
    await page.waitForTimeout(500);
    await addTask(page, 'Third task');
    await page.waitForTimeout(1000);

    // Assert: All tasks are displayed
    const tasks = page.locator('[data-testid^="task-item-"]');
    await expect(tasks).toHaveCount(3);

    // Verify order (newest first)
    await expect(tasks.nth(0)).toContainText('Third task');
    await expect(tasks.nth(1)).toContainText('Second task');
    await expect(tasks.nth(2)).toContainText('First task');
  });
});

