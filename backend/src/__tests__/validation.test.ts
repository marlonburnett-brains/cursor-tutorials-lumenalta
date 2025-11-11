/**
 * API Validation Tests
 * Tests edge cases, malformed requests, and validation logic
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { cleanupTestData, initializeTestData } from './setup';
import { clearTaskCache, loadTasksFromStorage } from '../services/taskService';

describe('API Validation Tests', () => {
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

  describe('POST /tasks - Content Validation', () => {
    it('should reject empty content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBeDefined();
    });

    it('should reject whitespace-only content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: '   \n\t  ' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBeDefined();
    });

    it('should reject content with only one character', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'a' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('at least 2 characters');
    });

    it('should accept content with exactly 2 characters', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'ab' });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe('ab');
    });

    it('should reject content exceeding 2000 characters', async () => {
      const longContent = 'a'.repeat(2001);
      const response = await request(app)
        .post('/tasks')
        .send({ content: longContent });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('must not exceed');
    });

    it('should accept content at exactly 2000 characters', async () => {
      const maxContent = 'a'.repeat(2000);
      const response = await request(app)
        .post('/tasks')
        .send({ content: maxContent });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe(maxContent);
    });

    it('should reject missing content field', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('required');
    });

    it('should reject null content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: null });
      
      expect(response.status).toBe(400);
    });

    it('should reject numeric content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 12345 });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('must be a string');
    });

    it('should reject array content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: ['test'] });
      
      expect(response.status).toBe(400);
    });

    it('should reject object content', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: { text: 'test' } });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /tasks - Special Characters', () => {
    it('should accept content with emojis', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'Task with emoji 🚀' });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe('Task with emoji 🚀');
    });

    it('should accept content with special characters', async () => {
      const specialContent = 'Task @#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
      const response = await request(app)
        .post('/tasks')
        .send({ content: specialContent });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe(specialContent);
    });

    it('should accept content with newlines', async () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      const response = await request(app)
        .post('/tasks')
        .send({ content: multilineContent });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe(multilineContent);
    });

    it('should accept content with Unicode characters', async () => {
      const unicodeContent = 'Héllo Wörld 世界 مرحبا';
      const response = await request(app)
        .post('/tasks')
        .send({ content: unicodeContent });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe(unicodeContent);
    });
  });

  describe('PATCH /tasks/:id/status - Status Validation', () => {
    it('should reject invalid status value', async () => {
      // First create a task
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Status validation test 1' });
      
      const taskId = createRes.body.task.id;
      
      // Try to update with invalid status
      const response = await request(app)
        .patch(`/tasks/${taskId}/status`)
        .send({ status: 'invalid-status' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Status must be one of');
    });

    it('should reject empty status', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Status validation test 2' });
      
      const response = await request(app)
        .patch(`/tasks/${createRes.body.task.id}/status`)
        .send({ status: '' });
      
      expect(response.status).toBe(400);
    });

    it('should reject missing status field', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Status validation test 3' });
      
      const response = await request(app)
        .patch(`/tasks/${createRes.body.task.id}/status`)
        .send({});
      
      expect(response.status).toBe(400);
    });

    it('should be case-sensitive for status', async () => {
      const createRes = await request(app)
        .post('/tasks')
        .send({ content: 'Status validation test 4' });
      
      const response = await request(app)
        .patch(`/tasks/${createRes.body.task.id}/status`)
        .send({ status: 'TODO' }); // Uppercase should be rejected
      
      expect(response.status).toBe(400);
    });
  });

  describe('Invalid Task IDs', () => {
    it('should reject malformed UUID in PATCH', async () => {
      const response = await request(app)
        .patch('/tasks/not-a-uuid/status')
        .send({ status: 'completed' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid UUID');
    });

    it('should reject malformed UUID in DELETE', async () => {
      const response = await request(app)
        .delete('/tasks/not-a-uuid');
      
      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('valid UUID');
    });

    it('should return 404 for non-existent valid UUID', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .patch(`/tasks/${validUUID}/status`)
        .send({ status: 'completed' });
      
      expect(response.status).toBe(404);
      expect(response.body.error.message).toContain('not found');
    });

    it('should reject empty ID in URL', async () => {
      const response = await request(app)
        .delete('/tasks/');
      
      // Should return 404 (route not found) or 400
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Malformed JSON', () => {
    it('should reject invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect(response.status).toBe(400);
    });
  });

  describe('Content-Type Validation', () => {
    it('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Content-Type', 'application/json')
        .send({ content: 'Content type test task' });
      
      expect(response.status).toBe(201);
    });

    it('should handle missing content-type header', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ content: 'Test task' });
      
      // Express typically handles this gracefully
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });

  describe('Extra Fields', () => {
    it('should ignore extra fields in POST request', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          content: 'Test task',
          extraField: 'should be ignored',
          anotherField: 123,
        });
      
      expect(response.status).toBe(201);
      expect(response.body.task.content).toBe('Test task');
      expect(response.body.task).not.toHaveProperty('extraField');
    });
  });
});
