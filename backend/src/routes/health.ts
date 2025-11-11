/**
 * Health check route
 * Provides a simple endpoint to verify the server is running
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Returns 200 with { status: 'ok', timestamp } if server is running
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

export default router;

