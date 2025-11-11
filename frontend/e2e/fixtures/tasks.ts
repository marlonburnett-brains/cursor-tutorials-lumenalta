import { Page } from '@playwright/test';

/**
 * Test data fixtures for E2E tests
 */

export interface TaskFixture {
  id?: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt?: number;
}

export const testTasks: TaskFixture[] = [
  {
    title: 'Test Task 1',
    status: 'todo',
  },
  {
    title: 'Test Task 2',
    status: 'in-progress',
  },
  {
    title: 'Test Task 3',
    status: 'completed',
  },
];

/**
 * Seeds the backend with test data via API
 */
export async function seedTasks(baseURL: string, tasks: TaskFixture[]): Promise<void> {
  // Clear existing tasks first
  await clearTasks(baseURL);
  
  // Add test tasks via API
  for (const task of tasks) {
    const response = await fetch(`${baseURL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.title }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to seed task: ${task.title}`);
    }
    
    // If task needs to be in a different status, update it
    if (task.status !== 'todo') {
      const createdTask = await response.json();
      // For now, we'll handle status updates through the UI
      // Backend currently only supports completed toggle
      if (task.status === 'completed') {
        await fetch(`${baseURL}/tasks/${createdTask.id}/toggle`, {
          method: 'PATCH',
        });
      }
    }
  }
}

/**
 * Clears all tasks from the backend
 */
export async function clearTasks(baseURL: string): Promise<void> {
  // Get all tasks
  const response = await fetch(`${baseURL}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks for cleanup');
  }
  
  const tasks = await response.json();
  
  // Delete each task
  for (const task of tasks) {
    await fetch(`${baseURL}/tasks/${task.id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Clears local storage for the application
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Complete cleanup - clears both backend and frontend state
 */
export async function cleanupTestData(page: Page, apiBaseURL: string): Promise<void> {
  await clearTasks(apiBaseURL);
  await clearLocalStorage(page);
}

