/**
 * Configuration loader
 * Loads configuration from config.json with fallback to defaults
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Application configuration interface
 */
export interface Config {
  port: number;
  corsOrigin: string;
  dataFilePath: string;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Config = {
  port: 3001,
  corsOrigin: 'http://localhost:5173',
  dataFilePath: './data/tasks.json',
};

/**
 * Test environment configuration
 */
const TEST_CONFIG: Config = {
  port: 3001,
  corsOrigin: 'http://localhost:5173',
  dataFilePath: './data/tasks.test.json',
};

/**
 * Load configuration from config.json
 * Falls back to default values if file doesn't exist or is invalid
 * Uses test configuration when NODE_ENV=test
 */
export function loadConfig(): Config {
  // Return test configuration when in test environment
  if (process.env.NODE_ENV === 'test') {
    return { ...TEST_CONFIG };
  }

  try {
    const configPath = path.join(process.cwd(), 'config.json');
    
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      console.log('config.json not found, using default configuration');
      return { ...DEFAULT_CONFIG };
    }

    // Read and parse config file
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const fileConfig = JSON.parse(configFile);

    // Merge with defaults (file config takes precedence)
    const config: Config = {
      port: fileConfig.port || DEFAULT_CONFIG.port,
      corsOrigin: fileConfig.corsOrigin || DEFAULT_CONFIG.corsOrigin,
      dataFilePath: fileConfig.dataFilePath || DEFAULT_CONFIG.dataFilePath,
    };

    return config;
  } catch (error) {
    console.error('Error loading config.json, using default configuration:', error);
    return { ...DEFAULT_CONFIG };
  }
}

