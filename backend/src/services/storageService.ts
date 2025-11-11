/**
 * Storage Service
 * Handles file-based persistence for task data using JSON files.
 * Implements atomic writes to prevent data corruption.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Task } from '../types/task';
import { loadConfig } from '../config';

/**
 * Storage error class for file system operations
 */
export class StorageError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Structure of the JSON file containing tasks
 */
interface TasksData {
  tasks: Task[];
}

/**
 * Get data file path from config
 * Uses tasks.test.json when NODE_ENV=test, otherwise tasks.json
 */
function getDataFilePathFromConfig(): string {
  const config = loadConfig();
  return config.dataFilePath;
}

let dataFilePath: string = getDataFilePathFromConfig();

/**
 * Set the data file path (useful for testing and configuration)
 */
export function setDataFilePath(filePath: string): void {
  dataFilePath = filePath;
}

/**
 * Get the current data file path
 */
export function getDataFilePath(): string {
  return dataFilePath;
}

/**
 * Initialize the data directory if it doesn't exist
 * Creates the directory structure needed for storing task data
 */
export async function initializeDataDirectory(): Promise<void> {
  try {
    // Use absolute path to ensure consistency
    const absolutePath = path.resolve(dataFilePath);
    const dirPath = path.dirname(absolutePath);
    
    // Check if directory exists
    try {
      await fs.promises.access(dirPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  } catch (error) {
    throw new StorageError(
      'Failed to initialize data directory',
      error as Error
    );
  }
}

/**
 * Load tasks from the JSON file
 * Returns an empty array if the file doesn't exist or is corrupted
 */
export async function loadTasks(): Promise<Task[]> {
  try {
    // Check if file exists
    try {
      await fs.promises.access(dataFilePath);
    } catch {
      // File doesn't exist, return empty array
      return [];
    }

    // Read and parse the file
    const fileContent = await fs.promises.readFile(dataFilePath, 'utf-8');
    
    // Handle empty file
    if (!fileContent.trim()) {
      return [];
    }

    // Parse JSON
    const data: TasksData = JSON.parse(fileContent);
    
    // Validate structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.tasks)) {
      console.error('Invalid tasks.json structure, returning empty array');
      return [];
    }

    return data.tasks;
  } catch (error) {
    // Log error but don't throw - return empty array for corrupted files
    if (error instanceof SyntaxError) {
      console.error('Corrupted tasks.json file, returning empty array:', error.message);
      return [];
    }
    
    throw new StorageError(
      'Failed to load tasks from storage',
      error as Error
    );
  }
}

/**
 * Save tasks to the JSON file using atomic write operation
 * Writes to a temporary file first, then renames to prevent corruption
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    // Ensure data directory exists
    await initializeDataDirectory();

    const data: TasksData = { tasks };
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Resolve to absolute paths to avoid path resolution issues
    const absoluteDataPath = path.resolve(dataFilePath);
    const tempPath = `${absoluteDataPath}.tmp`;
    
    // Write to temporary file
    await fs.promises.writeFile(tempPath, jsonContent, 'utf-8');
    
    // Atomic rename (replace old file with new one)
    // On some systems, rename requires the destination to be deleted first
    try {
      await fs.promises.unlink(absoluteDataPath);
    } catch (unlinkError: any) {
      // File doesn't exist yet, that's okay
      if (unlinkError.code !== 'ENOENT') {
        throw unlinkError;
      }
    }
    
    await fs.promises.rename(tempPath, absoluteDataPath);
  } catch (error) {
    throw new StorageError(
      'Failed to save tasks to storage',
      error as Error
    );
  }
}

