/**
 * Error types and codes for the application
 * Provides structured error handling with consistent error codes
 */

/**
 * Error code constants used throughout the application
 */
export const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_STATUS: 'INVALID_STATUS',
  INVALID_UUID: 'INVALID_UUID',
  MISSING_FIELD: 'MISSING_FIELD',
  CONTENT_TOO_SHORT: 'CONTENT_TOO_SHORT',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',

  // Not found errors (404)
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',

  // Conflict errors (409)
  DUPLICATE_TASK: 'DUPLICATE_TASK',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;

/**
 * Type for error codes
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Custom application error class
 * Extends the standard Error class with additional properties for structured error handling
 */
export class AppError extends Error {
  /**
   * Create a new application error
   * @param code - Error code constant
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   * @param field - Optional field name that caused the error
   */
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.field && { field: this.field }),
      },
    };
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(ERROR_CODES.VALIDATION_ERROR, message, 400, field);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(ERROR_CODES.TASK_NOT_FOUND, message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, field?: string) {
    super(ERROR_CODES.DUPLICATE_TASK, message, 409, field);
    this.name = 'ConflictError';
  }
}

/**
 * Internal server error (500)
 */
export class InternalError extends AppError {
  constructor(message: string = 'An unexpected error occurred') {
    super(ERROR_CODES.INTERNAL_ERROR, message, 500);
    this.name = 'InternalError';
  }
}

