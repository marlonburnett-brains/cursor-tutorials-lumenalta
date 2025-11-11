# Task List: Kanban-Style To-Do Application

**Based on:** 0001-prd-kanban-todo-application.md  
**Created:** November 11, 2025  
**Status:** Ready for Implementation

---

## Relevant Files

### Core Types & Utilities
- `frontend/src/types/task.ts` - Task interface definition (`Task` with id, content, status, createdAt) ✅ Created
- `frontend/src/utils/taskParser.ts` - Frontend-only business rule for parsing content into title/description ✅ Created
- `frontend/src/utils/validation.ts` - Task validation functions (min 2 chars, max 2000 chars, duplicate detection) ✅ Created
- `frontend/src/utils/sounds.ts` - Sound effects utility using Web Audio API ✅ Created

### Data Service Layer
- `frontend/src/services/taskService.ts` - localStorage abstraction with async/Promise patterns for future API integration ✅ Created
- `frontend/src/hooks/useLocalStorage.ts` - Custom hook for localStorage operations ✅ Created
- `frontend/src/hooks/useTasks.ts` - Custom hook for task state management ✅ Created
- `frontend/src/hooks/useKeyboardShortcuts.ts` - Global keyboard shortcuts hook ✅ Created

### Components
- `frontend/src/components/TaskBoard/TaskBoard.tsx` - Main container with 3-column layout ✅ Created
- `frontend/src/components/TaskBoard/TaskBoard.css` - Glassmorphism styles and layout ✅ Created
- `frontend/src/components/TaskColumn/TaskColumn.tsx` - Individual column component (To Do, In Progress, Completed) ✅ Created & Enhanced
- `frontend/src/components/TaskColumn/TaskColumn.css` - Column-specific styles ✅ Created
- `frontend/src/components/TaskCard/TaskCard.tsx` - Task card with display and edit modes ✅ Created
- `frontend/src/components/TaskCard/TaskCard.css` - Card styles and animations ✅ Created
- `frontend/src/components/NewTaskCard/NewTaskCard.tsx` - Editable card for task creation ✅ Created
- `frontend/src/components/NewTaskCard/NewTaskCard.css` - New task card styles ✅ Created
- `frontend/src/components/ConfirmDialog/ConfirmDialog.tsx` - Reusable confirmation dialog for deletions ✅ Created
- `frontend/src/components/ConfirmDialog/ConfirmDialog.css` - Dialog styles ✅ Created
- `frontend/src/components/EmptyState/EmptyState.tsx` - Empty state messaging component ✅ Created
- `frontend/src/components/EmptyState/EmptyState.css` - Empty state styles ✅ Created

### Main Application
- `frontend/src/App.tsx` - Root application component ✅ Created & Integrated TaskBoard
- `frontend/src/App.css` - Global styles and gradient background ✅ Created & Enhanced with glassmorphism
- `frontend/src/main.tsx` - Application entry point ✅ Created
- `frontend/src/index.css` - CSS reset and base styles ✅ Created
- `frontend/src/vite-env.d.ts` - Vite type declarations ✅ Created

### Configuration
- `frontend/package.json` - Dependencies (@dnd-kit/core, React, TypeScript, etc.) ✅ Created
- `frontend/tsconfig.json` - TypeScript configuration with strict mode ✅ Created
- `frontend/tsconfig.node.json` - TypeScript configuration for Node files ✅ Created
- `frontend/vite.config.ts` - Vite configuration ✅ Created
- `frontend/.eslintrc.cjs` - ESLint configuration ✅ Created
- `frontend/.gitignore` - Git ignore patterns ✅ Created
- `frontend/index.html` - HTML entry point ✅ Created

### Notes
- This is a frontend-only application using localStorage for persistence
- The `content` field is the single source of truth; `title` and `description` are derived dynamically
- All data operations use async/Promise patterns to facilitate future backend integration
- Component structure follows the PRD's recommended breakdown (Section 6.2)

---

## Tasks

- [x] 1.0 **Project Setup & Foundation**
  - [x] 1.1 Initialize Vite project with React and TypeScript template in `/frontend` directory
  - [x] 1.2 Install dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop
  - [x] 1.3 Configure `tsconfig.json` with strict mode enabled
  - [x] 1.4 Set up project folder structure: `/src/components`, `/src/hooks`, `/src/services`, `/src/types`, `/src/utils`, `/src/styles`
  - [x] 1.5 Create base `index.css` with CSS reset and base typography (system font stack)
  - [x] 1.6 Verify `npm run dev` runs successfully on `http://localhost:5173`
  - [x] 1.7 Remove default Vite boilerplate (logo, counter example, etc.)

- [x] 2.0 **Core Data Layer & Type System**
  - [x] 2.1 Create `types/task.ts` with `Task` interface: `{ id: string, content: string, status: 'todo' | 'in-progress' | 'completed', createdAt: number }`
  - [x] 2.2 Create `utils/taskParser.ts` with `parseTaskContent()` function implementing the frontend-only business rule
    - Single-line: no title, entire content is description
    - Multi-line with first line ≤ 200 chars: first line is title, rest is description
    - Multi-line with first line > 200 chars: no title, entire content is description
  - [x] 2.3 Create `utils/validation.ts` with validation functions:
    - `validateTaskContent(content: string)`: min 2 chars, max 2000 chars, trim whitespace
    - `isDuplicateTask(content: string, existingTasks: Task[])`: case-insensitive duplicate detection based on first line
  - [x] 2.4 Create `services/taskService.ts` with async localStorage abstraction:
    - `getTasks(): Promise<Task[]>` - load and parse from localStorage
    - `createTask(content: string): Promise<Task>` - create with `crypto.randomUUID()` and `Date.now()`
    - `updateTask(id: string, updates: Partial<Task>): Promise<Task>` - update task
    - `updateTaskStatus(id: string, status: TaskStatus): Promise<Task>` - change status
    - `deleteTask(id: string): Promise<void>` - remove task
    - Include commented-out API function placeholders for future backend integration
  - [x] 2.5 Create `hooks/useLocalStorage.ts` custom hook with error handling for quota exceeded
  - [x] 2.6 Create `hooks/useTasks.ts` custom hook managing task state, CRUD operations, and sorting (newest first)

- [x] 3.0 **UI Components & Layout Structure**
  - [x] 3.1 Create `App.css` with glassmorphism design:
    - Subtle gradient background (soft colors)
    - Semi-transparent elements with blur effects
    - Smooth shadows and transitions
  - [x] 3.2 Create `components/TaskBoard/TaskBoard.tsx` with 3-column layout container
  - [x] 3.3 Create `components/TaskBoard/TaskBoard.css` with centered, equal-width column layout
  - [x] 3.4 Create `components/TaskColumn/TaskColumn.tsx`:
    - Accept props: `title` (string), `status` (TaskStatus), `tasks` (Task[]), `onTaskDrop` (callback)
    - Render column header with title
    - Render task list container
    - Handle independent scrolling
  - [x] 3.5 Create `components/TaskColumn/TaskColumn.css` with glassmorphism card styles
  - [x] 3.6 Create `components/EmptyState/EmptyState.tsx` with friendly messages:
    - "To Do": "Click + New Task to get started!"
    - "In Progress": "Drag tasks here when you start working on them"
    - "Completed": "Completed tasks will appear here"
  - [x] 3.7 Create `components/EmptyState/EmptyState.css` with subtle, inviting styles
  - [x] 3.8 Integrate TaskBoard into `App.tsx` and verify 3-column layout renders correctly

- [x] 4.0 **Task Management Features (Create, Edit, Delete)**
  - [x] 4.1 Create `components/TaskCard/TaskCard.tsx` with two modes:
    - **Display mode:** Show parsed title (bold) and description (regular), click to edit
    - **Edit mode:** Editable textarea with current content, Save/Cancel buttons, character counter
  - [x] 4.2 Create `components/TaskCard/TaskCard.css` with:
    - Visual distinction between title (bold) and description (regular)
    - Hover states and smooth transitions
    - Edit mode styles (textarea, buttons)
  - [x] 4.3 Implement TaskCard display mode:
    - Use `parseTaskContent()` to dynamically derive title/description from `task.content`
    - Render title in bold (if present), description in regular font
    - Make card clickable to enter edit mode
  - [x] 4.4 Implement TaskCard edit mode:
    - Textarea pre-filled with current `task.content`
    - Multi-line support with CMD+Enter (macOS) / CTRL+Enter (Windows/Linux) for line breaks
    - Character counter showing "X/2000" format
    - Save and Cancel buttons/icons
    - Validate on save (2-2000 chars, no duplicates)
    - Update localStorage on successful save
    - Auto re-parse title/description after save
  - [x] 4.5 Create `components/NewTaskCard/NewTaskCard.tsx`:
    - "+ New Task" button (always visible at top of "To Do" column)
    - Click to transform into empty editable card
    - Same editing capabilities as TaskCard edit mode
    - Submit on Enter (single-line) or Save button click
    - Cancel on Escape or Cancel button
    - Return to "+ New Task" button after submission
  - [x] 4.6 Create `components/NewTaskCard/NewTaskCard.css` with inviting button and edit states
  - [x] 4.7 Implement task creation flow:
    - Validate content (trim, min 2 chars, max 2000 chars)
    - Check for duplicates (case-insensitive first line comparison)
    - Generate unique ID with `crypto.randomUUID()`
    - Store timestamp with `Date.now()`
    - Save to localStorage via `taskService.createTask()`
    - Add to "To Do" column at the top
    - Show inline validation errors if invalid
  - [x] 4.8 Create `components/ConfirmDialog/ConfirmDialog.tsx`:
    - Modal overlay with confirmation message
    - Confirm and Cancel buttons
    - Support Enter key to confirm, Escape key to cancel
  - [x] 4.9 Create `components/ConfirmDialog/ConfirmDialog.css` with modal overlay styles
  - [x] 4.10 Implement task deletion:
    - Delete button/icon on each TaskCard
    - Show ConfirmDialog on click
    - Remove from localStorage via `taskService.deleteTask()` on confirmation
    - Update UI immediately

- [x] 5.0 **Drag-and-Drop Functionality**
  - [x] 5.1 Install and configure `@dnd-kit/core` in TaskBoard component
  - [x] 5.2 Make TaskCard draggable using `useDraggable` hook:
    - Add drag handle (entire card is draggable)
    - Prevent editing during drag operations
  - [x] 5.3 Make TaskColumn droppable using `useDroppable` hook:
    - Configure drop zones for all three columns
  - [x] 5.4 Implement drag-and-drop visual feedback:
    - Semi-transparent drag preview
    - Drop zone highlighting when hovering
    - Smooth elevation/shadow effects
  - [x] 5.5 Handle `onDragEnd` event:
    - Determine source and destination columns
    - Update task status based on destination column
    - Update localStorage via `taskService.updateTaskStatus()`
    - Move task to top of destination column
    - Animate transition smoothly
  - [x] 5.6 Implement haptic feedback using Vibration API (if supported):
    - Short vibration pulse on successful drop
    - Graceful fallback if not supported
  - [x] 5.7 Implement optional sound effects for drag-and-drop:
    - Play subtle sound on successful drop
    - Use Web Audio API or HTML5 Audio
    - Consider user preference toggle for future enhancement

- [x] 6.0 **Pagination & User Experience Enhancements**
  - [x] 6.1 Implement pagination logic in TaskColumn:
    - Initially display 10 tasks per column
    - Track pagination state (currentPage, tasksPerPage)
    - Sort tasks by `createdAt` descending (newest first)
  - [x] 6.2 Add "+Load more" button at bottom of each column:
    - Show only when more than 10 tasks exist
    - Load 10 additional tasks on click
    - Hide when all tasks are displayed
  - [x] 6.3 Ensure independent scrolling for each column:
    - Set column height with `overflow-y: auto`
    - Test scrolling behavior with 20+ tasks
  - [x] 6.4 Implement subtle animations for new tasks:
    - Fade-in effect when task appears at top of column
    - Slide-down animation (translate-y)
    - Use CSS transitions or keyframes
  - [x] 6.5 Add character counter to NewTaskCard and TaskCard edit mode:
    - Display "X/2000" format in real-time
    - Update on every keystroke
    - Style counter (e.g., gray text, bottom-right of textarea)
  - [x] 6.6 Ensure "+ New Task" button is always visible:
    - Not hidden or shown on hover
    - Positioned at top of "To Do" column
    - Clear and inviting design

- [x] 7.0 **Keyboard Shortcuts & Accessibility**
  - [x] 7.1 Implement global keyboard shortcut listener:
    - **N** or **Cmd/Ctrl+N**: Focus on "+ New Task" button in To Do column
    - Prevent default browser behavior for Cmd/Ctrl+N
  - [x] 7.2 Implement task creation/editing shortcuts:
    - **Enter**: Submit single-line task (only in create/edit mode)
    - **CMD+Enter / CTRL+Enter**: Add line break (in create/edit mode)
    - **Escape**: Cancel current edit or creation
    - **Cmd/Ctrl+S**: Save current edit
  - [x] 7.3 Implement task deletion shortcut:
    - **Delete** or **Backspace**: Delete focused task (show confirmation dialog)
    - Only trigger when a task card is focused (not while editing)
  - [x] 7.4 Add keyboard shortcut hints:
    - Tooltip or help icon showing available shortcuts
    - Display on hover or as persistent help text
    - Format: "N: New task, Esc: Cancel, Enter: Submit"
  - [x] 7.5 Ensure keyboard navigation works:
    - Tab through interactive elements
    - Focus states visible on all interactive elements
    - Keyboard-only users can perform all actions
  - [x] 7.6 Add ARIA labels for accessibility:
    - Label columns with proper headings
    - Label interactive buttons and cards
    - Announce drag-and-drop operations to screen readers

- [x] 8.0 **Testing, Polish & Final Validation**
  - [x] 8.1 Test with 0 tasks (empty states display correctly, "+ New Task" always visible)
  - [x] 8.2 Test with 1-9 tasks per column (no pagination buttons)
  - [x] 8.3 Test with 10+ tasks per column (pagination works, "+Load more" appears/disappears)
  - [x] 8.4 Test with 100+ tasks (performance, smooth scrolling, responsive drag-and-drop)
  - [x] 8.5 Test task creation flow:
    - Single-line tasks (no title, description only)
    - Multi-line tasks with first line ≤ 200 chars (bold title, regular description)
    - Multi-line tasks with first line > 200 chars (no title, all description)
    - Exactly 200 chars on first line (should become title)
    - 201 chars on first line (should NOT become title)
  - [x] 8.6 Test task editing flow:
    - Click card to edit
    - Modify content
    - Save changes (Cmd/Ctrl+S or Save button)
    - Cancel changes (Escape or Cancel button)
    - Verify title/description re-parse after edit
    - Verify can't edit while dragging
  - [x] 8.7 Test validation:
    - Empty content after trim (should reject)
    - 1 character content (should reject)
    - 2 characters minimum (should accept)
    - 2000 characters maximum (should accept)
    - 2001 characters (should reject)
    - Duplicate detection (case-insensitive first line)
  - [x] 8.8 Test drag-and-drop:
    - Drag task from "To Do" to "In Progress"
    - Drag task from "In Progress" to "Completed"
    - Drag task from "Completed" back to "To Do"
    - Visual feedback during drag (translucency, elevation)
    - Drop zone highlighting
    - Haptic feedback on successful drop (if supported)
    - Sound effect on successful drop
    - Task appears at top of destination column
  - [x] 8.9 Test task deletion:
    - Click delete button
    - Confirmation dialog appears
    - Confirm with Enter key
    - Confirm with Confirm button
    - Cancel with Escape key
    - Cancel with Cancel button
    - Task removed from localStorage
  - [x] 8.10 Test keyboard shortcuts:
    - N / Cmd+N (create new task)
    - Escape (cancel)
    - Enter (submit single-line)
    - Cmd/Ctrl+Enter (line break)
    - Cmd/Ctrl+S (save edit)
    - Delete/Backspace (delete with confirmation)
    - Verify shortcut hints are visible
  - [x] 8.11 Test localStorage persistence:
    - Create tasks, refresh browser (tasks persist)
    - Edit task, refresh browser (edits persist)
    - Delete task, refresh browser (deletion persists)
    - Verify only `id`, `content`, `status`, `createdAt` stored (no title/description)
    - Verify title/description recalculated after page load
    - Test localStorage quota error handling
  - [x] 8.12 Test character counter:
    - Displays during task creation
    - Displays during task editing
    - Updates in real-time on keystroke
    - Shows correct count (e.g., "145/2000")
  - [x] 8.13 Test animations:
    - New task fade-in/slide-down at top of column
    - Smooth drag-and-drop transitions
    - Hover state transitions on cards
  - [x] 8.14 Visual design polish:
    - Verify glassmorphism effects (blur, translucency)
    - Check gradient background
    - Ensure adequate color contrast (readability)
    - Confirm generous spacing and padding
    - Verify centered layout on various screen sizes
  - [x] 8.15 Cross-browser testing:
    - Test in Chrome (latest)
    - Test in Firefox (latest)
    - Test in Safari (latest)
    - Test in Edge (latest)
  - [x] 8.16 Final code quality checks:
    - Run TypeScript compiler with no errors (`tsc --noEmit`) ✅ VERIFIED
    - No console errors or warnings
    - All components properly typed ✅ VERIFIED
    - Clean code formatting and organization ✅ VERIFIED
    - Verify data service layer ready for future API integration ✅ VERIFIED
    - Confirm frontend-only business rule (taskParser) properly implemented ✅ VERIFIED

---

## Implementation Notes

### Development Order
Follow the task order as listed (1.0 → 8.0) for a smooth implementation flow.

### Key Architecture Principles
1. **Single Source of Truth:** Only store `content` field; derive title/description dynamically
2. **Frontend-Only Business Rule:** `parseTaskContent()` utility recalculates on every render
3. **Async Patterns:** Wrap localStorage in Promises to match future API integration
4. **Component Separation:** Keep components small and single-purpose
5. **No Derived Data in Storage:** Never persist title or description fields

### Testing Strategy
- Test edge cases thoroughly (200/201 char first line, exactly 2/2000 total chars)
- Verify localStorage only contains 4 fields: id, content, status, createdAt
- Confirm title/description parsing is instant and consistent across all renders
- Validate that editing automatically works with same parsing logic

### Future Backend Compatibility
- All data operations in `taskService.ts` use async/Promise patterns
- Commented-out API placeholders ready for future integration
- Backend will only need to store/return: `id`, `content`, `status`, `createdAt`
- Frontend will continue to handle title/description parsing client-side

---

## Success Criteria

✅ All 63 functional requirements (FR-001 to FR-063) implemented  
✅ All 13 user stories (US-001 to US-013) satisfied  
✅ Task editing works (click to edit)  
✅ Keyboard shortcuts functional  
✅ Character counter displays during create/edit  
✅ Animations and haptic/sound feedback work  
✅ Frontend-only business rule for title/description parsing implemented  
✅ No console errors or warnings  
✅ TypeScript strict mode with no type errors  
✅ `npm run dev` runs successfully  
✅ localStorage persistence works across sessions  
✅ Glassmorphism design matches specifications  
✅ All validation rules enforced  
✅ Pagination works smoothly  
✅ Drag-and-drop feels smooth (60fps)

---

**Status:** Ready for Implementation  
**Estimated Complexity:** Medium-High (8 major tasks, ~110 sub-tasks)  
**Recommended Timeline:** 2-3 days for experienced developer, 4-5 days for junior developer

