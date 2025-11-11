# Task List: Backend REST API for Kanban To-Do Application

**Source PRD:** `0002-prd-backend-rest-api.md`  
**Generated:** November 11, 2025  
**Status:** Ready for Implementation

---

## Current State Assessment

- **Backend Directory:** Empty (greenfield project)
- **Technology Stack:** Node.js 18+, TypeScript 5.x, Express.js 4.x
- **Data Model:** Task interface with 4 fields (id, content, status, createdAt)
- **Persistence:** JSON file-based storage
- **Testing:** Jest + Supertest for unit and integration tests

---

## Relevant Files

### Core Application Files
- `backend/src/types/task.ts` - Task interface and type definitions (id, content, status, createdAt)
- `backend/src/types/error.ts` - Custom error classes and error code constants
- `backend/src/config/index.ts` - Configuration loader that reads config.json and provides defaults
- `backend/src/app.ts` - Express application setup with middleware and routes
- `backend/src/server.ts` - Server entry point that starts the Express server

### Storage Layer
- `backend/src/services/storageService.ts` - File I/O operations with atomic writes for tasks.json
- `backend/src/services/storageService.test.ts` - Unit tests for storage service

### Business Logic & Validation
- `backend/src/services/taskService.ts` - Core business logic for task CRUD operations
- `backend/src/services/taskService.test.ts` - Unit tests for task service
- `backend/src/utils/validation.ts` - Validation helper functions (content length, status, UUID format)
- `backend/src/utils/validation.test.ts` - Unit tests for validation utilities
- `backend/src/utils/duplicateCheck.ts` - Duplicate detection logic (case-insensitive first line comparison)
- `backend/src/utils/duplicateCheck.test.ts` - Unit tests for duplicate detection

### Middleware
- `backend/src/middleware/errorHandler.ts` - Global error handling middleware that converts errors to structured responses
- `backend/src/middleware/validator.ts` - Request validation middleware for schema validation

### Routes
- `backend/src/routes/tasks.ts` - Task route handlers for all CRUD endpoints
- `backend/src/routes/health.ts` - Health check endpoint handler

### Integration Tests
- `backend/tests/integration/tasks.test.ts` - Integration tests for all task endpoints
- `backend/tests/integration/health.test.ts` - Integration tests for health endpoint

### Configuration Files
- `backend/package.json` - Node.js project dependencies and npm scripts
- `backend/tsconfig.json` - TypeScript compiler configuration (strict mode enabled)
- `backend/.eslintrc.json` - ESLint configuration for code quality
- `backend/.prettierrc` - Prettier configuration for code formatting
- `backend/.gitignore` - Git ignore rules (node_modules, data/, dist/)
- `backend/config.json` - Runtime configuration (port, CORS origin, data file path)
- `backend/jest.config.js` - Jest test framework configuration

### Data & Documentation
- `backend/data/tasks.json` - Task storage file (created at runtime, gitignored)
- `backend/README.md` - Setup instructions, API documentation, and usage examples

### Notes

- Unit tests should be placed alongside the code files they test (same directory)
- Integration tests go in the `/tests/integration/` directory
- Use `npm test` to run all tests, `npm run test:unit` for unit tests only, `npm run test:integration` for integration tests only
- The `data/` directory and its contents should be gitignored but the directory structure should be documented
- All TypeScript files compile to a `dist/` directory (also gitignored)

---

## Tasks

- [x] 1.0 Project Setup & Configuration
  - [x] 1.1 Initialize Node.js project in `/backend` directory with `npm init -y`
  - [x] 1.2 Install production dependencies: `express`, `cors`
  - [x] 1.3 Install TypeScript dependencies: `typescript`, `@types/node`, `@types/express`, `@types/cors`
  - [x] 1.4 Install dev tools: `nodemon`, `ts-node`
  - [x] 1.5 Install testing dependencies: `jest`, `@types/jest`, `ts-jest`, `supertest`, `@types/supertest`
  - [x] 1.6 Install code quality tools: `eslint`, `prettier`, `eslint-config-prettier`
  - [x] 1.7 Create `tsconfig.json` with strict mode enabled and appropriate compiler options
  - [x] 1.8 Create `.eslintrc.json` with TypeScript-aware linting rules
  - [x] 1.9 Create `.prettierrc` with consistent formatting rules
  - [x] 1.10 Create `.gitignore` to exclude `node_modules/`, `dist/`, `data/`, and `.env`
  - [x] 1.11 Create project folder structure: `src/`, `src/types/`, `src/services/`, `src/routes/`, `src/middleware/`, `src/utils/`, `src/config/`, `tests/`, `tests/integration/`
  - [x] 1.12 Create `config.json` with default values: port 3001, CORS origin `http://localhost:5173`, data path `./data/tasks.json`
  - [x] 1.13 Add npm scripts to `package.json`: `dev` (nodemon), `start` (node), `build` (tsc), `test`, `test:unit`, `test:integration`

- [x] 2.0 Storage Layer & Data Persistence
  - [x] 2.1 Create `src/types/task.ts` with Task interface (id: string, content: string, status: 'todo'|'in-progress'|'completed', createdAt: number)
  - [x] 2.2 Create `src/services/storageService.ts` with functions: `loadTasks()`, `saveTasks(tasks)`, `initializeDataDirectory()`
  - [x] 2.3 Implement `loadTasks()` to read tasks from JSON file, handle missing/corrupted files gracefully (return empty array)
  - [x] 2.4 Implement `saveTasks()` with atomic write operation (write to temp file, then rename)
  - [x] 2.5 Implement `initializeDataDirectory()` to create `data/` folder if it doesn't exist
  - [x] 2.6 Add error handling for file system operations (throw StorageError with STORAGE_ERROR code)
  - [x] 2.7 Create `src/services/storageService.test.ts` with unit tests for all storage operations
  - [x] 2.8 Test atomic writes don't corrupt data on interruption
  - [x] 2.9 Test handling of missing and corrupted JSON files

- [x] 3.0 Business Logic & Validation
  - [x] 3.1 Create `src/types/error.ts` with `AppError` class (code, message, statusCode, field properties)
  - [x] 3.2 Define error code constants in `src/types/error.ts`: VALIDATION_ERROR, INVALID_STATUS, INVALID_UUID, MISSING_FIELD, CONTENT_TOO_SHORT, CONTENT_TOO_LONG, TASK_NOT_FOUND, DUPLICATE_TASK, INTERNAL_ERROR, STORAGE_ERROR
  - [x] 3.3 Create `src/utils/validation.ts` with functions: `validateContent(content)`, `validateStatus(status)`, `validateUUID(id)`, `trimContent(content)`
  - [x] 3.4 Implement `validateContent()` to check 2-2000 character range after trimming
  - [x] 3.5 Implement `validateStatus()` to check for valid values ('todo', 'in-progress', 'completed') with case-sensitivity
  - [x] 3.6 Implement `validateUUID()` to check valid UUID v4 format
  - [x] 3.7 Create `src/utils/duplicateCheck.ts` with `isDuplicateTask(content, tasks, excludeId?)` function
  - [x] 3.8 Implement case-insensitive first-line comparison for duplicate detection
  - [x] 3.9 Create `src/utils/validation.test.ts` with comprehensive tests for all validation functions
  - [x] 3.10 Create `src/utils/duplicateCheck.test.ts` with tests for single-line and multi-line duplicate detection
  - [x] 3.11 Create `src/services/taskService.ts` with in-memory task cache and CRUD functions
  - [x] 3.12 Implement `getAllTasks()` with optional status filtering and sorting (newest first)
  - [x] 3.13 Implement `createTask(content)` with validation, duplicate check, ID generation (crypto.randomUUID()), timestamp (Date.now()), default status 'todo'
  - [x] 3.14 Implement `updateTask(id, updates)` with validation, duplicate check, preserving id and createdAt
  - [x] 3.15 Implement `updateTaskStatus(id, status)` to update only status field
  - [x] 3.16 Implement `deleteTask(id)` with existence check
  - [x] 3.17 Implement `loadTasksFromStorage()` to initialize in-memory cache on startup
  - [x] 3.18 Implement `persistTasks()` to save in-memory cache to storage after each change
  - [x] 3.19 Create `src/services/taskService.test.ts` with unit tests for all CRUD operations (mock storage layer)
  - [x] 3.20 Test duplicate detection in create and update operations
  - [x] 3.21 Test sorting by createdAt descending
  - [x] 3.22 Test filtering by status

- [x] 4.0 API Endpoints & Routes
  - [x] 4.1 Create `src/middleware/errorHandler.ts` to convert AppError to structured JSON responses with proper status codes
  - [x] 4.2 Implement error logging in error handler (console.error for server errors)
  - [x] 4.3 Ensure no sensitive information (stack traces, file paths) exposed in production errors
  - [x] 4.4 Create `src/middleware/validator.ts` for request body validation (check required fields, types)
  - [x] 4.5 Create `src/routes/health.ts` with GET /health endpoint returning `{ ok: true }` with HTTP 200
  - [x] 4.6 Create `src/routes/tasks.ts` with route handler functions for all task endpoints
  - [x] 4.7 Implement GET /tasks handler with optional `status` query parameter, call `getAllTasks(status)`, return HTTP 200 with `{ tasks: [...] }`
  - [x] 4.8 Implement POST /tasks handler: validate request body, call `createTask(content)`, return HTTP 201 with `{ task: {...} }`
  - [x] 4.9 Implement PUT /tasks/:id handler: validate ID and body, call `updateTask(id, updates)`, return HTTP 200 with `{ task: {...} }`
  - [x] 4.10 Implement PATCH /tasks/:id handler: validate ID and partial body, call `updateTask(id, updates)`, return HTTP 200 with `{ task: {...} }`
  - [x] 4.11 Implement PATCH /tasks/:id/status handler: validate ID and status, call `updateTaskStatus(id, status)`, return HTTP 200 with `{ task: {...} }`
  - [x] 4.12 Implement DELETE /tasks/:id handler: validate ID, call `deleteTask(id)`, return HTTP 204 (no content)
  - [x] 4.13 Add error handling to all route handlers (try-catch, pass errors to error middleware)
  - [x] 4.14 Create `src/config/index.ts` to load config.json and provide default values (port: 3001, corsOrigin: http://localhost:5173, dataFilePath: ./data/tasks.json)
  - [x] 4.15 Create `src/app.ts` to set up Express app: JSON body parser, CORS middleware, route mounting, error handler
  - [x] 4.16 Configure CORS in app.ts with allowed origin from config, methods (GET, POST, PUT, PATCH, DELETE, OPTIONS), headers (Content-Type, Authorization)
  - [x] 4.17 Mount health route at `/health` and tasks routes at `/tasks`
  - [x] 4.18 Create `src/server.ts` as entry point: load config, initialize storage, load tasks, start Express server
  - [x] 4.19 Log configuration and server startup information (port, CORS origin)
  - [x] 4.20 Add graceful shutdown handling (SIGINT, SIGTERM)

- [x] 5.0 Testing & Documentation
  - [x] 5.1 Create `jest.config.js` with TypeScript support (ts-jest), test paths, coverage settings (minimum 80%)
  - [x] 5.2 Create `tests/integration/health.test.ts` to test GET /health returns 200 with `{ ok: true }`
  - [x] 5.3 Create `tests/integration/tasks.test.ts` with setup/teardown for test data file
  - [x] 5.4 Test GET /tasks returns empty array initially, then all tasks sorted newest first
  - [x] 5.5 Test GET /tasks?status=todo filters correctly
  - [x] 5.6 Test GET /tasks?status=in-progress filters correctly
  - [x] 5.7 Test GET /tasks?status=completed filters correctly
  - [x] 5.8 Test GET /tasks?status=invalid returns 400 error
  - [x] 5.9 Test POST /tasks with valid content returns 201 with task (auto-generated id, createdAt, status 'todo')
  - [x] 5.10 Test POST /tasks with content <2 chars returns 400 CONTENT_TOO_SHORT
  - [x] 5.11 Test POST /tasks with content >2000 chars returns 400 CONTENT_TOO_LONG
  - [x] 5.12 Test POST /tasks with missing content returns 400 MISSING_FIELD
  - [x] 5.13 Test POST /tasks with duplicate content returns 409 DUPLICATE_TASK
  - [x] 5.14 Test POST /tasks trims whitespace from content
  - [x] 5.15 Test PUT /tasks/:id updates task and returns 200
  - [x] 5.16 Test PUT /tasks/:id with non-existent ID returns 404 TASK_NOT_FOUND
  - [x] 5.17 Test PUT /tasks/:id with invalid status returns 400 INVALID_STATUS
  - [x] 5.18 Test PUT /tasks/:id with duplicate content returns 409 DUPLICATE_TASK
  - [x] 5.19 Test PATCH /tasks/:id partially updates task and returns 200
  - [x] 5.20 Test PATCH /tasks/:id/status updates only status and returns 200
  - [x] 5.21 Test PATCH /tasks/:id/status with invalid status returns 400
  - [x] 5.22 Test DELETE /tasks/:id removes task and returns 204
  - [x] 5.23 Test DELETE /tasks/:id with non-existent ID returns 404
  - [x] 5.24 Test CORS headers are present in responses
  - [x] 5.25 Test OPTIONS preflight requests handled correctly
  - [x] 5.26 Verify all error responses follow format: `{ error: { message, code, field? } }`
  - [x] 5.27 Run all tests and verify 80%+ code coverage
  - [x] 5.28 Create `README.md` with project overview, prerequisites (Node.js 18+), and setup instructions
  - [x] 5.29 Document installation steps: `npm install`, config.json setup
  - [x] 5.30 Document npm scripts: `npm run dev`, `npm start`, `npm test`, `npm run test:unit`, `npm run test:integration`
  - [x] 5.31 Document all API endpoints with request/response examples (include curl commands from PRD section 9.2)
  - [x] 5.32 Document error codes and their meanings (reference PRD section 4.11)
  - [x] 5.33 Add troubleshooting section for common issues (port conflicts, CORS errors, file permissions)
  - [x] 5.34 Verify `npm run dev` starts development server without errors
  - [x] 5.35 Verify `npm start` runs in production mode
  - [x] 5.36 Manual testing: Create, read, update, delete tasks using curl or Postman
  - [x] 5.37 Manual testing: Verify data persists across server restarts
  - [x] 5.38 Manual testing: Test error scenarios (duplicate tasks, invalid data, missing fields)

---

## Implementation Notes

### Development Order
1. Start with project setup (Task 1.0) to get the development environment ready
2. Build storage layer (Task 2.0) as the foundation for data persistence
3. Implement validation and business logic (Task 3.0) before exposing APIs
4. Create API endpoints (Task 4.0) using the service layer
5. Write comprehensive tests (Task 5.0) and documentation

### Key Reminders
- Always trim content before validation and storage
- Duplicate detection is case-insensitive and compares first line only
- Use `crypto.randomUUID()` for task IDs (requires Node.js 18+)
- Use `Date.now()` for timestamps (milliseconds since Unix epoch)
- Status values are lowercase with hyphens: 'todo', 'in-progress', 'completed'
- Never store `title` or `description` fields - these are frontend-only
- Atomic writes prevent data corruption (write to temp file, then rename)
- Error responses must include: message, code, and optionally field

### Testing Tips
- Mock the storage layer when testing the service layer
- Use a temporary test file for integration tests (clean up after each test)
- Test both success and error paths for every endpoint
- Verify error codes and status codes are correct
- Test CORS headers are present in all responses

