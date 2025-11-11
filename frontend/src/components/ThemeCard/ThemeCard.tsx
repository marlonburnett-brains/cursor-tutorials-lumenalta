import { Theme } from '../../config/themes';
import './ThemeCard.css';

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

/**
 * ThemeCard Component
 * 
 * Displays an individual theme option with color swatches
 * Features:
 * - Visual preview of theme colors
 * - Active state indicator (checkmark)
 * - Hover effects
 * - Accessibility labels
 */
function ThemeCard({ theme, isActive, onClick }: ThemeCardProps) {
  return (
    <button
      className={`theme-card ${isActive ? 'theme-card-active' : ''}`}
      onClick={onClick}
      aria-label={`Select ${theme.displayName} theme`}
      aria-selected={isActive}
      type="button"
    >
      <div className="theme-card-header">
        <h4 className="theme-card-name">{theme.displayName}</h4>
        {isActive && <span className="theme-card-checkmark">✓</span>}
      </div>
      
      <div className="theme-card-swatches">
        <div 
          className="theme-card-swatch"
          style={{ backgroundColor: theme.colors.bgPrimary }}
          title="Primary Background"
        />
        <div 
          className="theme-card-swatch"
          style={{ backgroundColor: theme.colors.accentPrimary }}
          title="Primary Accent"
        />
        <div 
          className="theme-card-swatch"
          style={{ backgroundColor: theme.colors.accentSecondary }}
          title="Secondary Accent"
        />
        <div 
          className="theme-card-swatch"
          style={{ backgroundColor: theme.colors.textPrimary }}
          title="Primary Text"
        />
      </div>
    </button>
  );
}

export default ThemeCard;

