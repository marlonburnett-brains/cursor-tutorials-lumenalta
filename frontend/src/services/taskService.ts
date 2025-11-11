import { Task, TaskStatus } from '../types/task';
import { apiClient } from './apiClient';

/**
 * Task Service
 * 
 * Provides async API abstraction for task CRUD operations.
 * All methods use the centralized API client for backend communication.
 * 
 * API Response Formats:
 * - GET /tasks → { tasks: Task[] }
 * - POST /tasks → { task: Task }
 * - PATCH /tasks/:id → { task: Task }
 * - PATCH /tasks/:id/status → { task: Task }
 * - DELETE /tasks/:id → 204 No Content
 */

/**
 * Backend response format for task list
 */
interface TasksResponse {
  tasks: Task[];
}

/**
 * Backend response format for single task operations
 */
interface TaskResponse {
  task: Task;
}

/**
 * Get all tasks from the backend
 * 
 * @returns Promise<Task[]> - Array of all tasks
 */
export async function getTasks(): Promise<Task[]> {
  const response = await apiClient.get<TasksResponse>('/tasks');
  
  if (!response || !response.tasks) {
    return [];
  }
  
  return response.tasks;
}

/**
 * Create a new task
 * 
 * @param content - Task content string
 * @returns Promise<Task> - The created task
 */
export async function createTask(content: string): Promise<Task> {
  const response = await apiClient.post<TaskResponse>('/tasks', {
    content: content.trim(),
  });
  
  if (!response || !response.task) {
    throw new Error('Invalid response from server');
  }
  
  return response.task;
}

/**
 * Update an existing task
 * 
 * @param id - Task ID
 * @param updates - Partial task object with fields to update
 * @returns Promise<Task> - The updated task
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<Task> {
  const response = await apiClient.patch<TaskResponse>(`/tasks/${id}`, updates);
  
  if (!response || !response.task) {
    throw new Error('Invalid response from server');
  }
  
  return response.task;
}

/**
 * Update task status (convenience method for drag-and-drop)
 * 
 * @param id - Task ID
 * @param status - New status
 * @returns Promise<Task> - The updated task
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task> {
  const response = await apiClient.patch<TaskResponse>(`/tasks/${id}/status`, {
    status,
  });
  
  if (!response || !response.task) {
    throw new Error('Invalid response from server');
  }
  
  return response.task;
}

/**
 * Delete a task
 * 
 * @param id - Task ID
 * @returns Promise<void>
 */
export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

/**
 * Clear all tasks (useful for testing)
 * Note: This is a client-side utility to help with testing.
 * Consider implementing a backend endpoint for bulk operations if needed.
 * 
 * @returns Promise<void>
 */
export async function clearAllTasks(): Promise<void> {
  const tasks = await getTasks();
  await Promise.all(tasks.map((task) => deleteTask(task.id)));
}
