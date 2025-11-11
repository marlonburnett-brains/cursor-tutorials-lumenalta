/**
 * Task Service
 * Core business logic for task CRUD operations
 * Maintains in-memory cache and persists to storage
 */

import { Task } from '../types/task';
import { AppError, ERROR_CODES, NotFoundError, ConflictError } from '../types/error';
import { validateContent, validateStatus, validateUUID } from '../utils/validation';
import { isDuplicateTask } from '../utils/duplicateCheck';
import * as storageService from './storageService';

/**
 * In-memory task cache
 * Loaded from storage on startup and kept in sync
 */
let tasksCache: Task[] = [];

/**
 * Initialize the task service by loading tasks from storage
 * Should be called once on application startup
 */
export async function loadTasksFromStorage(): Promise<void> {
  try {
    tasksCache = await storageService.loadTasks();
  } catch (error) {
    console.error('Failed to load tasks from storage:', error);
    throw new AppError(
      ERROR_CODES.STORAGE_ERROR,
      'Failed to load tasks from storage',
      500
    );
  }
}

/**
 * Clear the task cache (useful for testing)
 * Resets the in-memory cache to an empty array
 */
export function clearTaskCache(): void {
  tasksCache = [];
}

/**
 * Persist current tasks to storage
 * Called after each create/update/delete operation
 */
async function persistTasks(): Promise<void> {
  try {
    await storageService.saveTasks(tasksCache);
  } catch (error) {
    console.error('Failed to persist tasks to storage:', error);
    throw new AppError(
      ERROR_CODES.STORAGE_ERROR,
      'Failed to save tasks to storage',
      500
    );
  }
}

/**
 * Get all tasks, optionally filtered by status
 * Tasks are always sorted by createdAt descending (newest first)
 * @param status - Optional status filter
 * @returns Array of tasks
 */
export function getAllTasks(status?: string): Task[] {
  let tasks = [...tasksCache];

  // Filter by status if provided
  if (status) {
    // Validate status
    const validStatus = validateStatus(status);
    tasks = tasks.filter(task => task.status === validStatus);
  }

  // Sort by createdAt descending (newest first)
  tasks.sort((a, b) => b.createdAt - a.createdAt);

  return tasks;
}

/**
 * Create a new task
 * @param content - Task content (will be trimmed and validated)
 * @returns The created task
 */
export async function createTask(content: string): Promise<Task> {
  // Validate and trim content
  const trimmedContent = validateContent(content);

  // Check for duplicates
  if (isDuplicateTask(trimmedContent, tasksCache)) {
    throw new ConflictError(
      'A task with this content already exists',
      'content'
    );
  }

  // Create new task
  const newTask: Task = {
    id: crypto.randomUUID(),
    content: trimmedContent,
    status: 'todo',
    createdAt: Date.now(),
  };

  // Add to cache
  tasksCache.push(newTask);

  // Persist to storage
  await persistTasks();

  return newTask;
}

/**
 * Update a task
 * @param id - Task ID
 * @param updates - Fields to update (content and/or status)
 * @returns The updated task
 */
export async function updateTask(
  id: string,
  updates: { content?: string; status?: string }
): Promise<Task> {
  // Validate ID
  validateUUID(id);

  // Find task
  const taskIndex = tasksCache.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    throw new NotFoundError(`Task with ID ${id} not found`);
  }

  const task = tasksCache[taskIndex];

  // Validate and apply updates
  if (updates.content !== undefined) {
    const trimmedContent = validateContent(updates.content);

    // Check for duplicates (excluding current task)
    if (isDuplicateTask(trimmedContent, tasksCache, id)) {
      throw new ConflictError(
        'A task with this content already exists',
        'content'
      );
    }

    task.content = trimmedContent;
  }

  if (updates.status !== undefined) {
    task.status = validateStatus(updates.status);
  }

  // Update cache
  tasksCache[taskIndex] = task;

  // Persist to storage
  await persistTasks();

  return task;
}

/**
 * Update only the status of a task
 * @param id - Task ID
 * @param status - New status
 * @returns The updated task
 */
export async function updateTaskStatus(
  id: string,
  status: string
): Promise<Task> {
  // Validate inputs
  validateUUID(id);
  const validStatus = validateStatus(status);

  // Find task
  const taskIndex = tasksCache.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    throw new NotFoundError(`Task with ID ${id} not found`);
  }

  // Update status
  tasksCache[taskIndex].status = validStatus;

  // Persist to storage
  await persistTasks();

  return tasksCache[taskIndex];
}

/**
 * Delete a task
 * @param id - Task ID
 */
export async function deleteTask(id: string): Promise<void> {
  // Validate ID
  validateUUID(id);

  // Find task
  const taskIndex = tasksCache.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    throw new NotFoundError(`Task with ID ${id} not found`);
  }

  // Remove from cache
  tasksCache.splice(taskIndex, 1);

  // Persist to storage
  await persistTasks();
}

/**
 * Get a single task by ID (for testing purposes)
 */
export function getTaskById(id: string): Task | undefined {
  return tasksCache.find(task => task.id === id);
}

/**
 * Clear all tasks (for testing purposes)
 */
export async function clearAllTasks(): Promise<void> {
  tasksCache = [];
  await persistTasks();
}

/**
 * Get task count (for testing purposes)
 */
export function getTaskCount(): number {
  return tasksCache.length;
}

