/**
 * Health Endpoint Tests
 * Tests the GET /health endpoint functionality
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { cleanupTestData, initializeTestData } from './setup';
import { clearTaskCache, loadTasksFromStorage } from '../services/taskService';

describe('Health Endpoint', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    initializeTestData();
  });

  beforeEach(async () => {
    clearTaskCache();
    await loadTasksFromStorage();
  });

  afterAll(() => {
    cleanupTestData();
  });

  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
    });

    it('should return JSON response', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return status "ok"', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should return timestamp', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('number');
    });

    it('should return recent timestamp', async () => {
      const before = Date.now();
      const response = await request(app).get('/health');
      const after = Date.now();
      
      expect(response.body.timestamp).toBeGreaterThanOrEqual(before);
      expect(response.body.timestamp).toBeLessThanOrEqual(after);
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app)
        .get('/health')
        .set('Authorization', ''); // Empty auth header
      
      expect(response.status).toBe(200);
    });

    it('should respond quickly (< 100ms)', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });
});

