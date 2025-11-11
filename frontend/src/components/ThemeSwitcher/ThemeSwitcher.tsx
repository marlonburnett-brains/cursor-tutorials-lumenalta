import { useState } from 'react';
import ThemeModal from '../ThemeModal/ThemeModal';
import './ThemeSwitcher.css';

/**
 * ThemeSwitcher Component
 * 
 * Button that opens the theme selection modal.
 * Features:
 * - Palette icon button with glassmorphism styling
 * - Opens/closes theme modal
 * - Matches styling of keyboard shortcuts button
 */
function ThemeSwitcher() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="theme-switcher-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Change theme"
        title="Change theme"
        type="button"
      >
        🎨
      </button>

      <ThemeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

export default ThemeSwitcher;

