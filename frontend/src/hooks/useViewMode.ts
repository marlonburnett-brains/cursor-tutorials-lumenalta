import { useState, useEffect } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { useLocalStorage } from './useLocalStorage';

export type ViewMode = 'kanban' | 'compact';

const MOBILE_BREAKPOINT = '(max-width: 639px)'; // < 640px
const STORAGE_KEY = 'task_view_mode';

/**
 * Custom hook for view mode state management and localStorage persistence
 * 
 * Manages view mode state ('kanban' | 'compact') with localStorage persistence.
 * Implements responsive locking: forces Compact mode on mobile (<640px) regardless of preference.
 * Restores user preference when resizing from small to large screen.
 * 
 * @returns Object containing current view mode, toggle function, and locked state
 */
export function useViewMode() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [storedMode, setStoredMode] = useLocalStorage<ViewMode>(
    STORAGE_KEY,
    'kanban'
  );
  const [viewMode, setViewMode] = useState<ViewMode>(storedMode);

  // Apply responsive locking: force Compact mode on mobile
  useEffect(() => {
    if (isMobile) {
      // Lock to Compact mode on mobile
      setViewMode('compact');
    } else {
      // Restore user preference on desktop
      setViewMode(storedMode);
    }
  }, [isMobile, storedMode]);

  /**
   * Toggle view mode (only if not locked on mobile)
   */
  const toggleViewMode = () => {
    if (isMobile) {
      // Do nothing if locked on mobile
      return;
    }

    const newMode: ViewMode = viewMode === 'kanban' ? 'compact' : 'kanban';
    setViewMode(newMode);
    setStoredMode(newMode);
  };

  /**
   * Check if view mode is locked (mobile)
   */
  const isLocked = isMobile;

  return {
    viewMode,
    toggleViewMode,
    isLocked,
  };
}

