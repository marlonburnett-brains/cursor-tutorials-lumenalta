/**
 * Server entry point
 * Initializes the application and starts the server
 */

import { createApp } from './app';
import { loadConfig } from './config';
import { setDataFilePath, initializeDataDirectory } from './services/storageService';
import { loadTasksFromStorage } from './services/taskService';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Load configuration
    const config = loadConfig();
    console.log('Configuration loaded:');
    console.log(`  Port: ${config.port}`);
    console.log(`  CORS Origin: ${config.corsOrigin}`);
    console.log(`  Data File Path: ${config.dataFilePath}`);

    // Initialize storage
    setDataFilePath(config.dataFilePath);
    await initializeDataDirectory();
    console.log('Storage initialized');

    // Load tasks from storage
    await loadTasksFromStorage();
    console.log('Tasks loaded from storage');

    // Create Express app
    const app = createApp(config.corsOrigin);

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${config.port}`);
      console.log(`✅ Health check: http://localhost:${config.port}/health`);
      console.log(`📝 Tasks API: http://localhost:${config.port}/tasks\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };

