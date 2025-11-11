# PRD: Automated Testing Suite (Playwright + Vitest)

## Introduction/Overview

This PRD outlines the implementation of a comprehensive automated testing suite for the To-Do application. The goal is to establish reliable, fast, and maintainable tests that verify all application functionality across both backend API endpoints and frontend user workflows. Tests will be integrated into their respective contexts (backend and frontend) rather than a separate monorepo directory, ensuring colocated test files with the code they validate.

The testing suite will use **Vitest + Supertest** for backend API testing and **Playwright with TypeScript** for frontend end-to-end (E2E) browser automation. Tests must be comprehensive, covering not only happy paths but also edge cases and error scenarios, while maintaining high code quality and clear failure messages.

## Goals

1. **Comprehensive Test Coverage:** Validate all core functionality (add task, toggle completion, delete task, data persistence) with quality-focused tests
2. **Fast & Reliable Execution:** Deterministic tests that run quickly and provide clear failure diagnostics
3. **Data Isolation:** Separate test data from development data to prevent interference
4. **Cross-Browser Compatibility:** Ensure frontend works consistently across Chromium, Firefox, and WebKit
5. **Developer-Friendly:** Easy-to-run npm scripts with intuitive reporting for quick debugging
6. **Professional Standards:** Follow industry best practices for test organization, patterns, and maintainability

## User Stories

### As a Developer:
- **US-1:** I want to run backend API tests independently so that I can validate endpoint behavior without starting the frontend
- **US-2:** I want to run E2E tests to verify the complete user workflow works as expected in a real browser
- **US-3:** I want tests to use separate test data so my development data remains intact
- **US-4:** I want clear error messages when tests fail so I can quickly identify and fix issues
- **US-5:** I want to see test results in multiple formats (console, HTML report, QA summary) for different contexts

### As a QA Engineer:
- **US-6:** I want to verify the application works across multiple browsers (Chromium, Firefox, WebKit) to ensure broad compatibility
- **US-7:** I want screenshots of E2E test failures so I can visually diagnose issues without reproducing them
- **US-8:** I want a comprehensive QA report that summarizes test results and any issues found

### As a Team Lead:
- **US-9:** I want tests organized professionally within their respective contexts (backend/frontend) for maintainability
- **US-10:** I want comprehensive edge case and error scenario coverage to ensure robust error handling

## Functional Requirements

### Backend API Tests (Vitest + Supertest)

**FR-1:** Backend tests must be located in `/backend/src/__tests__/` directory, colocated with source code

**FR-2:** Tests must use Vitest as the test framework and Supertest for HTTP assertions

**FR-3:** Tests must validate all REST endpoints with comprehensive scenarios:
  - **FR-3.1:** `GET /tasks` - Verify tasks are returned in newest-first order
  - **FR-3.2:** `POST /tasks` - Test title validation (trimming whitespace, rejecting empty/whitespace-only titles)
  - **FR-3.3:** `PATCH /tasks/:id/toggle` - Verify completion status toggles correctly
  - **FR-3.4:** `DELETE /tasks/:id` - Test task removal and verify task no longer exists
  - **FR-3.5:** `GET /health` - Validate health check returns expected status

**FR-4:** Tests must validate request/response contracts including:
  - Correct HTTP status codes (200, 201, 400, 404, 500)
  - Response body structure and data types
  - Error messages for invalid inputs

**FR-5:** Tests must cover comprehensive error scenarios:
  - Invalid task IDs (non-existent, malformed)
  - Missing required fields
  - Empty or whitespace-only inputs
  - Edge cases (very long titles, special characters)

**FR-6:** Tests must use the Arrange-Act-Assert (AAA) pattern for clarity and consistency

**FR-7:** Tests must use isolated test data (separate from development data, e.g., `tasks.test.json`)

**FR-8:** Backend must run on port 3001 during testing to avoid conflicts with development server

### Frontend E2E Tests (Playwright)

**FR-9:** Frontend E2E tests must be located in `/frontend/e2e/` directory

**FR-10:** Tests must use Playwright with TypeScript for browser automation

**FR-11:** Tests must validate complete user workflows:
  - **FR-11.1:** Adding a new task and verifying it appears in the list
  - **FR-11.2:** Toggling task completion status via checkbox
  - **FR-11.3:** Deleting a task and verifying it's removed from the list
  - **FR-11.4:** Switching between filters (All/Active/Completed) and verifying correct tasks display
  - **FR-11.5:** Verifying task counts update correctly for each filter
  - **FR-11.6:** Page refresh persistence (tasks remain after reload)

**FR-12:** Tests must use stable selectors via `data-testid` attributes for all interactive elements

**FR-13:** Tests must run against all three major browser engines:
  - Chromium (Chrome/Edge)
  - Firefox (Gecko)
  - WebKit (Safari)

**FR-14:** Tests must include fixtures and helper functions for:
  - Test data seeding
  - Data cleanup between tests
  - Common assertions and interactions

**FR-15:** Tests must capture screenshots on failure for visual debugging

**FR-16:** Frontend must run on port 5173 during testing

**FR-17:** Tests must validate error handling and edge cases:
  - Attempting to add empty/whitespace-only tasks
  - Network error scenarios
  - UI state consistency during operations

### Test Infrastructure

**FR-18:** Implement npm scripts in root `package.json` (or appropriate location):
  - `npm run test` - Run all tests (backend + frontend)
  - `npm run test:backend` - Run API tests only
  - `npm run test:ui` - Run E2E tests headless (CI mode)
  - `npm run test:ui:headed` - Run E2E tests with visible browser (debugging)

**FR-19:** Generate `QA_REPORT.md` in the project root summarizing:
  - Total tests run (backend + frontend)
  - Pass/fail counts
  - Test execution time
  - Any issues or failures found
  - Browser compatibility results
  - Timestamp and test environment details

**FR-20:** Generate HTML reports with Playwright that include:
  - Visual test result summary
  - Screenshots of failures
  - Execution traces for debugging

**FR-21:** Provide clear, actionable console output during test execution showing:
  - Real-time test progress
  - Pass/fail indicators
  - Failure details with stack traces

**FR-22:** Tests must not interfere with development data (use separate test database/storage)

**FR-23:** Tests must be deterministic and produce consistent results across runs

**FR-24:** All tests must execute quickly (complete test suite < 2 minutes ideally)

## Non-Goals (Out of Scope)

1. **CI/CD Integration:** Automated test execution in CI pipelines is out of scope for this phase (manual execution only)
2. **Performance Testing:** Load testing, stress testing, or performance benchmarking
3. **Security Testing:** Penetration testing, vulnerability scanning, or security audits
4. **Visual Regression Testing:** Pixel-perfect screenshot comparison tools
5. **Unit Tests for Components:** Fine-grained component unit tests (focus is on integration/E2E)
6. **Test Coverage Enforcement:** Blocking builds based on coverage thresholds (though coverage reporting is nice-to-have)
7. **Mobile Browser Testing:** Responsive/mobile-specific browser testing
8. **Accessibility Testing:** WCAG compliance or a11y-specific test suites

## Design Considerations

### Test File Organization

**Backend Structure:**
```
/backend/
  /src/
    /__tests__/
      api.test.ts          # Main API endpoint tests
      health.test.ts       # Health check tests
      validation.test.ts   # Input validation tests
      setup.ts            # Test configuration and helpers
```

**Frontend Structure:**
```
/frontend/
  /e2e/
    /fixtures/
      tasks.ts            # Test data fixtures
    /helpers/
      actions.ts          # Reusable test actions
      assertions.ts       # Custom assertions
    tasks.spec.ts         # Task workflow tests
    filters.spec.ts       # Filter functionality tests
    persistence.spec.ts   # Data persistence tests
    playwright.config.ts  # Playwright configuration
```

### Selector Strategy

Use `data-testid` attributes for all test selectors to ensure stability:
- `data-testid="new-task-input"` - Task input field
- `data-testid="add-task-button"` - Add task button
- `data-testid="task-item-{id}"` - Individual task items
- `data-testid="task-checkbox-{id}"` - Task completion checkboxes
- `data-testid="delete-task-{id}"` - Delete buttons
- `data-testid="filter-all"` - All tasks filter
- `data-testid="filter-active"` - Active tasks filter
- `data-testid="filter-completed"` - Completed tasks filter
- `data-testid="task-count-{filter}"` - Task count displays

## Technical Considerations

### Dependencies

**Backend:**
- `vitest` - Test framework
- `supertest` - HTTP assertions
- `@types/supertest` - TypeScript types

**Frontend:**
- `@playwright/test` - E2E testing framework
- `playwright` - Browser automation

### Test Data Isolation

- Backend should detect test environment (e.g., `NODE_ENV=test`) and use `tasks.test.json` instead of `tasks.json`
- Frontend tests should point to backend on port 3001 during testing
- Test data should be cleared/reset before each test run to ensure independence

### Configuration Files

**`vitest.config.ts` (Backend):**
- Configure test file patterns
- Set up test environment
- Define coverage thresholds (optional)

**`playwright.config.ts` (Frontend):**
- Configure browser projects (chromium, firefox, webkit)
- Set base URL (http://localhost:5173)
- Configure screenshot/video capture on failure
- Set test timeout and retry logic
- Define HTML reporter

### Error Handling

Tests must validate:
- Proper HTTP status codes for errors
- User-friendly error messages
- Graceful degradation when API is unavailable
- UI feedback for failed operations

## Success Metrics

1. **Test Execution:** All tests pass green on first implementation
2. **Failure Clarity:** When tests fail, the error message clearly indicates the problem within 10 seconds of reading
3. **Coverage Quality:** All user workflows and edge cases defined in FR-11 are covered
4. **Cross-Browser Success:** Tests pass consistently across all three browser engines (Chromium, Firefox, WebKit)
5. **Performance:** Complete test suite executes in under 2 minutes
6. **Reliability:** Tests pass 100% of the time when application code is correct (no flaky tests)
7. **Documentation:** QA_REPORT.md is generated automatically and provides actionable insights

## Open Questions

1. Should test scripts automatically start/stop the backend and frontend servers, or assume they're already running?
2. What should happen if tests fail - should the process exit with error code for potential future CI integration?
3. Should there be a `--watch` mode for tests during development?
4. Do we need a separate test configuration for environment variables (e.g., `.env.test`)?
5. Should test data fixtures be committed to the repository or generated dynamically?
6. What level of Playwright trace detail should be captured (always, on-failure, never)?
7. Should we implement test retries for potentially flaky E2E tests, and if so, how many retries?

## Definition of Done

- [ ] Backend tests located in `/backend/src/__tests__/` and passing
- [ ] Frontend E2E tests located in `/frontend/e2e/` and passing
- [ ] `npm run test:backend` executes all API tests successfully
- [ ] `npm run test:ui` runs Playwright tests headless across all three browsers
- [ ] `npm run test:ui:headed` opens visible browser for debugging
- [ ] `npm run test` executes both backend and frontend tests
- [ ] Tests use separate test data file (no pollution of development data)
- [ ] All interactive elements have `data-testid` attributes
- [ ] Screenshots captured on E2E test failures
- [ ] HTML report generated for Playwright results
- [ ] `QA_REPORT.md` generated with comprehensive test summary
- [ ] All tests follow AAA pattern with clear, descriptive names
- [ ] Error scenarios and edge cases comprehensively tested
- [ ] Tests pass consistently across all three browser engines
- [ ] Clear failure messages that enable quick debugging
- [ ] Complete test suite executes in under 2 minutes
- [ ] Documentation updated with instructions for running tests

