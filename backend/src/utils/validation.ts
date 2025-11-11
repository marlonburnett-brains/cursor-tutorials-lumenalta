/**
 * Validation utilities
 * Provides validation functions for task data
 */

import { TASK_STATUSES, TaskStatus } from '../types/task';
import { AppError, ERROR_CODES } from '../types/error';

/**
 * Content validation constraints
 */
export const CONTENT_MIN_LENGTH = 2;
export const CONTENT_MAX_LENGTH = 2000;

/**
 * UUID v4 regex pattern
 * Matches standard UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Trim whitespace from content
 * Removes leading and trailing whitespace
 */
export function trimContent(content: string): string {
  return content.trim();
}

/**
 * Validate task content
 * Checks that content is between 2 and 2000 characters after trimming
 * @throws AppError if validation fails
 */
export function validateContent(content: unknown): string {
  // Check if content is provided
  if (content === undefined || content === null) {
    throw new AppError(
      ERROR_CODES.MISSING_FIELD,
      'Content field is required',
      400,
      'content'
    );
  }

  // Check if content is a string
  if (typeof content !== 'string') {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'Content must be a string',
      400,
      'content'
    );
  }

  // Trim content
  const trimmedContent = trimContent(content);

  // Check minimum length
  if (trimmedContent.length < CONTENT_MIN_LENGTH) {
    throw new AppError(
      ERROR_CODES.CONTENT_TOO_SHORT,
      `Content must be at least ${CONTENT_MIN_LENGTH} characters after trimming`,
      400,
      'content'
    );
  }

  // Check maximum length
  if (trimmedContent.length > CONTENT_MAX_LENGTH) {
    throw new AppError(
      ERROR_CODES.CONTENT_TOO_LONG,
      `Content must not exceed ${CONTENT_MAX_LENGTH} characters`,
      400,
      'content'
    );
  }

  return trimmedContent;
}

/**
 * Validate task status
 * Checks that status is one of the valid values (case-sensitive)
 * @throws AppError if validation fails
 */
export function validateStatus(status: unknown): TaskStatus {
  // Check if status is provided
  if (status === undefined || status === null) {
    throw new AppError(
      ERROR_CODES.MISSING_FIELD,
      'Status field is required',
      400,
      'status'
    );
  }

  // Check if status is a string
  if (typeof status !== 'string') {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'Status must be a string',
      400,
      'status'
    );
  }

  // Check if status is valid (case-sensitive)
  if (!TASK_STATUSES.includes(status as TaskStatus)) {
    throw new AppError(
      ERROR_CODES.INVALID_STATUS,
      `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      400,
      'status'
    );
  }

  return status as TaskStatus;
}

/**
 * Validate UUID format
 * Checks that ID is a valid UUID v4 format
 * @throws AppError if validation fails
 */
export function validateUUID(id: unknown): string {
  // Check if ID is provided
  if (id === undefined || id === null) {
    throw new AppError(
      ERROR_CODES.MISSING_FIELD,
      'ID field is required',
      400,
      'id'
    );
  }

  // Check if ID is a string
  if (typeof id !== 'string') {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'ID must be a string',
      400,
      'id'
    );
  }

  // Check UUID format
  if (!UUID_V4_REGEX.test(id)) {
    throw new AppError(
      ERROR_CODES.INVALID_UUID,
      'Task ID must be a valid UUID',
      400,
      'id'
    );
  }

  return id;
}

/**
 * Validate that a field is not empty
 */
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new AppError(
      ERROR_CODES.MISSING_FIELD,
      `${fieldName} field is required`,
      400,
      fieldName
    );
  }
}

