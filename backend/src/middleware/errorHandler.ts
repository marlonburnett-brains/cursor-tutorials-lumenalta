/**
 * Global error handling middleware
 * Converts errors to structured JSON responses with appropriate status codes
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ERROR_CODES } from '../types/error';

/**
 * Error handler middleware
 * Must be registered last in the middleware chain
 */
export function errorHandler(
  err: Error & { status?: number; type?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Check if it's an AppError (our custom error)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle JSON parsing errors from body-parser
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    res.status(400).json({
      error: {
        message: 'Invalid JSON in request body',
        code: ERROR_CODES.VALIDATION_ERROR,
      },
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    error: {
      message: isProduction
        ? 'An unexpected error occurred'
        : err.message || 'An unexpected error occurred',
      code: ERROR_CODES.INTERNAL_ERROR,
    },
  });
}

