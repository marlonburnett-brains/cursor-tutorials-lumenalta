import { ViewMode } from '../../hooks/useViewMode';
import './ViewModeToggle.css';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onToggle: () => void;
  isLocked?: boolean;
}

/**
 * ViewModeToggle Component
 * 
 * Toggle button component for switching between Kanban and Compact modes.
 * Features:
 * - Two buttons/icons for Kanban and Compact modes
 * - Disabled state styling and tooltip when locked on mobile (<640px)
 * - Matches existing ThemeSwitcher design for consistent header integration
 */
function ViewModeToggle({ currentMode, onToggle, isLocked = false }: ViewModeToggleProps) {
  return (
    <div className="view-mode-toggle">
      <button
        className={`view-mode-button ${currentMode === 'kanban' ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
        onClick={onToggle}
        disabled={isLocked}
        aria-label={isLocked ? 'View mode locked on mobile. Use desktop to change view mode.' : `Switch to ${currentMode === 'kanban' ? 'Compact' : 'Kanban'} mode`}
        aria-disabled={isLocked}
        title={isLocked ? 'View mode locked on mobile. Use desktop to change view mode.' : `Current: ${currentMode === 'kanban' ? 'Kanban' : 'Compact'}. Click to switch.`}
        type="button"
        data-testid="view-mode-toggle"
      >
        {currentMode === 'kanban' ? '⊞' : '☰'}
      </button>
    </div>
  );
}

export default ViewModeToggle;

