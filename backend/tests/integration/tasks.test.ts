/**
 * Integration tests for tasks endpoints
 */

import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { createApp } from '../../src/app';
import { setDataFilePath, initializeDataDirectory } from '../../src/services/storageService';
import { loadTasksFromStorage } from '../../src/services/taskService';

describe('Tasks API Integration Tests', () => {
  const app = createApp('http://localhost:5173');
  const testDataDir = './test-integration-data';
  const testDataFile = path.join(testDataDir, 'tasks.json');

  beforeAll(async () => {
    // Set up test data file
    setDataFilePath(testDataFile);
    await initializeDataDirectory();
  });

  beforeEach(async () => {
    // Clean up and reinitialize before each test
    try {
      await fs.promises.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors
    }
    
    setDataFilePath(testDataFile);
    await initializeDataDirectory();
    await loadTasksFromStorage();
  });

  afterAll(async () => {
    // Clean up test data after all tests
    try {
      await fs.promises.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors
    }
  });

  describe('GET /tasks', () => {
    it('should return empty array initially', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ tasks: [] });
    });

    it('should return all tasks sorted by newest first', async () => {
      // Create tasks
      const task1 = await request(app)
        .post('/tasks')
        .send({ content: 'First task' });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const task2 = await request(app)
        .post('/tasks')
        .send({ content: 'Second task' });

      // Get all tasks
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.tasks[0].id).toBe(task2.body.task.id); // Newest first
      expect(response.body.tasks[1].id).toBe(task1.body.task.id);
    });

    it('should filter tasks by status=todo', async () => {
      await request(app).post('/tasks').send({ content: 'Todo task' });
      const task2Response = await request(app)
        .post('/tasks')
        .send({ content: 'Progress task' });
      
      await request(app)
        .patch(`/tasks/${task2Response.body.task.id}/status`)
        .send({ status: 'in-progress' });

      const response = await request(app).get('/tasks?status=todo');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('todo');
    });

    it('should filter tasks by status=in-progress', async () => {
      const task1Response = await request(app)
        .post('/tasks')
        .send({ content: 'Progress task' });
      
      await request(app)
        .patch(`/tasks/${task1Response.body.task.id}/status`)
        .send({ status: 'in-progress' });

      const response = await request(app).get('/tasks?status=in-progress');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('in-progress');
    });

    it('should filter tasks by status=completed', async () => {
      const task1Response = await request(app)
        .post('/tasks')
        .send({ content: 'Completed task' });
      
      await request(app)
        .patch(`/tasks/${task1Response.body.task.id}/status`)
        .send({ status: 'completed' });

      const response = await request(app).get('/tasks?status=completed');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('completed');
    });

    it('should return 400 for invalid status filter', async () => {
      const response = await request(app).get('/tasks?status=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });

    it('should have CORS headers', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173'
      );
    });
  });

  describe('POST /tasks', () => {
    it('should create task with valid content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });

      expect(response.status).toBe(201);
      expect(response.body.task).toMatchObject({
        content: 'Buy groceries',
        status: 'todo',
      });
      expect(response.body.task.id).toBeDefined();
      expect(response.body.task.createdAt).toBeDefined();
    });

    it('should trim whitespace from content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: '  Buy groceries  ' });

      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe('Buy groceries');
    });

    it('should return 400 for content < 2 chars', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CONTENT_TOO_SHORT');
      expect(response.body.error.field).toBe('content');
    });

    it('should return 400 for content > 2000 chars', async () => {
      const longContent = 'a'.repeat(2001);
      const response = await request(app)
        .post('/tasks')
        .send({ content: longContent });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CONTENT_TOO_LONG');
      expect(response.body.error.field).toBe('content');
    });

    it('should return 400 for missing content field', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FIELD');
    });

    it('should return 409 for duplicate content', async () => {
      await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });

      const response = await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE_TASK');
    });

    it('should detect duplicate case-insensitively', async () => {
      await request(app)
        .post('/tasks')
        .send({ content: 'Buy groceries' });

      const response = await request(app)
        .post('/tasks')
        .send({ content: 'BUY GROCERIES' });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE_TASK');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update task content and status', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ content: 'Original content' });

      const taskId = createResponse.body.task.id;

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ content: 'Updated content', status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.task.content).toBe('Updated content');
      expect(response.body.task.status).toBe('completed');
      expect(response.body.task.id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .put(`/tasks/${fakeId}`)
        .send({ content: 'New content' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });

      const response = await request(app)
        .put(`/tasks/${createResponse.body.task.id}`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });

    it('should return 409 for duplicate content', async () => {
      await request(app).post('/tasks').send({ content: 'Task 1' });
      const task2Response = await request(app)
        .post('/tasks')
        .send({ content: 'Task 2' });

      const response = await request(app)
        .put(`/tasks/${task2Response.body.task.id}`)
        .send({ content: 'Task 1' });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE_TASK');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should partially update task', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ content: 'Original content' });

      const response = await request(app)
        .patch(`/tasks/${createResponse.body.task.id}`)
        .send({ content: 'Updated content' });

      expect(response.status).toBe(200);
      expect(response.body.task.content).toBe('Updated content');
      expect(response.body.task.status).toBe('todo'); // Unchanged
    });
  });

  describe('PATCH /tasks/:id/status', () => {
    it('should update only status', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });

      const response = await request(app)
        .patch(`/tasks/${createResponse.body.task.id}/status`)
        .send({ status: 'in-progress' });

      expect(response.status).toBe(200);
      expect(response.body.task.status).toBe('in-progress');
      expect(response.body.task.content).toBe('Test task'); // Unchanged
    });

    it('should return 400 for invalid status', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });

      const response = await request(app)
        .patch(`/tasks/${createResponse.body.task.id}/status`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .patch(`/tasks/${fakeId}/status`)
        .send({ status: 'completed' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task and return 204', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ content: 'Task to delete' });

      const response = await request(app)
        .delete(`/tasks/${createResponse.body.task.id}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify task is deleted
      const getResponse = await request(app).get('/tasks');
      expect(getResponse.body.tasks).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app).delete(`/tasks/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app).delete('/tasks/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_UUID');
    });
  });

  describe('CORS and Headers', () => {
    it('should handle OPTIONS preflight for POST /tasks', async () => {
      const response = await request(app)
        .options('/tasks')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173'
      );
      expect(response.headers['access-control-allow-methods']).toMatch(/POST/);
    });

    it('should include CORS headers in error responses', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Origin', 'http://localhost:5173')
        .send({ content: 'a' }); // Too short

      expect(response.status).toBe(400);
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173'
      );
    });
  });

  describe('Error Response Format', () => {
    it('should return structured error with message, code, and field', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'a' });

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('field');
    });
  });
});

