# PRD: Compact and Kanban View Modes

## Introduction/Overview

This feature introduces a configurable view mode system that allows users to switch between "Kanban" (multi-column) and "Compact" (single-column) display modes for their task list. The Compact mode is optimized for smaller screens and mobile devices, presenting tasks in a single column with tab-based filtering and inline status change controls. On screens below 640px width, the application automatically uses Compact mode regardless of user preference to ensure optimal usability on mobile devices.

**Problem Statement:** The current Kanban board layout with three columns works well on larger screens but becomes cramped and difficult to use on smaller screens, tablets, and mobile devices. Users need a more suitable interface for managing tasks on smaller displays while maintaining the full feature set.

**Goal:** Provide users with flexible view modes that adapt to their screen size and personal preferences, ensuring an optimal task management experience across all device sizes.

## Goals

1. **Dual View Modes** - Implement both Kanban (current multi-column) and Compact (single-column) view modes
2. **Responsive Design** - Automatically switch to Compact mode on screens narrower than 640px
3. **User Preference** - Allow users to choose their preferred mode on larger screens, with preference saved to localStorage
4. **Feature Parity** - Ensure all task management operations (create, read, update, delete, change status) work in both modes
5. **Seamless Transitions** - Smooth visual transitions when switching between modes
6. **Enhanced UX** - Improve mobile usability with touch-friendly controls and appropriate visual density

## User Stories

### Core Functionality

**US-1: As a mobile user, I want the app to automatically use a single-column layout so that I can easily manage tasks on my phone**
- **Acceptance Criteria:**
  - When I access the app on a screen narrower than 640px, it displays in Compact mode
  - I can view all my tasks in a single scrollable column
  - I can filter tasks by status using tabs (To Do, In Progress, Done)
  - I can perform all task operations without horizontal scrolling

**US-2: As a desktop user, I want to choose between Kanban and Compact modes so that I can use the layout that best fits my workflow**
- **Acceptance Criteria:**
  - When I access the app on a screen wider than 640px, I see a mode toggle in the header
  - I can click the toggle to switch between Kanban and Compact modes
  - My preference is remembered when I return to the app
  - The transition between modes is smooth and doesn't lose my place

**US-3: As a user in Compact mode, I want to filter tasks by status so that I can focus on specific task categories**
- **Acceptance Criteria:**
  - I see three tabs: "To Do", "In Progress", and "Done"
  - Each tab shows a count of tasks in that status
  - Clicking a tab instantly filters the view to show only tasks of that status
  - The active tab is clearly highlighted

**US-4: As a user in Compact mode, I want to easily change a task's status so that I can manage my workflow without drag-and-drop**
- **Acceptance Criteria:**
  - Each task card shows status change buttons appropriate to its current status
  - From "To Do" status, I see buttons to move to "In Progress" or "Done"
  - From "In Progress" status, I see buttons to move back to "To Do" or forward to "Done"
  - From "Done" status, I see a button to move back to "In Progress"
  - Clicking a button immediately updates the task status
  - The UI updates optimistically and the change persists to the backend

**US-5: As a mobile user, I want to understand why I can't switch modes so that I know it's a feature limitation, not a bug**
- **Acceptance Criteria:**
  - On screens narrower than 640px, the mode toggle is visible but disabled
  - When I hover/tap the disabled toggle, I see a tooltip: "View mode is locked to Compact on small screens"
  - The disabled state is clearly indicated visually (grayed out or similar)

**US-6: As a user, I want to see task counts in both modes so that I can quickly understand my workload**
- **Acceptance Criteria:**
  - In Kanban mode, each column header shows the count of tasks in that column (e.g., "To Do (5)")
  - In Compact mode, each tab shows the count of tasks in that status (e.g., "In Progress (3)")
  - Counts update in real-time as tasks are added, removed, or changed

**US-7: As a new user, I want the app to choose the best view mode for my screen automatically so that I have a good first experience**
- **Acceptance Criteria:**
  - On first visit with screen width ≥ 640px, the app defaults to Kanban mode
  - On first visit with screen width < 640px, the app uses Compact mode (locked)
  - The default feels appropriate and natural for my screen size

## Functional Requirements

### View Mode System

**FR-1:** Implement view mode state management
- **FR-1.1:** Create a `viewMode` state variable with values: `'kanban'` or `'compact'`
- **FR-1.2:** Store user's view mode preference in localStorage under key `task_view_mode`
- **FR-1.3:** Read preference from localStorage on app initialization
- **FR-1.4:** Provide a function to toggle between modes and persist the change

**FR-2:** Implement responsive auto-detection
- **FR-2.1:** Detect screen width on initial load
- **FR-2.2:** If screen width < 640px, force Compact mode regardless of stored preference
- **FR-2.3:** Listen for window resize events
- **FR-2.4:** When width crosses the 640px threshold, apply appropriate mode rules
- **FR-2.5:** On resize from small to large screen, restore user's saved preference
- **FR-2.6:** On resize from large to small screen, enforce Compact mode

**FR-3:** Default mode selection logic
- **FR-3.1:** If no preference is stored and screen width ≥ 640px, default to Kanban mode
- **FR-3.2:** If no preference is stored and screen width < 640px, use Compact mode (locked)
- **FR-3.3:** If preference exists and screen width ≥ 640px, use stored preference
- **FR-3.4:** If preference exists and screen width < 640px, override with Compact mode

### Mode Toggle UI

**FR-4:** Create view mode toggle component in header
- **FR-4.1:** Position toggle in the top header area, near the theme switcher
- **FR-4.2:** Use clear iconography (e.g., grid icon for Kanban, list icon for Compact)
- **FR-4.3:** Include text labels or tooltips: "Kanban View" and "Compact View"
- **FR-4.4:** Highlight the currently active mode
- **FR-4.5:** Make toggle easily tappable on touch devices (minimum 44x44px touch target)

**FR-5:** Implement toggle disabled state for mobile
- **FR-5.1:** When screen width < 640px, render toggle in disabled state
- **FR-5.2:** Apply visual disabled styling (reduced opacity, grayed out, cursor not-allowed)
- **FR-5.3:** Show tooltip on hover/tap: "View mode is locked to Compact on small screens"
- **FR-5.4:** Prevent click/tap actions on disabled toggle
- **FR-5.5:** Keep toggle visible for discoverability

### Kanban Mode (Enhanced)

**FR-6:** Update existing Kanban mode with task counts
- **FR-6.1:** Display task count in each column header (e.g., "To Do (5)")
- **FR-6.2:** Update counts in real-time as tasks change
- **FR-6.3:** Keep existing drag-and-drop functionality
- **FR-6.4:** Maintain current multi-column layout
- **FR-6.5:** Keep existing visual styling and spacing

### Compact Mode - Layout

**FR-7:** Implement single-column layout
- **FR-7.1:** Display all filtered tasks in a single vertical column
- **FR-7.2:** Use full width of the container (with appropriate max-width for readability)
- **FR-7.3:** Stack tasks vertically with consistent spacing
- **FR-7.4:** Maintain responsive padding and margins

**FR-8:** Implement task status tabs
- **FR-8.1:** Display three tabs above the task list: "To Do", "In Progress", "Done"
- **FR-8.2:** Show task count on each tab (e.g., "To Do (5)")
- **FR-8.3:** Highlight the active tab with distinct styling
- **FR-8.4:** Make tabs large enough for touch interaction (44px height minimum)
- **FR-8.5:** Ensure tabs are horizontally scrollable if needed on very small screens

**FR-9:** Implement tab filtering logic
- **FR-9.1:** When "To Do" tab is active, display only tasks with status "todo"
- **FR-9.2:** When "In Progress" tab is active, display only tasks with status "in-progress"
- **FR-9.3:** When "Done" tab is active, display only tasks with status "done"
- **FR-9.4:** Remember active tab when switching between modes (not persisted across sessions)
- **FR-9.5:** Default to "To Do" tab on first render in Compact mode

**FR-10:** Add new task in Compact mode
- **FR-10.1:** Display task creation input at the top (above tabs) or within the active tab view
- **FR-10.2:** New tasks are created with the status of the currently active tab
- **FR-10.3:** If creating from "Done" tab, create task as "todo" instead (or prompt user)
- **FR-10.4:** Automatically switch to the appropriate tab after task creation

### Compact Mode - Task Cards

**FR-11:** Enhance task cards with status change buttons
- **FR-11.1:** Add inline status change buttons to each task card
- **FR-11.2:** When task status is "todo", show buttons: "Start" (→ in-progress) and "Complete" (→ done)
- **FR-11.3:** When task status is "in-progress", show buttons: "Revert" (→ todo) and "Complete" (→ done)
- **FR-11.4:** When task status is "done", show button: "Reopen" (→ in-progress)
- **FR-11.5:** Style buttons to be touch-friendly and visually distinct from other card elements
- **FR-11.6:** Use icons or short text labels for clarity
- **FR-11.7:** Position buttons consistently (e.g., right side of card or bottom row)

**FR-12:** Adjust visual density for Compact mode
- **FR-12.1:** Reduce padding on task cards by 20% compared to Kanban mode
- **FR-12.2:** Slightly reduce font size (1-2px smaller) for task content
- **FR-12.3:** Maintain readability and touch target sizes
- **FR-12.4:** Ensure delete and edit buttons remain easily accessible
- **FR-12.5:** Keep sufficient spacing between interactive elements (minimum 8px)

**FR-13:** Remove drag-and-drop in Compact mode
- **FR-13.1:** Disable drag-and-drop handlers when in Compact mode
- **FR-13.2:** Remove visual drag affordances (drag handle, cursor styles)
- **FR-13.3:** Status changes handled exclusively through status buttons

### Empty States

**FR-14:** Implement empty states for each tab
- **FR-14.1:** When "To Do" tab has no tasks, show: "No tasks to do. Add your first task above!"
- **FR-14.2:** When "In Progress" tab has no tasks, show: "No tasks in progress. Start a task from To Do!"
- **FR-14.3:** When "Done" tab has no tasks, show: "No completed tasks yet. You've got this!"
- **FR-14.4:** Style empty states with appropriate iconography and encouraging messaging
- **FR-14.5:** Keep empty states visible and centered in the view

### Transitions and Animations

**FR-15:** Implement smooth mode transitions
- **FR-15.1:** Add CSS transition when switching from Kanban to Compact (e.g., 300ms ease)
- **FR-15.2:** Add CSS transition when switching from Compact to Kanban
- **FR-15.3:** Maintain scroll position or reset to top appropriately
- **FR-15.4:** Avoid jarring layout shifts or flashing content

**FR-16:** Add subtle animations for status changes in Compact mode
- **FR-16.1:** Animate task card out when status changes (fade or slide)
- **FR-16.2:** Update count on tabs with brief highlight or animation
- **FR-16.3:** Keep animations quick (150-250ms) for responsiveness

## Non-Goals (Out of Scope)

1. **Swipe Gestures** - No swipe-to-complete or swipe-to-change-status gestures (could be future enhancement)
2. **List View with All Tasks** - No "All Tasks" tab in Compact mode showing all statuses together
3. **Drag-and-Drop in Compact Mode** - Compact mode uses buttons only for status changes
4. **Customizable Visual Density** - No user-configurable density settings; density is tied to view mode
5. **Backend Persistence of View Preference** - View mode stored only in localStorage, not synced across devices
6. **Additional View Modes** - Only Kanban and Compact; no "Table", "Calendar", or other view types
7. **Column Reordering** - No ability to customize tab order in Compact mode
8. **Bulk Actions** - No multi-select or bulk status changes (same as current functionality)
9. **Filtering Within Tabs** - No additional filters (by date, content, etc.) beyond status filtering
10. **Custom Breakpoints** - 640px breakpoint is fixed, not configurable by users

## Design Considerations

### UI/UX Requirements

1. **Header Integration:**
   - Add view mode toggle next to existing theme switcher
   - Use consistent visual styling with theme switcher
   - Ensure header doesn't become cluttered; consider icon-only toggle with tooltips
   - Maintain header responsiveness on very small screens

2. **Tab Design (Compact Mode):**
   - Use clear, high-contrast styling for active vs. inactive tabs
   - Include task counts in parentheses: "To Do (5)"
   - Ensure tabs are accessible (proper ARIA labels, keyboard navigation)
   - Consider using tab underline or background color to indicate active state

3. **Status Change Buttons:**
   - Use color coding that aligns with existing status colors
   - Consider icons: ▶️ "Start", ✅ "Complete", ↩️ "Revert", 🔄 "Reopen"
   - Make buttons small enough to not dominate the card but large enough to tap (minimum 32x32px)
   - Position consistently (recommend right side or bottom row of card)

4. **Empty States:**
   - Use friendly, encouraging language
   - Include relevant icons (e.g., checkmark, rocket, celebration)
   - Keep messaging concise
   - Ensure empty states are visually distinct from loading states

5. **Responsive Behavior:**
   - Test on common breakpoints: 320px, 375px, 414px, 640px, 768px, 1024px, 1280px
   - Ensure smooth transitions when rotating device (portrait ↔ landscape)
   - Consider tablet landscape mode (typically > 640px but might benefit from Compact)

6. **Visual Density:**
   - In Compact mode, reduce card padding from 16px to 12px
   - Reduce task content font size from 16px to 14px
   - Reduce line height slightly for tighter layout
   - Maintain 8px minimum spacing between interactive elements

### Component Updates

The following components will require updates:

**New Components:**
1. **ViewModeToggle** - Toggle button for switching between modes
2. **StatusTabs** - Tab navigation for Compact mode
3. **StatusChangeButtons** - Inline buttons for changing task status in Compact mode

**Modified Components:**
1. **App** or **TaskBoard** - Add view mode state management and conditional rendering
2. **TaskCard** - Add status change buttons conditionally for Compact mode
3. **TaskColumn** - Update to show task counts in header
4. **NewTaskCard** - Adapt creation logic for Compact mode (use active tab status)
5. **Header** (if exists) - Add ViewModeToggle component

### File Structure

New files to create:
- `frontend/src/components/ViewModeToggle/ViewModeToggle.tsx`
- `frontend/src/components/ViewModeToggle/ViewModeToggle.css`
- `frontend/src/components/StatusTabs/StatusTabs.tsx`
- `frontend/src/components/StatusTabs/StatusTabs.css`
- `frontend/src/components/CompactView/CompactView.tsx`
- `frontend/src/components/CompactView/CompactView.css`
- `frontend/src/hooks/useViewMode.ts` - Custom hook for view mode logic
- `frontend/src/hooks/useMediaQuery.ts` - Custom hook for responsive detection

Modified files:
- `frontend/src/App.tsx` or `TaskBoard.tsx` - Main view mode logic
- `frontend/src/components/TaskCard/TaskCard.tsx` - Add status buttons
- `frontend/src/components/TaskCard/TaskCard.css` - Compact mode styling
- `frontend/src/components/TaskColumn/TaskColumn.tsx` - Add task counts
- `frontend/src/components/NewTaskCard/NewTaskCard.tsx` - Adapt for Compact mode

## Technical Considerations

### View Mode Management

**Hook Design:**

```typescript
// Pseudo-code structure
const useViewMode = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'compact'>('kanban');
  const [isLocked, setIsLocked] = useState(false);
  const isMobile = useMediaQuery('(max-width: 639px)');
  
  useEffect(() => {
    // Load preference from localStorage
    // Check screen size
    // Apply appropriate mode
    // Set locked state
  }, [isMobile]);
  
  const toggleViewMode = () => {
    // Toggle mode if not locked
    // Save to localStorage
  };
  
  return { viewMode, isLocked, toggleViewMode };
};
```

### Media Query Hook

```typescript
// Pseudo-code structure
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};
```

### LocalStorage Keys

- `task_view_mode`: Stores user's preferred view mode ('kanban' | 'compact')

### CSS Strategy

1. **Use CSS classes for mode-specific styling:**
   - `.task-board--kanban` and `.task-board--compact` on main container
   - `.task-card--compact` for density adjustments
   - `.task-card--kanban` for Kanban-specific styling

2. **Use CSS custom properties for adjustable values:**
   ```css
   :root {
     --card-padding-kanban: 16px;
     --card-padding-compact: 12px;
     --font-size-kanban: 16px;
     --font-size-compact: 14px;
   }
   ```

3. **Use media queries sparingly:**
   - Primary responsive logic in React (via hooks)
   - Media queries only for minor CSS adjustments

### Accessibility

1. **ARIA Labels:**
   - `role="tablist"` and `role="tab"` for status tabs
   - `aria-selected` for active tab
   - `aria-label` on view mode toggle
   - `aria-disabled="true"` on locked toggle with explanation

2. **Keyboard Navigation:**
   - Arrow keys to navigate between tabs
   - Enter/Space to activate tab
   - Enter/Space to toggle view mode (when not locked)
   - Tab key navigates through status change buttons

3. **Screen Reader Announcements:**
   - Announce mode changes: "Switched to Compact view"
   - Announce status changes: "Task moved to In Progress"
   - Announce empty states appropriately

### Performance Considerations

1. **Avoid unnecessary re-renders:**
   - Memoize view mode state where appropriate
   - Use React.memo for static components
   - Avoid inline function definitions in render

2. **Optimize media query listeners:**
   - Debounce resize events if needed
   - Clean up listeners properly
   - Use single media query listener per breakpoint

3. **Smooth transitions:**
   - Use CSS transforms instead of layout properties for animations
   - Keep animation durations short (≤ 300ms)
   - Use `will-change` sparingly for critical animations

## Success Metrics

### Functional Success Criteria

1. ✅ **Mode Switching Works Correctly**
   - Users can toggle between Kanban and Compact on screens ≥ 640px
   - Preference is saved to localStorage and persists across sessions
   - Mode automatically switches to Compact on screens < 640px
   - Toggle is disabled (but visible) on small screens with helpful tooltip

2. ✅ **Compact Mode Features Work**
   - Status tabs filter tasks correctly
   - Task counts on tabs are accurate and update in real-time
   - Status change buttons appear on task cards
   - Status change buttons correctly update task status
   - New tasks are created with the appropriate status
   - Empty states display when no tasks match the active tab

3. ✅ **Kanban Mode Enhanced**
   - Task counts appear in column headers
   - Counts update in real-time
   - Existing drag-and-drop functionality remains intact

4. ✅ **Responsive Behavior**
   - Mode automatically switches at 640px breakpoint
   - Switching works smoothly on window resize
   - Orientation changes handled correctly on mobile devices
   - User preference restored when moving from small to large screen

### User Experience Success Criteria

1. ✅ **Intuitive Interface**
   - Mode toggle is easy to find and understand
   - Tab navigation feels natural and responsive
   - Status change buttons are clearly labeled and easy to use
   - Empty states provide helpful guidance

2. ✅ **Smooth Transitions**
   - Mode switching animates smoothly without jarring jumps
   - Status changes in Compact mode are visually smooth
   - No layout shift or content flashing during transitions

3. ✅ **Mobile Optimized**
   - All touch targets meet minimum size requirements (44x44px for primary actions)
   - No horizontal scrolling required
   - Text remains readable at reduced size
   - Sufficient spacing between interactive elements

4. ✅ **Accessibility**
   - All interactive elements keyboard accessible
   - Screen readers announce mode and status changes
   - Proper ARIA labels and roles implemented
   - Color is not the only indicator of state (use icons, text)

### Technical Success Criteria

1. ✅ **Code Quality**
   - No TypeScript errors
   - No linter warnings
   - Follows existing code patterns and conventions
   - Proper component composition and separation of concerns

2. ✅ **Performance**
   - Mode switching feels instant (< 300ms)
   - No janky animations or transitions
   - Media query listeners properly cleaned up
   - No memory leaks from event listeners

3. ✅ **Browser Compatibility**
   - Works in Chrome, Firefox, Safari, Edge (latest versions)
   - Works on iOS Safari and Chrome
   - Works on Android Chrome
   - matchMedia API properly polyfilled if needed

4. ✅ **Integration**
   - Works seamlessly with existing task operations
   - Compatible with theme switcher
   - Backend API calls remain unchanged
   - localStorage doesn't conflict with other stored data

## Testing Strategy

### Unit Tests

**UT-1:** View mode hook tests
- Test initial mode selection (default, from localStorage, responsive)
- Test toggle function
- Test locked state on small screens
- Test localStorage persistence

**UT-2:** Media query hook tests
- Test media query matching
- Test listener setup and cleanup
- Test state updates on media query changes

**UT-3:** Component tests
- ViewModeToggle: rendering, click handling, disabled state
- StatusTabs: rendering, filtering, counts, active state
- CompactView: rendering, empty states, task display
- Status change buttons: rendering, click handling, correct actions

### Integration Tests

**IT-1:** Mode switching flows
- Switch from Kanban to Compact and verify layout changes
- Switch from Compact to Kanban and verify layout changes
- Verify preference persists across page reload
- Verify responsive auto-switching at breakpoint

**IT-2:** Compact mode task operations
- Create task in each tab, verify correct status
- Change task status using buttons, verify update
- Delete task in Compact mode, verify counts update
- Edit task in Compact mode, verify functionality

**IT-3:** Task count accuracy
- Verify counts in Kanban column headers
- Verify counts in Compact mode tabs
- Verify counts update after CRUD operations
- Verify counts correct after mode switch

### End-to-End Tests

**E2E-1:** Complete mode switching workflow
- Load app on large screen → Default to Kanban
- Toggle to Compact → Verify layout change
- Refresh page → Verify Compact mode persists
- Toggle back to Kanban → Verify layout change

**E2E-2:** Mobile experience
- Load app on small screen (< 640px) → Verify Compact mode forced
- Verify toggle is disabled with tooltip
- Create, edit, delete tasks → Verify all features work
- Change task status using buttons → Verify updates

**E2E-3:** Responsive transitions
- Load app on large screen in Kanban mode
- Resize window below 640px → Verify auto-switch to Compact
- Resize window above 640px → Verify return to Kanban
- Change preference to Compact on large screen
- Resize below and above 640px → Verify Compact persists above threshold

**E2E-4:** Task management in both modes
- Create tasks in Kanban mode
- Switch to Compact mode → Verify all tasks visible
- Filter by each tab → Verify correct tasks shown
- Change task status using buttons
- Switch back to Kanban → Verify status changes reflected

### Manual Testing Checklist

- [ ] Test on actual mobile devices (iOS and Android)
- [ ] Test landscape and portrait orientations
- [ ] Verify touch interactions feel responsive
- [ ] Verify text remains readable in Compact mode
- [ ] Test with screen reader (VoiceOver, TalkBack)
- [ ] Test keyboard navigation (Tab, Arrow keys, Enter)
- [ ] Test with browser zoom at 150% and 200%
- [ ] Test with large numbers of tasks (50+)
- [ ] Verify no layout issues at various zoom levels
- [ ] Test transition animations on slower devices

## Open Questions

None at this time. All requirements have been clarified through the initial discussion.

---

## Implementation Notes

### Development Approach

**Phase 1: Infrastructure** (Foundation)
1. Create `useMediaQuery` hook
2. Create `useViewMode` hook
3. Set up localStorage persistence
4. Add view mode to global state/context

**Phase 2: Kanban Enhancements** (Quick Wins)
1. Add task counts to TaskColumn headers
2. Test counts update correctly
3. Verify no regression in existing functionality

**Phase 3: Compact Mode Components** (Core Feature)
1. Create ViewModeToggle component
2. Create StatusTabs component
3. Create CompactView layout component
4. Add status change buttons to TaskCard
5. Implement tab filtering logic

**Phase 4: Responsive Behavior** (Critical)
1. Integrate media query detection
2. Implement auto-switching at 640px
3. Handle disabled toggle on mobile
4. Test resize and orientation change behavior

**Phase 5: Polish & Accessibility** (Quality)
1. Add transitions and animations
2. Implement empty states
3. Add ARIA labels and keyboard navigation
4. Add tooltips and help text
5. Refine visual density in Compact mode

**Phase 6: Testing** (Quality Assurance)
1. Write unit tests
2. Write integration tests
3. Write E2E tests
4. Manual testing on real devices
5. Accessibility audit

### Key Implementation Details

**Mode Detection Priority:**
1. Check if screen width < 640px → Force Compact (locked)
2. If screen width ≥ 640px, check localStorage for preference
3. If no preference, default to Kanban

**Task Creation in Compact Mode:**
- When creating a task, use the currently active tab's status
- Exception: If on "Done" tab, create as "todo" (more intuitive than creating completed tasks)

**Status Button Logic:**
| Current Status | Available Actions | Button Labels |
|----------------|-------------------|---------------|
| todo | → in-progress<br>→ done | "Start" / "Complete" |
| in-progress | → todo<br>→ done | "Revert" / "Complete" |
| done | → in-progress | "Reopen" |

**Responsive Breakpoint Behavior:**
```
< 640px: Compact mode (locked, toggle disabled)
≥ 640px: User preference (default: Kanban)
```

### Dependencies

No new external dependencies required. Implementation uses:
- React hooks (useState, useEffect, useCallback)
- localStorage API
- matchMedia API (well-supported)
- Existing CSS architecture

Optional enhancements:
- `framer-motion` for advanced animations (not required, CSS transitions sufficient)

### Accessibility Checklist

- [ ] ViewModeToggle has proper `aria-label`
- [ ] Disabled toggle has `aria-disabled="true"` and tooltip
- [ ] StatusTabs use `role="tablist"`, `role="tab"`, `role="tabpanel"`
- [ ] Active tab has `aria-selected="true"`
- [ ] Status change buttons have descriptive labels
- [ ] Empty states are announced by screen readers
- [ ] Keyboard navigation works: Tab, Arrow keys, Enter, Space
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)

### Risk Mitigation

**Risk: Layout breaks at edge case widths**
- Mitigation: Test thoroughly at 320px, 640px, and intermediate widths
- Use flexible units (rem, %, flex) rather than fixed pixels

**Risk: Mode switching feels jarring**
- Mitigation: Add smooth CSS transitions
- Maintain visual continuity (colors, spacing)
- Keep animations brief (< 300ms)

**Risk: Status buttons clutter task cards**
- Mitigation: Use small, icon-based buttons
- Position consistently (right side or collapsed until hover/focus)
- Maintain sufficient spacing

**Risk: Users don't understand why toggle is disabled on mobile**
- Mitigation: Clear tooltip explaining the behavior
- Keep toggle visible for discoverability
- Consider adding help documentation

**Risk: Task counts impact performance**
- Mitigation: Calculate counts from existing filtered arrays
- Avoid additional array iterations
- Memoize count calculations if needed

---

**Document Version:** 1.0  
**Created:** 2025-11-11  
**Status:** Ready for Implementation  
**Estimated Effort:** 3-5 days (1 day planning, 2-3 days implementation, 1 day testing/polish)

