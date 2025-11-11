/**
 * API Client
 * 
 * Centralized fetch wrapper that provides:
 * - Automatic timeout handling
 * - Consistent error handling
 * - Proper request/response formatting
 * - Type-safe API calls
 */

import { API_CONFIG } from '../config/api';
import {
  NetworkError,
  ValidationError,
  NotFoundError,
  ServerError,
  TimeoutError,
} from '../types/apiError';

/**
 * HTTP Methods supported by the API client
 */
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * API Request options
 */
interface RequestOptions {
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Creates an AbortController that times out after specified milliseconds
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Maps HTTP status codes to appropriate error types with user-friendly messages
 */
function handleErrorResponse(status: number, message: string): never {
  switch (status) {
    case 400:
      // Display backend validation messages for 400 errors
      throw new ValidationError(message || 'Invalid request data.');
    case 404:
      throw new NotFoundError('Task not found. It may have been deleted.');
    case 500:
    case 502:
    case 503:
    case 504:
      throw new ServerError('Server error occurred. Please try again.');
    default:
      throw new ServerError(`Unexpected error: ${message}`);
  }
}

/**
 * Makes an HTTP request to the API with timeout and error handling
 * 
 * @param endpoint - API endpoint path (e.g., '/tasks')
 * @param options - Request options (method, body, headers)
 * @returns Parsed JSON response or null for 204 responses
 */
async function request<T>(endpoint: string, options: RequestOptions): Promise<T | null> {
  const controller = createTimeoutController(API_CONFIG.timeout);
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method: options.method,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    signal: controller.signal,
  };

  // Add body for POST/PATCH requests
  if (options.body && (options.method === 'POST' || options.method === 'PATCH')) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 204 No Content (DELETE success)
    if (response.status === 204) {
      return null;
    }

    // Parse response body
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'An error occurred';
      handleErrorResponse(response.status, errorMessage);
    }

    return data as T;
  } catch (error) {
    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError('Request timed out. Please try again.');
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new NetworkError('Unable to connect to server. Please check your connection.');
    }

    // Re-throw our custom errors
    throw error;
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get<T>(endpoint: string): Promise<T | null> {
    return request<T>(endpoint, { method: 'GET' });
  },

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown): Promise<T | null> {
    return request<T>(endpoint, { method: 'POST', body });
  },

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: unknown): Promise<T | null> {
    return request<T>(endpoint, { method: 'PATCH', body });
  },

  /**
   * DELETE request
   */
  delete(endpoint: string): Promise<null> {
    return request(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;

