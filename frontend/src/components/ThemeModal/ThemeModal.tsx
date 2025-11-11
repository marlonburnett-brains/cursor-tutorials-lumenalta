import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../hooks/useTheme';
import ThemeCard from '../ThemeCard/ThemeCard';
import './ThemeModal.css';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ThemeModal Component
 * 
 * Modal for selecting application theme.
 * Features:
 * - Grid of theme cards
 * - Keyboard navigation (Tab, Enter, Space, Escape)
 * - Click outside to close
 * - Auto-close after theme selection
 * - Glassmorphism styling
 */
function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { currentTheme, setTheme, themes } = useTheme();

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle theme selection
  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName as any);
    // Auto-close modal after selection
    setTimeout(() => {
      onClose();
    }, 300); // Small delay for visual feedback
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="theme-modal-overlay" onClick={onClose}>
      <div
        className="theme-modal glass-strong"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        <h2 id="theme-modal-title" className="theme-modal-title">
          Choose Theme
        </h2>

        <div className="theme-modal-grid">
          {Object.values(themes).map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={currentTheme === theme.name}
              onClick={() => handleThemeSelect(theme.name)}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ThemeModal;

