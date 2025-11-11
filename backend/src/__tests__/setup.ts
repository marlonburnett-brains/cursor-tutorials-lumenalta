/**
 * Test configuration and setup utilities
 * Provides helpers for test data management and cleanup
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Task } from '../types/task';

/**
 * Test configuration
 */
export const TEST_CONFIG = {
  port: 3001,
  dataFilePath: './data/tasks.test.json',
  corsOrigin: 'http://localhost:5173',
};

/**
 * Test fixtures - sample tasks for testing
 */
export const TEST_FIXTURES = {
  validTask: {
    content: 'Test task content',
    status: 'todo' as const,
  },
  todoTask: {
    content: 'Todo task',
    status: 'todo' as const,
  },
  inProgressTask: {
    content: 'In progress task',
    status: 'in-progress' as const,
  },
  completedTask: {
    content: 'Completed task',
    status: 'completed' as const,
  },
  longContent: {
    content: 'a'.repeat(2000), // Max length task
    status: 'todo' as const,
  },
};

/**
 * Clean up test data file
 * Removes tasks.test.json file if it exists
 */
export function cleanupTestData(): void {
  const testDataPath = path.join(process.cwd(), TEST_CONFIG.dataFilePath);
  
  try {
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Initialize test data file with empty array
 */
export function initializeTestData(): void {
  const testDataPath = path.join(process.cwd(), TEST_CONFIG.dataFilePath);
  const testDataDir = path.dirname(testDataPath);
  
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Write empty tasks array with proper structure expected by storage service
    fs.writeFileSync(testDataPath, JSON.stringify({ tasks: [] }, null, 2));
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}

/**
 * Seed test data with sample tasks
 */
export function seedTestData(tasks: Task[]): void {
  const testDataPath = path.join(process.cwd(), TEST_CONFIG.dataFilePath);
  
  try {
    fs.writeFileSync(testDataPath, JSON.stringify({ tasks }, null, 2));
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}

/**
 * Read current test data
 */
export function readTestData(): Task[] {
  const testDataPath = path.join(process.cwd(), TEST_CONFIG.dataFilePath);
  
  try {
    if (!fs.existsSync(testDataPath)) {
      return [];
    }
    
    const data = fs.readFileSync(testDataPath, 'utf-8');
    const parsed = JSON.parse(data);
    // Handle both old format (array) and new format ({ tasks: [] })
    return Array.isArray(parsed) ? parsed : (parsed.tasks || []);
  } catch (error) {
    console.error('Error reading test data:', error);
    return [];
  }
}

/**
 * Wait helper for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Setup hook to run before all tests
 * This is automatically called by Vitest when included in setupFiles
 */
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Initialize test data directory
initializeTestData();

