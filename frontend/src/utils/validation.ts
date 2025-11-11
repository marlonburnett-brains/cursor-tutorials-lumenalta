import { Task } from '../types/task';

/**
 * Validation Error Interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate task content
 * 
 * Rules:
 * - Minimum 2 characters (after trimming)
 * - Maximum 2000 characters
 * - Content must not be empty after trimming whitespace
 * 
 * @param content - The raw task content to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateTaskContent(content: string): ValidationResult {
  const trimmedContent = content.trim();

  // Empty content check
  if (trimmedContent.length === 0) {
    return {
      isValid: false,
      error: 'Task content cannot be empty',
    };
  }

  // Minimum length check
  if (trimmedContent.length < 2) {
    return {
      isValid: false,
      error: 'Task content must be at least 2 characters',
    };
  }

  // Maximum length check
  if (trimmedContent.length > 2000) {
    return {
      isValid: false,
      error: 'Task content must not exceed 2000 characters',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Check if a task is a duplicate based on first line comparison
 * 
 * Duplicate detection rules:
 * - Compare first line of new content with first line of existing tasks
 * - Case-insensitive comparison
 * - Whitespace is trimmed before comparison
 * 
 * @param content - The new task content to check
 * @param existingTasks - Array of existing tasks to check against
 * @returns true if duplicate found, false otherwise
 */
export function isDuplicateTask(
  content: string,
  existingTasks: Task[]
): boolean {
  const newFirstLine = content.trim().split('\n')[0].trim().toLowerCase();

  if (newFirstLine.length === 0) {
    return false;
  }

  return existingTasks.some((task) => {
    const existingFirstLine = task.content
      .trim()
      .split('\n')[0]
      .trim()
      .toLowerCase();
    return existingFirstLine === newFirstLine;
  });
}

/**
 * Check if a task is a duplicate when editing (exclude current task from check)
 * 
 * @param content - The edited task content to check
 * @param currentTaskId - ID of the task being edited (to exclude from check)
 * @param existingTasks - Array of existing tasks to check against
 * @returns true if duplicate found, false otherwise
 */
export function isDuplicateTaskExcludingCurrent(
  content: string,
  currentTaskId: string,
  existingTasks: Task[]
): boolean {
  const otherTasks = existingTasks.filter((task) => task.id !== currentTaskId);
  return isDuplicateTask(content, otherTasks);
}

