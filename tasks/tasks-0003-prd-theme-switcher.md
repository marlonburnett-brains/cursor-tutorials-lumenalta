# Task List: Theme Switcher Implementation

This task list guides the implementation of a theme switcher feature for the To-Do application based on PRD 0003.

## Relevant Files

- `frontend/src/config/themes.ts` - Theme configuration with color palettes for all five themes.
- `frontend/src/hooks/useTheme.ts` - Custom React hook for theme state management and localStorage persistence.
- `frontend/src/hooks/useTheme.test.ts` - Unit tests for `useTheme` hook.
- `frontend/src/components/ThemeSwitcher/ThemeSwitcher.tsx` - Icon button component that opens the theme modal.
- `frontend/src/components/ThemeSwitcher/ThemeSwitcher.css` - Styles for the theme switcher button.
- `frontend/src/components/ThemeModal/ThemeModal.tsx` - Modal component for theme selection.
- `frontend/src/components/ThemeModal/ThemeModal.css` - Styles for the theme modal.
- `frontend/src/components/ThemeModal/ThemeModal.test.tsx` - Unit tests for theme modal component.
- `frontend/src/components/ThemeCard/ThemeCard.tsx` - Individual theme preview card component.
- `frontend/src/components/ThemeCard/ThemeCard.css` - Styles for theme cards.
- `frontend/src/index.css` - Update to add CSS custom properties (variables) for theming.
- `frontend/src/App.tsx` - Update to integrate ThemeSwitcher component into header.
- `frontend/src/App.css` - Update to use CSS variables instead of hardcoded colors.
- `frontend/src/components/TaskCard/TaskCard.css` - Update to use CSS variables for theming.
- `frontend/src/components/TaskColumn/TaskColumn.css` - Update to use CSS variables for theming.
- `frontend/src/components/NewTaskCard/NewTaskCard.css` - Update to use CSS variables for theming.
- `frontend/src/components/ConfirmDialog/ConfirmDialog.css` - Update to use CSS variables for theming.
- `frontend/src/components/EmptyState/EmptyState.css` - Update to use CSS variables for theming.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `useTheme.tsx` and `useTheme.test.tsx` in the same directory).
- Use `npm test` or `npx jest [optional/path/to/test/file]` to run tests in the frontend directory.
- The implementation leverages the existing `useLocalStorage` hook pattern and modal patterns (similar to `ConfirmDialog`).

## Tasks

- [x] 1.0 Create Theme Configuration and Infrastructure
  - [x] 1.1 Create `frontend/src/config/themes.ts` file with theme type definitions (Theme, ThemeName, ThemeConfig)
  - [x] 1.2 Define the five theme color palettes in `themes.ts`:
    - Tech/Modern (default): Teal/cyan with dark slate backgrounds
    - Warm/Inviting: Coral/peach with warm beige/cream backgrounds
    - Professional/Elegant: Deep navy with gold/amber accents
    - Natural/Calm: Forest green with earthy tones
    - Bold/Energetic: Vibrant orange/red with dark charcoal
  - [x] 1.3 For each theme, define color values for: primary background, secondary background, card background, primary text, secondary text, muted text, primary accent, secondary accent, border colors, hover states, focus states, and button colors
  - [x] 1.4 Export a `themes` object mapping theme names to their color configurations
  - [x] 1.5 Export a `defaultTheme` constant set to 'tech-modern'
  - [x] 1.6 Update `frontend/src/index.css` to add CSS custom property definitions using the `[data-theme]` attribute selector approach
  - [x] 1.7 Define all CSS variables (--color-bg-primary, --color-bg-secondary, --color-text-primary, etc.) with default values from Tech/Modern theme
  - [x] 1.8 Create theme-specific CSS variable definitions for each of the five themes using `[data-theme="theme-name"]` selectors

- [x] 2.0 Build Theme Switching Hook and Logic
  - [x] 2.1 Create `frontend/src/hooks/useTheme.ts` with a custom React hook
  - [x] 2.2 Use the existing `useLocalStorage` hook to persist theme preference with key `'todo-app-theme'`
  - [x] 2.3 Implement `useTheme` hook that returns: `{ currentTheme, setTheme, availableThemes }`
  - [x] 2.4 In the hook, apply the theme by setting the `data-theme` attribute on the document root element (`document.documentElement.setAttribute('data-theme', themeName)`)
  - [x] 2.5 Initialize theme on mount by loading from localStorage or defaulting to 'tech-modern'
  - [x] 2.6 Add a `useEffect` to update the `data-theme` attribute whenever the theme changes
  - [x] 2.7 Create `frontend/src/hooks/useTheme.test.ts` with unit tests covering:
    - Default theme initialization
    - Theme switching functionality
    - localStorage persistence
    - data-theme attribute updates

- [x] 3.0 Create Theme Switcher UI Components
  - [x] 3.1 Create `frontend/src/components/ThemeSwitcher/ThemeSwitcher.tsx` component
  - [x] 3.2 Add a palette icon button (use emoji 🎨 or similar) that opens the theme modal
  - [x] 3.3 Add state to track modal open/closed status
  - [x] 3.4 Style the button with glassmorphism matching the existing keyboard shortcuts button
  - [x] 3.5 Add appropriate aria-label ("Change theme") and title attributes
  - [x] 3.6 Create `frontend/src/components/ThemeSwitcher/ThemeSwitcher.css` for button styles
  - [x] 3.7 Create `frontend/src/components/ThemeModal/ThemeModal.tsx` component
  - [x] 3.8 Structure modal with overlay, centered dialog, title ("Choose Theme"), and grid of theme cards
  - [x] 3.9 Implement keyboard navigation: Tab between themes, Enter/Space to select, Escape to close
  - [x] 3.10 Add click-outside-to-close functionality using overlay click handler
  - [x] 3.11 Auto-close modal after theme selection
  - [x] 3.12 Create `frontend/src/components/ThemeModal/ThemeModal.css` with styles for overlay, dialog, and grid layout
  - [x] 3.13 Use glassmorphism styles consistent with existing modals (reference ConfirmDialog)
  - [x] 3.14 Make modal responsive: 2 columns on mobile, 3-5 columns on desktop
  - [x] 3.15 Create `frontend/src/components/ThemeCard/ThemeCard.tsx` component
  - [x] 3.16 Display theme name, 3-4 color swatches showing the theme's palette
  - [x] 3.17 Add visual indicator (checkmark ✓ or border highlight) for currently active theme
  - [x] 3.18 Make card interactive with hover states and onClick handler
  - [x] 3.19 Add aria-label describing the theme and aria-selected for active theme
  - [x] 3.20 Create `frontend/src/components/ThemeCard/ThemeCard.css` with card styles, hover effects, and active state styling
  - [x] 3.21 Create `frontend/src/components/ThemeModal/ThemeModal.test.tsx` with tests for:
    - Modal opens and closes correctly
    - Theme selection triggers theme change
    - Keyboard navigation works (Escape, Enter)
    - Click outside closes modal

- [x] 4.0 Integrate Theming with Existing Components
  - [x] 4.1 Update `frontend/src/App.tsx` to import and use the `useTheme` hook
  - [x] 4.2 Add ThemeSwitcher component to the app header, positioned near the keyboard shortcuts button
  - [x] 4.3 Update `frontend/src/App.css` to replace all hardcoded color values with CSS variables:
    - Background gradient: use var(--color-bg-primary), var(--color-bg-secondary)
    - Text colors: use var(--color-text-primary), var(--color-text-secondary)
    - Accent colors: use var(--color-accent-primary), var(--color-accent-secondary)
    - Border colors: use var(--color-border)
  - [x] 4.4 Update animated gradient overlay to use CSS variables
  - [x] 4.5 Update `frontend/src/components/TaskCard/TaskCard.css` to use CSS variables for all colors (backgrounds, text, borders, hover states, button colors)
  - [x] 4.6 Update `frontend/src/components/TaskColumn/TaskColumn.css` to use CSS variables for column backgrounds, borders, headers, and interactive elements
  - [x] 4.7 Update `frontend/src/components/NewTaskCard/NewTaskCard.css` to use CSS variables for backgrounds, borders, buttons, and input fields
  - [x] 4.8 Update `frontend/src/components/ConfirmDialog/ConfirmDialog.css` to use CSS variables for overlay, dialog backgrounds, borders, and button colors
  - [x] 4.9 Update `frontend/src/components/EmptyState/EmptyState.css` to use CSS variables for text and icon colors
  - [x] 4.10 Add CSS transition properties to elements that should animate during theme changes: `transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;`

- [x] 5.0 Testing, Accessibility, and Polish
  - [x] 5.1 Manually test each theme by switching between all five options
  - [x] 5.2 Verify all UI elements (cards, buttons, inputs, modals) render correctly in each theme
  - [x] 5.3 Test WCAG AA contrast ratios for each theme using browser DevTools or online contrast checker
  - [x] 5.4 Adjust any theme colors that fail contrast requirements (minimum 4.5:1 for normal text, 3:1 for large text)
  - [x] 5.5 Test keyboard navigation through theme modal using Tab, Enter, Space, and Escape keys
  - [x] 5.6 Verify screen reader announces theme names and selection status correctly
  - [x] 5.7 Test localStorage persistence: select a theme, refresh browser, verify theme persists
  - [x] 5.8 Test in multiple browsers (Chrome, Firefox, Safari, Edge)
  - [x] 5.9 Test responsive behavior on mobile (320px), tablet (768px), and desktop (1024px+) viewports
  - [x] 5.10 Verify smooth transitions when switching themes (no flashing or janky animations)
  - [x] 5.11 Test that existing features still work: add task, edit task, delete task, drag-and-drop, filters
  - [x] 5.12 Fix any visual glitches or styling issues discovered during testing

