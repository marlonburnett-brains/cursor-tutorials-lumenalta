import { Page, Locator } from '@playwright/test';

/**
 * Reusable test action functions for E2E tests
 */

/**
 * Adds a new task using the input field
 */
export async function addTask(page: Page, title: string): Promise<void> {
  await page.getByTestId('new-task-input').fill(title);
  await page.getByTestId('add-task-button').click();
  
  // Wait for the task to appear in the DOM
  await page.waitForTimeout(500);
}

/**
 * Deletes a task by its ID
 */
export async function deleteTask(page: Page, taskId: string): Promise<void> {
  await page.getByTestId(`delete-task-${taskId}`).click();
  
  // Wait for delete confirmation or animation
  await page.waitForTimeout(300);
}

/**
 * Toggles task completion status by ID
 */
export async function toggleTaskStatus(page: Page, taskId: string): Promise<void> {
  await page.getByTestId(`task-checkbox-${taskId}`).click();
  
  // Wait for status update
  await page.waitForTimeout(300);
}

/**
 * Edits a task's content
 */
export async function editTask(page: Page, taskId: string, newTitle: string): Promise<void> {
  // Click on the task or edit button to enter edit mode
  const editButton = page.getByTestId(`edit-task-${taskId}`);
  await editButton.click();
  
  // Find the edit input/textarea and update
  const editInput = page.locator(`[data-testid="edit-task-${taskId}"] input, [data-testid="edit-task-${taskId}"] textarea`);
  await editInput.fill(newTitle);
  
  // Save (usually by pressing Enter or clicking save)
  await editInput.press('Enter');
  
  // Wait for save
  await page.waitForTimeout(300);
}

/**
 * Switches to a specific filter view
 */
export async function switchFilter(page: Page, filter: 'all' | 'active' | 'completed'): Promise<void> {
  await page.getByTestId(`filter-${filter}`).click();
  
  // Wait for filter to apply
  await page.waitForTimeout(300);
}

/**
 * Gets all visible task items
 */
export function getVisibleTasks(page: Page): Locator {
  return page.locator('[data-testid^="task-item-"]');
}

/**
 * Gets a specific task by ID
 */
export function getTask(page: Page, taskId: string): Locator {
  return page.getByTestId(`task-item-${taskId}`);
}

/**
 * Gets the task count for a specific filter
 */
export async function getTaskCount(page: Page, filter: 'all' | 'active' | 'completed'): Promise<number> {
  const countElement = page.getByTestId(`task-count-${filter}`);
  const text = await countElement.textContent();
  
  // Extract number from text like "5 tasks" or "1 task"
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Waits for a task to appear in the DOM
 */
export async function waitForTask(page: Page, taskId: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(`[data-testid="task-item-${taskId}"]`, { timeout });
}

/**
 * Waits for a task to disappear from the DOM
 */
export async function waitForTaskRemoval(page: Page, taskId: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(`[data-testid="task-item-${taskId}"]`, { state: 'detached', timeout });
}

/**
 * Drags a task to a different column (if drag-and-drop is supported)
 */
export async function dragTaskToColumn(
  page: Page,
  taskId: string,
  targetColumn: 'todo' | 'in-progress' | 'completed'
): Promise<void> {
  const taskElement = page.getByTestId(`task-item-${taskId}`);
  const columnElement = page.getByTestId(`task-column-${targetColumn}`);
  
  await taskElement.dragTo(columnElement);
  
  // Wait for animation
  await page.waitForTimeout(500);
}

