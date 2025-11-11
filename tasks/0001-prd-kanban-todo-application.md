# PRD: Kanban-Style To-Do Application

**Document ID:** 0001  
**Feature Name:** Kanban-Style To-Do Application  
**Created:** November 11, 2025  
**Last Updated:** November 11, 2025  
**Status:** Ready for Implementation  
**Version:** 2.0

## Change Log

**Version 2.0 (Nov 11, 2025):**
- ✅ Added task editing to MVP scope (click to edit)
- ✅ Added keyboard shortcuts (N, Escape, Enter, Cmd+S, Delete, etc.)
- ✅ Added character counter for create/edit modes
- ✅ Added subtle animations for new tasks
- ✅ Added haptic/sound feedback for drag-and-drop
- ✅ Made "+ New Task" always visible (not on hover)
- ✅ Confirmed title/description as frontend-only business rule
- ✅ Updated to 63 functional requirements (from 50)
- ✅ Updated to 13 user stories (from 11)
- ✅ Added decision summary section

**Version 1.0 (Nov 11, 2025):**
- Initial PRD with card-based input approach
- Frontend-only title/description parsing
- 3-column Kanban layout with drag-and-drop
- LocalStorage persistence
- Pagination (10 tasks per column)  

---

## 1. Introduction/Overview

This document outlines the requirements for building a modern, interactive Kanban-style To-Do application using React and TypeScript. The application will allow users to create, organize, and manage tasks across three status columns: "To Do", "In Progress", and "Completed". 

The primary goal is to provide users with an intuitive task management interface that persists data locally and offers a delightful user experience with drag-and-drop functionality and glassmorphism design aesthetics.

**Key Innovation:** Unlike traditional to-do apps that use separate form fields, this application uses a **card-based input approach** where users type directly into task cards. The system intelligently infers the title from the content (first line becomes the title, subsequent lines become the description), making task creation faster and more natural.

**Problem Statement:** Users need a simple yet effective way to track their tasks and visualize their workflow across different stages of completion, without the friction of filling out multiple form fields.

---

## 2. Goals

1. Enable users to create, edit, move, and delete tasks across three workflow stages
2. Provide an intuitive drag-and-drop interface for task status transitions
3. Offer keyboard shortcuts for efficient task management
4. Persist all task data locally so users don't lose information on page refresh
5. Deliver a modern, visually appealing interface using glassmorphism design principles
6. Provide immediate visual feedback through animations and haptic/sound effects
7. Handle large numbers of tasks gracefully with pagination
8. Structure the codebase to facilitate future backend API integration with frontend-only business rules

---

## 3. User Stories

**US-001:** As a user, I want to click a "+ New Task" area and type directly into a card so that I can quickly create tasks without form fields.

**US-002:** As a user, I want to drag tasks between "To Do", "In Progress", and "Completed" columns so that I can update their status visually.

**US-003:** As a user, I want to delete tasks I no longer need so that I can keep my board organized.

**US-004:** As a user, I want my tasks to persist after closing and reopening the browser so that I don't lose my data.

**US-005:** As a user, I want to see a limited number of tasks per column initially so that the interface doesn't feel overwhelming.

**US-006:** As a user, I want to load more tasks in each column when needed so that I can access all my tasks without performance issues.

**US-007:** As a user, I want each column to scroll independently so that I can view different parts of my workflow simultaneously.

**US-008:** As a user, I want to confirm before deleting a task so that I don't accidentally remove important items.

**US-009:** As a user, I want to see friendly empty state messages so that I know the application is working even when there's no data.

**US-010:** As a user, I want to add multi-line task content using CMD+Enter (macOS) or CTRL+Enter (Windows/Linux) so that I can provide detailed information, with the first line optionally becoming a bold title if it's concise enough.

**US-011:** As a user, I want the first line of my multi-line task to be displayed as a bold title (when 200 characters or less) so that I can quickly scan my tasks and distinguish them from single-line tasks.

**US-012:** As a user, I want to click on a task card to edit its content so that I can update or correct tasks without deleting and recreating them.

**US-013:** As a user, I want to use keyboard shortcuts for common actions so that I can work more efficiently.

---

## 4. Functional Requirements

### 4.1 Task Management

**FR-001:** The system must allow users to create new tasks by clicking a "+ New Task" button or area at the top of the "To Do" column.

**FR-002:** The system must display an empty editable card when creating a new task.

**FR-003:** The system must allow users to type directly into the card (no separate input fields).

**FR-004:** The system must assign each task a unique ID using `crypto.randomUUID()`.

**FR-005:** The system must store a timestamp (`createdAt`) for each task using `Date.now()`.

**FR-006:** The system must trim whitespace from task content before saving.

**FR-007:** The system must validate that task content has at least 2 characters after trimming.

**FR-008:** The system must enforce a maximum total character limit of 2000 characters for task content.

**FR-009:** The system must automatically infer the title and description from task content:
   - If single-line: no title, entire content is the description
   - If multi-line AND first line ≤ 200 chars: first line is title, remaining lines are description
   - If multi-line AND first line > 200 chars: no title, entire content is the description

**FR-010:** The system must limit the title to 200 characters. Only first lines of 200 characters or less can become titles.

**FR-011:** The system must prevent users from creating duplicate tasks (same content, case-insensitive comparison of first line/title).

**FR-012:** The system must display newest tasks at the top of their respective columns.

**FR-013:** The system must allow users to delete tasks with confirmation.

**FR-014:** The system must support multi-line task input using CMD+Enter (macOS) or CTRL+Enter (Windows/Linux) for line breaks.

**FR-015:** The system must allow users to submit tasks by:
   - Pressing Enter key (for single-line tasks)
   - Clicking outside the card
   - Clicking a "Save" icon/button on the card

**FR-016:** The system must allow users to cancel task creation by pressing Escape or clicking a "Cancel" icon/button.

### 4.2 Task Status & Columns

**FR-017:** The system must organize tasks into three columns: "To Do", "In Progress", and "Completed".

**FR-018:** The system must default new tasks to "To Do" status.

**FR-019:** The system must allow users to drag and drop tasks between columns to change their status.

**FR-020:** The system must provide visual feedback during drag operations (e.g., translucency, elevation, smooth animations).

**FR-021:** The system must update the task's status when dropped into a new column.

### 4.3 Pagination & Scrolling

**FR-022:** The system must initially display 10 tasks per column.

**FR-023:** The system must show a "+Load more" button at the bottom of each column when more tasks exist.

**FR-024:** The system must load 10 additional tasks when the "+Load more" button is clicked.

**FR-025:** The system must make each column independently scrollable.

**FR-026:** The system must hide the "+Load more" button when all tasks in a column are displayed.

### 4.4 Data Persistence

**FR-027:** The system must persist task data (id, content, status, createdAt) to localStorage.

**FR-028:** The system must NOT persist title or description fields - these are frontend-only derived values.

**FR-029:** The system must load persisted tasks on application initialization.

**FR-030:** The system must update localStorage whenever tasks are created, modified, or deleted.

**FR-031:** The system must gracefully handle localStorage quota errors (show user-friendly error message).

### 4.5 User Interface

**FR-032:** The system must display a centered layout with clean, readable typography.

**FR-033:** The system must implement glassmorphism design with translucent elements and blur effects.

**FR-034:** The system must use a subtle gradient background.

**FR-035:** The system must provide adequate contrast for readability.

**FR-036:** The system must dynamically parse and display task titles in bold font (when present) and descriptions in regular font using the frontend business rule.

**FR-037:** The system must show a visual distinction between the title (bold) and description (regular) within cards that have titles.

**FR-038:** The system must display only the description in regular font for tasks without titles (single-line or multi-line with long first line).

**FR-039:** The system must display friendly empty state messages when columns are empty (e.g., "Click + New Task to get started!").

**FR-040:** The system must show a "+ New Task" button or area at the top of the "To Do" column.

### 4.6 Validation & Error Handling

**FR-041:** The system must prevent submission of empty tasks (after trimming).

**FR-042:** The system must show inline validation errors within or near the card being edited.

**FR-043:** The system must display clear error messages for duplicate tasks.

**FR-044:** The system must show a confirmation dialog before deleting tasks.

**FR-045:** The system must allow users to confirm deletion with Enter key or a confirm button.

**FR-046:** The system must allow users to cancel deletion with Escape key or a cancel button.

### 4.7 Data Model & Business Rules

**FR-047:** Tasks must use the following TypeScript interface for storage (localStorage and future API):

```typescript
interface Task {
  id: string;           // Generated via crypto.randomUUID()
  content: string;      // Full task content (2-2000 chars, trimmed)
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: number;    // Unix timestamp via Date.now()
}
```

**FR-048:** The system must store ONLY the `content` field. Title and description must NOT be persisted as separate fields.

**FR-049:** The system must implement a **frontend-only business rule** that dynamically calculates title and description from content when rendering:
   - Single-line content: No title, entire content is description
   - Multi-line with first line ≤ 200 chars: First line is title, remaining lines are description
   - Multi-line with first line > 200 chars: No title, entire content is description

**FR-050:** The title/description parsing must be recalculated on every render, ensuring:
   - Any content updates (via editing) automatically reflect new title/description
   - No stale or cached parsed values
   - Consistent behavior across all task displays
   - Automatic re-parsing if content changes

### 4.8 Task Editing

**FR-051:** The system must allow users to edit existing tasks by clicking on the task card.

**FR-052:** The system must transform the task card into edit mode when clicked, showing:
   - Editable textarea pre-filled with current content
   - Save and Cancel buttons/icons
   - Character counter

**FR-053:** The system must allow the same multi-line editing capabilities in edit mode (CMD+Enter / CTRL+Enter for line breaks).

**FR-054:** The system must update the task content in localStorage when saved.

**FR-055:** The system must automatically re-parse title/description after content is edited.

**FR-056:** The system must prevent editing during drag operations.

### 4.9 User Experience Enhancements

**FR-057:** The system must display a character counter showing current/max characters (e.g., "145/2000") while typing in new or edit mode.

**FR-058:** The system must show the "+ New Task" button at the top of the "To Do" column at all times (always visible).

**FR-059:** The system must implement subtle animations when new tasks appear at the top of columns (fade-in, slide-down, or similar).

**FR-060:** The system must provide haptic feedback (on supported devices) when drag-and-drop operations complete successfully.

**FR-061:** The system must provide optional sound effects for successful drag-and-drop operations (user preference/toggle recommended for future).

### 4.10 Keyboard Shortcuts

**FR-062:** The system must support the following keyboard shortcuts:
   - **N** or **Cmd/Ctrl+N**: Create new task (focus on "+ New Task" in To Do column)
   - **Escape**: Cancel current edit/creation
   - **Enter**: Submit single-line task (in create/edit mode)
   - **Cmd/Ctrl+Enter**: Add line break (in create/edit mode)
   - **Cmd/Ctrl+S**: Save current edit
   - **Delete** or **Backspace**: Delete focused task (with confirmation)

**FR-063:** The system must show keyboard shortcut hints on hover or in a help tooltip.

---

## 5. Non-Goals (Out of Scope)

**NG-001:** Task priority or labeling systems.

**NG-002:** Task due dates or reminders.

**NG-003:** User authentication or multi-user support.

**NG-004:** Backend API integration (will be addressed in a future iteration).

**NG-005:** Task search functionality.

**NG-006:** Task filtering beyond the three status columns.

**NG-007:** Task assignment or collaboration features.

**NG-008:** Mobile-specific responsive design optimizations (focus on modern desktop browsers).

**NG-009:** Dark mode toggle (single theme only).

**NG-010:** Accessibility features beyond basic semantic HTML.

**NG-011:** Internationalization (English only).

**NG-012:** "Clear all completed" bulk action.

**NG-013:** Maximum total task limit enforcement.

**NG-014:** Task metadata display (creation dates, time in status, etc.).

---

## 6. Design Considerations

### 6.1 Visual Design

- **Style:** Glassmorphism aesthetic with translucent card backgrounds, subtle blur effects, and smooth shadows
- **Layout:** 3-column layout with equal-width columns, centered on page
- **Typography:** Clean, modern sans-serif font (system font stack recommended)
- **Color Palette:** Soft gradients for background, semi-transparent white/light colors for cards
- **Spacing:** Generous padding and margins for comfortable readability
- **Effects:** Smooth transitions for drag-and-drop, hover states, and interactions

### 6.2 Component Structure

Suggested component breakdown:
- `TaskBoard.tsx` - Main container for the three columns
- `TaskColumn.tsx` - Individual column component (To Do, In Progress, Completed)
- `TaskCard.tsx` - Individual task card component (handles both display and edit modes)
- `NewTaskCard.tsx` - Editable card for creating new tasks (or integrate into TaskCard with edit mode)
- `ConfirmDialog.tsx` - Reusable confirmation dialog for deletions
- `EmptyState.tsx` - Empty state messaging component

**Note:** The `TaskCard` component should support two modes:
- **Display mode:** Shows the task with optional bold title (if present) and regular description
  - With title: Bold title on first line, regular description below
  - Without title: Regular description only
  - Clickable to enter edit mode
- **Edit mode:** Shows editable textarea with current content
  - Used for both creating new tasks (NewTaskCard) and editing existing tasks
  - Displays character counter
  - Shows Save and Cancel buttons/icons
  - Supports keyboard shortcuts

### 6.3 Card-Based Input UX Flow

The card-based input approach follows this user flow:

1. **Initial State:** User sees a "+ New Task" button/area at the top of the "To Do" column
2. **Click to Create:** When clicked, the button transforms into an empty editable card with a textarea
3. **Type Content:** User types directly into the card:
   - Single line: Just type and press Enter
   - Multiple lines: Press CMD+Enter (macOS) or CTRL+Enter (Windows/Linux) for line breaks
4. **Submit Task:** User can submit by:
   - Pressing Enter (single-line only)
   - Clicking outside the card (blur)
   - Clicking a Save/Check icon on the card
5. **Task Parsing:** System automatically:
   - Single-line: No title, entire content is **description** (regular weight)
   - Multi-line with first line ≤ 200 chars: First line is **title** (bold), rest is **description** (regular)
   - Multi-line with first line > 200 chars: No title, entire content is **description** (regular)
6. **Task Display:** New card appears at top of column with optional bold title and regular description
7. **Return to Initial:** The editable card returns to "+ New Task" button state

**Visual States:**
- **Empty state:** "+ New Task" button/area (subtle, inviting)
- **Edit state:** Expanded card with textarea, Save and Cancel buttons/icons
- **Display state (with title):** Rendered card with bold title on first line, regular description below
- **Display state (no title):** Rendered card with regular description text only

### 6.4 Drag and Drop

- Use a modern drag-and-drop library (e.g., `@dnd-kit/core`, `react-beautiful-dnd`, or native HTML5 drag-and-drop)
- Visual feedback: semi-transparent drag preview, drop zone highlighting
- Smooth animations during drag and drop operations
- Prevent drops in invalid locations

---

## 7. Technical Considerations

### 7.1 Technology Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Drag-and-Drop:** Recommend `@dnd-kit/core` (modern, accessible, TypeScript-first)
- **Development Server:** `http://localhost:5173`
- **Storage:** localStorage (initial implementation)

### 7.2 Browser Support

- **Target:** Modern browsers only (latest versions of Chrome, Firefox, Safari, Edge)
- **Required APIs:** crypto.randomUUID(), localStorage, ES6+ features
- **Note:** No IE11 support required

### 7.3 Code Organization

```
/frontend
  /src
    /components
      /TaskBoard
      /TaskColumn
      /TaskCard
      /NewTaskCard
      /ConfirmDialog
      /EmptyState
    /hooks
      /useLocalStorage.ts
      /useTasks.ts
    /services
      /taskService.ts  (placeholder for future API)
    /types
      /task.ts
    /utils
      /validation.ts
      /taskParser.ts    (utility to parse content into title/description)
    /styles
    App.tsx
    main.tsx
```

**Example `taskParser.ts` implementation pattern (Frontend-Only Utility):**

```typescript
/**
 * Frontend-only business rule for parsing task content into title/description.
 * This is NOT stored - it's calculated dynamically on every render.
 * 
 * @param content - The raw task content from storage
 * @returns Parsed title (optional) and description for display
 */
export function parseTaskContent(content: string): { 
  title?: string; 
  description: string 
} {
  const trimmed = content.trim();
  const lines = trimmed.split('\n');
  
  if (lines.length === 1) {
    // Single line: no title, entire content is description
    return { 
      title: undefined,
      description: trimmed
    };
  }
  
  // Multi-line: check if first line qualifies as title (≤ 200 chars)
  const firstLine = lines[0];
  
  if (firstLine.length <= 200) {
    // First line becomes title, rest is description
    const description = lines.slice(1).join('\n').trim();
    return { 
      title: firstLine,
      description
    };
  } else {
    // First line too long: no title, entire content is description
    return { 
      title: undefined,
      description: trimmed
    };
  }
}
```

**Usage in Components:**

```typescript
// TaskCard.tsx - Example usage
function TaskCard({ task }: { task: Task }) {
  // Parse content dynamically - NOT stored, always fresh
  const { title, description } = parseTaskContent(task.content);
  
  return (
    <div className="task-card">
      {title && <h3 className="task-title">{title}</h3>}
      <p className="task-description">{description}</p>
    </div>
  );
}
```

**Task Content Examples:**

| Stored Content | Rendered Display (Frontend Parsing) |
|----------------|-------------------------------------|
| `"Buy groceries"` | **Title:** none<br>**Description:** "Buy groceries" |
| `"Buy groceries\nMilk, eggs, bread"` | **Title:** "Buy groceries"<br>**Description:** "Milk, eggs, bread" |
| `"Very long first line that exceeds two hundred characters...\nMore details here"` | **Title:** none<br>**Description:** (entire content) |

**Key Principle:** Only `content` is stored. Title/description are derived at render time, ensuring they automatically update if content changes in the future.

**Architecture Flow:**
```
User Input → Store Content → localStorage/API
                ↓
          Load Content
                ↓
    Frontend Parser (taskParser.ts)
                ↓
        { title?, description }
                ↓
            Render UI
```

**Benefits of Frontend-Only Parsing:**
- ✅ Simpler data model (no duplicate data)
- ✅ Automatic recalculation on content changes
- ✅ No migration needed if parsing rules change
- ✅ Backend stays simple (just stores content)
- ✅ Editing automatically works with same logic

### 7.4 Future Backend Integration

**Note:** The application should be structured to facilitate future backend integration:

1. **Create a Data Service Layer:** All localStorage operations should be abstracted into a `taskService.ts` module with methods like:
   - `getTasks(): Promise<Task[]>`
   - `createTask(task: Task): Promise<Task>`
   - `updateTaskStatus(id: string, status: TaskStatus): Promise<Task>`
   - `deleteTask(id: string): Promise<void>`

**Important:** The backend should ONLY store and return tasks with `id`, `content`, `status`, and `createdAt` fields. The backend should NOT store `title` or `description` fields, as these are frontend-only derived values.

2. **Use Async Patterns:** Even though localStorage is synchronous, wrap all data operations in Promises to match future async API calls.

3. **Placeholder API Functions:** Create commented-out API function placeholders that show the intended backend integration:

```typescript
// taskService.ts - Current localStorage implementation
export async function getTasks(): Promise<Task[]> {
  const stored = localStorage.getItem('tasks');
  return stored ? JSON.parse(stored) : [];
  
  // Future API implementation:
  // return fetch('/api/tasks').then(res => res.json());
}
```

4. **Error Handling:** Implement proper error handling that will work with both localStorage errors and future network errors.

5. **Loading States:** Implement loading state management even for localStorage operations to establish patterns for future API integration.

### 7.5 Performance Considerations

- Implement virtual scrolling if columns exceed 100+ items (future enhancement)
- Debounce localStorage writes if performance issues arise
- Use React.memo() for TaskCard components to prevent unnecessary re-renders
- Optimize drag-and-drop performance with proper event handling

### 7.6 State Management

- Start with React Context API or useState for local state management
- No need for Redux or heavy state management libraries initially
- Consider Zustand if state management becomes complex

---

## 8. Success Metrics

### 8.1 Feature Completeness

✅ All functional requirements (FR-001 through FR-063) implemented  
✅ All user stories (US-001 through US-013) satisfied  
✅ Task editing capability implemented (click to edit)  
✅ Keyboard shortcuts implemented  
✅ Character counter implemented  
✅ Animations and haptic/sound feedback implemented  
✅ Frontend-only business rule for title/description parsing implemented  
✅ No console errors or warnings  
✅ TypeScript strict mode enabled with no type errors  

### 8.2 Quality Standards

✅ `npm run dev` runs without errors  
✅ Application loads in under 2 seconds on modern hardware  
✅ Drag-and-drop operations feel smooth (60fps)  
✅ localStorage persistence works across browser sessions  
✅ All validation rules work as specified  
✅ Confirmation dialogs function correctly  

### 8.3 User Experience

✅ UI matches glassmorphism design specifications  
✅ Adequate color contrast for readability  
✅ Responsive feedback for all user actions  
✅ Empty states display properly  
✅ Pagination works smoothly in all columns  
✅ Multi-line input works with CMD+Enter / CTRL+Enter  
✅ Title/description parsing is instant and consistent  

### 8.4 Code Quality

✅ Components are small and single-purpose  
✅ Proper TypeScript types throughout  
✅ Clean separation of concerns (UI, logic, data)  
✅ Data service layer ready for API integration  
✅ Frontend-only business rule properly implemented (parseTaskContent utility)  
✅ No derived data stored in localStorage/backend  
✅ Consistent code formatting  

---

## 9. Requirements Based on Decisions

The following requirements are based on answered clarifying questions:

**D1 - Keyboard Shortcuts (Q1: Yes):** The system will include keyboard shortcuts for common actions.

**D2 - Task Metadata (Q2: No):** Tasks will NOT display creation date or status timing metadata.

**D3 - Task Limits (Q3: No):** No maximum total task limit will be enforced (rely on localStorage natural limits).

**D4 - Bulk Actions (Q4: No):** No "Clear all completed" bulk action for MVP.

**D5 - localStorage Fallback (Q5: Error message):** Show error message if localStorage unavailable (future API will resolve this).

**D6 - Animations (Q6: Yes):** Implement subtle animations when tasks appear at top of columns.

**D7 - Pagination Size (Q7: Fixed):** Page size fixed at 10 tasks per column.

**D8 - Haptic/Sound Feedback (Q8: Yes):** Add haptic feedback and/or sound effects for drag-and-drop operations.

**D9 - New Task Button (Q9: Always visible):** "+ New Task" button always visible in "To Do" column.

**D10 - Character Counter (Q10: Yes):** Show character counter while typing in task card.

**D11 - Long First Line Behavior (Q11: No auto-break):** Do not auto-break at 200 characters; let user manage line breaks.

**D12 - Task Editing (Q12: Yes, editable):** Task cards are clickable and editable (moved to MVP scope).

---

## 10. Acceptance Criteria

### 10.1 Task Creation

- [ ] User can click "+ New Task" button at top of "To Do" column
- [ ] Empty editable card appears when creating new task
- [ ] User can type directly into the card (no separate form fields)
- [ ] User can press Enter to submit single-line task
- [ ] User can press CMD+Enter (macOS) or CTRL+Enter (Windows/Linux) to add line breaks
- [ ] User can click outside card or Save button to submit task
- [ ] User can press Escape or Cancel button to cancel creation
- [ ] Empty tasks (after trim) cannot be submitted
- [ ] Tasks over 2000 characters cannot be submitted
- [ ] Duplicate tasks (case-insensitive, based on first line) cannot be created
- [ ] Card returns to "+ New Task" button after successful creation
- [ ] New task appears at the top of "To Do" column
- [ ] Single-line tasks display with regular description text only (no title)
- [ ] Multi-line tasks with first line ≤ 200 chars display first line as bold title
- [ ] Multi-line tasks with first line > 200 chars display as regular description only (no title)
- [ ] Remaining lines (after title) display as regular description text
- [ ] Validation errors display clearly within or near the card

### 10.2 Drag and Drop

- [ ] User can grab any task card and drag it
- [ ] Visual feedback shows during drag (translucency, elevation)
- [ ] Drop zones highlight when dragging over them
- [ ] Task updates status when dropped in new column
- [ ] Task appears in correct position (top) of new column
- [ ] Smooth animations occur during the transition
- [ ] Drag can be cancelled by dropping outside valid zones

### 10.3 Task Editing

- [ ] User can click on any task card to enter edit mode
- [ ] Task card transforms into editable textarea with current content
- [ ] Character counter displays while editing (e.g., "145/2000")
- [ ] User can modify content with multi-line support (CMD+Enter / CTRL+Enter)
- [ ] Save button/icon is available
- [ ] Cancel button/icon is available
- [ ] Pressing Escape cancels edit and reverts to display mode
- [ ] Pressing Cmd/Ctrl+S saves the edit
- [ ] Updated content saves to localStorage
- [ ] Title/description automatically re-parse after edit
- [ ] Card cannot be edited while being dragged
- [ ] Validation rules apply (2 char min, 2000 char max, no duplicates)

### 10.4 Task Deletion

- [ ] Delete button/icon appears on each task card
- [ ] Clicking delete shows confirmation dialog
- [ ] User can confirm with Enter key or confirm button
- [ ] User can cancel with Escape key or cancel button
- [ ] Task is removed from UI after confirmation
- [ ] Task is removed from localStorage after deletion

### 10.5 Keyboard Shortcuts

- [ ] Pressing N or Cmd/Ctrl+N focuses on "+ New Task" button
- [ ] Pressing Escape cancels current edit or creation
- [ ] Pressing Enter submits single-line task
- [ ] Pressing Cmd/Ctrl+Enter adds line break
- [ ] Pressing Cmd/Ctrl+S saves current edit
- [ ] Pressing Delete/Backspace on focused task shows deletion confirmation
- [ ] Keyboard shortcut hints visible on hover or in help tooltip

### 10.6 User Experience Enhancements

- [ ] Character counter displays during task creation (e.g., "145/2000")
- [ ] Character counter displays during task editing
- [ ] "+ New Task" button is always visible at top of "To Do" column
- [ ] Subtle animations play when new tasks appear (fade-in/slide-down)
- [ ] Haptic feedback occurs on successful drag-and-drop (on supported devices)
- [ ] Optional sound effects play on successful drag-and-drop

### 10.7 Pagination

- [ ] Each column initially shows maximum 10 tasks
- [ ] "+Load more" button appears when more than 10 tasks exist
- [ ] Clicking "+Load more" loads 10 additional tasks
- [ ] "+Load more" button disappears when all tasks are shown
- [ ] Pagination state persists during drag-and-drop operations
- [ ] Each column scrolls independently

### 10.8 Data Persistence

- [ ] Tasks save to localStorage on creation (only id, content, status, createdAt)
- [ ] Tasks save to localStorage on status change
- [ ] Tasks save to localStorage on deletion
- [ ] Tasks save to localStorage on edit
- [ ] Title and description are NOT stored in localStorage (frontend-only)
- [ ] Tasks load from localStorage on page load
- [ ] Title/description are parsed dynamically from content on every render
- [ ] Tasks persist after browser refresh
- [ ] localStorage quota errors show user-friendly message

### 10.9 Visual Design

- [ ] Three equal-width columns displayed horizontally
- [ ] Glassmorphism effects visible (blur, translucency)
- [ ] Gradient background displays correctly
- [ ] Typography is clean and readable
- [ ] Color contrast meets readability standards
- [ ] Generous spacing and padding throughout
- [ ] Layout is centered on the page

### 10.10 Empty States

- [ ] "To Do" column shows empty message when no tasks
- [ ] "In Progress" column shows empty message when no tasks
- [ ] "Completed" column shows empty message when no tasks
- [ ] Empty messages are friendly and helpful

### 10.11 Technical

- [ ] Application runs on `http://localhost:5173`
- [ ] `npm run dev` starts without errors
- [ ] No console errors during normal operation
- [ ] TypeScript compiles without errors
- [ ] All components use proper TypeScript types
- [ ] Data service layer uses async/Promise patterns
- [ ] Placeholder API comments exist in service layer

---

## 11. Implementation Notes

### 11.1 Recommended Development Order

1. **Phase 1 - Foundation**
   - Set up Vite + React + TypeScript project
   - Create Task interface and types
   - Implement basic 3-column layout (no functionality)
   - Add glassmorphism styling and gradient background

2. **Phase 2 - Core Features**
   - Create TaskCard component (display mode with click to edit)
   - Build NewTaskCard component (card-based input with validation)
   - Implement taskParser utility (parse content into title/description)
   - Implement localStorage service layer
   - Add task creation functionality with "+ New Task" trigger (always visible)
   - Add character counter for create/edit modes
   - Implement task editing (click card to edit)
   - Implement task deletion with confirmation

3. **Phase 3 - Drag and Drop**
   - Install and configure drag-and-drop library
   - Implement drag-and-drop between columns
   - Add visual feedback and animations
   - Implement haptic feedback (on supported devices)
   - Add optional sound effects
   - Prevent editing during drag
   - Test status updates

4. **Phase 4 - Keyboard Shortcuts & UX**
   - Implement keyboard shortcut system (N, Escape, Enter, Cmd/Ctrl+Enter, Cmd/Ctrl+S, Delete)
   - Add keyboard shortcut hints/tooltips
   - Implement subtle animations for new task appearance
   - Ensure "+ New Task" always visible
   - Test keyboard navigation

5. **Phase 5 - Pagination**
   - Implement pagination logic per column (10 tasks per page)
   - Add "+Load more" buttons
   - Ensure independent scrolling
   - Test with large numbers of tasks

6. **Phase 6 - Polish & Testing**
   - Add empty states
   - Refine all animations and transitions
   - Optimize performance
   - Test all keyboard shortcuts
   - Test editing workflow
   - Fix any remaining bugs
   - Final comprehensive testing

### 11.2 Testing Checklist

- [ ] Test with 0 tasks (empty states, "+ New Task" button always visible)
- [ ] Test with 1-9 tasks (no pagination)
- [ ] Test with 10+ tasks per column (pagination)
- [ ] Test with 100+ tasks (performance)
- [ ] Test card-based task creation (click "+ New Task")
- [ ] Test single-line task creation (shows as description only, no title)
- [ ] Test multi-line task with short first line ≤ 200 chars (first line bold, rest regular)
- [ ] Test multi-line task with long first line > 200 chars (no title, all regular text)
- [ ] Test title/description parsing edge cases (exactly 200 chars, 201 chars)
- [ ] Test duplicate detection (same first line, different cases)
- [ ] Test max length validation (2000 chars total)
- [ ] Test multi-line input with CMD+Enter / CTRL+Enter
- [ ] Test task submission with Enter, click outside, and Save button
- [ ] Test task cancellation with Escape and Cancel button
- [ ] Test character counter display (during creation and editing)
- [ ] Test task editing (click card, modify content, save)
- [ ] Test editing cancellation (Escape key)
- [ ] Test that editing recalculates title/description
- [ ] Test that cards can't be edited while dragging
- [ ] Test drag-and-drop between all column combinations
- [ ] Test haptic feedback on drag-and-drop completion (on supported devices)
- [ ] Test sound effects on drag-and-drop completion
- [ ] Test deletion confirmation (confirm and cancel)
- [ ] Test keyboard shortcuts:
  - [ ] N / Cmd+N to create new task
  - [ ] Escape to cancel
  - [ ] Enter to submit single-line
  - [ ] Cmd/Ctrl+Enter for line breaks
  - [ ] Cmd/Ctrl+S to save edit
  - [ ] Delete/Backspace to delete with confirmation
- [ ] Test keyboard shortcut hints/tooltips visibility
- [ ] Test subtle animations when new tasks appear
- [ ] Test "+ New Task" is always visible (not hidden)
- [ ] Test localStorage persistence across browser restarts
- [ ] Test that localStorage only contains `content` field (not title/description)
- [ ] Test that title/description are recalculated after reload
- [ ] Test that edits persist in localStorage
- [ ] Test localStorage quota handling
- [ ] Test in Chrome, Firefox, Safari, Edge

---

## 12. Future Enhancements (Post-MVP)

These features are out of scope for the initial release but could be considered for future iterations:

- Backend API integration with RESTful endpoints (backend stores only `id`, `content`, `status`, `createdAt`)
- Configurable sound effects toggle (enable/disable in settings)
- Customizable keyboard shortcuts
- Task reordering within columns (manual sorting)
- Task search and filtering
- Task priority levels
- Due dates and calendar integration
- User authentication
- Multi-user collaboration
- Real-time updates with WebSockets
- Mobile responsive design
- Dark mode toggle
- Accessibility improvements (ARIA labels, keyboard navigation)
- Undo/redo functionality
- Bulk operations (select multiple, bulk delete, bulk move)
- Custom columns
- Task templates
- Export/import functionality
- Analytics and insights

---

## 13. Decision Summary

This section documents key decisions made during PRD development:

### Design Decisions

| Decision | Answer | Impact |
|----------|--------|--------|
| Keyboard shortcuts | ✅ Yes | Added FR-062, FR-063 for N, Escape, Enter, Cmd+Enter, Cmd+S, Delete |
| Task metadata display | ❌ No | No creation dates or timestamps shown on cards |
| Maximum task limit | ❌ No | Rely on localStorage natural limits |
| "Clear all completed" action | ❌ No | Not included in MVP |
| localStorage fallback | Error message | Show error if unavailable (API will resolve in future) |
| New task animations | ✅ Yes | Added FR-059 for subtle fade-in/slide-down effects |
| Pagination size | Fixed at 10 | Not user-configurable |
| Haptic/sound feedback | ✅ Yes | Added FR-060, FR-061 for drag-and-drop feedback |
| "+ New Task" visibility | Always visible | Added FR-058 - always shown, not on hover |
| Character counter | ✅ Yes | Added FR-057 - displays during create/edit |
| Long first line behavior | No auto-break | User manages line breaks with Cmd/Ctrl+Enter |
| Task editing | ✅ Yes | **Moved to MVP scope** - Added FR-051 through FR-056 |

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Title/description as frontend-only | Simpler data model, automatic recalculation, no migrations needed |
| Store only `content` field | Backend stays simple, frontend handles parsing |
| Dynamic parsing on render | Ensures consistency, editing works automatically |
| Min 2 characters | Prevents accidental single-character tasks |
| 200-char title threshold | Keeps titles concise and scannable |
| 2000-char total limit | Reasonable for task descriptions |

### Scope Changes

**Added to MVP (originally in Future Enhancements):**
- ✅ Task editing capability (click to edit)
- ✅ Keyboard shortcuts
- ✅ Character counter
- ✅ Animations for new tasks
- ✅ Haptic and sound feedback

**Confirmed Out of Scope:**
- ❌ Task metadata display
- ❌ Bulk actions
- ❌ Configurable pagination size
- ❌ Maximum task limits

---

**End of Document**

