# Task List: Compact and Kanban View Modes

> Generated from: `0006-prd-compact-kanban-view-modes.md`

## Relevant Files

### New Files to Create

**Hooks:**
- `frontend/src/hooks/useMediaQuery.ts` - Custom hook for responsive media query detection
- `frontend/src/hooks/useMediaQuery.test.ts` - Unit tests for useMediaQuery hook
- `frontend/src/hooks/useViewMode.ts` - Custom hook for view mode state management and localStorage persistence
- `frontend/src/hooks/useViewMode.test.ts` - Unit tests for useViewMode hook

**Components:**
- `frontend/src/components/ViewModeToggle/ViewModeToggle.tsx` - Toggle button component for switching between Kanban and Compact modes
- `frontend/src/components/ViewModeToggle/ViewModeToggle.css` - Styles for view mode toggle
- `frontend/src/components/ViewModeToggle/ViewModeToggle.test.tsx` - Unit tests for ViewModeToggle component
- `frontend/src/components/StatusTabs/StatusTabs.tsx` - Tab navigation component for Compact mode (To Do, In Progress, Done)
- `frontend/src/components/StatusTabs/StatusTabs.css` - Styles for status tabs
- `frontend/src/components/StatusTabs/StatusTabs.test.tsx` - Unit tests for StatusTabs component
- `frontend/src/components/CompactView/CompactView.tsx` - Single-column layout component for Compact mode
- `frontend/src/components/CompactView/CompactView.css` - Styles for compact view layout
- `frontend/src/components/CompactView/CompactView.test.tsx` - Unit tests for CompactView component
- `frontend/src/components/StatusChangeButtons/StatusChangeButtons.tsx` - Inline status change buttons for task cards in Compact mode
- `frontend/src/components/StatusChangeButtons/StatusChangeButtons.css` - Styles for status change buttons
- `frontend/src/components/StatusChangeButtons/StatusChangeButtons.test.tsx` - Unit tests for StatusChangeButtons component

**E2E Tests:**
- `frontend/e2e/view-modes.spec.ts` - End-to-end tests for view mode switching and responsive behavior
- `frontend/e2e/compact-mode.spec.ts` - End-to-end tests for Compact mode task operations

### Existing Files to Modify

**Main Application:**
- `frontend/src/App.tsx` - Add ViewModeToggle to header and integrate view mode system
- `frontend/src/App.css` - Add styles for view mode integration in header

**Components:**
- `frontend/src/components/TaskBoard/TaskBoard.tsx` - Add conditional rendering for Kanban vs Compact mode
- `frontend/src/components/TaskBoard/TaskBoard.css` - Add mode-specific CSS classes (`.task-board--kanban`, `.task-board--compact`)
- `frontend/src/components/TaskColumn/TaskColumn.tsx` - Add task count display in column header (for Kanban mode)
- `frontend/src/components/TaskColumn/TaskColumn.css` - Add styles for task count badge
- `frontend/src/components/TaskCard/TaskCard.tsx` - Add conditional rendering for status change buttons in Compact mode
- `frontend/src/components/TaskCard/TaskCard.css` - Add compact mode styling (reduced padding, font size)
- `frontend/src/components/NewTaskCard/NewTaskCard.tsx` - Accept optional `defaultStatus` prop for Compact mode tab integration
- `frontend/src/components/EmptyState/EmptyState.tsx` - Update to handle tab-specific empty state messages for Compact mode

**Integration Tests:**
- `frontend/src/components/TaskBoard/TaskBoard.test.tsx` - Add tests for mode switching and task count accuracy (new file)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npm test` to run all Vitest unit tests in the frontend.
- Use `npm run test:e2e` to run Playwright end-to-end tests.
- The existing `useLocalStorage` hook can be leveraged for view mode preference persistence.

## Tasks

- [x] 1.0 Create foundational hooks for view mode management and responsive detection
  - [x] 1.1 Create `useMediaQuery.ts` hook that listens to window.matchMedia changes and returns boolean match state
  - [x] 1.2 Write unit tests for `useMediaQuery` hook covering initial match, listener setup, cleanup, and state updates
  - [x] 1.3 Create `useViewMode.ts` hook that manages view mode state ('kanban' | 'compact') with localStorage persistence
  - [x] 1.4 Implement view mode logic: check screen size via useMediaQuery, load preference from localStorage, apply locking for mobile (<640px)
  - [x] 1.5 Provide `toggleViewMode` function that switches modes (only if not locked) and persists to localStorage under key `task_view_mode`
  - [x] 1.6 Write unit tests for `useViewMode` hook covering default mode selection, localStorage persistence, responsive locking, and toggle behavior
  
- [x] 2.0 Enhance Kanban mode with task counts
  - [x] 2.1 Update `TaskColumn.tsx` to display task count in the header next to the title (e.g., "To Do (5)")
  - [x] 2.2 Add CSS styles in `TaskColumn.css` for the task count badge (small, subtle, aligned with title)
  - [x] 2.3 Verify that task counts update in real-time when tasks are created, deleted, or moved between columns
  - [x] 2.4 Test that existing drag-and-drop functionality remains intact with no regressions
  
- [x] 3.0 Build Compact mode components and layout
  - [x] 3.1 Create `ViewModeToggle` component with two buttons/icons for Kanban and Compact modes
  - [x] 3.2 Add disabled state styling and tooltip for ViewModeToggle when locked on mobile (<640px)
  - [x] 3.3 Style ViewModeToggle to match existing ThemeSwitcher design (consistent header integration)
  - [x] 3.4 Write unit tests for ViewModeToggle covering rendering, click handling, disabled state, and ARIA attributes
  - [x] 3.5 Create `StatusTabs` component with three tabs: "To Do", "In Progress", "Done" (each showing task counts)
  - [x] 3.6 Implement active tab state and click handlers in StatusTabs to filter tasks by status
  - [x] 3.7 Add keyboard navigation to StatusTabs (Arrow keys to switch tabs, Enter/Space to activate)
  - [x] 3.8 Style StatusTabs with clear active/inactive states and ensure touch-friendly size (44px height minimum)
  - [x] 3.9 Write unit tests for StatusTabs covering tab rendering, filtering, counts, active state, and keyboard navigation
  - [x] 3.10 Create `CompactView` component that renders StatusTabs and filtered task list in single-column layout
  - [x] 3.11 Implement tab filtering logic in CompactView (show only tasks matching active tab status)
  - [x] 3.12 Add NewTaskCard to CompactView with defaultStatus prop matching active tab (exception: use 'todo' for 'done' tab)
  - [x] 3.13 Style CompactView with full-width single-column layout and appropriate spacing
  - [x] 3.14 Write unit tests for CompactView covering rendering, filtering, and empty states
  - [x] 3.15 Create `StatusChangeButtons` component with conditional buttons based on task status (Start, Complete, Revert, Reopen)
  - [x] 3.16 Style StatusChangeButtons to be touch-friendly (32x32px minimum), visually distinct, and positioned consistently
  - [x] 3.17 Write unit tests for StatusChangeButtons covering rendering logic for each status and click handling
  - [x] 3.18 Update `TaskCard` to conditionally render StatusChangeButtons when in Compact mode (disable drag-and-drop)
  - [x] 3.19 Add compact mode CSS classes to TaskCard (`.task-card--compact`) with reduced padding (12px) and font size (14px)
  - [x] 3.20 Update `NewTaskCard` to accept optional `defaultStatus` prop for creating tasks with specific status
  - [x] 3.21 Update `EmptyState` component to show tab-specific messages in Compact mode (different messages for To Do, In Progress, Done tabs)
  
- [x] 4.0 Integrate view mode system with responsive behavior
  - [x] 4.1 Update `App.tsx` to integrate ViewModeToggle in the header next to ThemeSwitcher
  - [x] 4.2 Update `TaskBoard.tsx` to conditionally render Kanban columns OR CompactView based on current view mode
  - [x] 4.3 Pass view mode state and toggle function from useViewMode hook to ViewModeToggle and TaskBoard components
  - [x] 4.4 Add CSS classes to TaskBoard container: `.task-board--kanban` and `.task-board--compact` for mode-specific styling
  - [x] 4.5 Implement responsive auto-switching: force Compact mode when screen width < 640px regardless of user preference
  - [x] 4.6 Implement preference restoration: when resizing from small to large screen, restore saved user preference
  - [x] 4.7 Pass `isLocked` state to ViewModeToggle to show disabled state with tooltip on mobile
  - [x] 4.8 Test window resize behavior at 640px breakpoint (both directions: large→small and small→large)
  - [x] 4.9 Verify view mode preference persists across page refreshes on desktop (>= 640px)
  - [x] 4.10 Test that all task operations (create, edit, delete, status change) work correctly in both modes
  
- [x] 5.0 Add polish, accessibility, and comprehensive testing
  - [x] 5.1 Add CSS transitions for smooth mode switching (300ms ease) to TaskBoard and related components
  - [x] 5.2 Add subtle animations for status changes in Compact mode (fade/slide out when status changes, 150-250ms)
  - [x] 5.3 Implement ARIA labels on ViewModeToggle (`aria-label`, `aria-disabled` for locked state)
  - [x] 5.4 Implement ARIA roles on StatusTabs (`role="tablist"`, `role="tab"`, `aria-selected` for active tab)
  - [x] 5.5 Add descriptive `aria-label` attributes to all status change buttons
  - [x] 5.6 Ensure all interactive elements are keyboard accessible (Tab key navigation through all controls)
  - [x] 5.7 Test keyboard shortcuts work in both modes (N for new task, Enter to submit, Esc to cancel, etc.)
  - [x] 5.8 Verify focus indicators are visible on all interactive elements in both modes
  - [x] 5.9 Write integration tests in `TaskBoard.test.tsx` covering mode switching flow and task count accuracy
  - [x] 5.10 Write E2E test `view-modes.spec.ts` covering complete mode switching workflow and preference persistence
  - [x] 5.11 Write E2E test `compact-mode.spec.ts` covering mobile experience and responsive transitions
  - [x] 5.12 Write E2E test for task management in both modes (create in Kanban, switch to Compact, verify tasks visible, change status, switch back)
  - [x] 5.13 Test with browser zoom at 150% and 200% to ensure layout remains usable
  - [ ] 5.14 Manually test on actual mobile devices (iOS and Android) in portrait and landscape orientations (requires physical devices)
  - [ ] 5.15 Run accessibility audit with screen reader (VoiceOver or TalkBack) to verify announcements (requires manual testing)
  - [x] 5.16 Verify no TypeScript errors, linter warnings, or console errors in either mode

---

**Status:** Phase 2 Complete (Detailed Sub-tasks Generated)

**Total Sub-tasks:** 59

**Estimated Effort:** 3-5 days (as per PRD)

**Ready for Implementation!**

