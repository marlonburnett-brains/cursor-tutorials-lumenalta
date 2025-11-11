import { Page, expect } from '@playwright/test';

/**
 * Custom assertion helpers for E2E tests
 */

/**
 * Verifies that a task exists in the DOM
 */
export async function verifyTaskExists(page: Page, taskId: string): Promise<void> {
  const task = page.getByTestId(`task-item-${taskId}`);
  await expect(task).toBeVisible();
}

/**
 * Verifies that a task does not exist in the DOM
 */
export async function verifyTaskNotExists(page: Page, taskId: string): Promise<void> {
  const task = page.getByTestId(`task-item-${taskId}`);
  await expect(task).not.toBeVisible();
}

/**
 * Verifies that a task has specific text content
 */
export async function verifyTaskContent(page: Page, taskId: string, expectedText: string): Promise<void> {
  const task = page.getByTestId(`task-item-${taskId}`);
  await expect(task).toContainText(expectedText);
}

/**
 * Verifies that a task is in a specific column
 */
export async function verifyTaskInColumn(
  page: Page,
  taskId: string,
  column: 'todo' | 'in-progress' | 'completed'
): Promise<void> {
  const columnElement = page.getByTestId(`task-column-${column}`);
  const taskInColumn = columnElement.getByTestId(`task-item-${taskId}`);
  await expect(taskInColumn).toBeVisible();
}

/**
 * Verifies the total count of visible tasks
 */
export async function verifyTaskCount(page: Page, expectedCount: number): Promise<void> {
  const tasks = page.locator('[data-testid^="task-item-"]');
  await expect(tasks).toHaveCount(expectedCount);
}

/**
 * Verifies the count for a specific filter
 */
export async function verifyFilterCount(
  page: Page,
  filter: 'all' | 'active' | 'completed',
  expectedCount: number
): Promise<void> {
  const countElement = page.getByTestId(`task-count-${filter}`);
  await expect(countElement).toContainText(String(expectedCount));
}

/**
 * Verifies that a task is marked as completed
 */
export async function verifyTaskCompleted(page: Page, taskId: string): Promise<void> {
  const checkbox = page.getByTestId(`task-checkbox-${taskId}`);
  await expect(checkbox).toBeChecked();
}

/**
 * Verifies that a task is not marked as completed
 */
export async function verifyTaskNotCompleted(page: Page, taskId: string): Promise<void> {
  const checkbox = page.getByTestId(`task-checkbox-${taskId}`);
  await expect(checkbox).not.toBeChecked();
}

/**
 * Verifies that the empty state is visible
 */
export async function verifyEmptyState(page: Page, visible: boolean = true): Promise<void> {
  const emptyState = page.getByTestId('empty-state');
  if (visible) {
    await expect(emptyState).toBeVisible();
  } else {
    await expect(emptyState).not.toBeVisible();
  }
}

/**
 * Verifies that a specific filter is active/selected
 */
export async function verifyActiveFilter(page: Page, filter: 'all' | 'active' | 'completed'): Promise<void> {
  const filterButton = page.getByTestId(`filter-${filter}`);
  // Assuming active filter has a specific class or attribute
  await expect(filterButton).toHaveAttribute('aria-selected', 'true');
}

/**
 * Verifies the order of tasks (by their IDs)
 */
export async function verifyTaskOrder(page: Page, expectedOrder: string[]): Promise<void> {
  const tasks = page.locator('[data-testid^="task-item-"]');
  const count = await tasks.count();
  
  expect(count).toBe(expectedOrder.length);
  
  for (let i = 0; i < count; i++) {
    const taskId = await tasks.nth(i).getAttribute('data-testid');
    const extractedId = taskId?.replace('task-item-', '');
    expect(extractedId).toBe(expectedOrder[i]);
  }
}

/**
 * Verifies that an error message is displayed
 */
export async function verifyErrorMessage(page: Page, expectedMessage?: string): Promise<void> {
  // This depends on how errors are displayed in your app
  // Adjust the selector based on your error display implementation
  const errorElement = page.locator('[role="alert"], .error-message, [data-testid="error-message"]');
  await expect(errorElement).toBeVisible();
  
  if (expectedMessage) {
    await expect(errorElement).toContainText(expectedMessage);
  }
}

/**
 * Verifies that no error message is displayed
 */
export async function verifyNoError(page: Page): Promise<void> {
  const errorElement = page.locator('[role="alert"], .error-message, [data-testid="error-message"]');
  await expect(errorElement).not.toBeVisible();
}

