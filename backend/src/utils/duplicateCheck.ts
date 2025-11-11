/**
 * Duplicate detection utilities
 * Checks for duplicate tasks based on content
 */

import { Task } from '../types/task';

/**
 * Extract the first line from content
 * Used for duplicate detection on multi-line content
 */
export function extractFirstLine(content: string): string {
  return content.trim().split('\n')[0].trim();
}

/**
 * Check if a task with similar content already exists
 * Comparison is case-insensitive and only compares the first line
 * 
 * @param content - Content to check for duplicates
 * @param tasks - Existing tasks to compare against
 * @param excludeId - Optional task ID to exclude from comparison (for updates)
 * @returns true if a duplicate is found, false otherwise
 */
export function isDuplicateTask(
  content: string,
  tasks: Task[],
  excludeId?: string
): boolean {
  // Extract and normalize the first line of the new content
  const firstLine = extractFirstLine(content).toLowerCase();

  // Check each existing task
  return tasks.some(task => {
    // Skip the task if it's the one being updated
    if (excludeId && task.id === excludeId) {
      return false;
    }

    // Extract and normalize the first line of the existing task
    const existingFirstLine = extractFirstLine(task.content).toLowerCase();

    // Compare first lines
    return firstLine === existingFirstLine;
  });
}

