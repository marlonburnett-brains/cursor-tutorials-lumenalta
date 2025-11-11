/**
 * Task data model
 * This interface defines the core task structure stored in the backend.
 * The backend does NOT store title or description fields - these are
 * frontend-only derived values parsed from the content field.
 */
export interface Task {
  /** Unique identifier generated via crypto.randomUUID() */
  id: string;

  /** Task content (2-2000 characters after trimming) */
  content: string;

  /** Task status in the Kanban workflow */
  status: 'todo' | 'in-progress' | 'completed';

  /** Creation timestamp in milliseconds (Unix epoch via Date.now()) */
  createdAt: number;
}

/**
 * Valid status values for task workflow
 */
export const TASK_STATUSES = ['todo', 'in-progress', 'completed'] as const;

/**
 * Type for valid task status values
 */
export type TaskStatus = (typeof TASK_STATUSES)[number];

