import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './apiClient';
import {
  NetworkError,
  ValidationError,
  NotFoundError,
  ServerError,
  TimeoutError,
} from '../types/apiError';

/**
 * Unit tests for API Client
 * 
 * Tests cover:
 * - Successful GET/POST/PATCH/DELETE requests
 * - Error handling for 400/404/500 status codes
 * - Network error handling
 * - Timeout handling
 * - Correct request headers
 */

// Mock fetch globally
global.fetch = vi.fn();

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { tasks: [{ id: '1', content: 'Test', status: 'todo', createdAt: Date.now() }] };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get('/tasks');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/tasks',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include correct headers in GET request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get('/tasks');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with body', async () => {
      const mockTask = { id: '1', content: 'New Task', status: 'todo', createdAt: Date.now() };
      const requestBody = { content: 'New Task' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ task: mockTask }),
      });

      const result = await apiClient.post('/tasks', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual({ task: mockTask });
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request with body', async () => {
      const mockTask = { id: '1', content: 'Updated', status: 'completed', createdAt: Date.now() };
      const updates = { status: 'completed' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ task: mockTask }),
      });

      const result = await apiClient.patch('/tasks/1', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/tasks/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );
      expect(result).toEqual({ task: mockTask });
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request and return null', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiClient.delete('/tasks/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/tasks/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toBeNull();
    });
  });

  describe('Error handling - HTTP status codes', () => {
    it('should throw ValidationError on 400 Bad Request', async () => {
      const errorMessage = 'Invalid task content';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValueOnce({ error: errorMessage }),
      });

      await expect(apiClient.get('/tasks')).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError on 404 Not Found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValueOnce({ error: 'Not found' }),
      });

      await expect(apiClient.get('/tasks/999')).rejects.toThrow(NotFoundError);
    });

    it('should throw ServerError on 500 Internal Server Error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValueOnce({ error: 'Internal error' }),
      });

      await expect(apiClient.get('/tasks')).rejects.toThrow(ServerError);
    });

    it('should throw ServerError on 502 Bad Gateway', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({ error: 'Bad gateway' }),
      });

      await expect(apiClient.get('/tasks')).rejects.toThrow(ServerError);
    });

    it('should throw ServerError on 503 Service Unavailable', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Service unavailable' }),
      });

      await expect(apiClient.get('/tasks')).rejects.toThrow(ServerError);
    });
  });

  describe('Error handling - Network errors', () => {
    it('should throw NetworkError when fetch fails with TypeError', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient.get('/tasks')).rejects.toThrow(NetworkError);
      await expect(apiClient.get('/tasks')).rejects.toThrow('Unable to connect to server. Please check your connection.');
    });

    it('should throw NetworkError on network failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Network request failed'));

      await expect(apiClient.post('/tasks', { content: 'test' })).rejects.toThrow(NetworkError);
    });
  });

  describe('Error handling - Timeout', () => {
    it('should throw TimeoutError when request times out', async () => {
      // Mock fetch to simulate an AbortError (which happens on timeout)
      (global.fetch as any).mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      );

      await expect(apiClient.get('/tasks')).rejects.toThrow(TimeoutError);
    });
  });

  describe('Response parsing', () => {
    it('should parse JSON response correctly', async () => {
      const mockData = { tasks: [{ id: '1', content: 'Test', status: 'todo', createdAt: Date.now() }] };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get('/tasks');
      expect(result).toEqual(mockData);
    });

    it('should handle 204 No Content response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiClient.delete('/tasks/1');
      expect(result).toBeNull();
    });

    it('should parse error message from response', async () => {
      const errorMessage = 'Custom error message';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: errorMessage }),
      });

      await expect(apiClient.get('/tasks')).rejects.toThrow(errorMessage);
    });

    it('should use default error message when response has no error field', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(apiClient.get('/tasks')).rejects.toThrow('Server error occurred. Please try again.');
    });
  });

  describe('Request configuration', () => {
    it('should use correct base URL', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get('/tasks');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/tasks',
        expect.any(Object)
      );
    });

    it('should include timeout signal in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get('/tasks');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });
});

