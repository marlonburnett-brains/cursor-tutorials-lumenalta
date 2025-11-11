# PRD: Theme Switcher for To-Do Application

## Introduction/Overview

This feature adds a theme customization capability to the To-Do application, allowing users to personalize the visual appearance of the interface. Users can choose from five distinct color themes that affect all UI elements throughout the application. The theme switcher enhances user experience by providing visual variety and allowing users to select a color scheme that best suits their preferences and working environment.

**Problem:** The current application has a single fixed color scheme. Users may prefer different color palettes based on personal taste, lighting conditions, or mood.

**Goal:** Provide users with the ability to switch between five pre-defined themes, with preferences persisting across sessions via localStorage.

## Goals

1. Implement five distinct, visually appealing themes with cohesive color palettes
2. Create an intuitive theme selection interface with visual previews
3. Persist user theme preferences across browser sessions
4. Ensure smooth visual transitions when switching themes
5. Maintain accessibility standards (WCAG AA compliance) across all themes
6. Integrate seamlessly with existing UI without disrupting user workflow

## User Stories

1. **As a user**, I want to select from multiple visual themes, so that I can customize the application to match my personal aesthetic preferences.

2. **As a user**, I want to preview how each theme looks before selecting it, so that I can make an informed decision about which theme I prefer.

3. **As a user**, I want my theme preference to be remembered, so that I don't have to reselect it every time I use the application.

4. **As a user**, I want the theme to transition smoothly when I change it, so that the visual change is pleasant and not jarring.

5. **As a user with accessibility needs**, I want all themes to maintain readable contrast ratios, so that I can use the application comfortably regardless of which theme I choose.

## Functional Requirements

### Core Functionality

1. The system must provide exactly five theme options:
   - **Tech/Modern**: Teal/cyan with dark accents
   - **Warm/Inviting**: Coral/peach with warm neutrals
   - **Professional/Elegant**: Deep navy with gold/amber accents
   - **Natural/Calm**: Forest green with earthy tones
   - **Bold/Energetic**: Vibrant orange/red with dark background

2. The "Tech/Modern" theme must be the default theme on first application load.

3. The system must display a theme switcher icon in the application header/toolbar.

4. When the user clicks the theme switcher icon, a modal/dialog must open displaying all available themes.

5. The modal must display theme cards for each theme, showing:
   - Theme name
   - Color swatches/preview representing the theme's color palette
   - Visual indication of which theme is currently active

6. When a user selects a theme, the system must apply the theme to all UI elements including:
   - Main application background
   - Column/board backgrounds
   - Task card backgrounds and borders
   - Button colors (primary, secondary, hover, active states)
   - Text colors (headings, body text, labels)
   - Input field styles
   - Modal/dialog backgrounds
   - All accent colors
   - Icon colors

7. Theme changes must animate smoothly with a color transition effect (fade/cross-fade).

8. The system must save the selected theme to localStorage immediately upon selection.

9. The system must load the user's saved theme preference from localStorage on application startup.

10. If no theme preference exists in localStorage, the system must default to "Tech/Modern".

### Accessibility Requirements

11. All themes must maintain WCAG AA contrast ratio requirements (minimum 4.5:1 for normal text, 3:1 for large text).

12. The theme switcher icon must have an appropriate aria-label (e.g., "Change theme").

13. The theme selection modal must be keyboard navigable:
    - Tab key must move between theme options
    - Enter/Space key must select a theme
    - Escape key must close the modal

14. Each theme option in the modal must have an aria-label describing the theme.

15. The currently selected theme must have an aria-selected="true" attribute and visible indicator.

### UI/UX Requirements

16. The theme switcher icon must be clearly visible and accessible from the main application view.

17. The modal must be centered on screen with a backdrop that dims the background content.

18. The modal must close when the user clicks outside of it or presses the Escape key.

19. The modal must close automatically after a theme is selected.

20. The transition between themes must complete within 300-500ms.

21. All interactive elements in the theme switcher must provide visual feedback (hover states, active states).

## Non-Goals (Out of Scope)

1. **Custom theme creation**: Users cannot create their own custom themes or modify existing theme colors.

2. **Theme scheduling**: No automatic theme switching based on time of day or system preferences.

3. **Additional themes**: Only the five specified themes will be included in this initial release.

4. **Theme previews without applying**: The application will not provide a full-screen preview mode; users select a theme to see it fully applied.

5. **Per-component theming**: Users cannot apply different themes to different sections of the application.

6. **Import/export themes**: No functionality to share or import theme preferences.

7. **Backend integration**: Theme preferences are stored only in localStorage, not synced to any backend service.

## Design Considerations

### Theme Color Specifications

Each theme must define values for the following color variables:

- **Backgrounds**: Primary background, secondary background, card background
- **Text**: Primary text, secondary text, muted text
- **Accents**: Primary accent, secondary accent
- **Borders**: Border colors for various states
- **States**: Hover, active, focus states for interactive elements
- **Status colors**: Success, warning, error (may be consistent across themes or themed)

### Suggested Theme Color Palettes

**Tech/Modern (Default)**
- Primary: Teal (#14B8A6, #0D9488)
- Accents: Cyan (#06B6D4)
- Background: Dark slate (#0F172A, #1E293B)
- Text: Light gray/white

**Warm/Inviting**
- Primary: Coral (#F87171, #EF4444)
- Accents: Peach (#FED7AA, #FDBA74)
- Background: Warm beige/cream (#FDF8F6, #F5F5F4)
- Text: Warm dark brown

**Professional/Elegant**
- Primary: Deep navy (#1E3A8A, #1E40AF)
- Accents: Gold/amber (#F59E0B, #D97706)
- Background: Navy gradients (#0C1844, #1E293B)
- Text: Cream/gold tinted white

**Natural/Calm**
- Primary: Forest green (#047857, #059669)
- Accents: Sage/olive (#84CC16, #65A30D)
- Background: Soft earth tones (#F5F5F4, #E7E5E4)
- Text: Deep forest green/brown

**Bold/Energetic**
- Primary: Vibrant orange (#EA580C, #C2410C)
- Accents: Red (#DC2626, #B91C1C)
- Background: Dark charcoal (#18181B, #27272A)
- Text: Bright white

### Theme Switcher Icon

- Use a palette icon, theme icon, or paint brush icon
- Position in the header area, grouped with other utility icons or in the top-right corner
- Icon should be 20-24px, matching other header icons

### Theme Modal Layout

- Fixed width modal (e.g., 600px max-width)
- Theme cards displayed in a grid (2 columns on mobile, 3-5 columns on desktop)
- Each card shows:
  - Theme name as heading
  - 3-4 color swatches showing primary colors
  - Visual indicator for active theme (checkmark, border, or highlight)
- "Close" button or rely on backdrop click/escape key

## Technical Considerations

1. **CSS Variables**: Implement themes using CSS custom properties (CSS variables) for easy switching and consistent application.

2. **localStorage Key**: Use a key like `todo-app-theme` for storing the theme preference.

3. **Theme Hook**: Create a custom React hook (e.g., `useTheme`) to manage theme state and localStorage synchronization.

4. **CSS Transitions**: Apply CSS transitions to elements that should animate during theme changes (e.g., `transition: all 0.3s ease-in-out`).

5. **Theme Component**: Create a `ThemeProvider` context or ensure the theme class is applied to a root element (e.g., `<html>`, `<body>`, or `#root`).

6. **Data Attribute Approach**: Consider using data attributes (e.g., `data-theme="tech-modern"`) on the root element to scope theme styles.

7. **Integration with Existing Styles**: Audit existing CSS to ensure color values are replaced with theme variables.

8. **Component Structure**:
   - `ThemeSwitcher.tsx` - The icon button component
   - `ThemeModal.tsx` - The theme selection modal
   - `ThemeCard.tsx` - Individual theme preview cards
   - `useTheme.ts` - Custom hook for theme management

## Success Metrics

The feature will be considered successfully implemented when:

1. **Functionality**: All five themes can be selected and properly apply to all UI elements.

2. **Persistence**: Selected theme persists across browser sessions and page refreshes.

3. **Performance**: Theme switching completes within 500ms with smooth transitions.

4. **Accessibility**: All themes pass WCAG AA contrast requirements and keyboard navigation works correctly.

5. **No Regressions**: Existing To-Do functionality (add, edit, delete, filter tasks) continues to work without issues.

6. **Visual Quality**: Theme transitions are smooth without visual glitches or flashing.

7. **Cross-Browser**: Feature works correctly in Chrome, Firefox, Safari, and Edge.

8. **Responsive**: Theme switcher and modal work correctly on mobile, tablet, and desktop viewports.

## Open Questions

1. Should there be any animation or visual effect when the theme switcher icon is first introduced to users (e.g., a subtle pulse or highlight)?

2. Should we add a "Reset to default" option in the theme modal?

3. In the future, should we consider adding a theme preference based on system dark/light mode as a sixth option?

4. Should theme cards in the modal show a mini preview of the actual UI, or are color swatches sufficient?

---

## Appendix: Implementation Checklist

For the developer implementing this feature, here's a suggested order of work:

- [ ] Define color palettes for all five themes in a central theme configuration file
- [ ] Create CSS custom properties for themeable values
- [ ] Implement `useTheme` hook with localStorage integration
- [ ] Create `ThemeSwitcher` icon button component
- [ ] Create `ThemeModal` component with theme cards
- [ ] Implement theme application logic (CSS variable updates)
- [ ] Add smooth transition effects
- [ ] Ensure accessibility (WCAG AA, keyboard nav, ARIA labels)
- [ ] Test theme switching across all components
- [ ] Test localStorage persistence
- [ ] Verify responsive behavior
- [ ] Cross-browser testing

