/**
 * Custom API Error Types
 * 
 * Provides specific error classes for different API failure scenarios
 * to enable precise error handling and user feedback.
 */

/**
 * Base API Error class
 */
export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Network connectivity errors (no response from server)
 */
export class NetworkError extends APIError {
  constructor(message = 'Unable to connect to server. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Validation errors from the API (400 Bad Request)
 */
export class ValidationError extends APIError {
  constructor(message = 'Invalid request data.') {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Resource not found errors (404 Not Found)
 */
export class NotFoundError extends APIError {
  constructor(message = 'Task not found. It may have been deleted.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Server errors (500 Internal Server Error)
 */
export class ServerError extends APIError {
  constructor(message = 'Server error occurred. Please try again.') {
    super(message);
    this.name = 'ServerError';
  }
}

/**
 * Request timeout errors
 */
export class TimeoutError extends APIError {
  constructor(message = 'Request timed out. Please try again.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

