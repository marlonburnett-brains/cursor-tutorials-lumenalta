# Tasks: Frontend-Backend Integration

## Relevant Files

- `frontend/src/config/api.ts` - **NEW** - API configuration and base URL
- `frontend/src/services/apiClient.ts` - **NEW** - Centralized fetch wrapper with error handling and timeout support
- `frontend/src/types/apiError.ts` - **NEW** - Custom error types for API failures
- `frontend/src/services/taskService.ts` - **MODIFY** - Replace localStorage with API calls
- `frontend/src/hooks/useTasks.ts` - **MODIFY** - Enhanced error handling and optimistic updates
- `frontend/src/contexts/TasksContext.tsx` - **MODIFY** - Add retry functionality
- `frontend/src/components/ErrorNotification/ErrorNotification.tsx` - **NEW** - Error display component with retry action
- `frontend/src/components/ErrorNotification/ErrorNotification.css` - **NEW** - Styling for error notification
- `frontend/src/components/TaskBoard/TaskBoard.tsx` - **MODIFY** - Enhanced loading states
- `frontend/src/components/TaskCard/TaskCard.tsx` - **MODIFY** - Individual task loading states
- `frontend/src/components/NewTaskCard/NewTaskCard.tsx` - **MODIFY** - Error handling for task creation
- `frontend/src/App.tsx` - **MODIFY** - Add error boundary and global error handling
- `frontend/.env.example` - **NEW** - Environment variable template
- `frontend/src/services/apiClient.test.ts` - **NEW** - Unit tests for API client
- `frontend/src/services/taskService.test.ts` - **MODIFY** - Update tests to mock API calls
- `frontend/tests/integration/api.test.ts` - **NEW** - Integration tests for API calls
- `frontend/tests/e2e/frontend-backend.test.ts` - **NEW** - End-to-end tests

### Notes

- Unit tests should be placed alongside the code files they are testing
- Integration and E2E tests go in the `frontend/tests/` directory
- Use `npm test` to run tests (configure test script in package.json if needed)
- Backend must be running on `http://localhost:3001` for integration/E2E tests

## Tasks

- [x] 1.0 Set up API Infrastructure and Configuration
  - [x] 1.1 Create `frontend/src/config/api.ts` with API base URL configuration (use `import.meta.env.VITE_API_URL` with fallback to `http://localhost:3001`)
  - [x] 1.2 Create `frontend/src/types/apiError.ts` with custom error classes: `NetworkError`, `ValidationError`, `NotFoundError`, `ServerError`, and `TimeoutError` (all extending `Error`)
  - [x] 1.3 Create `frontend/src/services/apiClient.ts` with a centralized fetch wrapper that includes: request timeout (10 seconds), proper headers (`Content-Type: application/json`), error handling for different status codes (400, 404, 500), and network failures
  - [x] 1.4 Implement request/response parsing in `apiClient.ts` to handle backend response formats (`{ task }` for single operations, `{ tasks }` for lists, `204 No Content` for deletes)
  - [x] 1.5 Create `frontend/.env.example` file documenting the `VITE_API_URL` environment variable with example value `http://localhost:3001`
  - [x] 1.6 Verify CORS is working by testing a simple GET request to the backend `/health` endpoint

- [x] 2.0 Replace localStorage with Backend API Integration
  - [x] 2.1 Update `getTasks()` in `taskService.ts` to call `GET http://localhost:3001/tasks` using the API client, parse the `{ tasks }` response, and return the tasks array
  - [x] 2.2 Update `createTask(content)` to call `POST http://localhost:3001/tasks` with `{ content }` in body, parse `{ task }` response, and return the created task
  - [x] 2.3 Update `updateTask(id, updates)` to call `PATCH http://localhost:3001/tasks/:id` with updates in body, parse `{ task }` response, and return the updated task
  - [x] 2.4 Update `updateTaskStatus(id, status)` to call `PATCH http://localhost:3001/tasks/:id/status` with `{ status }` in body, parse `{ task }` response, and return the updated task
  - [x] 2.5 Update `deleteTask(id)` to call `DELETE http://localhost:3001/tasks/:id` and handle the `204 No Content` response
  - [x] 2.6 Remove the internal `saveTasks()` function from `taskService.ts` as it's no longer needed
  - [x] 2.7 Add logic to clear localStorage (`kanban_tasks` key) on application initialization (in `App.tsx` or on first API call)
  - [x] 2.8 Remove or update the old localStorage code and API placeholder comments from `taskService.ts`

- [x] 3.0 Implement Enhanced Error Handling and User Feedback
  - [x] 3.1 Create `frontend/src/components/ErrorNotification/ErrorNotification.tsx` component that displays error messages, includes a dismiss button (X icon), includes a "Retry" button that accepts a retry callback, and auto-dismisses after 5 seconds
  - [x] 3.2 Create `frontend/src/components/ErrorNotification/ErrorNotification.css` with toast-style positioning (top-right corner), glass morphism styling to match existing design, and smooth enter/exit animations
  - [x] 3.3 Add error state management to `App.tsx`: create state for current error and retry callback, implement `showError(message, retryFn)` function, render `ErrorNotification` component when error exists
  - [x] 3.4 Map API error types to user-friendly messages in `apiClient.ts`: "Unable to connect to server. Please check your connection." for network failures, display backend validation messages for 400 errors, "Task not found. It may have been deleted." for 404 errors, "Server error occurred. Please try again." for 500 errors, "Request timed out. Please try again." for timeouts
  - [x] 3.5 Update `useTasks.ts` to pass error information to the global error handler instead of just logging to console
  - [x] 3.6 Test error display by simulating network failure (stop backend) and verify error notification appears with retry button

- [x] 4.0 Add Optimistic Updates and Loading States
  - [x] 4.1 Implement optimistic update for `createTask` in `useTasks.ts`: immediately add task with temporary ID (prefix with `temp-`), update state with optimistic task, on API success replace temp ID with real ID from server, on API failure remove the optimistic task and show error
  - [x] 4.2 Implement optimistic update for `updateTask` in `useTasks.ts`: immediately update task in local state, on API success confirm update with server data, on API failure revert to previous state and show error
  - [x] 4.3 Implement optimistic update for `deleteTask` in `useTasks.ts`: immediately remove task from local state, on API success confirm deletion, on API failure restore the task and show error
  - [x] 4.4 Add visual indicator for pending operations in `TaskCard.tsx`: add `isPending` prop and visual styling (reduced opacity or subtle loading spinner), disable edit/delete buttons during pending state
  - [x] 4.5 Enhance loading state in `TaskBoard.tsx`: replace simple "Loading tasks..." with a skeleton screen showing 3 columns with placeholder cards, ensure the loading state only appears on initial page load
  - [x] 4.6 Add error recovery in `TaskBoard.tsx`: improve error display with better styling, ensure "Retry" button calls `refreshTasks()` to reload data
  - [x] 4.7 Add loading feedback to `NewTaskCard.tsx`: disable input and button during task creation, show loading indicator on submit button, clear input only after successful API response
  - [x] 4.8 Test optimistic updates: create a task with backend stopped → see optimistic UI → see error and revert, update task status via drag-and-drop → see immediate visual feedback → confirm persistence

- [x] 5.0 Implement Comprehensive Testing
  - [x] 5.1 Create `frontend/src/services/apiClient.test.ts` with unit tests for: successful GET/POST/PATCH/DELETE requests, error handling for 400/404/500 status codes, network error handling, timeout handling, correct request headers
  - [x] 5.2 Update `frontend/src/services/taskService.test.ts` to: mock the API client module, test each CRUD operation with mocked responses, test error propagation from API to service layer, verify correct endpoint URLs and request bodies
  - [x] 5.3 Add `vitest` to `package.json` if not already present and configure test scripts: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:coverage": "vitest --coverage"`
  - [x] 5.4 Create `frontend/tests/integration/api.test.ts` with integration tests (requires backend running): test full CRUD flow end-to-end (create → read → update → delete), test filtering by status, test error scenarios (404 for non-existent task), verify data persistence across operations
  - [x] 5.5 Install and configure Playwright or Cypress for E2E testing: add to `package.json`, create configuration file, add E2E test script
  - [x] 5.6 Create `frontend/tests/e2e/frontend-backend.test.ts` with E2E tests: launch app → create tasks → refresh → verify persistence, create task → drag to different column → refresh → verify status persists, edit task content → refresh → verify changes persist, delete task → refresh → verify deletion persists
  - [x] 5.7 Create E2E error recovery tests: start with backend offline → verify error shows → start backend → click retry → verify success, attempt operation with backend offline → verify error → retry → verify recovery
  - [x] 5.8 Run all tests and fix any failures: unit tests (`npm test`), integration tests (with backend running), E2E tests (with both frontend and backend running), verify test coverage meets requirements

---

**Status:** Phase 2 - Complete task breakdown with sub-tasks
**Total Sub-tasks:** 40
**Estimated Complexity:** Medium-High (API integration + comprehensive testing)
**Prerequisites:** Backend must be running on `http://localhost:3001` for integration/E2E tests

