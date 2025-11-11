/**
 * Task routes
 * Handles all task-related API endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../services/taskService';
import { validateBody, validateContentField, validateStatusField } from '../middleware/validator';

const router = Router();

/**
 * GET /tasks
 * Get all tasks, optionally filtered by status
 * Query params: status (optional) - filter by 'todo', 'in-progress', or 'completed'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const tasks = getAllTasks(status as string | undefined);
    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /tasks
 * Create a new task
 * Body: { content: string }
 */
router.post(
  '/',
  validateBody,
  validateContentField,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content } = req.body;
      const task = await createTask(content);
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /tasks/:id
 * Update a task (content and/or status)
 * Body: { content?: string, status?: string }
 */
router.put(
  '/:id',
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { content, status } = req.body;
      const task = await updateTask(id, { content, status });
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /tasks/:id
 * Partially update a task
 * Body: { content?: string, status?: string }
 */
router.patch(
  '/:id',
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { content, status } = req.body;
      const task = await updateTask(id, { content, status });
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /tasks/:id/status
 * Update only the status of a task
 * Body: { status: string }
 */
router.patch(
  '/:id/status',
  validateBody,
  validateStatusField,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const task = await updateTaskStatus(id, status);
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await deleteTask(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

