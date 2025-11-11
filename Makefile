.PHONY: help dev dev-frontend dev-backend dev-test build build-frontend build-backend test test-all test-frontend test-backend test-e2e test-e2e-headed test-e2e-ui test-e2e-report install install-frontend install-backend clean stop

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start both frontend and backend in development mode"
	@echo "  make dev-frontend     - Start only the frontend"
	@echo "  make dev-backend      - Start only the backend"
	@echo "  make dev-test         - Start services for testing (backend on port 3001)"
	@echo ""
	@echo "Build:"
	@echo "  make build            - Build both frontend and backend"
	@echo "  make build-frontend   - Build only the frontend"
	@echo "  make build-backend    - Build only the backend"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests (backend + E2E)"
	@echo "  make test-all         - Run all tests and generate QA report"
	@echo "  make test-backend     - Run backend API tests only"
	@echo "  make test-e2e         - Run E2E tests headless (CI mode)"
	@echo "  make test-e2e-headed  - Run E2E tests with visible browser"
	@echo "  make test-e2e-ui      - Run E2E tests with Playwright UI"
	@echo "  make test-e2e-debug   - Run E2E tests with debugger"
	@echo "  make test-e2e-report  - Show Playwright HTML report"
	@echo ""
	@echo "Other:"
	@echo "  make install          - Install dependencies for both"
	@echo "  make install-frontend - Install frontend dependencies"
	@echo "  make install-backend  - Install backend dependencies"
	@echo "  make clean            - Clean build artifacts and dependencies"
	@echo "  make stop             - Stop all running dev servers"

# Development
dev:
	@echo "Starting frontend and backend..."
	@trap 'kill 0' EXIT; \
	(cd frontend && npm run dev) & \
	(cd backend && npm run dev) & \
	wait

dev-frontend:
	@echo "Starting frontend..."
	@cd frontend && npm run dev

dev-backend:
	@echo "Starting backend..."
	@cd backend && npm run dev

# Build
build: build-backend build-frontend
	@echo "Build complete!"

build-frontend:
	@echo "Building frontend..."
	@cd frontend && npm run build

build-backend:
	@echo "Building backend..."
	@cd backend && npm run build

# Development for testing (backend on port 3001)
dev-test:
	@echo "Starting backend in test mode (port 3001) and frontend..."
	@trap 'kill 0' EXIT; \
	(cd backend && NODE_ENV=test npm run dev) & \
	(cd frontend && npm run dev) & \
	wait

# Test
test: test-backend test-e2e
	@echo "All tests complete!"

test-all:
	@echo "Running all tests and generating QA report..."
	@node scripts/generate-qa-report.js || echo "QA report generation failed"
	@echo "Test run complete! Check QA_REPORT.md for summary."

test-backend:
	@echo "Running backend API tests..."
	@cd backend && npm test

test-e2e:
	@echo "Running E2E tests (headless)..."
	@echo "Report will be saved to: frontend/playwright-report/index.html"
	@cd frontend && npm run test:e2e
	@echo "\n✅ Tests complete! View report: make test-e2e-report"

test-e2e-headed:
	@echo "Running E2E tests (headed mode)..."
	@cd frontend && npm run test:e2e:headed

test-e2e-ui:
	@echo "Opening Playwright UI..."
	@cd frontend && npm run test:e2e:ui

test-e2e-debug:
	@echo "Running E2E tests with debugger..."
	@cd frontend && npm run test:e2e:debug

test-e2e-report:
	@echo "Opening Playwright HTML report..."
	@cd frontend && npm run test:e2e:report

# Install dependencies
install: install-frontend install-backend
	@echo "Dependencies installed!"

install-frontend:
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

install-backend:
	@echo "Installing backend dependencies..."
	@cd backend && npm install

# Clean
clean:
	@echo "Cleaning build artifacts and node_modules..."
	@rm -rf frontend/dist frontend/node_modules
	@rm -rf backend/dist backend/node_modules
	@echo "Clean complete!"

# Stop running servers
stop:
	@echo "Stopping all dev servers..."
	@pkill -f "vite" || true
	@pkill -f "nodemon" || true
	@pkill -f "ts-node" || true
	@echo "Servers stopped!"

