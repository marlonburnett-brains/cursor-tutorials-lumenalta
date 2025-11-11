/**
 * Unit tests for Task Service
 * Mocks the storage layer to test business logic in isolation
 */

import { vi } from 'vitest';
import {
  getAllTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  loadTasksFromStorage,
  getTaskById,
  getTaskCount,
} from './taskService';
import * as storageService from './storageService';
import { ERROR_CODES } from '../types/error';

// Mock the storage service
vi.mock('./storageService');

describe('TaskService', () => {
  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Mock loadTasks to return empty array by default
    (storageService.loadTasks as any).mockResolvedValue([]);
    (storageService.saveTasks as any).mockResolvedValue(undefined);

    // Load empty tasks to start each test with clean state
    await loadTasksFromStorage();
  });

  describe('loadTasksFromStorage', () => {
    it('should load tasks from storage on initialization', async () => {
      const mockTasks = [
        {
          id: 'test-id-1',
          content: 'Test task 1',
          status: 'todo' as const,
          createdAt: Date.now(),
        },
      ];

      (storageService.loadTasks as any).mockResolvedValue(mockTasks);

      await loadTasksFromStorage();

      expect(storageService.loadTasks).toHaveBeenCalled();
      expect(getAllTasks()).toEqual(mockTasks);
    });

    it('should throw error if storage fails', async () => {
      (storageService.loadTasks as any).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(loadTasksFromStorage()).rejects.toThrow();
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array when no tasks exist', () => {
      const tasks = getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks sorted by newest first', async () => {
      const task1 = await createTask('First task');
      await new Promise(resolve => setTimeout(resolve, 10));
      const task2 = await createTask('Second task');
      await new Promise(resolve => setTimeout(resolve, 10));
      const task3 = await createTask('Third task');

      const tasks = getAllTasks();

      expect(tasks).toHaveLength(3);
      expect(tasks[0].id).toBe(task3.id); // Newest first
      expect(tasks[1].id).toBe(task2.id);
      expect(tasks[2].id).toBe(task1.id); // Oldest last
    });

    it('should filter tasks by status: todo', async () => {
      const task1 = await createTask('Todo task');
      const task2 = await createTask('Second task');
      await updateTaskStatus(task2.id, 'in-progress');

      const tasks = getAllTasks('todo');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(task1.id);
      expect(tasks[0].status).toBe('todo');
    });

    it('should filter tasks by status: in-progress', async () => {
      await createTask('First task');
      const task2 = await createTask('Second task');
      await updateTaskStatus(task2.id, 'in-progress');

      const tasks = getAllTasks('in-progress');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(task2.id);
      expect(tasks[0].status).toBe('in-progress');
    });

    it('should filter tasks by status: completed', async () => {
      await createTask('First task');
      const task2 = await createTask('Second task');
      await updateTaskStatus(task2.id, 'completed');

      const tasks = getAllTasks('completed');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(task2.id);
      expect(tasks[0].status).toBe('completed');
    });

    it('should throw error for invalid status', () => {
      expect(() => getAllTasks('invalid')).toThrow();
      expect(() => getAllTasks('invalid')).toThrow('Status must be one of');
    });

    it('should return sorted tasks when filtering by status', async () => {
      const task1 = await createTask('First todo');
      await new Promise(resolve => setTimeout(resolve, 10));
      const task2 = await createTask('Second todo');

      const tasks = getAllTasks('todo');

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe(task2.id); // Newest first
      expect(tasks[1].id).toBe(task1.id);
    });
  });

  describe('createTask', () => {
    it('should create a task with valid content', async () => {
      const task = await createTask('Buy groceries');

      expect(task).toMatchObject({
        content: 'Buy groceries',
        status: 'todo',
      });
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(storageService.saveTasks).toHaveBeenCalled();
    });

    it('should trim content before creating', async () => {
      const task = await createTask('  Buy groceries  ');

      expect(task.content).toBe('Buy groceries');
    });

    it('should generate unique UUID for task ID', async () => {
      const task1 = await createTask('Task 1');
      const task2 = await createTask('Task 2');

      expect(task1.id).not.toBe(task2.id);
      expect(task1.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should set status to todo by default', async () => {
      const task = await createTask('New task');

      expect(task.status).toBe('todo');
    });

    it('should set createdAt timestamp', async () => {
      const before = Date.now();
      const task = await createTask('New task');
      const after = Date.now();

      expect(task.createdAt).toBeGreaterThanOrEqual(before);
      expect(task.createdAt).toBeLessThanOrEqual(after);
    });

    it('should throw error for content too short', async () => {
      await expect(createTask('a')).rejects.toThrow('at least 2 characters');
      try {
        await createTask('a');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.CONTENT_TOO_SHORT);
      }
    });

    it('should throw error for content too long', async () => {
      const longContent = 'a'.repeat(2001);
      await expect(createTask(longContent)).rejects.toThrow('must not exceed');
      try {
        await createTask(longContent);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.CONTENT_TOO_LONG);
      }
    });

    it('should throw error for duplicate content', async () => {
      await createTask('Buy groceries');

      await expect(createTask('Buy groceries')).rejects.toThrow(
        'already exists'
      );
      try {
        await createTask('Buy groceries');
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.DUPLICATE_TASK);
      }
    });

    it('should detect duplicate case-insensitively', async () => {
      await createTask('Buy groceries');

      await expect(createTask('BUY GROCERIES')).rejects.toThrow(
        'already exists'
      );
    });

    it('should detect duplicate on first line only', async () => {
      await createTask('Buy groceries\nMilk\nEggs');

      await expect(
        createTask('Buy groceries\nBread\nCheese')
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateTask', () => {
    it('should update task content', async () => {
      const task = await createTask('Original content');

      const updated = await updateTask(task.id, {
        content: 'Updated content',
      });

      expect(updated.content).toBe('Updated content');
      expect(updated.id).toBe(task.id);
      expect(updated.createdAt).toBe(task.createdAt);
      expect(storageService.saveTasks).toHaveBeenCalledTimes(2); // Create + update
    });

    it('should update task status', async () => {
      const task = await createTask('Test task');

      const updated = await updateTask(task.id, { status: 'in-progress' });

      expect(updated.status).toBe('in-progress');
      expect(updated.content).toBe(task.content);
    });

    it('should update both content and status', async () => {
      const task = await createTask('Original content');

      const updated = await updateTask(task.id, {
        content: 'New content',
        status: 'completed',
      });

      expect(updated.content).toBe('New content');
      expect(updated.status).toBe('completed');
    });

    it('should preserve id and createdAt', async () => {
      const task = await createTask('Original content');

      const updated = await updateTask(task.id, {
        content: 'New content',
        status: 'completed',
      });

      expect(updated.id).toBe(task.id);
      expect(updated.createdAt).toBe(task.createdAt);
    });

    it('should trim content when updating', async () => {
      const task = await createTask('Original content');

      const updated = await updateTask(task.id, {
        content: '  New content  ',
      });

      expect(updated.content).toBe('New content');
    });

    it('should throw error for invalid task ID', async () => {
      await expect(
        updateTask('not-a-uuid', { content: 'New content' })
      ).rejects.toThrow('valid UUID');
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(
        updateTask(fakeId, { content: 'New content' })
      ).rejects.toThrow('not found');
      try {
        await updateTask(fakeId, { content: 'New content' });
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.TASK_NOT_FOUND);
      }
    });

    it('should throw error for duplicate content', async () => {
      await createTask('Task 1');
      const task2 = await createTask('Task 2');

      await expect(
        updateTask(task2.id, { content: 'Task 1' })
      ).rejects.toThrow('already exists');
    });

    it('should allow updating to same content', async () => {
      const task = await createTask('Task content');

      const updated = await updateTask(task.id, {
        content: 'Task content',
      });

      expect(updated.content).toBe('Task content');
    });

    it('should throw error for invalid status', async () => {
      const task = await createTask('Test task');

      await expect(
        updateTask(task.id, { status: 'invalid' })
      ).rejects.toThrow('Status must be one of');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update only the status', async () => {
      const task = await createTask('Test task');

      const updated = await updateTaskStatus(task.id, 'in-progress');

      expect(updated.status).toBe('in-progress');
      expect(updated.content).toBe(task.content);
      expect(updated.id).toBe(task.id);
      expect(updated.createdAt).toBe(task.createdAt);
    });

    it('should throw error for invalid status', async () => {
      const task = await createTask('Test task');

      await expect(updateTaskStatus(task.id, 'invalid')).rejects.toThrow(
        'Status must be one of'
      );
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(updateTaskStatus(fakeId, 'completed')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const task = await createTask('Task to delete');

      await deleteTask(task.id);

      expect(getTaskById(task.id)).toBeUndefined();
      expect(getTaskCount()).toBe(0);
      expect(storageService.saveTasks).toHaveBeenCalledTimes(2); // Create + delete
    });

    it('should throw error for invalid task ID', async () => {
      await expect(deleteTask('not-a-uuid')).rejects.toThrow('valid UUID');
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(deleteTask(fakeId)).rejects.toThrow('not found');
      try {
        await deleteTask(fakeId);
      } catch (error: any) {
        expect(error.code).toBe(ERROR_CODES.TASK_NOT_FOUND);
      }
    });

    it('should not affect other tasks', async () => {
      const task1 = await createTask('Task 1');
      const task2 = await createTask('Task 2');
      const task3 = await createTask('Task 3');

      await deleteTask(task2.id);

      const tasks = getAllTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks.some(t => t.id === task1.id)).toBe(true);
      expect(tasks.some(t => t.id === task2.id)).toBe(false);
      expect(tasks.some(t => t.id === task3.id)).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // Create
      const task = await createTask('New task');
      expect(getTaskCount()).toBe(1);

      // Read
      const tasks = getAllTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(task.id);

      // Update
      const updated = await updateTask(task.id, {
        content: 'Updated task',
        status: 'completed',
      });
      expect(updated.content).toBe('Updated task');
      expect(updated.status).toBe('completed');

      // Delete
      await deleteTask(task.id);
      expect(getTaskCount()).toBe(0);
    });

    it('should maintain correct count with multiple operations', async () => {
      await createTask('Task 1');
      await createTask('Task 2');
      expect(getTaskCount()).toBe(2);

      await createTask('Task 3');
      expect(getTaskCount()).toBe(3);

      const tasks = getAllTasks();
      await deleteTask(tasks[0].id);
      expect(getTaskCount()).toBe(2);
    });
  });
});

