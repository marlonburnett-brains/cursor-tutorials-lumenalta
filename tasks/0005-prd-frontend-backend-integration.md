# PRD: Frontend-Backend Integration

## Introduction/Overview

This feature connects the existing React frontend Kanban Todo application with the Express backend REST API, replacing the current localStorage-based persistence with server-side data storage. The integration enables data persistence across sessions and devices while maintaining the smooth user experience of the current application.

**Problem Statement:** The frontend currently stores all task data in localStorage, which limits data accessibility to a single browser and device. Users cannot access their tasks from different devices or browsers.

**Goal:** Integrate the frontend with the backend API to enable centralized data storage, allowing tasks to persist across sessions and be accessible from any device.

## Goals

1. **Replace localStorage with API calls** - All CRUD operations should communicate with the backend REST API
2. **Maintain user experience** - The application should feel as responsive as the current localStorage implementation
3. **Handle errors gracefully** - Network failures and API errors should be communicated clearly to users with retry options
4. **Enable data persistence** - Tasks should persist across sessions, browsers, and devices
5. **Implement modern UX patterns** - Use optimistic updates and appropriate loading states for a responsive feel
6. **Ensure code quality** - Comprehensive test coverage (unit, integration, and end-to-end tests)

## User Stories

### Core Functionality

**US-1: As a user, I want my tasks to be saved to the server so that I can access them from any device**
- **Acceptance Criteria:**
  - When I create a task, it is immediately saved to the backend
  - When I refresh the page, all my tasks are loaded from the backend
  - When I access the app from a different device, I see the same tasks

**US-2: As a user, I want the app to feel fast and responsive when I interact with it**
- **Acceptance Criteria:**
  - When I create/update/delete a task, the UI updates immediately (optimistic update)
  - Loading indicators appear during longer operations
  - The app doesn't freeze while waiting for API responses

**US-3: As a user, I want to know when something goes wrong so I can take action**
- **Acceptance Criteria:**
  - When an API call fails, I see a clear error message explaining what went wrong
  - I have the option to retry the failed operation
  - The app doesn't lose my work when an error occurs

**US-4: As a user, I want to drag and drop tasks between columns smoothly**
- **Acceptance Criteria:**
  - When I drag a task to a new column, it updates immediately
  - The status change is saved to the backend
  - If the save fails, I see an error and the task reverts to its original column

**US-5: As a user, I want to edit task content seamlessly**
- **Acceptance Criteria:**
  - When I edit a task's content, changes are saved to the backend
  - The UI updates immediately without flickering
  - If the save fails, I can retry or cancel the edit

### Migration & Transition

**US-6: As a new user migrating from localStorage, I want a clean start**
- **Acceptance Criteria:**
  - When the app detects the new API integration, it clears localStorage
  - I start with a fresh task board synced with the backend
  - There are no conflicts between old localStorage data and new API data

## Functional Requirements

### API Integration

**FR-1:** Replace all localStorage operations in `frontend/src/services/taskService.ts` with API calls to the backend
- **FR-1.1:** Implement `getTasks()` - `GET http://localhost:3001/tasks`
- **FR-1.2:** Implement `createTask(content)` - `POST http://localhost:3001/tasks`
- **FR-1.3:** Implement `updateTask(id, updates)` - `PATCH http://localhost:3001/tasks/:id`
- **FR-1.4:** Implement `updateTaskStatus(id, status)` - `PATCH http://localhost:3001/tasks/:id/status`
- **FR-1.5:** Implement `deleteTask(id)` - `DELETE http://localhost:3001/tasks/:id`

**FR-2:** Create a centralized API client/configuration
- **FR-2.1:** Define base API URL (environment variable with fallback to `http://localhost:3001`)
- **FR-2.2:** Create a shared fetch wrapper with error handling
- **FR-2.3:** Add request/response interceptors for consistent error handling
- **FR-2.4:** Include proper headers (`Content-Type: application/json`)

**FR-3:** Handle API response formats
- **FR-3.1:** Parse backend response format `{ task }` for single task operations
- **FR-3.2:** Parse backend response format `{ tasks }` for getTasks operation
- **FR-3.3:** Handle 204 No Content for delete operations
- **FR-3.4:** Handle error responses with proper status codes (400, 404, 500)

### Error Handling

**FR-4:** Implement comprehensive error handling
- **FR-4.1:** Display user-friendly error messages for common errors:
  - Network failure: "Unable to connect to server. Please check your connection."
  - 400 Bad Request: Display validation error from backend
  - 404 Not Found: "Task not found. It may have been deleted."
  - 500 Server Error: "Server error occurred. Please try again."
- **FR-4.2:** Provide a "Retry" button for failed operations
- **FR-4.3:** Log errors to console for debugging
- **FR-4.4:** Prevent cascading errors from breaking the app

**FR-5:** Handle network timeouts
- **FR-5.1:** Set reasonable timeout for API requests (e.g., 10 seconds)
- **FR-5.2:** Show loading state during request
- **FR-5.3:** Show timeout error if request takes too long

### Loading States & UX

**FR-6:** Implement optimistic updates
- **FR-6.1:** When creating a task, add it to the UI immediately with a temporary ID
- **FR-6.2:** When updating a task, update the UI immediately
- **FR-6.3:** When deleting a task, remove it from the UI immediately
- **FR-6.4:** On API success, replace temporary data with server response
- **FR-6.5:** On API failure, revert the optimistic update and show error

**FR-7:** Display appropriate loading indicators
- **FR-7.1:** Show a loading spinner or skeleton screen on initial page load
- **FR-7.2:** Show subtle loading indicators (e.g., opacity change) during background updates
- **FR-7.3:** Disable interaction on elements being updated
- **FR-7.4:** Show loading state in the TaskCard during individual updates

**FR-8:** Maintain responsive interactions
- **FR-8.1:** Drag-and-drop should work smoothly without blocking
- **FR-8.2:** Task creation should be instant in the UI
- **FR-8.3:** Editing should feel immediate

### Data Migration

**FR-9:** Clear localStorage on first load with API integration
- **FR-9.1:** Remove the `kanban_tasks` key from localStorage
- **FR-9.2:** Fetch initial tasks from the backend API
- **FR-9.3:** Populate the UI with backend data
- **FR-9.4:** This should happen automatically on application start

### Configuration

**FR-10:** Support environment-based configuration
- **FR-10.1:** Use environment variable `VITE_API_URL` for API base URL
- **FR-10.2:** Default to `http://localhost:3001` if not set
- **FR-10.3:** Document configuration in README

**FR-11:** Ensure CORS is properly configured
- **FR-11.1:** Verify backend CORS allows `http://localhost:5173` (already configured)
- **FR-11.2:** Test API calls work without CORS errors

## Non-Goals (Out of Scope)

1. **Authentication/Authorization** - No user accounts, login, or authentication mechanisms
2. **Offline-first functionality** - Not implementing service workers, offline caching, or sync queues
3. **Real-time collaboration** - No WebSocket connections or multi-user real-time updates
4. **Data migration from old localStorage** - Existing localStorage data will be cleared, not migrated
5. **Backend modifications** - The backend API is complete and should not be changed
6. **Advanced retry logic** - Simple retry button only; no exponential backoff or automatic retries
7. **Request caching** - No caching layer between frontend and backend
8. **Pagination** - All tasks are fetched and displayed at once
9. **Filtering on the backend** - Filtering by status remains a frontend concern

## Design Considerations

### UI/UX Requirements

1. **Error Display:**
   - Create a toast/notification component or use existing error display mechanism
   - Errors should be dismissible and auto-dismiss after 5 seconds
   - Errors should include a "Retry" action when applicable

2. **Loading States:**
   - Initial load: Full-screen loading spinner or skeleton screen
   - Background operations: Subtle loading indicators (opacity, small spinners)
   - Disabled state on cards being modified

3. **Optimistic Updates:**
   - Use visual cues (e.g., slightly dimmed or with a subtle icon) to indicate pending operations
   - Smooth transitions when reverting failed operations

4. **Empty States:**
   - Show appropriate empty state when no tasks are loaded from backend
   - Distinguish between "loading" and "no tasks" states

### Component Updates

The following components will require updates:

1. **TaskBoard** - Add loading state for initial data fetch
2. **TaskCard** - Add loading state for individual updates
3. **NewTaskCard** - Handle creation errors
4. **TasksContext** - Integrate new API-based service calls
5. **App** - Add error boundary and global error handling

### File Structure

New files to create:
- `frontend/src/config/api.ts` - API configuration and base URL
- `frontend/src/services/apiClient.ts` - Shared fetch wrapper with error handling
- `frontend/src/components/ErrorNotification/` - Error display component (if not exists)
- `frontend/src/hooks/useApiError.ts` - Hook for error handling (optional)

Modified files:
- `frontend/src/services/taskService.ts` - Replace localStorage with API calls
- `frontend/src/contexts/TasksContext.tsx` - Add error and loading state management
- Component files as needed for loading/error UI

## Technical Considerations

### Architecture

1. **Service Layer:** Keep the existing service layer abstraction (`taskService.ts`) to minimize changes to consuming components
2. **Error Handling:** Centralize error handling in the API client for consistency
3. **Type Safety:** Ensure TypeScript types match between frontend and backend (they already align)
4. **State Management:** Use existing React Context for state; no need for additional libraries

### API Client Design

```typescript
// Pseudo-code structure
const apiClient = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  async request(endpoint, options) {
    // Add headers
    // Handle timeout
    // Make fetch call
    // Parse response
    // Throw custom errors with user-friendly messages
  }
}
```

### Error Types

Define custom error types for better error handling:
- `NetworkError` - Connection failed
- `ValidationError` - 400 status codes
- `NotFoundError` - 404 status codes  
- `ServerError` - 500 status codes
- `TimeoutError` - Request timeout

### Environment Variables

```env
VITE_API_URL=http://localhost:3001
```

### Dependencies

The backend already has CORS configured for `http://localhost:5173`. No new dependencies should be required for basic fetch calls.

Consider adding (optional):
- A toast notification library if one doesn't exist (e.g., `react-hot-toast`)
- Or implement a simple custom notification component

## Testing Requirements

### Unit Tests

**UT-1:** API Client tests (`apiClient.test.ts`)
- Test successful requests
- Test error handling for different status codes
- Test timeout handling
- Test request headers

**UT-2:** Task Service tests (`taskService.test.ts` - update existing)
- Mock API calls
- Test each CRUD operation
- Test error propagation
- Test response parsing

**UT-3:** Component tests
- Test loading states render correctly
- Test error states render correctly
- Test optimistic updates and reverts

### Integration Tests

**IT-1:** Frontend-Backend integration tests
- Test full CRUD flow with real API calls to test backend
- Test error scenarios (backend returns 400, 404, 500)
- Test network failure scenarios
- Test initial data load on app start

**IT-2:** User flow tests
- Test creating a task end-to-end
- Test updating task status via drag-and-drop
- Test editing task content
- Test deleting a task
- Test error recovery (retry after failure)

### End-to-End Tests

**E2E-1:** Complete user workflows
- Launch app → Create tasks → Refresh → Verify tasks persist
- Create task → Drag to different column → Refresh → Verify status persists
- Edit task → Refresh → Verify changes persist
- Delete task → Refresh → Verify task is gone

**E2E-2:** Error scenarios
- Start app with backend offline → Show error → Start backend → Retry → Success
- Create task with backend offline → Show error → Retry → Success

**E2E-3:** Multi-device simulation (manual testing acceptable)
- Create tasks on "device 1" (browser window 1)
- Open app on "device 2" (different browser/incognito)
- Verify tasks appear on device 2

### Test Environment Setup

- Use Jest for unit tests (already configured)
- Use Vitest for integration tests (Vite's test runner)
- Use Playwright or Cypress for E2E tests (choose based on preference)
- Mock API responses in unit tests
- Use test backend instance for integration/E2E tests

## Success Metrics

### Functional Success Criteria

1. ✅ **All CRUD operations work via API**
   - Tasks can be created via POST /tasks
   - Tasks can be fetched via GET /tasks
   - Tasks can be updated via PATCH /tasks/:id
   - Task status can be updated via PATCH /tasks/:id/status
   - Tasks can be deleted via DELETE /tasks/:id

2. ✅ **Data persists across sessions and devices**
   - Tasks created in one browser session appear after refresh
   - Tasks created in one browser appear in another browser
   - All task properties (content, status, createdAt) persist correctly

3. ✅ **Graceful error handling and loading states**
   - Users see appropriate loading indicators during operations
   - API errors display clear, actionable error messages
   - Users can retry failed operations
   - The app doesn't crash or lose data on errors
   - Optimistic updates revert properly on failures

### Technical Success Criteria

1. ✅ **Test Coverage**
   - All unit tests pass (taskService, apiClient, components)
   - All integration tests pass (API integration flows)
   - All E2E tests pass (complete user workflows)

2. ✅ **Code Quality**
   - No TypeScript errors
   - No linter warnings
   - Code follows existing patterns and conventions
   - Proper error handling throughout

3. ✅ **Performance**
   - App loads in under 2 seconds on localhost
   - UI updates feel instant (optimistic updates)
   - No noticeable lag during drag-and-drop operations

### User Experience Success Criteria

1. ✅ **Responsive UI**
   - Task creation appears instant
   - Drag-and-drop is smooth
   - Loading states don't block interactions unnecessarily

2. ✅ **Clear Communication**
   - Users understand when data is loading
   - Users understand when errors occur
   - Error messages are clear and actionable

## Open Questions

None at this time. All requirements have been clarified through the initial discussion.

---

## Implementation Notes

### Development Approach

1. **Phase 1: API Infrastructure** (Foundation)
   - Create API client with error handling
   - Set up environment configuration
   - Create error types and utilities

2. **Phase 2: Service Layer** (Core Integration)
   - Update taskService to use API instead of localStorage
   - Implement proper error handling in service layer
   - Clear localStorage on first load

3. **Phase 3: UI Integration** (User Experience)
   - Add loading states to components
   - Implement optimistic updates
   - Create error notification system
   - Add retry functionality

4. **Phase 4: Testing** (Quality Assurance)
   - Write/update unit tests
   - Write integration tests
   - Write E2E tests
   - Manual testing of all flows

### Key Files to Modify

**High Priority:**
- `frontend/src/services/taskService.ts` - Core integration work
- `frontend/src/contexts/TasksContext.tsx` - State management updates
- `frontend/src/config/api.ts` - New file for API config

**Medium Priority:**
- `frontend/src/components/TaskBoard/TaskBoard.tsx` - Loading states
- `frontend/src/components/TaskCard/TaskCard.tsx` - Individual loading states
- `frontend/src/components/NewTaskCard/NewTaskCard.tsx` - Error handling

**Low Priority (as needed):**
- Error notification component
- Custom hooks for error handling
- Test files

### Backend Endpoints Summary

For reference, the backend provides these endpoints:

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| GET | `/tasks` | - | `{ tasks: Task[] }` |
| GET | `/tasks?status=todo` | - | `{ tasks: Task[] }` |
| POST | `/tasks` | `{ content: string }` | `{ task: Task }` |
| PUT | `/tasks/:id` | `{ content?: string, status?: string }` | `{ task: Task }` |
| PATCH | `/tasks/:id` | `{ content?: string, status?: string }` | `{ task: Task }` |
| PATCH | `/tasks/:id/status` | `{ status: string }` | `{ task: Task }` |
| DELETE | `/tasks/:id` | - | `204 No Content` |

### Risk Mitigation

**Risk: Backend not running**
- Mitigation: Show clear error message, provide instructions to start backend
- Consider: Add health check on app load

**Risk: Breaking existing functionality**
- Mitigation: Comprehensive testing before removing localStorage
- Keep async patterns in service layer for consistency

**Risk: Poor user experience during slow network**
- Mitigation: Optimistic updates and clear loading states
- Test on throttled network connections

**Risk: Type mismatches between frontend and backend**
- Mitigation: Both already use identical Task interface
- Validate response shapes in API client

---

**Document Version:** 1.0  
**Created:** 2025-11-11  
**Status:** Ready for Implementation

