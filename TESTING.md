# Testing Guide

Complete guide for running automated tests in the Todo Kanban application.

## Overview

This project has comprehensive test coverage using:
- **Backend**: Vitest + Supertest for API testing
- **Frontend**: Playwright for E2E browser automation
- **Browsers**: Chromium, Firefox, and WebKit

## Quick Start

### Run All Tests
```bash
make test
```
This runs both backend and frontend tests.

### Run All Tests + Generate Report
```bash
make test-all
```
Runs all tests and generates `QA_REPORT.md` with comprehensive results.

**What you'll see:**
- Live output from backend tests (Vitest)
- Live output from E2E tests (Playwright) across 3 browsers
- Pretty formatted sections with emojis and boxes
- Final summary with pass/fail counts
- Report saved to `QA_REPORT.md`

**Duration:** ~90-120 seconds

---

## Backend Tests

### Run Backend Tests
```bash
make test-backend
# OR
cd backend && npm test
```

### Backend Test Structure
- **Location**: `/backend/src/__tests__/`
- **Framework**: Vitest
- **Coverage**:
  - Health check endpoint (`/health`)
  - Full CRUD operations (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
  - Input validation and error handling
  - Edge cases and error scenarios

### Backend Test Files
- `health.test.ts` - Health endpoint tests
- `api.test.ts` - Main API endpoint tests (143 tests)
- `validation.test.ts` - Input validation tests
- `setup.ts` - Test configuration and utilities

### Test Data Isolation
- Backend uses `NODE_ENV=test` to detect test mode
- Test data stored in `tasks.test.json` (separate from production data)
- Backend runs on port 3001 during tests (vs 3001 for development)

---

## Frontend E2E Tests

### Run E2E Tests

#### Headless Mode (CI)
```bash
make test-e2e
# OR
cd frontend && npm run test:e2e
```
**What to expect:**
- Terminal shows live progress with `list` reporter
- Tests run across 3 browsers (Chromium, Firefox, WebKit)
- Report saved to `frontend/playwright-report/index.html`
- JSON results saved to `frontend/test-results/results.json`
- Browser window will **NOT** auto-open during tests (configured with `open: 'never'`)

#### With Visible Browser (Debugging)
```bash
make test-e2e-headed
# OR
cd frontend && npm run test:e2e:headed
```
Shows browser window during test execution. Great for debugging.

#### With Playwright UI (Interactive)
```bash
make test-e2e-ui
# OR
cd frontend && npm run test:e2e:ui
```
Opens interactive UI for running and debugging tests step-by-step.

#### With Debugger
```bash
make test-e2e-debug
# OR
cd frontend && npm run test:e2e:debug
```
Runs tests with Playwright Inspector for detailed debugging.

#### Run Single Browser
```bash
cd frontend && npm run test:e2e:chromium
cd frontend && npm run test:e2e:firefox
cd frontend && npm run test:e2e:webkit
```

### Frontend Test Structure
- **Location**: `/frontend/e2e/`
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Coverage**:
  - Task workflows (create, edit, delete)
  - Drag-and-drop between columns
  - Data persistence after reload
  - Column organization
  - Error handling and validation

### Frontend Test Files
- `tasks.spec.ts` - Task workflow tests (10 tests)
  - Adding tasks
  - Editing tasks
  - Deleting tasks
  - Drag-and-drop status changes
  - Error validation
- `filters.spec.ts` - Column organization tests (9 tests)
  - Column visibility
  - Task distribution
  - Count updates
  - Empty states
- `persistence.spec.ts` - Data persistence tests (9 tests)
  - Task persistence after reload
  - Order persistence
  - Status persistence
  - Content edits persistence

### Test Helpers
- **Fixtures** (`/frontend/e2e/fixtures/`):
  - `tasks.ts` - Test data fixtures and cleanup utilities
- **Actions** (`/frontend/e2e/helpers/actions.ts`):
  - Reusable test actions (addTask, deleteTask, dragTaskToColumn, etc.)
- **Assertions** (`/frontend/e2e/helpers/assertions.ts`):
  - Custom assertion helpers (verifyTaskExists, verifyTaskCount, etc.)

---

## View Test Reports

### Playwright HTML Report
```bash
make test-e2e-report
# OR
cd frontend && npm run test:e2e:report
```

**Report Location**: `frontend/playwright-report/index.html`

The HTML report includes:
- Test execution details for all browsers
- Screenshots of failures
- Video recordings (on failure)
- Execution traces for debugging
- Detailed timing information
- Test annotations and metadata

### Understanding Test Progress

**During Test Execution:**
- `list` reporter shows each test as it runs in the terminal
- `line` reporter (non-CI) shows a compact progress indicator
- JSON results are written to `frontend/test-results/results.json`
- HTML report is generated continuously but **not auto-opened**

**Terminal Output:**
```
Running 28 tests using 3 workers

  ✓  [chromium] › tasks.spec.ts:7:7 › Task Management › should add a new task (1.2s)
  ✓  [firefox] › tasks.spec.ts:7:7 › Task Management › should add a new task (1.5s)
  ✓  [webkit] › tasks.spec.ts:7:7 › Task Management › should add a new task (1.8s)
  ...
```

**If Tests Seem Stuck:**
1. Check if browsers are still running: `ps aux | grep playwright`
2. Look for terminal output - tests may be running slower than expected
3. Press `Ctrl+C` to stop if truly hung
4. Run with `--headed` to see what's happening: `make test-e2e-headed`

### QA Summary Report
```bash
make test-all
```

Generates `QA_REPORT.md` with:
- Total test counts
- Pass/fail statistics
- Backend test summary
- Frontend test summary
- Browser compatibility matrix
- Execution times

---

## Development Workflow

### Start Services for Testing
```bash
make dev-test
```
Starts:
- Backend on port 3001 (test mode)
- Frontend on port 5173

### Running Tests During Development

1. **Start services in test mode**:
   ```bash
   make dev-test
   ```

2. **In another terminal, run tests**:
   ```bash
   # Run E2E tests with UI for debugging
   make test-e2e-ui
   
   # Or run specific test file
   cd frontend && npx playwright test tasks.spec.ts --headed
   ```

3. **Debug failing tests**:
   ```bash
   # Run with headed browser
   make test-e2e-headed
   
   # Or use Playwright UI
   make test-e2e-ui
   ```

---

## Test Configuration

### Backend (Vitest)
- **Config**: `/backend/vitest.config.ts`
- **Environment**: Node
- **Test Port**: 3001
- **Test Data**: `tasks.test.json`

### Frontend (Playwright)
- **Config**: `/frontend/playwright.config.ts`
- **Base URL**: `http://localhost:5173`
- **API URL**: `http://localhost:3001` (test backend)
- **Browsers**: Chromium, Firefox, WebKit
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

---

## Continuous Integration

### CI-Friendly Commands
```bash
# Run all tests (exits with error if any fail)
make test

# Run with full report generation
make test-all
```

### Environment Variables
```bash
# Set CI mode (affects test behavior)
export CI=true

# Run tests
make test
```

---

## Troubleshooting

### E2E Tests Show No Progress
**Problem**: Tests appear stuck with no visual feedback.

**Solution**:
1. Check terminal output - `list` reporter shows each test
2. Tests run across 3 browsers sequentially, which takes time
3. First run may be slower while browsers initialize
4. Use `--headed` to see visual progress: `make test-e2e-headed`
5. Check if processes are running: `ps aux | grep playwright`

### Browser Window Opens During Tests
**Problem**: Browser opens to http://localhost:XXXXX showing report.

**What's happening**: This was Playwright's live HTML reporter (now disabled).

**Solution**: Already fixed in configuration with `open: 'never'`.
- Report is still saved to `frontend/playwright-report/index.html`
- View it after tests complete: `make test-e2e-report`

### E2E Tests Fail to Connect
**Problem**: Tests can't connect to backend or frontend.

**Solution**:
1. Ensure services are running: `make dev-test`
2. Check ports 3001 (backend) and 5173 (frontend) are available
3. Verify backend is in test mode: `NODE_ENV=test`
4. Check if webServer started in Playwright config (120s timeout)

### Tests Are Flaky
**Problem**: Tests pass/fail inconsistently.

**Solution**:
1. Increase wait times in test code
2. Use Playwright's built-in waiting mechanisms
3. Check for race conditions in application code
4. Run with `--repeat-each=3` to identify flakiness

### Backend Tests Pollute Development Data
**Problem**: Test data appears in production database.

**Solution**:
1. Verify `NODE_ENV=test` is set when running tests
2. Check backend config uses correct test data file
3. Ensure test cleanup runs in `afterEach` hooks

### Playwright Browsers Not Installed
**Problem**: Error about missing browser binaries.

**Solution**:
```bash
cd frontend
npx playwright install --with-deps
```

### Tests Appear Frozen
**Problem**: No output for extended period.

**Solution**:
1. E2E tests can take 60-90 seconds total (28 tests × 3 browsers)
2. Watch for terminal output from `list` reporter
3. Kill and restart if truly stuck: `Ctrl+C` then retry
4. Run single browser to isolate issues: `npm run test:e2e:chromium`

---

## Writing New Tests

### Backend Test Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup test data
  });

  it('should do something', async () => {
    // Arrange
    const testData = { ... };

    // Act
    const response = await request(app)
      .post('/endpoint')
      .send(testData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ... });
  });
});
```

### Frontend E2E Test Template
```typescript
import { test, expect } from '@playwright/test';
import { cleanupTestData } from './fixtures/tasks';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupTestData(page, 'http://localhost:3001');
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.getByTestId('some-element').click();

    // Act
    await page.getByTestId('action-button').click();

    // Assert
    await expect(page.getByTestId('result')).toBeVisible();
  });
});
```

---

## Best Practices

### General
- ✅ Follow Arrange-Act-Assert (AAA) pattern
- ✅ Use descriptive test names
- ✅ Clean up test data in hooks
- ✅ Test both happy paths and error cases
- ✅ Keep tests independent and isolated

### Backend Tests
- ✅ Use Supertest for HTTP assertions
- ✅ Test all CRUD operations
- ✅ Validate error responses
- ✅ Test edge cases and boundaries

### E2E Tests
- ✅ Use `data-testid` for selectors (never CSS classes)
- ✅ Wait for network requests to complete
- ✅ Test across all three browsers
- ✅ Capture meaningful assertions
- ✅ Use helper functions for repeated actions

---

## Performance Goals

- ✅ Full test suite completes in < 2 minutes
- ✅ Backend tests: < 30 seconds
- ✅ E2E tests: < 90 seconds
- ✅ Individual E2E test: < 10 seconds

---

## Support

For issues or questions:
1. Check this documentation
2. Review test output and error messages
3. Check Playwright HTML report: `make test-e2e-report`
4. Review `QA_REPORT.md` after running `make test-all`

---

*Last Updated: 2025-11-11*

