/**
 * Integration tests for health endpoint
 */

import request from 'supertest';
import { createApp } from '../../src/app';

describe('Health Endpoint Integration Tests', () => {
  const app = createApp('http://localhost:5173');

  describe('GET /health', () => {
  it('should return 200 with status ok and timestamp', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('number');
  });

    it('should have correct content-type header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should have CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173'
      );
    });

    it('should handle OPTIONS preflight request', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173'
      );
    });
  });
});

