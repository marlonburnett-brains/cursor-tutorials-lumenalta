/**
 * API Configuration
 * 
 * Centralizes API base URL configuration using environment variables
 * with fallback to localhost for development.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export default API_CONFIG;

