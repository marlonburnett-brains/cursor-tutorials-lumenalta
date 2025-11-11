/**
 * Task Status Type
 * Represents the three states a task can be in
 */
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

/**
 * Task Interface
 * Core data structure for a task
 * 
 * Note: title and description are NOT stored here.
 * They are derived dynamically from the content field using parseTaskContent()
 */
export interface Task {
  /** Unique identifier (generated via crypto.randomUUID()) */
  id: string;
  
  /** Single source of truth for task text content */
  content: string;
  
  /** Current status of the task */
  status: TaskStatus;
  
  /** Timestamp when task was created (Date.now()) */
  createdAt: number;
}

/**
 * Parsed Task Content
 * Result of parsing the content field
 */
export interface ParsedTaskContent {
  /** Optional title (derived from first line if conditions met) */
  title: string | null;
  
  /** Description text (either full content or remaining lines after title) */
  description: string;
}

