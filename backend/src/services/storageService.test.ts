/**
 * Unit tests for Storage Service
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  loadTasks,
  saveTasks,
  initializeDataDirectory,
  setDataFilePath,
  getDataFilePath,
} from './storageService';
import { Task } from '../types/task';

// Test data directory
const TEST_DATA_DIR = './test-data';
const TEST_DATA_FILE = path.join(TEST_DATA_DIR, 'test-tasks.json');

describe('StorageService', () => {
  beforeEach(async () => {
    // Set test data file path
    setDataFilePath(TEST_DATA_FILE);
    
    // Clean up test directory before each test
    try {
      await fs.promises.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors if directory doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test directory after each test
    try {
      await fs.promises.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors
    }
  });

  describe('setDataFilePath and getDataFilePath', () => {
    it('should set and get the data file path', () => {
      const testPath = './custom/path/tasks.json';
      setDataFilePath(testPath);
      expect(getDataFilePath()).toBe(testPath);
    });
  });

  describe('initializeDataDirectory', () => {
    it('should create the data directory if it does not exist', async () => {
      await initializeDataDirectory();
      
      const dirExists = await fs.promises
        .access(TEST_DATA_DIR)
        .then(() => true)
        .catch(() => false);
      
      expect(dirExists).toBe(true);
    });

    it('should not throw error if directory already exists', async () => {
      await fs.promises.mkdir(TEST_DATA_DIR, { recursive: true });
      await expect(initializeDataDirectory()).resolves.not.toThrow();
    });
  });

  describe('loadTasks', () => {
    it('should return empty array if file does not exist', async () => {
      const tasks = await loadTasks();
      expect(tasks).toEqual([]);
    });

    it('should return empty array if file is empty', async () => {
      await fs.promises.mkdir(TEST_DATA_DIR, { recursive: true });
      await fs.promises.writeFile(TEST_DATA_FILE, '', 'utf-8');
      
      const tasks = await loadTasks();
      expect(tasks).toEqual([]);
    });

    it('should return empty array if JSON is corrupted', async () => {
      await fs.promises.mkdir(TEST_DATA_DIR, { recursive: true });
      await fs.promises.writeFile(
        TEST_DATA_FILE,
        '{ invalid json }',
        'utf-8'
      );
      
      const tasks = await loadTasks();
      expect(tasks).toEqual([]);
    });

    it('should return empty array if JSON structure is invalid', async () => {
      await fs.promises.mkdir(TEST_DATA_DIR, { recursive: true });
      await fs.promises.writeFile(
        TEST_DATA_FILE,
        JSON.stringify({ wrongKey: [] }),
        'utf-8'
      );
      
      const tasks = await loadTasks();
      expect(tasks).toEqual([]);
    });

    it('should load tasks from valid JSON file', async () => {
      const testTasks: Task[] = [
        {
          id: 'test-id-1',
          content: 'Test task 1',
          status: 'todo',
          createdAt: Date.now(),
        },
        {
          id: 'test-id-2',
          content: 'Test task 2',
          status: 'in-progress',
          createdAt: Date.now(),
        },
      ];

      await fs.promises.mkdir(TEST_DATA_DIR, { recursive: true });
      await fs.promises.writeFile(
        TEST_DATA_FILE,
        JSON.stringify({ tasks: testTasks }, null, 2),
        'utf-8'
      );

      const loadedTasks = await loadTasks();
      expect(loadedTasks).toEqual(testTasks);
    });
  });

  describe('saveTasks', () => {
    it('should create directory and save tasks to JSON file', async () => {
      const testTasks: Task[] = [
        {
          id: 'test-id-1',
          content: 'Test task 1',
          status: 'todo',
          createdAt: Date.now(),
        },
      ];

      await saveTasks(testTasks);

      // Verify file exists
      const fileExists = await fs.promises
        .access(TEST_DATA_FILE)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Verify content
      const fileContent = await fs.promises.readFile(TEST_DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      expect(data.tasks).toEqual(testTasks);
    });

    it('should overwrite existing file', async () => {
      const firstTasks: Task[] = [
        {
          id: 'first-id',
          content: 'First task',
          status: 'todo',
          createdAt: Date.now(),
        },
      ];

      const secondTasks: Task[] = [
        {
          id: 'second-id',
          content: 'Second task',
          status: 'completed',
          createdAt: Date.now(),
        },
      ];

      await saveTasks(firstTasks);
      await saveTasks(secondTasks);

      const loadedTasks = await loadTasks();
      expect(loadedTasks).toEqual(secondTasks);
      expect(loadedTasks).not.toEqual(firstTasks);
    });

    it('should use atomic write (no .tmp file left behind)', async () => {
      const testTasks: Task[] = [
        {
          id: 'test-id',
          content: 'Test task',
          status: 'todo',
          createdAt: Date.now(),
        },
      ];

      await saveTasks(testTasks);

      // Verify temporary file doesn't exist
      const tmpFileExists = await fs.promises
        .access(`${TEST_DATA_FILE}.tmp`)
        .then(() => true)
        .catch(() => false);
      
      expect(tmpFileExists).toBe(false);
    });

    it('should save empty array', async () => {
      await saveTasks([]);

      const loadedTasks = await loadTasks();
      expect(loadedTasks).toEqual([]);
    });
  });

  describe('round-trip save and load', () => {
    it('should preserve task data through save and load cycle', async () => {
      const testTasks: Task[] = [
        {
          id: 'uuid-1',
          content: 'Buy groceries\nMilk, eggs, bread',
          status: 'todo',
          createdAt: 1699724400000,
        },
        {
          id: 'uuid-2',
          content: 'Write documentation',
          status: 'in-progress',
          createdAt: 1699724500000,
        },
        {
          id: 'uuid-3',
          content: 'Review pull request',
          status: 'completed',
          createdAt: 1699724600000,
        },
      ];

      await saveTasks(testTasks);
      const loadedTasks = await loadTasks();

      expect(loadedTasks).toEqual(testTasks);
      expect(loadedTasks).toHaveLength(3);
    });
  });
});

