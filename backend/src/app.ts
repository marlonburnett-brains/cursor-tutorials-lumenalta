/**
 * Express application setup
 * Configures middleware, routes, and error handling
 */

import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import taskRoutes from './routes/tasks';
import { loadConfig } from './config';

/**
 * Create and configure Express application
 * @param corsOrigin - CORS origin to allow (e.g., http://localhost:5173)
 * @returns Configured Express application
 */
export function createApp(corsOrigin: string): Application {
  const app = express();

  // Body parser middleware
  app.use(express.json());

  // CORS configuration
  app.use(
    cors({
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Mount routes
  app.use('/health', healthRoutes);
  app.use('/tasks', taskRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Default app instance for testing
 * Uses configuration from loadConfig()
 */
const config = loadConfig();
export const app = createApp(config.corsOrigin);

