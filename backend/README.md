# Backend REST API for Kanban To-Do Application

A robust Node.js REST API built with TypeScript and Express.js for managing tasks in a Kanban-style to-do application.

## Features

- ✅ Full CRUD operations for tasks
- ✅ Status-based filtering (todo, in-progress, completed)
- ✅ Duplicate task prevention (case-insensitive)
- ✅ Content validation (2-2000 characters)
- ✅ Persistent JSON file storage with atomic writes
- ✅ CORS enabled for frontend integration
- ✅ Comprehensive error handling with structured responses
- ✅ 143 tests (111 unit + 32 integration) with 80%+ coverage

## Prerequisites

- Node.js 18+ (required for `crypto.randomUUID()`)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Configuration

Create or modify `config.json` in the project root:

```json
{
  "port": 3001,
  "corsOrigin": "http://localhost:5173",
  "dataFilePath": "./data/tasks.json"
}
```

**Default values** (used if config.json is missing):
- Port: `3001`
- CORS Origin: `http://localhost:5173`
- Data File: `./data/tasks.json`

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## API Endpoints

Base URL: `http://localhost:3001`

### Health Check

#### GET /health
Returns server status.

**Response:** `200 OK`
```json
{
  "ok": true
}
```

### Tasks

#### GET /tasks
Get all tasks, sorted by newest first.

**Query Parameters:**
- `status` (optional): Filter by status (`todo`, `in-progress`, or `completed`)

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Buy groceries\nMilk, eggs, bread",
      "status": "todo",
      "createdAt": 1699724400000
    }
  ]
}
```

**Example:**
```bash
# Get all tasks
curl http://localhost:3001/tasks

# Get only todo tasks
curl http://localhost:3001/tasks?status=todo

# Get only in-progress tasks
curl http://localhost:3001/tasks?status=in-progress

# Get only completed tasks
curl http://localhost:3001/tasks?status=completed
```

---

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "content": "Buy groceries"
}
```

**Response:** `201 Created`
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Buy groceries",
    "status": "todo",
    "createdAt": 1699724400000
  }
}
```

**Validation Rules:**
- Content is required
- Content must be 2-2000 characters (after trimming)
- Duplicate detection (case-insensitive, first line only)

**Example:**
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"content": "Buy groceries\nMilk, eggs, bread"}'
```

---

#### PUT /tasks/:id
Update a task (full update).

**Request Body:**
```json
{
  "content": "Updated content",
  "status": "in-progress"
}
```

**Response:** `200 OK`
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Updated content",
    "status": "in-progress",
    "createdAt": 1699724400000
  }
}
```

**Example:**
```bash
curl -X PUT http://localhost:3001/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content", "status": "in-progress"}'
```

---

#### PATCH /tasks/:id
Partially update a task.

**Request Body:** (provide only fields to update)
```json
{
  "content": "Updated content"
}
```
or
```json
{
  "status": "completed"
}
```

**Response:** `200 OK`
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Updated content",
    "status": "todo",
    "createdAt": 1699724400000
  }
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3001/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content"}'
```

---

#### PATCH /tasks/:id/status
Update only the task status.

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Valid status values:** `todo`, `in-progress`, `completed`

**Response:** `200 OK`
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Buy groceries",
    "status": "in-progress",
    "createdAt": 1699724400000
  }
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3001/tasks/550e8400-e29b-41d4-a716-446655440000/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

---

#### DELETE /tasks/:id
Delete a task.

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE http://localhost:3001/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE_CONSTANT",
    "field": "fieldName"
  }
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | General validation failure |
| 400 | `INVALID_STATUS` | Invalid status value |
| 400 | `INVALID_UUID` | Invalid task ID format |
| 400 | `MISSING_FIELD` | Required field missing |
| 400 | `CONTENT_TOO_SHORT` | Content < 2 characters |
| 400 | `CONTENT_TOO_LONG` | Content > 2000 characters |
| 404 | `TASK_NOT_FOUND` | Task doesn't exist |
| 409 | `DUPLICATE_TASK` | Task with same content exists |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 500 | `STORAGE_ERROR` | File system error |

**Example Error Response:**
```json
{
  "error": {
    "message": "Content must be at least 2 characters after trimming",
    "code": "CONTENT_TOO_SHORT",
    "field": "content"
  }
}
```

## Data Model

Tasks are stored with the following structure:

```typescript
interface Task {
  id: string;              // UUID v4 (auto-generated)
  content: string;         // Task content (2-2000 chars, trimmed)
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: number;       // Unix timestamp in milliseconds
}
```

**Important Notes:**
- The backend does NOT store `title` or `description` fields
- These are frontend-only derived values parsed from `content`
- Content is always trimmed before validation and storage
- Duplicate detection compares the first line only (case-insensitive)

## Data Persistence

Tasks are stored in a JSON file with atomic write operations:

1. New data is written to a temporary file (`tasks.json.tmp`)
2. The temporary file is renamed to replace the original file
3. This prevents data corruption if the server crashes during writing

**Storage File Structure:**
```json
{
  "tasks": [
    {
      "id": "uuid-here",
      "content": "Task content",
      "status": "todo",
      "createdAt": 1699724400000
    }
  ]
}
```

## Project Structure

```
backend/
├── src/
│   ├── types/
│   │   ├── task.ts           # Task interface and types
│   │   └── error.ts          # Error classes and codes
│   ├── services/
│   │   ├── storageService.ts # File I/O operations
│   │   └── taskService.ts    # Business logic
│   ├── utils/
│   │   ├── validation.ts     # Validation functions
│   │   └── duplicateCheck.ts # Duplicate detection
│   ├── middleware/
│   │   ├── errorHandler.ts   # Error handling
│   │   └── validator.ts      # Request validation
│   ├── routes/
│   │   ├── health.ts         # Health check route
│   │   └── tasks.ts          # Task routes
│   ├── config/
│   │   └── index.ts          # Configuration loader
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── tests/
│   └── integration/
│       ├── health.test.ts    # Health endpoint tests
│       └── tasks.test.ts     # Task endpoint tests
├── data/                     # Task storage (gitignored)
│   └── tasks.json
├── config.json               # Configuration file
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Development

### Code Quality

The project uses:
- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing

```bash
# Lint code
npm run lint

# Format code
npm run format

# Build TypeScript
npm run build
```

### Testing Philosophy

- **Unit tests** test individual functions in isolation (mocked dependencies)
- **Integration tests** test full HTTP request/response cycles with real endpoints
- All business logic is thoroughly tested
- Error paths are tested alongside success paths

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` error:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

Or change the port in `config.json`.

### CORS Errors

If frontend can't connect:
1. Verify `corsOrigin` in `config.json` matches your frontend URL
2. Check that the frontend is running on the configured port
3. Make sure CORS headers are present in responses

### Data File Permissions

If you see storage errors:
```bash
# Ensure data directory is writable
chmod 755 data/
chmod 644 data/tasks.json
```

### Tests Failing

If tests fail:
1. Ensure Node.js version is 18 or higher
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clean test artifacts: `rm -rf test-data test-integration-data`

## Production Considerations

### Environment Variables

Set `NODE_ENV=production` to:
- Hide detailed error messages (no stack traces)
- Optimize performance

```bash
NODE_ENV=production npm start
```

### Monitoring

The API logs:
- Configuration on startup
- Server start message with URL
- All errors (console.error)

Consider using a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/server.js --name todo-api
```

### Security

- CORS is configured for a specific origin
- No authentication (single-user app)
- Error messages don't expose sensitive info in production
- Input validation prevents injection attacks

## License

ISC

## Contributing

This is a tutorial project. Feel free to use it as a starting point for your own applications!

