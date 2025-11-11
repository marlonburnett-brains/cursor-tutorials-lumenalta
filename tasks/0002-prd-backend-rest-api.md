# PRD: Backend REST API for Kanban To-Do Application

**Document ID:** 0002  
**Feature Name:** Backend REST API for Kanban To-Do Application  
**Created:** November 11, 2025  
**Last Updated:** November 11, 2025  
**Status:** Ready for Implementation  
**Version:** 1.0  
**Dependencies:** Supports Frontend (Document 0001)

---

## Change Log

**Version 1.0 (Nov 11, 2025):**
- Initial PRD for backend REST API
- Aligned data model with frontend requirements (`content` field, three-status workflow)
- Defined comprehensive API endpoints for full CRUD operations
- Specified validation rules matching frontend (2-2000 chars, duplicate prevention)
- Added filtering by status for efficient frontend queries
- Included detailed error response format
- Defined testing requirements (unit + integration tests)
- Specified JSON file-based persistence with proper atomicity

---

## 1. Introduction/Overview

This document outlines the requirements for building a REST API backend service for the Kanban-Style To-Do Application. The API will provide full CRUD (Create, Read, Update, Delete) operations for managing tasks, with data persistence via JSON file storage.

**Problem Statement:** The frontend Kanban application (Document 0001) requires a robust backend API that stores task data persistently, enforces business rules, and provides reliable endpoints for all task management operations.

**Key Principle:** The backend stores **only** the core task data model (`id`, `content`, `status`, `createdAt`). The backend does NOT store or process `title` or `description` fields - these are frontend-only derived values calculated from the `content` field using frontend business rules.

**Data Flow Architecture:**
```
Frontend → Backend API → JSON File Storage
                ↓
    { id, content, status, createdAt }
                ↓
    Frontend parses content → { title?, description }
```

---

## 2. Goals

1. Provide a reliable REST API for task management with full CRUD operations
2. Persist task data across server restarts using JSON file storage
3. Enforce data validation and business rules at the backend level
4. Support the frontend's three-status Kanban workflow (To Do, In Progress, Completed)
5. Return tasks in consistent order (newest first) for predictable frontend display
6. Enable efficient frontend queries with status filtering
7. Provide clear, detailed error messages for all failure scenarios
8. Support CORS for frontend running on a different port (localhost:5173)
9. Maintain high code quality with comprehensive test coverage
10. Structure the API for easy maintenance and future extensibility

---

## 3. User Stories

**US-001:** As a frontend application, I want to fetch all tasks via API so that I can display them in the Kanban board.

**US-002:** As a frontend application, I want to create new tasks via API so that users can add tasks to their board.

**US-003:** As a frontend application, I want to update task status via API so that users can move tasks between columns.

**US-004:** As a frontend application, I want to update task content via API so that users can edit their tasks.

**US-005:** As a frontend application, I want to delete tasks via API so that users can remove completed or unwanted tasks.

**US-006:** As a frontend application, I want to filter tasks by status so that I can efficiently load specific columns.

**US-007:** As a frontend application, I want to receive detailed error messages so that I can show helpful feedback to users.

**US-008:** As a developer, I want a health check endpoint so that I can monitor API availability.

**US-009:** As a system administrator, I want task data to persist across server restarts so that data is never lost.

**US-010:** As a frontend application, I want the API to prevent duplicate tasks so that data integrity is maintained.

---

## 4. Functional Requirements

### 4.1 Data Model

**FR-001:** The system must use the following TypeScript interface for task storage:

```typescript
interface Task {
  id: string;              // UUID generated via crypto.randomUUID()
  content: string;         // Task content (2-2000 chars, trimmed)
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: number;       // Unix timestamp (milliseconds) via Date.now()
}
```

**FR-002:** The system must NOT store `title`, `description`, `completed`, or any derived fields. Only the four fields above should be persisted.

**FR-003:** The system must generate task IDs using `crypto.randomUUID()`.

**FR-004:** The system must generate timestamps using `Date.now()` (milliseconds since Unix epoch).

### 4.2 API Endpoints

**FR-005:** The system must implement the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all tasks, newest first |
| GET | `/tasks?status=<status>` | Retrieve tasks filtered by status |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update entire task (content + status) |
| PATCH | `/tasks/:id` | Partially update task (any field) |
| PATCH | `/tasks/:id/status` | Update only task status |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/health` | Health check endpoint |

### 4.3 Endpoint: GET /tasks

**FR-006:** The endpoint must return all tasks sorted by `createdAt` in descending order (newest first).

**FR-007:** The endpoint must support an optional `status` query parameter to filter tasks:
- `GET /tasks?status=todo` - Return only tasks with status 'todo'
- `GET /tasks?status=in-progress` - Return only tasks with status 'in-progress'
- `GET /tasks?status=completed` - Return only tasks with status 'completed'

**FR-008:** Filtered results must also be sorted by `createdAt` descending.

**FR-009:** The endpoint must return HTTP 200 with JSON array of tasks:
```json
{
  "tasks": [
    {
      "id": "uuid-here",
      "content": "Buy groceries\nMilk, eggs, bread",
      "status": "todo",
      "createdAt": 1699724400000
    }
  ]
}
```

**FR-010:** The endpoint must return an empty array if no tasks exist: `{ "tasks": [] }`

**FR-011:** The endpoint must return HTTP 400 if the status query parameter has an invalid value.

### 4.4 Endpoint: POST /tasks

**FR-012:** The endpoint must accept a JSON request body:
```json
{
  "content": "Task content here"
}
```

**FR-013:** The endpoint must validate the request:
- Content field must be present
- Content must be a string
- Content must have at least 2 characters after trimming
- Content must not exceed 2000 characters after trimming

**FR-014:** The endpoint must trim whitespace from content before validation and storage.

**FR-015:** The endpoint must check for duplicate tasks:
- Compare content case-insensitively
- For multi-line content, compare only the first line
- Reject if a matching task already exists (any status)

**FR-016:** The endpoint must automatically set:
- `id`: Generated via `crypto.randomUUID()`
- `status`: Default to `'todo'`
- `createdAt`: Current timestamp via `Date.now()`

**FR-017:** The endpoint must return HTTP 201 with the created task on success:
```json
{
  "task": {
    "id": "uuid-here",
    "content": "Buy groceries",
    "status": "todo",
    "createdAt": 1699724400000
  }
}
```

**FR-018:** The endpoint must return appropriate error responses:
- HTTP 400 for validation errors (see Error Handling section)
- HTTP 409 for duplicate task conflicts
- HTTP 500 for server errors

### 4.5 Endpoint: PUT /tasks/:id

**FR-019:** The endpoint must accept a JSON request body with optional fields:
```json
{
  "content": "Updated content",
  "status": "in-progress"
}
```

**FR-020:** The endpoint must validate:
- Task ID must be a valid UUID format
- Task with the ID must exist
- If content is provided, apply same validation as POST (2-2000 chars, trimmed)
- If status is provided, must be one of: 'todo', 'in-progress', 'completed'

**FR-021:** The endpoint must update the specified fields while preserving:
- Original `id`
- Original `createdAt`

**FR-022:** The endpoint must check for duplicates when content is updated (same logic as POST).

**FR-023:** The endpoint must return HTTP 200 with the updated task on success.

**FR-024:** The endpoint must return appropriate error responses:
- HTTP 400 for validation errors
- HTTP 404 if task not found
- HTTP 409 for duplicate conflicts
- HTTP 500 for server errors

### 4.6 Endpoint: PATCH /tasks/:id

**FR-025:** The endpoint must accept partial updates (any subset of fields):
```json
{
  "content": "Updated content"
}
```
OR
```json
{
  "status": "completed"
}
```

**FR-026:** The endpoint must apply the same validation and update logic as PUT, but only for provided fields.

**FR-027:** The endpoint must return HTTP 200 with the updated task on success.

### 4.7 Endpoint: PATCH /tasks/:id/status

**FR-028:** The endpoint must accept a JSON request body:
```json
{
  "status": "in-progress"
}
```

**FR-029:** The endpoint must validate:
- Task with the ID must exist
- Status must be one of: 'todo', 'in-progress', 'completed'

**FR-030:** The endpoint must update only the status field, preserving all other fields.

**FR-031:** The endpoint must return HTTP 200 with the updated task on success.

**FR-032:** The endpoint must return appropriate error responses:
- HTTP 400 for invalid status
- HTTP 404 if task not found
- HTTP 500 for server errors

### 4.8 Endpoint: DELETE /tasks/:id

**FR-033:** The endpoint must validate:
- Task ID must be a valid UUID format
- Task with the ID must exist

**FR-034:** The endpoint must permanently remove the task from storage.

**FR-035:** The endpoint must return HTTP 204 (No Content) on success.

**FR-036:** The endpoint must return appropriate error responses:
- HTTP 404 if task not found
- HTTP 500 for server errors

### 4.9 Endpoint: GET /health

**FR-037:** The endpoint must return HTTP 200 with a JSON response:
```json
{
  "ok": true
}
```

**FR-038:** The endpoint must always return success if the server is running (no database check required for file-based storage).

### 4.10 Data Validation Rules

**FR-039:** Content validation rules:
- **Minimum length:** 2 characters (after trimming)
- **Maximum length:** 2000 characters (after trimming)
- **Trimming:** Remove leading/trailing whitespace before validation
- **Type:** Must be a string

**FR-040:** Status validation rules:
- **Allowed values:** `'todo'`, `'in-progress'`, `'completed'` only
- **Case-sensitive:** Reject variations like `'TODO'`, `'Todo'`, etc.

**FR-041:** ID validation rules:
- **Format:** Must be a valid UUID v4 format
- **Existence:** Must exist in storage for update/delete operations

**FR-042:** Duplicate detection rules:
- **Comparison:** Case-insensitive content comparison
- **Multi-line handling:** For multi-line content, compare only the first line
- **Scope:** Check across all tasks regardless of status
- **Trimming:** Compare trimmed content

### 4.11 Error Handling

**FR-043:** The system must return detailed error responses in the following format:
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE_CONSTANT",
    "field": "fieldName"  // Optional, for validation errors
  }
}
```

**FR-044:** The system must use the following error codes:

| HTTP Status | Error Code | Example Message |
|-------------|------------|-----------------|
| 400 | `VALIDATION_ERROR` | "Content must be at least 2 characters" |
| 400 | `INVALID_STATUS` | "Status must be one of: todo, in-progress, completed" |
| 400 | `INVALID_UUID` | "Task ID must be a valid UUID" |
| 400 | `MISSING_FIELD` | "Content field is required" |
| 400 | `CONTENT_TOO_SHORT` | "Content must be at least 2 characters after trimming" |
| 400 | `CONTENT_TOO_LONG` | "Content must not exceed 2000 characters" |
| 404 | `TASK_NOT_FOUND` | "Task with ID {id} not found" |
| 409 | `DUPLICATE_TASK` | "A task with this content already exists" |
| 500 | `INTERNAL_ERROR` | "An unexpected error occurred" |
| 500 | `STORAGE_ERROR` | "Failed to read/write task data" |

**FR-045:** The system must log all errors to console with appropriate severity levels.

**FR-046:** The system must never expose sensitive information (file paths, stack traces) in production error responses.

### 4.12 Data Persistence

**FR-047:** The system must store all tasks in a single JSON file (e.g., `data/tasks.json`).

**FR-048:** The system must use atomic write operations to prevent data corruption:
- Write to a temporary file first
- Rename to the actual file after successful write
- Use appropriate file system flags to ensure atomicity

**FR-049:** The system must load task data from the JSON file on server startup.

**FR-050:** The system must handle missing or corrupted data files gracefully:
- If file doesn't exist, start with an empty task array
- If file is corrupted, log error and start with empty array (consider backup)

**FR-051:** The system must persist changes immediately after each create/update/delete operation.

**FR-052:** The system must handle file system errors gracefully and return HTTP 500 with `STORAGE_ERROR`.

**FR-053:** The JSON file must store tasks as an array:
```json
{
  "tasks": [
    {
      "id": "uuid-1",
      "content": "Task 1",
      "status": "todo",
      "createdAt": 1699724400000
    }
  ]
}
```

### 4.13 CORS Configuration

**FR-054:** The system must enable CORS for the frontend origin: `http://localhost:5173`

**FR-055:** The system must allow the following HTTP methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

**FR-056:** The system must allow the following headers: Content-Type, Authorization

**FR-057:** The system must handle preflight OPTIONS requests correctly.

### 4.14 Server Configuration

**FR-058:** The system must load configuration from a `config.json` file at startup.

**FR-059:** The configuration file must support the following options:
```json
{
  "port": 3001,
  "corsOrigin": "http://localhost:5173",
  "dataFilePath": "./data/tasks.json"
}
```

**FR-060:** The system must use default values if config file is missing or incomplete:
- Default port: 3001
- Default CORS origin: "http://localhost:5173"
- Default data path: "./data/tasks.json"

**FR-061:** The system must create the data directory if it doesn't exist on startup.

**FR-062:** The system must log the loaded configuration on startup for debugging.

### 4.15 NPM Scripts

**FR-063:** The system must provide the following npm scripts:
- `npm run dev` - Start development server with nodemon (auto-reload on changes)
- `npm start` - Start production server with plain Node.js
- `npm test` - Run all tests (unit + integration)
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only

---

## 5. Non-Goals (Out of Scope)

**NG-001:** User authentication or authorization (single-user application).

**NG-002:** Task priority, labels, or tags.

**NG-003:** Task due dates or reminders.

**NG-004:** Task assignment or collaboration features.

**NG-005:** Real-time updates via WebSockets.

**NG-006:** Database integration (PostgreSQL, MongoDB, etc.) - file-based storage only.

**NG-007:** Task history or audit logs.

**NG-008:** Bulk operations (delete all, update multiple).

**NG-009:** Task search functionality (handled by frontend).

**NG-010:** Rate limiting or API throttling.

**NG-011:** API versioning (v1, v2) - simple unversioned API.

**NG-012:** Pagination (handled by frontend if needed).

**NG-013:** Task archiving or soft deletes.

**NG-014:** HTTPS/SSL configuration (use reverse proxy if needed).

**NG-015:** Docker containerization (future enhancement).

**NG-016:** Processing or validating the title/description fields (frontend-only concern).

---

## 6. Design Considerations

### 6.1 Technology Stack

- **Runtime:** Node.js 18+ (for native crypto.randomUUID() support)
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x (strict mode enabled)
- **Testing:** Jest + Supertest
- **Dev Tools:** Nodemon, ts-node
- **Code Quality:** ESLint, Prettier

### 6.2 Project Structure

```
/backend
  /src
    /routes
      /tasks.ts          # Task route handlers
      /health.ts         # Health check route
    /services
      /taskService.ts    # Business logic for tasks
      /storageService.ts # File I/O operations
    /middleware
      /errorHandler.ts   # Global error handling
      /validator.ts      # Request validation
    /types
      /task.ts           # Task interface and types
      /error.ts          # Error types and codes
    /utils
      /validation.ts     # Validation helpers
      /duplicateCheck.ts # Duplicate detection logic
    /config
      /index.ts          # Configuration loader
    app.ts               # Express app setup
    server.ts            # Server entry point
  /tests
    /unit
      /taskService.test.ts
      /validation.test.ts
      /duplicateCheck.test.ts
    /integration
      /tasks.test.ts     # API endpoint tests
      /health.test.ts
  /data
    /tasks.json          # Task storage file (gitignored)
  config.json            # Configuration file
  package.json
  tsconfig.json
  .eslintrc.json
  .prettierrc
  .gitignore
  README.md
```

### 6.3 Separation of Concerns

**Route Handlers (`/routes`):**
- Handle HTTP requests/responses
- Extract parameters and body
- Call service layer functions
- Return formatted responses

**Service Layer (`/services`):**
- Implement business logic
- Validation and duplicate checking
- Call storage layer
- Throw appropriate errors

**Storage Layer (`/services/storageService.ts`):**
- Handle file I/O operations
- Ensure atomic writes
- Handle file system errors
- Abstract storage implementation

**Middleware:**
- Error handling (convert errors to HTTP responses)
- Request validation (schema validation)
- CORS configuration

### 6.4 Error Handling Strategy

1. **Service Layer:** Throw custom error classes with codes:
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public field?: string
  ) {
    super(message);
  }
}
```

2. **Route Handlers:** Catch errors and pass to error middleware.

3. **Error Middleware:** Convert errors to formatted HTTP responses.

### 6.5 Validation Strategy

**Request Validation:**
- Use middleware for schema validation
- Validate request body structure
- Type checking before business logic

**Business Logic Validation:**
- Content length validation in service layer
- Duplicate detection in service layer
- Status value validation

**ID Validation:**
- UUID format validation
- Existence checks before updates/deletes

---

## 7. Technical Considerations

### 7.1 Duplicate Detection Algorithm

The duplicate detection logic must:

1. Extract the first line from the content being checked:
```typescript
const firstLine = content.trim().split('\n')[0];
```

2. For each existing task, extract its first line:
```typescript
const existingFirstLine = existingTask.content.trim().split('\n')[0];
```

3. Compare case-insensitively:
```typescript
const isDuplicate = firstLine.toLowerCase() === existingFirstLine.toLowerCase();
```

4. Return conflict error if duplicate found.

**Example Implementation Pattern:**
```typescript
function isDuplicateTask(content: string, tasks: Task[], excludeId?: string): boolean {
  const firstLine = content.trim().split('\n')[0].toLowerCase();
  
  return tasks.some(task => {
    if (excludeId && task.id === excludeId) {
      return false; // Allow updating the same task
    }
    const taskFirstLine = task.content.trim().split('\n')[0].toLowerCase();
    return firstLine === taskFirstLine;
  });
}
```

### 7.2 Atomic File Writes

To prevent data corruption during writes:

```typescript
async function saveTasksAtomic(tasks: Task[], filePath: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  const data = JSON.stringify({ tasks }, null, 2);
  
  // Write to temp file
  await fs.promises.writeFile(tempPath, data, 'utf8');
  
  // Atomic rename
  await fs.promises.rename(tempPath, filePath);
}
```

### 7.3 Sorting Implementation

Always sort by `createdAt` descending:

```typescript
function sortTasksByNewest(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => b.createdAt - a.createdAt);
}
```

### 7.4 Status Filtering

Efficient filtering implementation:

```typescript
function filterByStatus(tasks: Task[], status?: string): Task[] {
  if (!status) return tasks;
  return tasks.filter(task => task.status === status);
}
```

### 7.5 Performance Considerations

- **In-memory caching:** Load tasks into memory on startup, keep in sync with file
- **File writes:** Asynchronous with proper error handling
- **Array operations:** Use efficient filtering and sorting
- **Large datasets:** Current design supports hundreds of tasks; consider optimization if thousands are expected

### 7.6 Testing Strategy

**Unit Tests:**
- Test validation functions (content length, status values, UUID format)
- Test duplicate detection logic
- Test sorting and filtering functions
- Test error creation and handling
- Mock storage layer for isolated tests

**Integration Tests:**
- Test all API endpoints with real HTTP requests
- Test full request/response cycle
- Test error responses
- Test CORS headers
- Use in-memory or temporary file storage for tests

**Test Coverage Goals:**
- Minimum 80% code coverage
- 100% coverage for critical business logic (validation, duplicate detection)
- All error paths tested

**Example Test Cases:**
- Create task with valid content → 201 success
- Create task with empty content → 400 validation error
- Create task with >2000 chars → 400 validation error
- Create duplicate task → 409 conflict error
- Update non-existent task → 404 not found
- Update task with invalid status → 400 validation error
- Delete task → 204 success
- Get tasks returns newest first
- Filter tasks by status returns correct subset

---

## 8. Success Metrics

### 8.1 Feature Completeness

✅ All API endpoints implemented (GET, POST, PUT, PATCH, DELETE, health)  
✅ All validation rules enforced (2-2000 chars, duplicate detection, status values)  
✅ Data persists across server restarts  
✅ CORS configured correctly for frontend origin  
✅ Detailed error responses for all failure scenarios  
✅ Filtering by status works correctly  
✅ Tasks always returned newest first  

### 8.2 Quality Standards

✅ TypeScript strict mode with no type errors  
✅ No console warnings or errors during normal operation  
✅ All unit tests passing (80%+ coverage)  
✅ All integration tests passing  
✅ ESLint and Prettier configured with zero violations  
✅ `npm run dev` starts without errors  
✅ `npm start` runs in production mode  

### 8.3 Performance

✅ API responds to requests within 100ms (for small datasets)  
✅ Server startup time under 2 seconds  
✅ No memory leaks during extended operation  
✅ Atomic writes prevent data corruption  

### 8.4 Frontend Integration Readiness

✅ All endpoints documented with request/response examples  
✅ Error codes documented for frontend error handling  
✅ CORS configured for frontend port  
✅ Data model exactly matches frontend expectations  
✅ API returns data in format expected by frontend  
✅ Status values match frontend expectations ('todo', 'in-progress', 'completed')  

### 8.5 Code Quality

✅ Clean separation of concerns (routes, services, storage)  
✅ Consistent error handling throughout  
✅ Well-documented functions and types  
✅ No hardcoded values (use configuration)  
✅ Reusable validation and utility functions  

---

## 9. API Documentation

### 9.1 Quick Reference

**Base URL:** `http://localhost:3001`

**Content-Type:** `application/json` (for all requests/responses)

**CORS:** Enabled for `http://localhost:5173`

### 9.2 Example API Requests

**Create Task:**
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Buy groceries\nMilk, eggs, bread"
  }'
```

**Get All Tasks:**
```bash
curl http://localhost:3001/tasks
```

**Get Tasks by Status:**
```bash
curl http://localhost:3001/tasks?status=todo
```

**Update Task Status:**
```bash
curl -X PATCH http://localhost:3001/tasks/{id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

**Update Full Task:**
```bash
curl -X PUT http://localhost:3001/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content",
    "status": "completed"
  }'
```

**Partial Update:**
```bash
curl -X PATCH http://localhost:3001/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Only update content"
  }'
```

**Delete Task:**
```bash
curl -X DELETE http://localhost:3001/tasks/{id}
```

**Health Check:**
```bash
curl http://localhost:3001/health
```

### 9.3 Response Examples

**Success Response (GET /tasks):**
```json
{
  "tasks": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "content": "Buy groceries\nMilk, eggs, bread",
      "status": "todo",
      "createdAt": 1699724400000
    },
    {
      "id": "f1e2d3c4-b5a6-7890-cdef-ab1234567890",
      "content": "Write PRD",
      "status": "completed",
      "createdAt": 1699724300000
    }
  ]
}
```

**Error Response (400 Validation Error):**
```json
{
  "error": {
    "message": "Content must be at least 2 characters after trimming",
    "code": "CONTENT_TOO_SHORT",
    "field": "content"
  }
}
```

**Error Response (409 Duplicate):**
```json
{
  "error": {
    "message": "A task with this content already exists",
    "code": "DUPLICATE_TASK",
    "field": "content"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": {
    "message": "Task with ID a1b2c3d4-e5f6-7890-abcd-ef1234567890 not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

---

## 10. Acceptance Criteria

### 10.1 Endpoint Implementation

- [ ] GET /tasks returns all tasks sorted newest first
- [ ] GET /tasks?status=todo filters correctly
- [ ] GET /tasks?status=in-progress filters correctly
- [ ] GET /tasks?status=completed filters correctly
- [ ] GET /tasks?status=invalid returns 400 error
- [ ] POST /tasks creates task with auto-generated id and createdAt
- [ ] POST /tasks defaults status to 'todo'
- [ ] POST /tasks returns 201 with created task
- [ ] PUT /tasks/:id updates task and returns 200
- [ ] PATCH /tasks/:id partially updates task and returns 200
- [ ] PATCH /tasks/:id/status updates only status and returns 200
- [ ] DELETE /tasks/:id removes task and returns 204
- [ ] GET /health returns 200 with { ok: true }

### 10.2 Validation

- [ ] Content with <2 chars (after trim) returns 400 CONTENT_TOO_SHORT
- [ ] Content with >2000 chars returns 400 CONTENT_TOO_LONG
- [ ] Missing content field returns 400 MISSING_FIELD
- [ ] Invalid status value returns 400 INVALID_STATUS
- [ ] Invalid UUID format returns 400 INVALID_UUID
- [ ] Duplicate content (case-insensitive) returns 409 DUPLICATE_TASK
- [ ] Duplicate detection works for multi-line content (compares first line only)
- [ ] Non-existent task ID returns 404 TASK_NOT_FOUND
- [ ] Content is trimmed before validation and storage

### 10.3 Data Persistence

- [ ] Tasks persist to JSON file on create
- [ ] Tasks persist to JSON file on update
- [ ] Tasks persist to JSON file on delete
- [ ] Tasks load from JSON file on server startup
- [ ] Missing data file is handled gracefully (starts with empty array)
- [ ] Corrupted data file is handled gracefully (logs error, starts with empty array)
- [ ] Data directory is created if it doesn't exist
- [ ] File writes are atomic (no corruption on server crash)

### 10.4 CORS

- [ ] CORS headers present for http://localhost:5173
- [ ] OPTIONS preflight requests handled correctly
- [ ] All HTTP methods allowed (GET, POST, PUT, PATCH, DELETE)
- [ ] Content-Type header allowed

### 10.5 Configuration

- [ ] Server loads config.json on startup
- [ ] Server uses default values if config.json missing
- [ ] Server logs loaded configuration
- [ ] Port is configurable via config.json
- [ ] CORS origin is configurable via config.json
- [ ] Data file path is configurable via config.json

### 10.6 Error Handling

- [ ] All errors return structured format with message, code, field
- [ ] 400 errors used for validation failures
- [ ] 404 errors used for not found
- [ ] 409 errors used for conflicts
- [ ] 500 errors used for server errors
- [ ] Error messages are clear and helpful
- [ ] No sensitive information leaked in error responses

### 10.7 NPM Scripts

- [ ] `npm run dev` starts server with nodemon
- [ ] `npm start` starts server with node
- [ ] `npm test` runs all tests
- [ ] `npm run test:unit` runs unit tests
- [ ] `npm run test:integration` runs integration tests
- [ ] All scripts execute without errors

### 10.8 Testing

- [ ] Unit tests exist for validation logic
- [ ] Unit tests exist for duplicate detection
- [ ] Unit tests exist for sorting/filtering
- [ ] Integration tests exist for all endpoints
- [ ] Integration tests cover success cases
- [ ] Integration tests cover error cases
- [ ] Test coverage is at least 80%
- [ ] All tests pass successfully

### 10.9 Code Quality

- [ ] TypeScript strict mode enabled
- [ ] No TypeScript compilation errors
- [ ] ESLint configured and passing
- [ ] Prettier configured and applied
- [ ] Code follows consistent style
- [ ] Functions are well-documented
- [ ] Separation of concerns maintained (routes/services/storage)

### 10.10 Frontend Integration Readiness

- [ ] Data model matches frontend expectations exactly
- [ ] Status values match frontend ('todo', 'in-progress', 'completed')
- [ ] API returns only the four required fields (id, content, status, createdAt)
- [ ] No title or description fields in responses
- [ ] Tasks returned in correct order (newest first)
- [ ] All frontend CRUD operations supported
- [ ] Error responses can be consumed by frontend

---

## 11. Implementation Notes

### 11.1 Recommended Development Order

**Phase 1 - Project Setup (Day 1)**
1. Initialize Node.js + TypeScript project
2. Set up Express.js basic server
3. Configure ESLint, Prettier
4. Create basic project structure (folders)
5. Set up npm scripts (dev, start)
6. Create Task interface and types

**Phase 2 - Storage Layer (Day 1-2)**
1. Implement storageService.ts (read/write JSON file)
2. Implement atomic write operations
3. Handle file system errors
4. Test storage operations manually

**Phase 3 - Validation & Business Logic (Day 2-3)**
1. Create validation utilities (content length, status, UUID)
2. Implement duplicate detection logic
3. Create custom error classes
4. Write unit tests for validation and duplicate detection
5. Create taskService.ts with business logic

**Phase 4 - API Endpoints (Day 3-4)**
1. Implement GET /health endpoint
2. Implement GET /tasks (all + filtering)
3. Implement POST /tasks
4. Implement PATCH /tasks/:id/status
5. Implement PUT /tasks/:id
6. Implement PATCH /tasks/:id
7. Implement DELETE /tasks/:id
8. Add CORS configuration

**Phase 5 - Error Handling (Day 4)**
1. Create error middleware
2. Implement structured error responses
3. Add error codes and messages
4. Test all error scenarios

**Phase 6 - Configuration (Day 4)**
1. Create config.json
2. Implement configuration loader
3. Add default values
4. Test with different configurations

**Phase 7 - Integration Testing (Day 5)**
1. Set up Jest + Supertest
2. Write integration tests for all endpoints
3. Test success cases
4. Test error cases
5. Test CORS
6. Ensure 80%+ coverage

**Phase 8 - Documentation & Polish (Day 5)**
1. Write README with setup instructions
2. Document all API endpoints
3. Provide curl examples
4. Add inline code documentation
5. Final code review and cleanup

### 11.2 Development Environment Setup

**Required Tools:**
- Node.js 18+ (for crypto.randomUUID())
- npm or yarn
- Code editor (VS Code recommended)
- Postman or curl for API testing (optional)

**Initial Setup Commands:**
```bash
mkdir backend
cd backend
npm init -y
npm install express cors
npm install -D typescript @types/node @types/express @types/cors
npm install -D nodemon ts-node
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D eslint prettier eslint-config-prettier
npx tsc --init
```

### 11.3 Testing Strategy

**Unit Tests:**
- Focus on isolated functions (validation, duplicate detection, sorting)
- Mock dependencies (file system, external services)
- Fast execution (<1s total)
- Run on every file save

**Integration Tests:**
- Test full HTTP request/response cycle
- Use temporary test database file
- Clean up after each test
- Test all endpoints
- Test error scenarios

**Manual Testing:**
- Use provided curl examples
- Test with Postman collection (optional)
- Test CORS from frontend once available

### 11.4 Common Pitfalls to Avoid

1. **Not trimming content before validation** - Always trim first
2. **Case-sensitive duplicate detection** - Must be case-insensitive
3. **Not comparing first line only for duplicates** - Multi-line tasks should compare first line
4. **Race conditions in file writes** - Use atomic writes
5. **Exposing stack traces in production** - Return generic errors only
6. **Not handling corrupted JSON files** - Graceful fallback to empty array
7. **Hardcoding configuration values** - Use config.json
8. **Not testing error paths** - Test all validation failures
9. **Storing derived fields** - Never store title/description
10. **Inconsistent status values** - Always use lowercase with hyphens

---

## 12. Open Questions

1. **Backup Strategy:** Should the system create backup copies of the tasks.json file before overwriting? (e.g., tasks.json.backup)

2. **Rate Limiting:** Should we implement basic rate limiting to prevent abuse, or is it unnecessary for a single-user application?

3. **Logging:** What level of logging is desired? (Debug, Info, Warn, Error only) Should we use a logging library or console.log?

4. **Task Limits:** Should there be a maximum number of tasks allowed in the system?

5. **Data Migration:** If the data model changes in the future, should we provide migration utilities?

6. **Health Check Details:** Should the health check endpoint verify file system access or just confirm the server is running?

7. **CORS in Production:** Should the CORS origin be configurable for different environments (dev, staging, production)?

8. **Content Sanitization:** Should we sanitize content to remove potentially dangerous characters or allow any string?

---

## 13. Related Documents

- **Document 0001:** Frontend Kanban To-Do Application PRD
- **backend.md:** Initial backend requirements (superseded by this PRD)

---

**End of Document**

