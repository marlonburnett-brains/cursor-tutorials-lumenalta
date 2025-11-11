/**
 * Request validation middleware
 * Validates request bodies and parameters
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ERROR_CODES } from '../types/error';

/**
 * Middleware to validate request body exists
 */
export function validateBody(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.body || typeof req.body !== 'object') {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'Request body is required',
      400
    );
  }
  next();
}

/**
 * Middleware to validate content field in request body
 */
export function validateContentField(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.body.content) {
    throw new AppError(
      ERROR_CODES.MISSING_FIELD,
      'Content field is required',
      400,
      'content'
    );
  }
  next();
}

/**
 * Middleware to validate status field in request body
 */
export function validateStatusField(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.body.status) {
    throw new AppError(
      ERROR_CODES.MISSING_FIELD,
      'Status field is required',
      400,
      'status'
    );
  }
  next();
}

