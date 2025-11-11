import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as taskService from './taskService';
import { apiClient } from './apiClient';
import { Task } from '../types/task';

/**
 * Unit tests for Task Service
 * 
 * Tests cover:
 * - Mock the API client module
 * - Test each CRUD operation with mocked responses
 * - Test error propagation from API to service layer
 * - Verify correct endpoint URLs and request bodies
 */

// Mock the apiClient module
vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch all tasks from API', async () => {
      const mockTasks: Task[] = [
        { id: '1', content: 'Task 1', status: 'todo', createdAt: Date.now() },
        { id: '2', content: 'Task 2', status: 'in-progress', createdAt: Date.now() },
      ];

      (apiClient.get as any).mockResolvedValueOnce({ tasks: mockTasks });

      const result = await taskService.getTasks();

      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks exist', async () => {
      (apiClient.get as any).mockResolvedValueOnce({ tasks: [] });

      const result = await taskService.getTasks();

      expect(result).toEqual([]);
    });

    it('should return empty array when response is null', async () => {
      (apiClient.get as any).mockResolvedValueOnce(null);

      const result = await taskService.getTasks();

      expect(result).toEqual([]);
    });

    it('should return empty array when response has no tasks field', async () => {
      (apiClient.get as any).mockResolvedValueOnce({});

      const result = await taskService.getTasks();

      expect(result).toEqual([]);
    });

    it('should propagate errors from API client', async () => {
      const error = new Error('Network error');
      (apiClient.get as any).mockRejectedValueOnce(error);

      await expect(taskService.getTasks()).rejects.toThrow('Network error');
    });
  });

  describe('createTask', () => {
    it('should create a new task via API', async () => {
      const content = 'New task';
      const mockTask: Task = {
        id: '123',
        content: 'New task',
        status: 'todo',
        createdAt: Date.now(),
      };

      (apiClient.post as any).mockResolvedValueOnce({ task: mockTask });

      const result = await taskService.createTask(content);

      expect(apiClient.post).toHaveBeenCalledWith('/tasks', {
        content: 'New task',
      });
      expect(result).toEqual(mockTask);
    });

    it('should trim content before sending to API', async () => {
      const content = '  Task with spaces  ';
      const mockTask: Task = {
        id: '123',
        content: 'Task with spaces',
        status: 'todo',
        createdAt: Date.now(),
      };

      (apiClient.post as any).mockResolvedValueOnce({ task: mockTask });

      await taskService.createTask(content);

      expect(apiClient.post).toHaveBeenCalledWith('/tasks', {
        content: 'Task with spaces',
      });
    });

    it('should throw error when response is invalid', async () => {
      (apiClient.post as any).mockResolvedValueOnce(null);

      await expect(taskService.createTask('Test')).rejects.toThrow('Invalid response from server');
    });

    it('should throw error when response has no task field', async () => {
      (apiClient.post as any).mockResolvedValueOnce({});

      await expect(taskService.createTask('Test')).rejects.toThrow('Invalid response from server');
    });

    it('should propagate errors from API client', async () => {
      const error = new Error('Validation error');
      (apiClient.post as any).mockRejectedValueOnce(error);

      await expect(taskService.createTask('Test')).rejects.toThrow('Validation error');
    });
  });

  describe('updateTask', () => {
    it('should update a task via API', async () => {
      const taskId = '123';
      const updates = { content: 'Updated content' };
      const mockTask: Task = {
        id: '123',
        content: 'Updated content',
        status: 'todo',
        createdAt: Date.now(),
      };

      (apiClient.patch as any).mockResolvedValueOnce({ task: mockTask });

      const result = await taskService.updateTask(taskId, updates);

      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/123', updates);
      expect(result).toEqual(mockTask);
    });

    it('should handle partial updates', async () => {
      const taskId = '123';
      const updates = { status: 'completed' as const };
      const mockTask: Task = {
        id: '123',
        content: 'Original content',
        status: 'completed',
        createdAt: Date.now(),
      };

      (apiClient.patch as any).mockResolvedValueOnce({ task: mockTask });

      const result = await taskService.updateTask(taskId, updates);

      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/123', { status: 'completed' });
      expect(result).toEqual(mockTask);
    });

    it('should throw error when response is invalid', async () => {
      (apiClient.patch as any).mockResolvedValueOnce(null);

      await expect(taskService.updateTask('123', { content: 'Test' })).rejects.toThrow('Invalid response from server');
    });

    it('should propagate errors from API client', async () => {
      const error = new Error('Not found');
      (apiClient.patch as any).mockRejectedValueOnce(error);

      await expect(taskService.updateTask('999', { content: 'Test' })).rejects.toThrow('Not found');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status via API', async () => {
      const taskId = '123';
      const status = 'completed' as const;
      const mockTask: Task = {
        id: '123',
        content: 'Task content',
        status: 'completed',
        createdAt: Date.now(),
      };

      (apiClient.patch as any).mockResolvedValueOnce({ task: mockTask });

      const result = await taskService.updateTaskStatus(taskId, status);

      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/123/status', { status: 'completed' });
      expect(result).toEqual(mockTask);
    });

    it('should handle all status values', async () => {
      const statuses: Array<'todo' | 'in-progress' | 'completed'> = ['todo', 'in-progress', 'completed'];
      
      for (const status of statuses) {
        const mockTask: Task = {
          id: '123',
          content: 'Task',
          status,
          createdAt: Date.now(),
        };

        (apiClient.patch as any).mockResolvedValueOnce({ task: mockTask });

        await taskService.updateTaskStatus('123', status);

        expect(apiClient.patch).toHaveBeenCalledWith('/tasks/123/status', { status });
      }
    });

    it('should throw error when response is invalid', async () => {
      (apiClient.patch as any).mockResolvedValueOnce(null);

      await expect(taskService.updateTaskStatus('123', 'completed')).rejects.toThrow('Invalid response from server');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task via API', async () => {
      const taskId = '123';
      (apiClient.delete as any).mockResolvedValueOnce(null);

      await taskService.deleteTask(taskId);

      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/123');
    });

    it('should handle successful deletion with no return value', async () => {
      (apiClient.delete as any).mockResolvedValueOnce(null);

      await expect(taskService.deleteTask('123')).resolves.toBeUndefined();
    });

    it('should propagate errors from API client', async () => {
      const error = new Error('Not found');
      (apiClient.delete as any).mockRejectedValueOnce(error);

      await expect(taskService.deleteTask('999')).rejects.toThrow('Not found');
    });
  });

  describe('clearAllTasks', () => {
    it('should delete all tasks by calling deleteTask for each', async () => {
      const mockTasks: Task[] = [
        { id: '1', content: 'Task 1', status: 'todo', createdAt: Date.now() },
        { id: '2', content: 'Task 2', status: 'in-progress', createdAt: Date.now() },
        { id: '3', content: 'Task 3', status: 'completed', createdAt: Date.now() },
      ];

      (apiClient.get as any).mockResolvedValueOnce({ tasks: mockTasks });
      (apiClient.delete as any).mockResolvedValue(null);

      await taskService.clearAllTasks();

      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
      expect(apiClient.delete).toHaveBeenCalledTimes(3);
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/2');
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/3');
    });

    it('should handle empty task list', async () => {
      (apiClient.get as any).mockResolvedValueOnce({ tasks: [] });

      await taskService.clearAllTasks();

      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it('should propagate errors from getTasks', async () => {
      const error = new Error('Network error');
      (apiClient.get as any).mockRejectedValueOnce(error);

      await expect(taskService.clearAllTasks()).rejects.toThrow('Network error');
    });

    it('should propagate errors from deleteTask', async () => {
      const mockTasks: Task[] = [
        { id: '1', content: 'Task 1', status: 'todo', createdAt: Date.now() },
      ];

      (apiClient.get as any).mockResolvedValueOnce({ tasks: mockTasks });
      (apiClient.delete as any).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(taskService.clearAllTasks()).rejects.toThrow('Delete failed');
    });
  });

  describe('Endpoint URLs', () => {
    it('should use correct endpoint for getTasks', async () => {
      (apiClient.get as any).mockResolvedValueOnce({ tasks: [] });
      await taskService.getTasks();
      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
    });

    it('should use correct endpoint for createTask', async () => {
      (apiClient.post as any).mockResolvedValueOnce({ task: { id: '1', content: 'Test', status: 'todo', createdAt: Date.now() } });
      await taskService.createTask('Test');
      expect(apiClient.post).toHaveBeenCalledWith('/tasks', expect.any(Object));
    });

    it('should use correct endpoint for updateTask', async () => {
      (apiClient.patch as any).mockResolvedValueOnce({ task: { id: '123', content: 'Test', status: 'todo', createdAt: Date.now() } });
      await taskService.updateTask('123', { content: 'Test' });
      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/123', expect.any(Object));
    });

    it('should use correct endpoint for updateTaskStatus', async () => {
      (apiClient.patch as any).mockResolvedValueOnce({ task: { id: '123', content: 'Test', status: 'completed', createdAt: Date.now() } });
      await taskService.updateTaskStatus('123', 'completed');
      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/123/status', expect.any(Object));
    });

    it('should use correct endpoint for deleteTask', async () => {
      (apiClient.delete as any).mockResolvedValueOnce(null);
      await taskService.deleteTask('123');
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/123');
    });
  });
});

