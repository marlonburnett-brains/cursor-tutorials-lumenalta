import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as taskService from '../../src/services/taskService';
import { Task } from '../../src/types/task';

/**
 * Integration tests for API calls
 * 
 * Tests cover:
 * - Full CRUD flow end-to-end (create → read → update → delete)
 * - Filtering by status
 * - Error scenarios (404 for non-existent task)
 * - Data persistence across operations
 * 
 * NOTE: These tests require the backend server to be running on http://localhost:3001
 */

describe('API Integration Tests', () => {
  let createdTaskId: string | null = null;

  // Clean up any test tasks before each test
  beforeEach(async () => {
    try {
      const tasks = await taskService.getTasks();
      // Clean up tasks with test content
      const testTasks = tasks.filter(task => 
        task.content.includes('[TEST]') || 
        task.content.includes('Integration Test')
      );
      for (const task of testTasks) {
        await taskService.deleteTask(task.id);
      }
    } catch (error) {
      console.warn('Failed to clean up test tasks:', error);
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    if (createdTaskId) {
      try {
        await taskService.deleteTask(createdTaskId);
      } catch (error) {
        console.warn('Failed to clean up test task:', error);
      }
    }
  });

  describe('Full CRUD Flow', () => {
    it('should complete full CRUD cycle: create → read → update → delete', async () => {
      // CREATE
      const createContent = '[TEST] Integration Test Task - ' + Date.now();
      const createdTask = await taskService.createTask(createContent);
      
      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBeTruthy();
      expect(createdTask.content).toBe(createContent);
      expect(createdTask.status).toBe('todo');
      expect(createdTask.createdAt).toBeTruthy();
      
      createdTaskId = createdTask.id;

      // READ
      const tasks = await taskService.getTasks();
      const foundTask = tasks.find(t => t.id === createdTaskId);
      
      expect(foundTask).toBeDefined();
      expect(foundTask?.content).toBe(createContent);

      // UPDATE
      const updatedContent = '[TEST] Updated Content - ' + Date.now();
      const updatedTask = await taskService.updateTask(createdTaskId, {
        content: updatedContent,
      });
      
      expect(updatedTask.id).toBe(createdTaskId);
      expect(updatedTask.content).toBe(updatedContent);

      // Verify update persisted
      const tasksAfterUpdate = await taskService.getTasks();
      const verifyTask = tasksAfterUpdate.find(t => t.id === createdTaskId);
      expect(verifyTask?.content).toBe(updatedContent);

      // DELETE
      await taskService.deleteTask(createdTaskId);

      // Verify deletion
      const tasksAfterDelete = await taskService.getTasks();
      const deletedTask = tasksAfterDelete.find(t => t.id === createdTaskId);
      expect(deletedTask).toBeUndefined();
      
      createdTaskId = null; // Task cleaned up successfully
    });

    it('should create multiple tasks and retrieve all', async () => {
      const taskIds: string[] = [];
      
      try {
        // Create multiple tasks
        const task1 = await taskService.createTask('[TEST] Integration Task 1 - ' + Date.now());
        taskIds.push(task1.id);
        
        const task2 = await taskService.createTask('[TEST] Integration Task 2 - ' + Date.now());
        taskIds.push(task2.id);
        
        const task3 = await taskService.createTask('[TEST] Integration Task 3 - ' + Date.now());
        taskIds.push(task3.id);

        // Retrieve all tasks
        const allTasks = await taskService.getTasks();
        
        // Verify all created tasks exist
        expect(allTasks.some(t => t.id === task1.id)).toBe(true);
        expect(allTasks.some(t => t.id === task2.id)).toBe(true);
        expect(allTasks.some(t => t.id === task3.id)).toBe(true);
      } finally {
        // Clean up
        for (const id of taskIds) {
          try {
            await taskService.deleteTask(id);
          } catch (error) {
            console.warn('Failed to delete task:', id, error);
          }
        }
      }
    });
  });

  describe('Task Status Updates', () => {
    it('should update task status through all stages', async () => {
      const content = '[TEST] Status Update Test - ' + Date.now();
      const task = await taskService.createTask(content);
      createdTaskId = task.id;

      try {
        // Move to in-progress
        const inProgressTask = await taskService.updateTaskStatus(task.id, 'in-progress');
        expect(inProgressTask.status).toBe('in-progress');
        expect(inProgressTask.content).toBe(content); // Content should be unchanged

        // Move to completed
        const completedTask = await taskService.updateTaskStatus(task.id, 'completed');
        expect(completedTask.status).toBe('completed');
        expect(completedTask.content).toBe(content);

        // Move back to todo
        const todoTask = await taskService.updateTaskStatus(task.id, 'todo');
        expect(todoTask.status).toBe('todo');
        expect(todoTask.content).toBe(content);
      } finally {
        await taskService.deleteTask(task.id);
        createdTaskId = null;
      }
    });

    it('should persist status changes', async () => {
      const content = '[TEST] Status Persistence Test - ' + Date.now();
      const task = await taskService.createTask(content);
      
      try {
        // Update status
        await taskService.updateTaskStatus(task.id, 'completed');

        // Fetch tasks again and verify status persisted
        const tasks = await taskService.getTasks();
        const persistedTask = tasks.find(t => t.id === task.id);
        
        expect(persistedTask).toBeDefined();
        expect(persistedTask?.status).toBe('completed');
      } finally {
        await taskService.deleteTask(task.id);
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should throw error when updating non-existent task', async () => {
      const nonExistentId = 'non-existent-id-' + Date.now();
      
      await expect(
        taskService.updateTask(nonExistentId, { content: 'Updated' })
      ).rejects.toThrow();
    });

    it('should throw error when deleting non-existent task', async () => {
      const nonExistentId = 'non-existent-id-' + Date.now();
      
      await expect(
        taskService.deleteTask(nonExistentId)
      ).rejects.toThrow();
    });

    it('should throw error when updating status of non-existent task', async () => {
      const nonExistentId = 'non-existent-id-' + Date.now();
      
      await expect(
        taskService.updateTaskStatus(nonExistentId, 'completed')
      ).rejects.toThrow();
    });
  });

  describe('Data Persistence', () => {
    it('should persist data across multiple API calls', async () => {
      const content = '[TEST] Persistence Test - ' + Date.now();
      
      // Create task
      const createdTask = await taskService.createTask(content);
      const taskId = createdTask.id;

      try {
        // Update content
        await taskService.updateTask(taskId, { content: content + ' [UPDATED]' });
        
        // Update status
        await taskService.updateTaskStatus(taskId, 'in-progress');
        
        // Fetch and verify all changes persisted
        const tasks = await taskService.getTasks();
        const finalTask = tasks.find(t => t.id === taskId);
        
        expect(finalTask).toBeDefined();
        expect(finalTask?.content).toBe(content + ' [UPDATED]');
        expect(finalTask?.status).toBe('in-progress');
      } finally {
        await taskService.deleteTask(taskId);
      }
    });

    it('should maintain task order by creation time', async () => {
      const taskIds: string[] = [];
      
      try {
        // Create tasks with delays to ensure different timestamps
        const task1 = await taskService.createTask('[TEST] First Task - ' + Date.now());
        taskIds.push(task1.id);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const task2 = await taskService.createTask('[TEST] Second Task - ' + Date.now());
        taskIds.push(task2.id);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const task3 = await taskService.createTask('[TEST] Third Task - ' + Date.now());
        taskIds.push(task3.id);

        // Fetch all tasks
        const allTasks = await taskService.getTasks();
        
        // Find our test tasks
        const testTasks = allTasks.filter(t => taskIds.includes(t.id));
        
        // Verify tasks are ordered by creation time (newest first)
        expect(testTasks.length).toBe(3);
        expect(testTasks[0].createdAt).toBeGreaterThanOrEqual(testTasks[1].createdAt);
        expect(testTasks[1].createdAt).toBeGreaterThanOrEqual(testTasks[2].createdAt);
      } finally {
        // Clean up
        for (const id of taskIds) {
          try {
            await taskService.deleteTask(id);
          } catch (error) {
            console.warn('Failed to delete task:', id);
          }
        }
      }
    });
  });

  describe('Content Handling', () => {
    it('should handle multiline content', async () => {
      const multilineContent = '[TEST] Multiline Task\nLine 2\nLine 3 - ' + Date.now();
      const task = await taskService.createTask(multilineContent);
      
      try {
        expect(task.content).toBe(multilineContent);
        
        // Verify it persists
        const tasks = await taskService.getTasks();
        const foundTask = tasks.find(t => t.id === task.id);
        expect(foundTask?.content).toBe(multilineContent);
      } finally {
        await taskService.deleteTask(task.id);
      }
    });

    it('should handle special characters in content', async () => {
      const specialContent = '[TEST] Special chars: !@#$%^&*()_+-={}[]|:;"<>,.?/ - ' + Date.now();
      const task = await taskService.createTask(specialContent);
      
      try {
        expect(task.content).toBe(specialContent);
        
        // Verify it persists
        const tasks = await taskService.getTasks();
        const foundTask = tasks.find(t => t.id === task.id);
        expect(foundTask?.content).toBe(specialContent);
      } finally {
        await taskService.deleteTask(task.id);
      }
    });

    it('should trim whitespace from content', async () => {
      const contentWithSpaces = '  [TEST] Task with spaces  - ' + Date.now();
      const task = await taskService.createTask(contentWithSpaces);
      
      try {
        // Content should be trimmed
        expect(task.content).toBe(contentWithSpaces.trim());
      } finally {
        await taskService.deleteTask(task.id);
      }
    });
  });
});

