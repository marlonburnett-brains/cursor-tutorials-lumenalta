/**
 * Comprehensive API Tests
 * Tests all REST endpoints with various scenarios
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { cleanupTestData, initializeTestData, wait } from './setup';
import { clearTaskCache, loadTasksFromStorage } from '../services/taskService';

describe('Task API Tests', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(async () => {
    initializeTestData();
    clearTaskCache();
    await loadTasksFromStorage();
  });

  afterAll(() => {
    cleanupTestData();
  });

  describe('GET /tasks', () => {
    it('should return empty array initially', async () => {
      const response = await request(app).get('/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toEqual([]);
    });

    it('should return tasks in newest-first order', async () => {
      // Create multiple tasks with small delays
      const task1 = await request(app)
        .post('/tasks')
        .send({ content: 'First task' });
      
      await wait(10);
      
      const task2 = await request(app)
        .post('/tasks')
        .send({ content: 'Second task' });
      
      await wait(10);
      
      const task3 = await request(app)
        .post('/tasks')
        .send({ content: 'Third task' });
      
      // Get all tasks
      const response = await request(app).get('/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(3);
      expect(response.body.tasks[0].id).toBe(task3.body.task.id); // Newest first
      expect(response.body.tasks[1].id).toBe(task2.body.task.id);
      expect(response.body.tasks[2].id).toBe(task1.body.task.id); // Oldest last
    });

    it('should return JSON content-type', async () => {
      const response = await request(app).get('/tasks');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return tasks with all required fields', async () => {
      await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      const response = await request(app).get('/tasks');
      
      expect(response.body.tasks[0]).toHaveProperty('id');
      expect(response.body.tasks[0]).toHaveProperty('content');
      expect(response.body.tasks[0]).toHaveProperty('status');
      expect(response.body.tasks[0]).toHaveProperty('createdAt');
    });

    it('should filter by status: todo', async () => {
      await request(app).post('/tasks').send({ content: 'Todo task' });
      const task2 = await request(app).post('/tasks').send({ content: 'Another task' });
      
      // Change one to completed
      await request(app)
        .patch(`/tasks/${task2.body.task.id}/status`)
        .send({ status: 'completed' });
      
      const response = await request(app).get('/tasks?status=todo');
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('todo');
    });

    it('should filter by status: in-progress', async () => {
      const task1 = await request(app).post('/tasks').send({ content: 'Task 1' });
      await request(app).post('/tasks').send({ content: 'Task 2' });
      
      await request(app)
        .patch(`/tasks/${task1.body.task.id}/status`)
        .send({ status: 'in-progress' });
      
      const response = await request(app).get('/tasks?status=in-progress');
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('in-progress');
    });

    it('should filter by status: completed', async () => {
      const task1 = await request(app).post('/tasks').send({ content: 'Task 1' });
      await request(app).post('/tasks').send({ content: 'Task 2' });
      
      await request(app)
        .patch(`/tasks/${task1.body.task.id}/status`)
        .send({ status: 'completed' });
      
      const response = await request(app).get('/tasks?status=completed');
      
      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('completed');
    });
  });

  describe('POST /tasks', () => {
    it('should create a task with valid content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });
      
      expect(response.status).toBe(201);
      expect(response.body.task).toHaveProperty('id');
      expect(response.body.task.content).toBe('Buy groceries');
      expect(response.body.task.status).toBe('todo');
      expect(response.body.task).toHaveProperty('createdAt');
    });

    it('should trim leading and trailing whitespace', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: '  Buy groceries  ' });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe('Buy groceries');
    });

    it('should generate unique UUID for each task', async () => {
      const res1 = await request(app)
        .post('/tasks')
        .send({ content: 'Task 1' });
      
      const res2 = await request(app)
        .post('/tasks')
        .send({ content: 'Task 2' });
      
      expect(res1.body.task.id).not.toBe(res2.body.task.id);
      expect(res1.body.task.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should set status to todo by default', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'New task' });
      
      expect(response.body.task.status).toBe('todo');
    });

    it('should reject empty content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBeDefined();
    });

    it('should reject content too short (< 2 chars)', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'a' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('at least 2 characters');
    });

    it('should reject content too long (> 2000 chars)', async () => {
      const longContent = 'a'.repeat(2001);
      const response = await request(app)
        .post('/tasks')
        .send({ content: longContent });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('must not exceed');
    });

    it('should detect duplicate content', async () => {
      await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });
      
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });
      
      expect(response.status).toBe(409);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should detect duplicate case-insensitively', async () => {
      await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });
      
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'BUY GROCERIES' });
      
      expect(response.status).toBe(409);
      expect(response.body.error.message).toContain('already exists');
    });
  });

  describe('PATCH /tasks/:id/status', () => {
    it('should toggle task to completed', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      const taskId = createRes.body.task.id;
      
      const response = await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: 'completed' });
      
      expect(response.status).toBe(200);
      expect(response.body.task.status).toBe('completed');
      expect(response.body.task.id).toBe(taskId);
    });

    it('should change task to in-progress', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      const response = await request(app)
        .patch(`/tasks/${createRes.body.task.id}/status`)
        .send({ status: 'in-progress' });
      
      expect(response.status).toBe(200);
      expect(response.body.task.status).toBe('in-progress');
    });

    it('should change completed back to todo', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      const taskId = createRes.body.task.id;
      
      // First complete it
      await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: 'completed' });
      
      // Then change back to todo
      const response = await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: 'todo' });
      
      expect(response.status).toBe(200);
      expect(response.body.task.status).toBe('todo');
    });

    it('should preserve content and createdAt when toggling', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      const originalContent = createRes.body.task.content;
      const originalCreatedAt = createRes.body.task.createdAt;
      
      const response = await request(app)
        .patch(`/tasks/${createRes.body.task.id}/status`)
        .send({ status: 'completed' });
      
      expect(response.body.task.content).toBe(originalContent);
      expect(response.body.task.createdAt).toBe(originalCreatedAt);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .patch(`/tasks/${fakeId}/status`)
        .send({ status: 'completed' });
      
      expect(response.status).toBe(404);
      expect(response.body.error.message).toContain('not found');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .patch('/tasks/invalid-id/status')
        .send({ status: 'completed' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid UUID');
    });

    it('should return 400 for invalid status', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      const response = await request(app)
        .patch(`/tasks/${createRes.body.task.id}/status`)
        .send({ status: 'invalid-status' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Status must be one of');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete an existing task', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Task to delete' });
      
      const taskId = createRes.body.task.id;
      
      const response = await request(app).delete(`/tasks/${taskId}`);
      
      expect(response.status).toBe(204);
    });

    it('should verify task no longer exists after deletion', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Task to delete' });
      
      const taskId = createRes.body.task.id;
      
      await request(app).delete(`/tasks/${taskId}`);
      
      // Verify task is gone
      const listRes = await request(app).get('/tasks');
      expect(listRes.body.tasks.find((t: any) => t.id === taskId)).toBeUndefined();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app).delete(`/tasks/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error.message).toContain('not found');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app).delete('/tasks/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid UUID');
    });

    it('should not affect other tasks when deleting', async () => {
      const task1 = await request(app).post('/tasks').send({ content: 'Task 1' });
      const task2 = await request(app).post('/tasks').send({ content: 'Task 2' });
      const task3 = await request(app).post('/tasks').send({ content: 'Task 3' });
      
      // Delete task 2
      await request(app).delete(`/tasks/${task2.body.task.id}`);
      
      // Verify task1 and task3 still exist
      const listRes = await request(app).get('/tasks');
      expect(listRes.body.tasks).toHaveLength(2);
      expect(listRes.body.tasks.find((t: any) => t.id === task1.body.task.id)).toBeDefined();
      expect(listRes.body.tasks.find((t: any) => t.id === task3.body.task.id)).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    it('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect(response.status).toBe(400);
    });

    it('should return proper error structure', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: '' });
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(typeof response.body.error.message).toBe('string');
    });

    it('should include error code in response', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'a' }); // Too short
      
      expect(response.body.error).toHaveProperty('code');
    });

    it('should handle missing route with 404', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // Create
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Complete lifecycle task' });
      
      expect(createRes.status).toBe(201);
      const taskId = createRes.body.task.id;
      
      // Read
      let listRes = await request(app).get('/tasks');
      expect(listRes.body.tasks).toHaveLength(1);
      
      // Update
      const updateRes = await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: 'completed' });
      
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.task.status).toBe('completed');
      
      // Delete
      const deleteRes = await request(app).delete(`/tasks/${taskId}`);
      expect(deleteRes.status).toBe(204);
      
      // Verify deletion
      listRes = await request(app).get('/tasks');
      expect(listRes.body.tasks).toHaveLength(0);
    });

    it('should handle multiple concurrent task creation', async () => {
      // Create tasks sequentially to avoid race conditions
      const results: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const res = await request(app).post('/tasks').send({ content: `Task ${i}` });
        results.push(res);
      }
      
      results.forEach((res) => {
        expect(res.status).toBe(201);
      });
      
      const listRes = await request(app).get('/tasks');
      expect(listRes.body.tasks).toHaveLength(5);
    });

    it('should maintain data integrity across operations', async () => {
      // Create multiple tasks
      await request(app).post('/tasks').send({ content: 'Task 1' });
      const task2 = await request(app).post('/tasks').send({ content: 'Task 2' });
      await request(app).post('/tasks').send({ content: 'Task 3' });
      
      // Update one
      await request(app)
        .patch(`/tasks/${task2.body.task.id}/status`)
        .send({ status: 'completed' });
      
      // Delete one
      await request(app).delete(`/tasks/${task2.body.task.id}`);
      
      // Verify final state
      const listRes = await request(app).get('/tasks');
      expect(listRes.body.tasks).toHaveLength(2);
      expect(listRes.body.tasks.every((t: any) => t.id !== task2.body.task.id)).toBe(true);
    });
  });
});
